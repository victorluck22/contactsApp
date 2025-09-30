# Design System (Material 3 Adaptado)

Este documento descreve o design system adotado no projeto, baseado em princípios do Material Design 3 (MD3) com paleta verde e uso extensivo de CSS Custom Properties.

## 1. Fundamentos

### 1.1. Paleta / Tokens (CSS Custom Properties)

Tokens definidos em `src/styles/global.css` via `:root` e variantes para modo claro/escuro (classes `.light` / `.dark`). Principais categorias:

- `--md-sys-color-primary` / `on-primary`
- `--md-sys-color-secondary(-container)` / `on-secondary(-container)`
- `--md-sys-color-tertiary(-container)` / `on-tertiary(-container)` (usado para avisos / estados de atenção neutros)
- `--md-sys-color-error(-container)` / `on-error(-container)`
- `--md-sys-color-surface(-variant)` / `on-surface(-variant)`
- `--md-sys-color-outline` / `outline-variant`

Diretriz: Nunca usar cores Tailwind arbitrárias (`text-red-500`, `bg-green-600`, etc.) para estados. Sempre mapear para tokens MD3 ou utilitários semânticos.

### 1.2. Tipografia

Base via Tailwind (text-sm, text-xs, font-medium). Ajustes locais apenas quando semanticamente necessário.

### 1.3. Espaçamento e Radius

- Radius padrão: `.rounded-md` (componentes), `.rounded-lg` (cards / menus), `.rounded-xl` (modais/autenticação).
- Espaçamento segue escala 2 / 4 / 6 / 8 / 12 / 16.

## 2. Elevação & Superfícies

Classes utilitárias (definidas em `global.css`):

- `elev-0` (flat) – geralmente não usada explicitamente.
- `elev-1` – base interativa (botões filled/elevated, navbar, sidebar containers).
- `elev-2` – sobreposições leves (menus, pequenos popovers, toasts).
- `elev-3` – modais principais.

Adicionar `hover:elev-2` ou transições conforme variante. Evitar sombras inline custom sem necessidade.

## 3. Ripple & State Layer

- Marcar elementos interativos com classe `md-ripple` + atributo `data-auto-ripple` (automático via `initAutoRipples` em `main.jsx`).
- Classe interna gerada: `.md-ripple-wave` (animada e removida ao fim da animação).
- Para hover sem ripple: usar state-layer `hover:bg-[var(--md-sys-color-primary)]/10` ou container específico (tonal container etc.).

## 4. Componentes

### 4.1. Botão (`Button.jsx`)

Variantes (prop `variant`):

- `filled` (padrão)
- `tonal`
- `outlined`
- `text`
- `elevated`

Aliases de legado: `solid`→`filled`, `ghost`→`text`, `outline`→`outlined`.

Estados:

- `disabled:opacity-60` + bloqueio de clique.
- Feedback de carregamento via `loading` (exibe ícone `Loader2`).
- Ripple automático.

### 4.2. Modal (`Modal.jsx`)

- Z-index padronizado (ver seção 6) acima do mapa e elementos interativos.
- Foco: só força foco no título quando nada interno já está focado.
- Scroll interno; body sem overflow para evitar double scrollbars.

### 4.3. AccountModal

- Versão isolada da antiga página; evita remontagens que causavam perda de foco.
- Usa tokens MD3 para todos estados (erro, sucesso, feedback).

### 4.4. Sidebar & Navbar

- Layout persistente com containers translúcidos (`bg-surface/80` + `backdrop-blur`).
- Sidebar: seleção tonal (secondary-container) e menus portalizados com foco acessível.
- Navbar: ações principais (novo contato, tema, conta) com variantes de botão apropriadas.

### 4.5. Form & InputOutlined

- InputOutlined (dentro de `Form.jsx`) com label flutuante controlada.
- Prop `suppressLabel` para remover label interna quando label externa existir.
- Erros exibidos usando `--md-sys-color-error` (texto/borda/focus ring).
- Foco preservado em todas interações (eliminação de remontagens).

### 4.6. ContactForm

- Usa contexto para criar/atualizar contatos.
- Ao salvar/excluir dispara toasts semânticos.

### 4.7. Sugestões de Endereço

- Hook `useAddressSuggestions` aplica debounce (450ms), aborta requisições anteriores e trata CEP (8 dígitos) como atalho direto.
- Normaliza resposta de `/addresses/suggest` (placeId, mainText, secondaryText → address, neighborhood, city, state).
- Possível evolução: endpoint de detalhes para CEP real, lat/lng e número.

### 4.8. Busca Unificada de Contatos

- Hook `useContactSearch` (Sidebar + modal) centraliza debounce (400ms), abort e ordenação.
- Ambos componentes compartilham UX: limpar, loading spinner, lista ordenada.

### 4.9. Normalização de Contatos

- Função `normalizeContact` garante schema flat: { id, name, cpf, phone, email, zipCode, state, locality, neighborhood, address, number, complement, lat, lng }.
- Atualizações pós create/update disparam refetch para sincronizar campos calculados (ex: lat/lng escalados pelo backend).

### 4.10. Toasts

- `toast.success` usado para criação e atualização (consistência visual, evita transparência anterior de info).
- Barra de progresso reflete duração (default 3500ms). Tipos mapeados a containers MD3.
- Mensagens não são strings soltas: centralizadas em `src/constants/feedbackMessages.js` (objeto `FEEDBACK`).

### 4.11. Centralização de Mensagens (FEEDBACK)

Arquivo: `src/constants/feedbackMessages.js`

Estrutura principal (exemplo):

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
        "Sua conta foi removida. Crie uma nova para voltar a usar a aplicação.",
    },
    deleteError: (reason) => ({
      title: "Falha ao excluir conta",
      description: reason || "Não foi possível excluir a conta agora.",
    }),
  },
};
```

Diretrizes:

- Sempre usar `FEEDBACK` ao emitir toasts em fluxos de perfil/conta ou equivalentes futuros.
- Funções ao invés de strings simples permitem interpolação (`name`, motivos de erro) e futura i18n.
- Novas categorias devem manter padrão `{ actionSuccess, actionError }` ou objetos aninhados com coerência semântica.
- Evitar literais duplicadas em componentes (`AccountModal`, `ContactForm`, etc.).

## 5. Feedback / Estados

Utilitários padronizados (em `global.css`):

- `.alert-error`
- `.alert-success`
- `.alert-warning`
- `.alert-info`

Uso: blocos inline de feedback (ex: mensagens de sessão expirada, validação, confirmação). Nunca misturar com classes Tailwind de cor direta.

Toasts (`ToastContext.jsx`):

- Success → primary-container
- Danger/Error → error-container
- Warning → tertiary-container
- Info → surface

Integração com FEEDBACK:

- Componentes chamam `toast.success(FEEDBACK.profile.updateSuccess(name))` ou variantes de erro.
- Mantém consistência e reduz divergência textual entre modais e notificações.

## 6. Camadas (Z-Index Map)

Documentado em `global.css` (comentário):

- 200–250 Menus dropdown / popovers
- 300 Sidebar mobile drawer
- 400 Overlays contextuais (hover tooltips se adicionados futuramente)
- 500 Menus de usuário / portais principais
- 520 Toast viewport
- 640 Modal genérico
- 650 AccountModal
- 700+ Reservado (futuras sobreposições críticas)

Regra: Evitar números arbitrários novos; reutilizar a escala ou promover formalmente no comentário.

## 7. Acessibilidade

- Botões e itens de menu: sempre `aria-label` quando ícone único.
- Menus portalizados com foco inicial no primeiro item e ESC para fechar.
- Modal: role e aria attrs herdados (ver implementação) + foco gerenciado.
- Toasts: `role="alert"` para erros, `role="status"` para demais.

## 8. Convenções de Código

- Nenhum estado visual direto baseado em classes Tailwind de cor (exceto neutralidades como `border`, `opacity-*`).
- Preferir utilitários semânticos ou tokens MD3.
- Evitar criação de variantes inline de sombra/cor se equivalentes já existirem (reaproveitar `elev-*`).
- Remoção periódica de exports não utilizados (vide limpeza de `motion.js`).

## 9. Extensões Futuras (Sugestões)

- Extrair tokens para um arquivo JS exportando mapa (para uso em testes ou geração dinâmica de temas).
- Introduzir modo "high contrast" alternando subconjunto de tokens.
- Criar `<Field>` genérico que compõe label, hint, error e InputOutlined.
- Adicionar testes de acessibilidade (axe) nos componentes de feedback e modais.

## 10. Exemplos Rápidos

Botão Tonal:

```jsx
<Button variant="tonal" onClick={save}>
  Salvar
</Button>
```

Mensagem de Erro:

```jsx
<div className="alert-error">CPF inválido</div>
```

Toast de Sucesso:

```jsx
const toast = useToast();
toast.success({ title: "Contato criado" });
```

Modal (

```jsx
<Modal open={open} onClose={close} title="Editar Contato">
  <ContactForm initial={contact} onSubmit={handleSave} />
</Modal>
```

## 11. Manutenção

Checklist ao criar um novo componente:

1. Precisa de variantes? Reusar padrões existentes.
2. Interativo? Adicionar `md-ripple` + `data-auto-ripple`.
3. Cor de fundo / texto? Usar tokens MD3 (surface / container / primary / error etc.).
4. Estados (erro/sucesso/aviso)? Usar utilitários `.alert-*` ou toasts.
5. Camada? Validar z-index contra mapa.
6. Acessibilidade: aria-label / roles / foco inicial.

---

Este documento evoluirá conforme novos componentes e princípios forem adicionados. Manter sincronizado com o código após qualquer refatoração estilística.
