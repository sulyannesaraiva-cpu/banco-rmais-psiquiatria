/* Painel de uso (Administração), a partir de supabase/admin_usage_stats.sql: contas, pessoas
   que estudaram nos últimos 7 e 30 dias, questões respondidas, atividade diária do último mês e
   temas mais estudados. Também diz quando os recursos que dependem de vários usuários
   (comparação, gabaritos suspeitos) passam a ter dados. */

state.adminUsage = null;
state.adminUsageStatus = "idle";

async function loadAdminUsage() {
  if (!state.supabase || !state.isAdmin || state.adminUsageStatus === "loading") return;
  state.adminUsageStatus = "loading";
  const { data, error } = await state.supabase.rpc("admin_usage_stats");
  if (error || !data) {
    console.warn("admin_usage_stats indisponível:", error?.message);
    state.adminUsageStatus = "unavailable";
  } else {
    state.adminUsage = data;
    state.adminUsageStatus = "ready";
    state.adminUsageLoadedAt = Date.now();
  }
  renderAdminUsage();
}

function renderAdminUsage() {
  const host = document.querySelector("#adminUsage");
  if (!host) return;
  host.hidden = !state.isAdmin;
  if (!state.isAdmin) return;
  const usage = state.adminUsage;
  const format = (n) => Number(n || 0).toLocaleString("pt-BR");
  let html;
  if (state.adminUsageStatus === "unavailable") {
    html = '<h3>Uso do site</h3><p class="panel-line">Para ver os números de uso, rode <strong>supabase/admin_usage_stats.sql</strong> no SQL Editor do Supabase.</p>';
  } else if (!usage) {
    html = '<h3>Uso do site</h3><p class="panel-line">Carregando…</p>';
  } else {
    const daily = usage.daily || [];
    const days = [];
    for (let i = 29; i >= 0; i -= 1) {
      const key = localDayKey(Date.now() - i * DAY_MS);
      days.push(daily.find((item) => item.day === key) || { day: key, users: 0, attempts: 0 });
    }
    const maxAttempts = Math.max(1, ...days.map((item) => item.attempts));
    const themes = usage.top_temas || [];
    const maxTheme = Math.max(1, ...themes.map((item) => item.attempts));
    const enough = Number(usage.active_30d || 0) >= 5;
    html = `
      <h3>Uso do site</h3>
      <div class="usage-cards">
        <div><strong>${format(usage.total_users)}</strong><span>contas · ${format(usage.new_users_30d)} novas em 30 dias</span></div>
        <div><strong>${format(usage.active_7d)}</strong><span>estudaram nos últimos 7 dias</span></div>
        <div><strong>${format(usage.active_30d)}</strong><span>estudaram nos últimos 30 dias</span></div>
        <div><strong>${format(usage.attempts_7d)}</strong><span>questões respondidas em 7 dias · ${format(usage.attempts_total)} no total</span></div>
      </div>
      <h4>Questões respondidas por dia (30 dias)</h4>
      <div class="usage-chart" role="img" aria-label="Questões respondidas por dia nos últimos 30 dias">
        ${days.map((item) => `<i style="--h:${Math.round((item.attempts / maxAttempts) * 100)}%" title="${item.day.split("-").reverse().join("/")}: ${item.attempts} questões, ${item.users} pessoas"></i>`).join("")}
      </div>
      ${themes.length ? `<h4>Temas mais estudados (30 dias)</h4>
      <ul class="usage-themes">${themes.map((item) => `<li><span>${escapeHtml(item.tema)}</span><i style="--w:${Math.round((item.attempts / maxTheme) * 100)}%"></i><b>${format(item.attempts)}</b></li>`).join("")}</ul>` : ""}
      <p class="panel-line">${enough
        ? "Já há pessoas suficientes para a comparação entre usuários e a fila de gabaritos suspeitos começarem a mostrar dados, conforme as mesmas questões forem respondidas por 5 ou mais pessoas."
        : `Comparação entre usuários e gabaritos suspeitos precisam de 5 ou mais pessoas respondendo as mesmas questões. Hoje ${format(usage.active_30d)} ${Number(usage.active_30d) === 1 ? "pessoa estudou" : "pessoas estudaram"} no último mês.`}</p>
      <button type="button" class="link-btn" data-usage-refresh>Atualizar</button>`;
  }
  if (host.dataset.renderedHtml !== html) {
    host.innerHTML = html;
    host.dataset.renderedHtml = html;
  }
}

(function setupAdminUsage() {
  const host = document.querySelector("#adminUsage");
  if (!host) return;
  host.addEventListener("click", (event) => {
    if (!event.target.closest("[data-usage-refresh]")) return;
    state.adminUsageStatus = "idle";
    loadAdminUsage();
  });

  const baseRender = render;
  render = function renderWithAdminUsage(...args) {
    const result = baseRender.apply(this, args);
    if (state.activeTab === "topics" && state.isAdmin) {
      renderAdminUsage();
      const stale = !state.adminUsageLoadedAt || Date.now() - state.adminUsageLoadedAt > 10 * 60 * 1000;
      if (state.adminUsageStatus === "idle" || (state.adminUsageStatus === "ready" && stale)) loadAdminUsage();
    }
    return result;
  };
})();
