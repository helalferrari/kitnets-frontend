# Kitnets Frontend

Este é o projeto frontend da aplicação de gerenciamento e busca de Kitnets. Desenvolvido utilizando **Next.js** e **Tailwind CSS**, o projeto foca em performance, usabilidade e uma interface moderna para listar e visualizar detalhes de imóveis.

## 🚀 Stack Tecnológica

O projeto foi construído sobre uma base moderna utilizando as seguintes tecnologias principais:

-   **Framework Web:** [Next.js 16](https://nextjs.org/) (App Router)
-   **Biblioteca UI:** [React 19](https://react.dev/)
-   **Estilização:** [Tailwind CSS 4](https://tailwindcss.com/)
-   **Linting:** [ESLint](https://eslint.org/)
-   **Gerenciamento de Pacotes:** npm

## 📦 Dependências

As principais dependências do projeto (definidas no `package.json`) incluem:

-   `next`: ^16.0.10
-   `react`: ^19.2.1
-   `react-dom`: ^19.2.1
-   `tailwindcss`: ^4.0.0

## ⚙️ Configuração

### Pré-requisitos

-   **Node.js**: Versão 18.17 ou superior.
-   **Backend**: É necessário que a API de Backend esteja rodando localmente na porta `8080`.
    -   O código fonte da API pode ser encontrado neste repositório: [https://github.com/helalferrari/kitnets-api](https://github.com/helalferrari/kitnets-api)

### Variáveis de Ambiente e Constantes

Atualmente, as URLs da API estão configuradas diretamente nos arquivos:
-   **Base URL da API**: `http://localhost:8080`
-   **Imagens**: O projeto está configurado para permitir carregamento de imagens de `localhost:8080` e `placehold.co` (ver `next.config.mjs`).

## ▶️ Execução

Siga os passos abaixo para rodar o projeto localmente:

1.  **Instalar dependências:**
    ```bash
    npm install
    ```

2.  **Rodar o servidor de desenvolvimento:**
    ```bash
    npm run dev
    ```
    O frontend estará acessível em `http://localhost:3000`.

3.  **Build de produção:**
    ```bash
    npm run build
    npm start
    ```

4.  **Verificar qualidade de código (Lint):**
    ```bash
    npm run lint
    ```

## 🧪 Testes

Atualmente o projeto não possui uma suíte de testes automatizados (Jest/Cypress). A validação de código é feita através do **ESLint** para garantir padrões de código e boas práticas.

Recomenda-se rodar `npm run lint` antes de submeter qualquer alteração.

## 🤝 Contribuição

Para contribuir com o projeto:

1.  Faça um **Fork** do repositório.
2.  Crie uma branch para sua feature (`git checkout -b feature/nova-feature`).
3.  Commit suas mudanças (`git commit -m 'feat: adiciona nova feature'`).
4.  Faça o Push para a branch (`git push origin feature/nova-feature`).
5.  Abra um **Pull Request**.

### Padrões de Commit
Utilizamos Conventional Commits:
-   `feat:` para novas funcionalidades.
-   `fix:` para correção de bugs.
-   `docs:` para alterações na documentação.
-   `style:` para formatação, ponto e vírgula, etc.
-   `refactor:` para refatoração de código.

## 📄 Licença

Este projeto está licenciado sob a licença [MIT](https://opensource.org/licenses/MIT).