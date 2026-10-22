/* Service worker do Banco R+: deixa o site abrir e funcionar sem internet.
   Rede primeiro: sempre busca a versão nova (as atualizações chegam normalmente) e guarda uma
   cópia; só usa a cópia guardada sem conexão ou se a rede demorar mais que NETWORK_TIMEOUT_MS.
   Na instalação, lê o index.html e guarda todos os scripts, estilos e imagens que ele usa.
   O Supabase (login, sincronização) não passa por aqui: fora do ar, o progresso fica no
   aparelho e sobe na próxima sincronização. */

const CACHE = "banco-rmais-v1";
const NETWORK_TIMEOUT_MS = 5000;
const CDN_HOSTS = ["cdn.jsdelivr.net"];

self.addEventListener("install", (event) => {
  event.waitUntil((async () => {
    const cache = await caches.open(CACHE);
    const response = await fetch("/", { cache: "no-store" });
    const html = await response.clone().text();
    await cache.put("/", response);
    const assets = new Set(["/manifest.webmanifest", "/styles.css", "/icons/icon-192.png", "/icons/icon-512.png"]);
    for (const match of html.matchAll(/(?:src|href)="([^"]+\.(?:js|css|png|webmanifest))"/g)) {
      const url = match[1].startsWith("http") ? match[1] : `/${match[1].replace(/^\//, "")}`;
      assets.add(url);
    }
    await Promise.all([...assets].map(async (url) => {
      try {
        const asset = await fetch(url, { cache: "no-store" });
        if (asset.ok) await cache.put(url, asset);
      } catch {
        /* um arquivo que falhar agora entra no cache na próxima vez que for usado */
      }
    }));
    await self.skipWaiting();
  })());
});

self.addEventListener("activate", (event) => {
  event.waitUntil((async () => {
    for (const key of await caches.keys()) if (key !== CACHE) await caches.delete(key);
    await self.clients.claim();
  })());
});

self.addEventListener("fetch", (event) => {
  const request = event.request;
  if (request.method !== "GET") return;
  const url = new URL(request.url);
  const sameOrigin = url.origin === self.location.origin;
  if (!sameOrigin && !CDN_HOSTS.includes(url.hostname)) return;
  if (sameOrigin && url.pathname.startsWith("/__")) return;
  event.respondWith(networkFirst(request, sameOrigin && request.mode === "navigate"));
});

async function networkFirst(request, isPage) {
  const cache = await caches.open(CACHE);
  const key = isPage ? "/" : request;
  /* A busca na rede segue mesmo se a cópia for usada antes: quando chegar, atualiza a cópia. */
  const network = fetch(request).then((response) => {
    /* "opaque": script de outro domínio (Supabase no CDN) carregado sem CORS. */
    if (response.ok || response.type === "opaque") cache.put(key, response.clone());
    return response;
  });
  try {
    return await withTimeout(network, NETWORK_TIMEOUT_MS);
  } catch {
    const cached = await cache.match(key, { ignoreSearch: true });
    if (cached) return cached;
    return network; // sem cópia: espera a rede (ou falha, se estiver sem conexão)
  }
}

function withTimeout(promise, ms) {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error("tempo esgotado")), ms);
    promise.then((value) => { clearTimeout(timer); resolve(value); }, (error) => { clearTimeout(timer); reject(error); });
  });
}
