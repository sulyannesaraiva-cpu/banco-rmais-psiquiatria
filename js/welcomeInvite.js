/* Boas-vindas e convite.
   - Boas-vindas: para quem chega pela primeira vez (sem plano e sem nenhuma questão respondida),
     um cartão no topo de Hoje explica o site em 3 passos e leva a criar o plano ou a conta. Quem
     chega por um link de convite (?convite) vê também que foi convidado por um colega.
   - Convite: botão "Convidar colegas" no menu, que abre o compartilhamento do celular ou copia o
     link do site com uma mensagem curta. */

const WELCOME_DONE_KEY = "banco-rmais-welcome-done";
const INVITE_PARAM = "convite";

state.invited = new URLSearchParams(location.search).has(INVITE_PARAM);

function shouldShowWelcome() {
  if (localStorage.getItem(WELCOME_DONE_KEY)) return false;
  if (state.studyPlan) return false;
  return !Object.values(state.progress || {}).some((progress) => progress?.grade);
}

function dismissWelcome() {
  localStorage.setItem(WELCOME_DONE_KEY, String(Date.now()));
  renderWelcome();
}

function renderWelcome() {
  const card = document.querySelector("#welcomeCard");
  if (!card) return;
  const visible = shouldShowWelcome() && !document.querySelector("#startPanel")?.hidden;
  card.hidden = !visible;
  if (!visible) return;
  const html = `
    ${state.invited ? '<span class="welcome-kicker">Você foi convidado por um colega</span>' : ""}
    <h2>Bem-vindo ao Psiquiatria em Questão</h2>
    <p>Questões de provas de residência e de títulos, flashcards e um plano de estudo que se ajusta à sua prova.</p>
    <ol class="welcome-steps">
      <li><strong>Monte seu plano</strong><span>Escolha as provas que vai fazer, a data e quanto tempo tem por dia.</span></li>
      <li><strong>Estude o dia</strong><span>O site separa as revisões, as questões novas e os flashcards de cada dia.</span></li>
      <li><strong>Acompanhe até a prova</strong><span>Veja seu acerto por tema e onde concentrar o esforço.</span></li>
    </ol>
    <div class="welcome-actions">
      <button type="button" class="primary-btn" data-welcome="plan">Montar meu plano</button>
      ${state.authUser ? "" : '<button type="button" class="outline-btn" data-welcome="account">Criar conta para salvar o progresso</button>'}
      <button type="button" class="link-btn" data-welcome="close">Agora não</button>
    </div>`;
  if (card.dataset.renderedHtml !== html) {
    card.innerHTML = html;
    card.dataset.renderedHtml = html;
  }
}

async function inviteColleagues() {
  const url = `${location.origin}/?${INVITE_PARAM}=1`;
  const text = "Estou usando o Psiquiatria em Questão para estudar para as provas: questões comentadas, flashcards e plano de estudo. Experimenta:";
  const status = document.querySelector("#inviteStatus");
  try {
    if (navigator.share) {
      await navigator.share({ title: "Psiquiatria em Questão", text, url });
      return;
    }
    await navigator.clipboard.writeText(`${text} ${url}`);
    if (status) status.textContent = "Link copiado. É só colar na conversa.";
  } catch (error) {
    if (error?.name === "AbortError") return;
    if (status) status.textContent = `Copie e envie: ${url}`;
  }
  if (status) setTimeout(() => { status.textContent = ""; }, 6000);
}

(function setupWelcomeInvite() {
  document.querySelector("#welcomeCard")?.addEventListener("click", (event) => {
    const action = event.target.closest("[data-welcome]")?.dataset.welcome;
    if (!action) return;
    dismissWelcome();
    if (action === "account") {
      setSidebarCollapsed(false);
      const form = document.querySelector("#authForm");
      if (form) form.open = true;
      document.querySelector("#authEmail")?.focus();
    } else if (action === "plan") {
      document.querySelector(".plan-form")?.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  });
  document.querySelector("#inviteBtn")?.addEventListener("click", inviteColleagues);

  const baseRender = render;
  render = function renderWithWelcome(...args) {
    const result = baseRender.apply(this, args);
    renderWelcome();
    return result;
  };
})();
