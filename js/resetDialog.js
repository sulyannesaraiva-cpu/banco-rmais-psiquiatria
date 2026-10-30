/* Confirmação de "Reiniciar desempenho": diz o alcance real (navegador e, se logado, a conta),
   oferece baixar um backup antes e só libera o botão depois de digitar APAGAR. */

function downloadLocalBackup() {
  const data = {};
  for (let i = 0; i < localStorage.length; i += 1) {
    const key = localStorage.key(i);
    if (!key) continue;
    try {
      data[key] = JSON.parse(localStorage.getItem(key));
    } catch {
      data[key] = localStorage.getItem(key);
    }
  }
  const backup = {
    site: "Psiquiatria em Questão",
    exportedAt: new Date().toISOString(),
    note: "Cópia do que este navegador guarda (respostas, revisões, anotações, preferências).",
    data,
  };
  const blob = new Blob([JSON.stringify(backup, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `backup-psiquiatria-em-questao-${new Date().toISOString().slice(0, 10)}.json`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function openResetDialog(onConfirm) {
  document.querySelector("#resetDialog")?.remove();
  const logged = Boolean(state.authUser);
  const dialog = document.createElement("dialog");
  dialog.id = "resetDialog";
  dialog.className = "reset-dialog";
  dialog.setAttribute("aria-labelledby", "resetDialogTitle");
  dialog.innerHTML = `
    <form method="dialog" class="reset-dialog-body">
      <h2 id="resetDialogTitle">Reiniciar desempenho</h2>
      <p>Isso apaga acertos, erros, respostas marcadas, revisões programadas, anotações e alternativas riscadas.</p>
      <p class="reset-scope ${logged ? "cloud" : ""}">${logged
        ? "<b>Com login feito:</b> apaga deste navegador <b>e da sua conta</b>, em todos os aparelhos."
        : "<b>Modo local:</b> apaga só deste navegador."}</p>
      <p>O banco de questões não muda. <b>Não dá para desfazer.</b></p>
      <button type="button" class="reset-backup" data-reset-backup>Baixar meu backup antes</button>
      <label class="reset-type">Para confirmar, digite <b>APAGAR</b>
        <input type="text" autocomplete="off" autocapitalize="characters" spellcheck="false" data-reset-input aria-describedby="resetDialogTitle">
      </label>
      <div class="reset-actions">
        <button type="button" class="link-btn" data-reset-cancel>Cancelar</button>
        <button type="button" class="danger-lite" data-reset-confirm disabled>Apagar histórico</button>
      </div>
    </form>`;
  document.body.appendChild(dialog);
  const input = dialog.querySelector("[data-reset-input]");
  const confirmBtn = dialog.querySelector("[data-reset-confirm]");
  input.addEventListener("input", () => {
    confirmBtn.disabled = input.value.trim().toUpperCase() !== "APAGAR";
  });
  dialog.querySelector("[data-reset-backup]").addEventListener("click", downloadLocalBackup);
  dialog.querySelector("[data-reset-cancel]").addEventListener("click", () => dialog.close());
  confirmBtn.addEventListener("click", async () => {
    if (confirmBtn.disabled) return;
    confirmBtn.disabled = true;
    confirmBtn.textContent = "Apagando…";
    await onConfirm();
    dialog.close();
  });
  dialog.addEventListener("close", () => dialog.remove());
  if (typeof dialog.showModal === "function") dialog.showModal();
  else dialog.setAttribute("open", "");
  input.focus();
}
