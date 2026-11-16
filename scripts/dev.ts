/**
 * Frees the dev ports (stale vite/tsx processes survive turbo shutdowns),
 * prints the local dev URLs, then runs `turbo run dev` with streamed output.
 *
 *   bun run dev
 */

import { spawn } from "node:child_process";
import { reclaimPort } from "../packages/server/src/dev-port.js";

// Ports mirror the vite configs (apps/*/vite.config.ts) and dev-server.ts.
const webPort = Number(process.env.CHAIN_HUB_WEB_PORT ?? 4320);
const apiPort = Number(process.env.CHAIN_HUB_API_PORT ?? 2342);
const SURFACES: Array<{ name: string; url: string; port: number }> = [
  { name: "Hub (dashboard)", url: `http://localhost:${webPort}`, port: webPort },
  { name: "API server", url: `http://127.0.0.1:${apiPort}`, port: apiPort }
];

for (const { port } of SURFACES) {
  await reclaimPort(port);
}

console.log("\n  Chain Hub dev — starting everything:\n");
for (const { name, url } of SURFACES) {
  console.log(`    ${name.padEnd(16)} ${url}`);
}
console.log("");

const turbo = spawn("bun", ["x", "turbo", "run", "dev", "--ui=stream"], {
  stdio: "inherit"
});

turbo.on("exit", (code, signal) => {
  process.exit(signal ? 1 : (code ?? 1));
});
