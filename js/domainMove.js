/* Mudança de endereço: banco-rmais-psiquiatria.vercel.app -> domínio próprio.
   O navegador guarda o progresso por endereço, então quem estuda sem conta no endereço antigo
   abriria o novo "zerado". No endereço antigo aparece um aviso no topo:
   - sem conta e com progresso: criar a conta aqui antes (o progresso sobe e volta no novo);
   - com conta: é só entrar no novo endereço.
   Fica desligado enquanto NEW_SITE_URL estiver vazio. Depois de um tempo, o endereço antigo
   passa a redirecionar direto (configuração na Vercel) e este arquivo pode sair. */

const NEW_SITE_URL = "";
const OLD_SITE_HOST = "banco-rmais-psiquiatria.vercel.app";
const DOMAIN_MOVE_SNOOZE_KEY = "banco-rmais-domain-move-snooze";
const DOMAIN_MOVE_SNOOZE_MS = 3 * 24 * 60 * 60 * 1000;

function domainMoveActive() {
  if (!NEW_SITE_URL || location.hostname !== OLD_SITE_HOST) return false;
  const snoozedAt = Number(localStorage.getItem(DOMAIN_MOVE_SNOOZE_KEY) || 0);
  return Date.now() - snoozedAt > DOMAIN_MOVE_SNOOZE_MS;
}

function renderDomainMove() {
  const banner = document.querySelector("#domainMoveBanner");
  if (!banner) return;
  banner.hidden = !domainMoveActive();
  if (banner.hidden) return;
  const host = NEW_SITE_URL.replace(/^https?:\/\//, "").replace(/\/$/, "");
  const hasLocalProgress = Object.values(state.progress || {}).some((progress) => progress?.grade);
  const html = state.authUser
    ? `<p><strong>O site mudou de endereço: ${escapeHtml(host)}</strong><span>Seu progresso está salvo na conta. É só entrar com o mesmo email no endereço novo.</span></p>
       <div class="domain-move-actions"><a class="primary-btn" href="${escapeHtml(NEW_SITE_URL)}">Ir para o novo endereço</a><button type="button" class="link-btn" data-domain-move="snooze">Agora não</button></div>`
    : hasLocalProgress
    ? `<p><strong>O site mudou de endereço: ${escapeHtml(host)}</strong><span>Seu progresso está guardado só neste navegador. Crie uma conta aqui antes de mudar para levar tudo com você.</span></p>
       <div class="domain-move-actions"><button type="button" class="primary-btn" data-domain-move="account">Criar conta e levar meu progresso</button><a class="outline-btn" href="${escapeHtml(NEW_SITE_URL)}">Ir sem levar</a><button type="button" class="link-btn" data-domain-move="snooze">Agora não</button></div>`
    : `<p><strong>O site mudou de endereço: ${escapeHtml(host)}</strong><span>Atualize seus favoritos.</span></p>
       <div class="domain-move-actions"><a class="primary-btn" href="${escapeHtml(NEW_SITE_URL)}">Ir para o novo endereço</a></div>`;
  if (banner.dataset.renderedHtml !== html) {
    banner.innerHTML = html;
    banner.dataset.renderedHtml = html;
  }
}

(function setupDomainMove() {
  const banner = document.querySelector("#domainMoveBanner");
  if (!banner) return;
  banner.addEventListener("click", (event) => {
    const action = event.target.closest("[data-domain-move]")?.dataset.domainMove;
    if (action === "snooze") {
      localStorage.setItem(DOMAIN_MOVE_SNOOZE_KEY, String(Date.now()));
      renderDomainMove();
    } else if (action === "account") {
      setSidebarCollapsed(false);
      const form = document.querySelector("#authForm");
      if (form) form.open = true;
      document.querySelector("#authEmail")?.focus();
    }
  });

  const baseRender = render;
  render = function renderWithDomainMove(...args) {
    const result = baseRender.apply(this, args);
    renderDomainMove();
    return result;
  };
})();
