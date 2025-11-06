
import React, { useState, useRef, useCallback, useEffect } from 'react';
import { GoogleGenAI, LiveSession, LiveServerMessage, Modality, Blob } from '@google/genai';
import { TranscriptMessage, Sender } from '../types';
import { encode, decode, decodeAudioData } from '../utils/audioUtils';
import { Mic, MicOff, Square, Bot, User } from 'lucide-react';
import PhaseTracker from './PhaseTracker';

const systemInstruction = (projectName: string) => `
PERSONA: Você é um "Cadete Avaliador" da 42 Network. Seu objetivo é realizar uma pré-avaliação rigorosa e construtiva para o projeto ${projectName}, simulando a experiência de avaliação mútua entre alunos.

OBJETIVO DA AVALIAÇÃO: Determinar se o projeto (código-fonte e funcionalidade) atende estritamente a todos os requisitos do enunciado (o "Subject") e se o Cadete (o usuário) é capaz de defender e explicar CADA parte do seu código.

MÉTODO: A avaliação será conduzida em formato de diálogo ÁUDIO-TEXTO (o usuário responderá às suas perguntas por voz, e você processará as respostas textualmente). Você deve guiar o usuário através das 4 fases, fazendo perguntas e avaliando as respostas.

ESTRUTURA DA AVALIAÇÃO (4 FASES):

1.  **Pré-Requisitos e Instruções:** Comece se apresentando e confirmando o ambiente e as regras. Pergunte se o código está no repositório correto, se todos os requisitos do Subject foram cumpridos, e se o usuário está pronto para defender cada linha de código. Aguarde a confirmação antes de prosseguir.

2.  **Verificação de Requisitos Funcionais (Teste cego):** Simule os testes da Moulinette. Peça ao usuário para descrever a saída de comandos específicos (como 'make'). Faça perguntas sobre 'edge cases' críticos do projeto. Avalie se o programa trata erros corretamente.

3.  **Defesa do Código (Peer Review):** Faça perguntas profundas sobre a estrutura, escolhas de código e otimizações. Peça para ele explicar a lógica da função mais crítica, justificar o uso de certas estruturas de dados ou loops, e confirmar a conformidade com a Norme da 42 (regras de estilo).

4.  **Conclusão e Pontuação:** No final, sintetize o feedback. Dê um resultado claro: PASS ou FAIL. Se FAIL, explique o motivo específico (ex: falha em um teste obrigatório, vazamento de memória). Se PASS, forneça feedback construtivo com pontos de melhoria.

Conduza a conversa de forma profissional, mas justa. Seja o 'Moulinette Humana'.
`;

const EvaluationView: React.FC<{ projectName: string }> = ({ projectName }) => {
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [transcript, setTranscript] = useState<TranscriptMessage[]>([]);
  const [status, setStatus] = useState<'idle' | 'listening' | 'speaking' | 'connecting' | 'error'>('idle');

  const sessionPromiseRef = useRef<Promise<LiveSession> | null>(null);
  const inputAudioContextRef = useRef<AudioContext | null>(null);
  const outputAudioContextRef = useRef<AudioContext | null>(null);
  const micStreamRef = useRef<MediaStream | null>(null);
  const scriptProcessorRef = useRef<ScriptProcessorNode | null>(null);
  const nextAudioStartTimeRef = useRef<number>(0);
  const audioSourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());
  const transcriptEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    transcriptEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(scrollToBottom, [transcript]);

  const addMessage = (sender: Sender, text: string, isFinal: boolean) => {
    setTranscript(prev => {
      const lastMessage = prev[prev.length - 1];
      if (lastMessage && lastMessage.sender === sender && !lastMessage.isFinal) {
        const newTranscript = [...prev];
        newTranscript[newTranscript.length - 1] = { ...lastMessage, text: lastMessage.text + text };
        if (isFinal) {
          newTranscript[newTranscript.length - 1].isFinal = true;
        }
        return newTranscript;
      }
      return [...prev, { sender, text, isFinal }];
    });
  };

  const startEvaluation = useCallback(async () => {
    try {
      setStatus('connecting');
      setTranscript([{ sender: Sender.System, text: 'Iniciando sessão com o Avaliador...', isFinal: true }]);

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      micStreamRef.current = stream;

      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });

      inputAudioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
      outputAudioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });

      sessionPromiseRef.current = ai.live.connect({
        model: 'gemini-2.5-flash-native-audio-preview-09-2025',
        callbacks: {
          onopen: () => {
            const source = inputAudioContextRef.current!.createMediaStreamSource(micStreamRef.current!);
            const scriptProcessor = inputAudioContextRef.current!.createScriptProcessor(4096, 1, 1);
            scriptProcessorRef.current = scriptProcessor;

            scriptProcessor.onaudioprocess = (audioProcessingEvent) => {
              const inputData = audioProcessingEvent.inputBuffer.getChannelData(0);
              const pcmBlob: Blob = {
                data: encode(new Uint8Array(new Int16Array(inputData.map(f => f * 32768)).buffer)),
                mimeType: 'audio/pcm;rate=16000',
              };
              sessionPromiseRef.current?.then(session => session.sendRealtimeInput({ media: pcmBlob }));
            };

            source.connect(scriptProcessor);
            scriptProcessor.connect(inputAudioContextRef.current!.destination);
            setIsEvaluating(true);
            setStatus('listening');
            setTranscript(prev => [...prev, { sender: Sender.System, text: 'Conexão estabelecida. Pode começar a falar.', isFinal: true }]);
          },
          onmessage: async (message: LiveServerMessage) => {
            if (message.serverContent?.inputTranscription) {
              const { text, isFinal } = message.serverContent.inputTranscription;
              addMessage(Sender.User, text, isFinal);
            }
            if (message.serverContent?.outputTranscription) {
              const { text, isFinal } = message.serverContent.outputTranscription;
              addMessage(Sender.AI, text, isFinal);
            }
             const base64Audio = message.serverContent?.modelTurn?.parts[0]?.inlineData.data;
              if (base64Audio) {
                setStatus('speaking');
                const outputAudioContext = outputAudioContextRef.current!;
                nextAudioStartTimeRef.current = Math.max(nextAudioStartTimeRef.current, outputAudioContext.currentTime);

                const audioBuffer = await decodeAudioData(decode(base64Audio), outputAudioContext, 24000, 1);

                const source = outputAudioContext.createBufferSource();
                source.buffer = audioBuffer;
                source.connect(outputAudioContext.destination);
                
                source.onended = () => {
                    audioSourcesRef.current.delete(source);
                    if (audioSourcesRef.current.size === 0) {
                        setStatus('listening');
                    }
                };

                source.start(nextAudioStartTimeRef.current);
                nextAudioStartTimeRef.current += audioBuffer.duration;
                audioSourcesRef.current.add(source);
            }
            if (message.serverContent?.turnComplete) {
                // Finalize any pending transcript messages
                setTranscript(prev => prev.map(msg => ({...msg, isFinal: true})));
            }

          },
          onerror: (e: ErrorEvent) => {
            console.error(e);
            setStatus('error');
            addMessage(Sender.System, `Erro de conexão: ${e.message}`, true);
            stopEvaluation();
          },
          onclose: () => {
             stopEvaluation();
          },
        },
        config: {
          responseModalities: [Modality.AUDIO],
          inputAudioTranscription: {},
          outputAudioTranscription: {},
          speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Kore' } } },
          systemInstruction: systemInstruction(projectName),
        },
      });

    } catch (error) {
      console.error('Failed to start evaluation:', error);
      setStatus('error');
      addMessage(Sender.System, 'Não foi possível acessar o microfone. Verifique as permissões.', true);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectName]);


  const stopEvaluation = useCallback(() => {
    if (!isEvaluating && !sessionPromiseRef.current) return;
    setIsEvaluating(false);
    setStatus('idle');
    addMessage(Sender.System, 'Sessão de avaliação encerrada.', true);

    micStreamRef.current?.getTracks().forEach(track => track.stop());
    micStreamRef.current = null;
    
    scriptProcessorRef.current?.disconnect();
    scriptProcessorRef.current = null;

    inputAudioContextRef.current?.close();
    outputAudioContextRef.current?.close();
    inputAudioContextRef.current = null;
    outputAudioContextRef.current = null;
    
    audioSourcesRef.current.forEach(source => source.stop());
    audioSourcesRef.current.clear();
    nextAudioStartTimeRef.current = 0;

    sessionPromiseRef.current?.then(session => session.close()).catch(console.error);
    sessionPromiseRef.current = null;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isEvaluating]);


  useEffect(() => {
    return () => {
      // Cleanup on unmount
      if (isEvaluating) {
        stopEvaluation();
      }
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const getStatusIndicator = () => {
    switch (status) {
      case 'connecting':
        return <div className="text-yellow-400 flex items-center gap-2"><div className="w-3 h-3 bg-yellow-400 rounded-full animate-pulse"></div>Conectando...</div>;
      case 'listening':
        return <div className="text-green-400 flex items-center gap-2"><div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>Escutando...</div>;
      case 'speaking':
        return <div className="text-cyan-400 flex items-center gap-2"><div className="w-3 h-3 bg-cyan-400 rounded-full animate-pulse"></div>Avaliador falando...</div>;
      case 'error':
        return <div className="text-red-500 flex items-center gap-2"><div className="w-3 h-3 bg-red-500 rounded-full"></div>Erro</div>;
      default:
        return <div className="text-gray-400 flex items-center gap-2"><div className="w-3 h-3 bg-gray-500 rounded-full"></div>Inativo</div>;
    }
  };


  return (
    <div className="flex flex-col h-screen bg-gray-900 text-white font-mono">
      <header className="bg-gray-800 p-4 border-b border-gray-700 shadow-md">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-xl font-bold text-cyan-400">Avaliador: <span className="text-white">{projectName}</span></h1>
            <div className="text-sm font-semibold mt-1">{getStatusIndicator()}</div>
          </div>
          <button
            onClick={isEvaluating ? stopEvaluation : startEvaluation}
            className={`px-4 py-2 rounded-lg flex items-center gap-2 font-bold transition-all duration-200 ${isEvaluating ? 'bg-red-600 hover:bg-red-700' : 'bg-green-600 hover:bg-green-700'}`}
          >
            {isEvaluating ? <><Square size={18} /> Parar</> : <><Mic size={18} /> Iniciar</>}
          </button>
        </div>
      </header>
      
      <PhaseTracker transcript={transcript} />

      <main className="flex-1 overflow-y-auto p-4 space-y-4">
        {transcript.map((msg, index) => (
          <div key={index} className={`flex items-start gap-3 max-w-4xl mx-auto ${msg.sender === Sender.User ? 'justify-end' : 'justify-start'}`}>
            {msg.sender === Sender.AI && <div className="flex-shrink-0 w-8 h-8 rounded-full bg-cyan-800 flex items-center justify-center"><Bot className="w-5 h-5 text-cyan-300" /></div>}
            
            <div className={`p-4 rounded-xl max-w-2xl ${
                msg.sender === Sender.User ? 'bg-gray-700 text-right' : 
                msg.sender === Sender.AI ? 'bg-gray-800' : 
                'bg-yellow-900/50 text-center w-full text-yellow-300 italic'
            }`}>
              <p className="font-bold text-sm mb-1">{msg.sender}</p>
              <p className="whitespace-pre-wrap">{msg.text}{!msg.isFinal && '...'}</p>
            </div>

            {msg.sender === Sender.User && <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gray-600 flex items-center justify-center"><User className="w-5 h-5 text-gray-200" /></div>}
          </div>
        ))}
        <div ref={transcriptEndRef} />
      </main>
    </div>
  );
};

export default EvaluationView;
