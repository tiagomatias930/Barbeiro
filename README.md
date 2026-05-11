# O Padrinho - Simulador de Avaliação 42 Network

![O Padrinho Logo](https://img.shields.io/badge/42-Network-black?style=for-the-badge&logo=42)
![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white)
![Gemini AI](https://img.shields.io/badge/Gemini_AI-4285F4?style=for-the-badge&logo=google-gemini&logoColor=white)

O **O Padrinho** é uma ferramenta experimental projetada para ajudar cadetes da 42 Luanda a se prepararem para suas avaliações de projetos. Utilizando a potência da IA generativa do Google (Gemini), o simulador atua como um "Avaliador Virtual", realizando perguntas técnicas e desafiando o aluno a defender seu código por meio de interação por voz em tempo real.

---

## 🚀 Funcionalidades

- **Interação por Voz (Multimodal):** Converse diretamente com o avaliador. A IA processa sua voz e responde com áudio, simulando a dinâmica real de uma sala de avaliação.
- **Estrutura de 4 Fases:**
  1.  **Pré-Requisitos:** Verificação de ambiente e regras básicas.
  2.  **Testes Funcionais:** Simulação dos testes da Moulinette e casos de borda.
  3.  **Defesa de Código (Peer Review):** Perguntas profundas sobre lógica, algoritmos e conformidade com a *Norme*.
  4.  **Feedback e Pontuação:** Resultado final (PASS/FAIL) com críticas construtivas.
- **Transcrição em Tempo Real:** Acompanhe visualmente tudo o que está sendo dito durante a sessão.
- **Foco na 42:** Persona treinada para agir como um cadete experiente e rigoroso.

---

## 🛠️ Tecnologias Utilizadas

- **Frontend:** [React](https://reactjs.org/) + [Vite](https://vitejs.dev/)
- **Linguagem:** [TypeScript](https://www.typescriptlang.org/)
- **IA:** [Google Gemini API](https://ai.google.dev/) (Modelo `gemini-2.5-flash-native-audio-preview`)
- **Estilização:** [Tailwind CSS](https://tailwindcss.com/)
- **Ícones:** [Lucide React](https://lucide.dev/)

---

## 📦 Instalação e Configuração

### Pré-requisitos

1.  Uma chave de API do Google Gemini. Obtenha em [Google AI Studio](https://aistudio.google.com/).
2.  Node.js (versão recomendada v18 ou superior).

### Passo a Passo

1.  **Clone o repositório:**
    ```bash
    git clone https://github.com/seu-usuario/barbeiro.git
    cd barbeiro
    ```

2.  **Instale as dependências:**
    ```bash
    npm install
    ```

3.  **Configure as variáveis de ambiente:**
    Crie um arquivo `.env` na raiz do projeto ou configure no seu ambiente de desenvolvimento:
    ```env
    API_KEY=sua_chave_do_gemini_aqui
    ```

4.  **Inicie o servidor de desenvolvimento:**
    ```bash
    npm run dev
    ```

---

## 📖 Como Usar

1.  Ao abrir a aplicação, digite o nome do projeto que deseja simular (ex: `libft`, `get_next_line`, `ft_printf`).
2.  Clique em **"Iniciar Avaliação"**.
3.  Permita o acesso ao microfone no seu navegador.
4.  O avaliador começará a falar. Responda às perguntas dele usando seu microfone.
5.  Defenda seu projeto até o final das 4 fases para receber sua nota!

---

## ⚠️ Aviso Legal

Este projeto é uma ferramenta de estudo independente e **não possui ligação oficial** com a 42 Network ou com o sistema Moulinette. O objetivo é puramente educacional e pedagógico.

---

## 🤝 Contribuições

Contribuições são sempre bem-vindas! Se você tiver ideias para melhorar a persona do avaliador ou adicionar novos recursos, sinta-se à vontade para abrir uma *Issue* ou enviar um *Pull Request*.

---

Desenvolvido com ❤️ para a comunidade 42 Luanda.
