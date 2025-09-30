# Frontend App

Stack principal: React + Vite + TailwindCSS + Framer Motion + lucide-react (JavaScript).

> Design System completo: [DESIGN_SYSTEM.md](./DESIGN_SYSTEM.md)

Este README inclui agora:

1. Visão Geral Rápida
2. Mudanças de Arquitetura e Schema (retrocompatibilidade)
3. Fluxos de Autenticação e Verificação de E‑mail
4. Fluxo de Recuperação e Redefinição de Senha (token + email)
5. Contatos: Normalização, Flatten e Service Layer
6. Design System (resumo) + Acessibilidade
7. Testes e Helpers
8. Scripts e Execução
9. Próximos Passos / Melhorias Futuras
10. Perfil do Usuário (Atualização & Exclusão)
11. Centralização de Mensagens (Toasts)
12. Resumo Executivo (Changelog)
13. Requisitos
14. Instalação
15. Desenvolvimento
16. Build de Produção
17. Estrutura
18. Convenções
19. Acessibilidade & UX

- Autenticação baseada em token (mockável via `VITE_AUTH_MOCK=true`).

---

## 1. Visão Geral

- Endereços: CEP, sugestões (debounce + abort) e lat/lng usados no mapa (Leaflet) com futura expansão para detalhes por placeId.

Aplicação de gerenciamento de contatos com:

- `contactsService` abstrai operações remotas (`list`, `search`, `create`, `update`, `remove`) e mapeia campos de backend (ex: `zip_code`→`zipCode`, `city`→`locality`, `latitude_real/longitude_real` → escala dividindo por 1e6).
- Autenticação baseada em token (mockável via `VITE_AUTH_MOCK=true`).
- Registro com verificação de e‑mail obrigatória (não autentica automaticamente).
- CRUD de contatos integrado a `contactsService` (pronto para backend real) com otimização otimista.
- Geocache / endereço: CEP, sugestões e lat/lng associados para exibição em mapa (Leaflet).
- Normalização (`normalizeContact`) unifica schema flat: `{ id, name, cpf, phone, email, zipCode, state, locality, neighborhood, address, number, complement, lat, lng }` independentemente da forma recebida.
- Busca unificada de contatos via hook `useContactSearch` (debounce 400ms + abort de requisições antigas) usada na Sidebar e modal de busca.
- Loading state: skeleton / placeholders até primeira resposta.
- Mapa (`MapView`) apenas renderiza contatos com `lat`/`lng` numéricos (evita `Invalid LatLng`).
- Sidebar mostra linha secundária com `locality/state` e `neighborhood` (quando existir).
- Design System Material 3 adaptado (paleta verde) + tokens, ripple e elevação.
- Testes Vitest + Testing Library cobrindo fluxos principais (login, reset, criação de contato, rotas protegidas, mapa).

---

## 2. Mudanças de Arquitetura & Schema

Evolução do schema de contatos (flatten + normalização retrocompatível):

| Campo Antigo (possível)                               | Campo Novo     | Observações                      |
| ----------------------------------------------------- | -------------- | -------------------------------- |
| `nome`                                                | `name`         | Normalizado para inglês          |
| `telefone`                                            | `phone`        |                                  |
| `endereco.cep` / `completeAddress.zipCode`            | `zipCode`      | Flatten                          |
| `endereco.uf` / `completeAddress.state`               | `state`        | Flatten                          |
| `endereco.cidade` / `completeAddress.city` / `city`   | `locality`     | Unificado em `locality`          |
| `endereco.bairro` / `completeAddress.neighborhood`    | `neighborhood` | Flatten                          |
| `endereco.logradouro` / `completeAddress.address`     | `address`      | Flatten                          |
| `endereco.numero` / `completeAddress.number`          | `number`       | Flatten                          |
| `endereco.complemento` / `completeAddress.complement` | `complement`   | Flatten                          |
| (lat/lng aninhado ou escalado)                        | `lat`,`lng`    | Guardado no nível raiz (1e6 fix) |

Notas:

- `normalizeContact` trata todos os formatos acima e descarta chaves legadas após conversão.
- Coordenadas: backend pode enviar `latitude_real/longitude_real` escalados (1e6). Serviço divide para armazenar como float direto.
- Busca: hook `useContactSearch` opera sempre sobre a coleção já normalizada.
- Endereço: hook `useAddressSuggestions` usa debounce (450ms) + abort para reduzir requisições e retorna estrutura pronta para `ContactForm`.

---

## 3. Fluxo de Autenticação & Verificação de E‑mail

1. Login (`authService.login`) retorna `{ user, token, expiresAt? }` e persiste em `localStorage` (`app_auth_v1`).
2. Registro (`authService.register`) retorna apenas `{ success, message }` e NÃO autentica o usuário (aguarda verificação por link de e‑mail). A página `Register` exibe a mensagem e desabilita o botão.
3. Verificação de token inicial: `AuthContext` tenta validar token existente via `authService.verifyToken` (rota `/auth/user` por padrão configurável).
4. Logout dispara limpeza local e chamada opcional ao backend (`/auth/logout`).
5. Evento global custom `app:auth-unauthorized` força logout centralizado.

Ambiente Mock:

- Ativar com `VITE_AUTH_MOCK=true` (ou `MODE=test`).
- Fluxos de login/registro/reset retornam respostas simuladas estáveis.

---

## 4. Redefinição de Senha (token + email)

Fluxo Atual:

1. Usuário solicita link via Forgot Password (`requestPasswordReset`).
2. Backend envia e‑mail com URL contendo `?token=...&email=...`.
3. Página `/reset-password` lê query params. Sem ambos → mostra erro.
4. Envio chama `authService.resetPasswordTokenEmail({ token, email, password, password_confirmation })`.
5. Sucesso exibe mensagem e desabilita interação.

Suporte residual a fluxo antigo id/hash mantido em `authService.resetPasswordWithHash` (pode ser removido quando não mais necessário).

---

## 5. Contatos: Service Layer e Normalização

- `contactsService` abstrai operações remotas (`list`, `create`, `update`, `remove`).
- `ContactsContext` oferece estado global + otimização otimista (aplica alterações localmente e reverte se falhar).
- Loading state: exibe skeleton / placeholders na Sidebar até primeira carga.
- Normalização garante que qualquer payload legado com `endereco` ou `completeAddress` seja convertido.
- Mapa (`MapView`) filtra contatos sem `lat`/`lng` válidos evitando erros `Invalid LatLng`.

---

## 6. Design System (Resumo)

Componentes e padrões centrais:

- Tokens de cor MD3 (`--md-sys-color-*`) claro/escuro.
- Variantes de botão: filled, tonal, outlined, text, elevated (aliases de legado convertidos internamente).
- Elevação utilitária: classes `elev-*` + transições suaves.
- Ripple automático: classe `md-ripple` + atributo `data-auto-ripple` inicializado em `main.jsx`.
- Feedback: utilitários `.alert-{error|success|warning|info}` e toasts semânticos.
- Z-Index map documentado para consistência em sobreposições.

Detalhes completos em `DESIGN_SYSTEM.md` (inclui agora seção sobre centralização de mensagens FEEDBACK para toasts semânticos e futura i18n).

---

## 7. Testes

Configuração:

- Vitest + @testing-library/react.
- Helper `renderWithProviders` monta todos os contextos com `MemoryRouter`.

Casos Cobertos (exemplos):

- Login (sucesso + erro)
- Forgot Password (envio de link)
- Reset Password (token & email: ausência, sucesso, mismatch)
- Create Contact (form + integração contexto)
- Map Markers (renderização sem erros com lat/lng válidos)
- Protected Route (bloqueio sem token)

Próxima cobertura sugerida:

- Fluxo de registro (mensagem exibida + não autenticação automática) → teste adicionado em breve.
- Hook de sugestões de endereço (robustez em chaves `state`/`uf`).

Para rodar:

```powershell
npm test
```

---

## 8. Scripts

Desenvolvimento:

```powershell
npm run dev
```

Build / Preview:

```powershell
npm run build
npm run preview
```

Lint (se configurado):

```powershell
npm run lint
```

---

## 9. Perfil do Usuário (Atualização & Exclusão)

### Atualização de Nome

- O modal "Minha Conta" permite editar apenas o campo `name` por enquanto.
- A atualização chama `updateUserProfile` (AuthContext) que delega a `authService.updateProfile` (rota assumida `PUT /auth/user`).
- Otimização: só após resposta bem-sucedida o nome é persistido e um `toast.success` é exibido usando mensagens padronizadas em `FEEDBACK.profile.updateSuccess`.
- Em falha: `toast.danger` com texto de `FEEDBACK.profile.updateError`.

### Exclusão de Conta

- Formulário solicita a senha de confirmação.
- Chama `authService.deleteAccount` (rota assumida `POST /auth/delete-account`).
- Sucesso: realiza `logout()`, remove storage, fecha modal, redireciona para `/login` e exibe `toast.success` com instrução para criar nova conta (`FEEDBACK.account.deleteSuccess`).
- Erro: `toast.danger` usando `FEEDBACK.account.deleteError`.

### Acessibilidade / UX

- Fluxo usa foco gerenciado + Escape para fechar.
- Botões desabilitados enquanto `loading`.

## 10. Centralização de Mensagens (Toasts)

Arquivo: `src/constants/feedbackMessages.js`

Estrutura:

```js
export const FEEDBACK = {
  profile: {
    updateSuccess: (name) => ({
      title: "Nome atualizado",
      description: `Seu nome foi alterado para ${name}.`,
    }),
    updateError: (reason) => ({
      title: "Falha ao atualizar perfil",
      description: reason || "Não foi possível salvar suas alterações.",
    }),
  },
  account: {
    deleteSuccess: {
      title: "Conta excluída",
      description:
        "Sua conta foi removida com sucesso. Para voltar a usar a aplicação, crie uma nova conta.",
    },
    deleteError: (reason) => ({
      title: "Falha ao excluir conta",
      description: reason || "Não foi possível excluir a conta agora.",
    }),
  },
};
```

Benefícios:

- Facilita futura i18n (substituição única do arquivo).
- Evita discrepâncias de texto entre modal e toasts.
- Padroniza título + descrição para sucesso/erro.

## 11. Resumo Executivo das Alterações (Changelog Recente)

- Registro deixa de autenticar automaticamente; exige verificação de e‑mail.
- Adicionado fluxo completo de reset de senha por `token + email` com página dedicada e testes.
- Schema de contatos flatten (zipCode/state/locality/address/number/complement + lat/lng) e normalização retroativa.
- Integração de `contactsService` com carregamento assíncrono + UI de loading.
- Design System consolidado com ripple automático e utilitários semânticos.
- Mapa robusto contra coordenadas inválidas.
- Testes ampliados para fluxos críticos.

---

## 12. Requisitos

- Node 18+
- PNPM, NPM ou Yarn (exemplos abaixo usam npm)

## 13. Instalação

```powershell
npm install
```

## 14. Desenvolvimento

```powershell
npm run dev
```

Abrirá em: http://localhost:5173

## 15. Build de Produção

```powershell
npm run build
npm run preview
```

## 16. Estrutura

```
public/
  favicon.ico   # Icone da aplicação(favicon)
src/
  components/   # Componentes UI base (Button, Card, Layout, Navbar, Sidebar)
  lib/          # Helpers (motion variants)
  styles/       # Estilos globais Tailwind
  App.jsx       # Definição de rotas e páginas placeholder
  main.jsx      # Entry point React
```

## 17. Convenções

- Componentes em PascalCase
- Utilidades em camelCase
- Estilos + tokens em `src/styles/global.css`
- Animações reutilizáveis remanescentes em `lib/motion.js` (`fadeIn`)
- Evitar cores Tailwind diretas para estados (usar tokens MD3)

## 18. Acessibilidade & UX

- Foco visível com ring consistente nos componentes interativos
- Tema claro/escuro suportado (`ThemeProvider` + classe `light`/`dark` no root)
- Menus e modais portalizados com gerenciamento de foco
- Toasts com roles apropriados (`alert`/`status`)

<!-- Seção 19 antiga removida (duplicada). Conteúdo de testes consolidado na seção 7. -->
