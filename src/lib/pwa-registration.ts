/// <reference types="vite-plugin-pwa/vanillajs" />

const workerPath = "/sw.js";
const verifiedPreviewHost = "id-preview--38e62c78-6103-40c7-9bc1-c5e5b1c7f12d.lovable.app";

function isEditorOrPreview() {
  const host = window.location.hostname.toLowerCase();
  return (
    !import.meta.env.PROD ||
    window.top !== window.self ||
    host === verifiedPreviewHost ||
    /^(?:id-preview|preview)(?:-[a-z0-9]+)?--.+\.(?:lovable\.app|gpt-eng\.com|gptengineer\.run)$/.test(
      host,
    ) ||
    /^project--.+-dev\.(?:lovable\.app|gpt-eng\.com|gptengineer\.run)$/.test(host) ||
    host === "lovableproject.com" ||
    host.endsWith(".lovableproject.com") ||
    host === "lovableproject-dev.com" ||
    host.endsWith(".lovableproject-dev.com") ||
    host === "beta.lovable.dev" ||
    host.endsWith(".beta.lovable.dev") ||
    new URLSearchParams(window.location.search).get("sw") === "off"
  );
}

async function removeMatchingRegistrations() {
  const registrations = await navigator.serviceWorker.getRegistrations();
  await Promise.all(
    registrations
      .filter((registration) => {
        const scriptPath =
          registration.active?.scriptURL ??
          registration.waiting?.scriptURL ??
          registration.installing?.scriptURL;
        return scriptPath ? new URL(scriptPath).pathname === workerPath : false;
      })
      .map((registration) => registration.unregister()),
  );
}

export async function registerAgriSathiOffline() {
  if (!("serviceWorker" in navigator)) return;
  if (isEditorOrPreview()) {
    await removeMatchingRegistrations();
    return;
  }
  try {
    const registration = await navigator.serviceWorker.register(workerPath, {
      updateViaCache: "none",
    });
    await registration.update();
  } catch {
    // The published app remains usable if service-worker registration is unavailable.
  }
}
