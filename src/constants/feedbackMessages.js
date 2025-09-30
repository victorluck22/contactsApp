// Centralização de mensagens de feedback (toasts / UI)
// Facilita i18n futura e manutenção consistente.

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
