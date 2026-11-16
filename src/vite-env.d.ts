/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** Full URL of api/discord-invite on the Vercel copy. Only the GitHub Pages build sets it. */
  readonly VITE_INVITE_API_URL?: string;
}
