
export enum Sender {
  User = 'Cadete',
  AI = 'Barbeiro',
  System = 'System',
}

export interface TranscriptMessage {
  sender: Sender;
  text: string;
  isFinal: boolean;
}

export enum EvaluationPhase {
  Prerequisites = 'Pré-Requisitos e Instruções',
  Functional = 'Verificação de Requisitos Funcionais',
  CodeDefense = 'Defesa do Código',
  Conclusion = 'Conclusão e Pontuação',
}
