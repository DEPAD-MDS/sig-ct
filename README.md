# SIG-CT: Sistema de Informação e Gestão

## Visão Geral do Projeto

O **SIG-CT** (Sistema de Informação e Gestão - CT) é uma plataforma *full-stack* desenvolvida para fornecer uma visão abrangente e analítica de dados críticos, com foco em informações geográficas e de gestão de programas específicos (como CEBAS e Repasses). O sistema atua como um *dashboard* de Inteligência de Negócios (BI) e um Sistema de Informação Geográfica (SIG), permitindo aos usuários a visualização de dados em mapas, gráficos e tabelas interativas.

## Arquitetura do Sistema

O projeto adota uma arquitetura moderna, dividida em duas camadas principais que se comunicam via API REST:

| Camada | Componente | Descrição |
| :--- | :--- | :--- |
| **Backend (API)** | `api/` | Responsável pela lógica de negócios, persistência de dados, autenticação e exposição dos *endpoints* de dados. Segue um padrão de organização por *services* e *routers* (controladores). |
| **Frontend (UI)** | `src/` | Interface do usuário, responsável pela apresentação dos dados, interatividade e visualização. Implementa o *dashboard* com recursos de mapeamento e gráficos. |

### Fluxo de Dados

1.  O **Frontend** (React) solicita dados aos *endpoints* da API.
2.  A **API** (FastAPI) processa a requisição, interage com o banco de dados (via SQLAlchemy) e aplica a lógica de negócios.
3.  Os dados são retornados ao **Frontend** em formato JSON.
4.  O **Frontend** utiliza bibliotecas de visualização (Chart.js, Leaflet) para renderizar os dados em *dashboards* e mapas.

## 💻 Tecnologias Utilizadas

O SIG-CT é construído com um *stack* de tecnologias robusto e de alto desempenho:

### Backend (API)

| Tecnologia | Função |
| :--- | :--- |
| **Python** | Linguagem de programação principal. |
| **FastAPI** | Framework web moderno para construção da API REST, garantindo alta performance e tipagem de dados. |
| **SQLAlchemy** | ORM (Object-Relational Mapper) para abstração e manipulação do banco de dados. |
| **MSAL (Microsoft Authentication Library)** | Utilizado para autenticação e autorização, sugerindo integração com **Azure Active Directory** (Azure AD). |
| **PyJWT** | Implementação de JSON Web Tokens para segurança e gerenciamento de sessões. |
| **Uvicorn** | Servidor ASGI de alta performance para rodar a aplicação FastAPI. |

### Frontend (UI)

| Tecnologia | Função |
| :--- | :--- |
| **React** | Biblioteca JavaScript para construção da interface do usuário. |
| **TypeScript** | Superset do JavaScript que adiciona tipagem estática, melhorando a manutenibilidade e a detecção de erros. |
| **Tailwind CSS** | Framework CSS *utility-first* para estilização rápida e responsiva. |
| **React Router** | Gerenciamento de rotas e navegação na aplicação de página única (SPA). |
| **@tanstack/react-query** | Gerenciamento de estado assíncrono, *caching* e sincronização de dados do servidor. |
| **Leaflet & React-Leaflet** | Biblioteca para criação de mapas interativos e visualização de dados geográficos (GIS). |
| **Chart.js & React-Chartjs-2** | Bibliotecas para renderização de gráficos e visualizações de dados. |
| **MSAL Browser & MSAL React** | Integração da autenticação Azure AD no lado do cliente. |

## 🚀 Guia de Instalação e Uso

Para configurar e executar o projeto localmente, siga os passos abaixo.

### Pré-requisitos

Certifique-se de ter instalado em sua máquina:

*   **Python 3.10+**
*   **Node.js 18+**
*   **pnpm** (ou npm/yarn)
*   **Git**

### 1. Clonar o Repositório

```bash
git clone https://github.com/DEPAD-MDS/sig-ct.git
cd sig-ct
```

### 2. Configuração do Backend (API)

O backend requer um arquivo de variáveis de ambiente (`.env`) para a configuração do banco de dados e autenticação.

1.  Crie um arquivo `.env` na pasta `api/`.
2.  Adicione as variáveis de ambiente necessárias (exemplo):

    ```env
    # Exemplo de configuração de Banco de Dados (ajuste conforme seu SGBD)
    URL_DATABASE="postgresql://user:password@host:port/dbname"
    
    # Configurações de Autenticação MSAL/Azure AD
    # ... (outras variáveis de segurança e autenticação)
    ```

3.  Instale as dependências e inicie o servidor:

    ```bash
    cd api
    pip install -r requirements.txt
    uvicorn index:app --reload
    ```

    A API estará acessível em `http://127.0.0.1:8000` (ou porta configurada).

### 3. Configuração do Frontend (UI)

1.  Crie um arquivo `.env` na pasta `src/`.
2.  Adicione as variáveis de ambiente necessárias (exemplo):

    ```env
    # URL da API Backend
    VITE_API_URL="http://localhost:8000"
    
    # Configurações de Autenticação MSAL/Azure AD
    VITE_MSAL_CLIENT_ID="<Seu Client ID do Azure AD>"
    VITE_MSAL_AUTHORITY="<Sua Authority URL>"
    # ... (outras variáveis)
    ```

3.  Instale as dependências e inicie a aplicação:

    ```bash
    cd ../src
    pnpm install
    pnpm dev
    ```

    A aplicação estará acessível em `http://localhost:3000` (ou porta configurada pelo Vite).

## 📂 Estrutura de Pastas

A estrutura do projeto reflete a separação entre *backend* e *frontend*:

```
sig-ct/
├── api/                  # Backend em Python (FastAPI)
│   ├── functions/        # Lógica de negócios e rotas por módulo (dashboard, user)
│   ├── services/         # Módulos de serviço e lógica de dados
│   ├── database.py       # Configuração do SQLAlchemy
│   ├── index.py          # Ponto de entrada da aplicação FastAPI
│   └── requirements.txt  # Dependências do Python
└── src/                  # Frontend em React/TypeScript
    ├── app/              # Componentes, hooks, rotas e serviços do React
    ├── public/           # Arquivos estáticos (imagens, geojson)
    ├── msalConfig.ts     # Configuração do MSAL
    ├── package.json      # Dependências do Node.js
    └── vite.config.ts    # Configuração do Vite
```
