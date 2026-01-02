# Kitnets Frontend 🖥️

Este é o projeto frontend da aplicação de gerenciamento e busca de Kitnets. Desenvolvido utilizando **Next.js** e **Tailwind CSS**, o projeto foca em performance, usabilidade e uma interface moderna para listar, visualizar e gerenciar imóveis.

## 🚀 Funcionalidades

- **Busca Semântica (IA):** Pesquisa inteligente em linguagem natural utilizando **Groq AI**. O usuário pode descrever o que procura (ex: "Kitnet mobiliada no centro com ar condicionado até R$ 1500") e a IA processa os critérios de busca.
- **Preenchimento Automático de CEP:** Integração com **BrasilAPI v2** para preenchimento automático de endereço e coordenadas geográficas a partir do CEP informado.
- **Painel do Proprietário:** Área administrativa completa para gerenciamento de anúncios.
- **Gestão de Kitnets:** Cadastro e edição de kitnets com novos campos:
    - Área (m²), Mobiliado, Aceita Pets, Tipo de Banheiro (Privativo/Compartilhado).
    - Lista de Comodidades (WiFi, Piscina, Academia, etc.).
- **Persistência de Busca:** Os resultados da pesquisa são mantidos mesmo após navegar para outras páginas, utilizando `sessionStorage`.
- **Performance:** Carregamento otimizado com limite de resultados e remoção de buscas desnecessárias no carregamento inicial.
- **Segurança:** Autenticação via JWT com perfis de acesso e proteção de rotas.

## 🛠️ Stack Tecnológica

-   **Framework Web:** [Next.js 16](https://nextjs.org/) (App Router)
-   **Biblioteca UI:** [React 19](https://react.dev/)
-   **Estilização:** [Tailwind CSS 4](https://tailwindcss.com/)
-   **IA / Busca Semântica:** Integração com **Groq AI** (via Backend)
-   **API de Endereços:** [BrasilAPI](https://brasilapi.com.br/)

## ⚙️ Configuração

### Pré-requisitos

-   **Node.js**: Versão 18.17 ou superior.
-   **Backend**: É necessário que a API de Backend esteja rodando localmente na porta `8080`.
    -   O backend deve estar configurado com a integração Groq para habilitar a busca semântica.
    -   Repositório: [https://github.com/helalferrari/kitnets-api](https://github.com/helalferrari/kitnets-api)

### Variáveis de Ambiente e Constantes

As URLs da API estão configuradas diretamente nos arquivos:
-   **Base URL da API**: `http://localhost:8080/api/kitnets`
-   **Imagens**: O projeto está configurado para permitir carregamento de imagens de `localhost:8080`.

## ▶️ Execução

1.  **Instalar dependências:** `npm install`
2.  **Rodar dev:** `npm run dev` (Acessível em `http://localhost:3000`)
3.  **Build:** `npm run build && npm start`

## 🤝 Contribuição

Utilizamos Conventional Commits:
-   `feat:` para novas funcionalidades.
-   `fix:` para correção de bugs.
-   `docs:` para documentação.
-   `refactor:` para refatoração de código.
-   `perf:` para melhorias de performance.

## 📄 Licença

Este projeto está licenciado sob a licença [MIT](https://opensource.org/licenses/MIT).