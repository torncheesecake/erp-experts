import { spawn } from "node:child_process";
import fs from "node:fs";
import http from "node:http";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, "../..");
const SSH_REMOTE_API_PORT = 4317;
const DEFAULT_PI_HOST = "192.168.4.22";
const DEFAULT_LOCAL_PORT = 4317;
const DEFAULT_DEV_BASE_URL = "http://localhost:5173";

function parseLocalEnvFile(filePath) {
  if (!fs.existsSync(filePath)) return {};

  return fs.readFileSync(filePath, "utf8")
    .split(/\r?\n/)
    .reduce((acc, line) => {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) return acc;
      const match = trimmed.match(/^([A-Za-z_][A-Za-z0-9_]*)=(.*)$/);
      if (!match) return acc;
      const [, key, rawValue] = match;
      let value = rawValue.trim();
      if ((value.startsWith("\"") && value.endsWith("\"")) || (value.startsWith("'") && value.endsWith("'"))) {
        value = value.slice(1, -1);
      }
      acc[key] = value;
      return acc;
    }, {});
}

const localEnv = {
  ...parseLocalEnvFile(path.join(repoRoot, ".env")),
  ...parseLocalEnvFile(path.join(repoRoot, ".env.local")),
  ...process.env,
};

function getArgValue(argv, flag, fallback = null) {
  const index = argv.indexOf(flag);
  if (index === -1) return fallback;
  const value = argv[index + 1];
  if (!value || value.startsWith("--")) return fallback;
  return value;
}

function parseArgs(argv) {
  const recognisedFlags = new Set(["--check", "--tunnel", "--no-tunnel", "--help", "--port", "--pi-host", "--pi-user"]);
  const unknownArgs = [];

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (!arg.startsWith("--")) continue;
    if (!recognisedFlags.has(arg)) {
      unknownArgs.push(arg);
      continue;
    }
    if (["--port", "--pi-host", "--pi-user"].includes(arg)) {
      index += 1;
    }
  }

  const localPort = Number(getArgValue(argv, "--port", DEFAULT_LOCAL_PORT));

  return {
    checkOnly: argv.includes("--check"),
    help: argv.includes("--help"),
    noTunnel: argv.includes("--no-tunnel"),
    tunnel: argv.includes("--tunnel"),
    localPort,
    piHost: getArgValue(argv, "--pi-host", localEnv.RASPBERRY_PI_HOST || DEFAULT_PI_HOST),
    piUser: getArgValue(argv, "--pi-user", localEnv.RASPBERRY_PI_USER || ""),
    unknownArgs,
  };
}

function printHelp() {
  console.log("Sentinel Standalone Local Launch");
  console.log("");
  console.log("Usage:");
  console.log("  npm run sentinel:launch");
  console.log("  npm run sentinel:launch -- --tunnel");
  console.log("  npm run sentinel:launch -- --port 4318 --pi-user matthew");
  console.log("");
  console.log("Options:");
  console.log("  --check              Check status and print launch instructions. Same as the default.");
  console.log("  --tunnel             Start a foreground localhost-only SSH tunnel if local API health is not already reachable.");
  console.log("  --no-tunnel          Do not start SSH. This is the default.");
  console.log("  --port <localPort>   Local tunnel/API port. Default: 4317.");
  console.log("  --pi-host <host>     Raspberry Pi host. Default: RASPBERRY_PI_HOST or 192.168.4.22.");
  console.log("  --pi-user <user>     Raspberry Pi SSH user. Default: RASPBERRY_PI_USER when available.");
  console.log("  --help               Show this help.");
  console.log("");
  console.log("Safety:");
  console.log("- Tunnel mode uses ssh -N with a local 127.0.0.1 bind only.");
  console.log("- No password is stored or printed.");
  console.log("- Vite is never started by this helper.");
  console.log("- The Pi is not mutated.");
}

function getJson(url, timeoutMs = 1200) {
  return new Promise((resolve) => {
    const request = http.get(url, { timeout: timeoutMs }, (response) => {
      let body = "";

      response.setEncoding("utf8");
      response.on("data", (chunk) => {
        body += chunk;
      });
      response.on("end", () => {
        try {
          resolve({
            ok: response.statusCode >= 200 && response.statusCode < 300,
            statusCode: response.statusCode,
            payload: JSON.parse(body),
          });
        } catch {
          resolve({
            ok: false,
            statusCode: response.statusCode,
            error: "Response was not JSON.",
          });
        }
      });
    });

    request.on("timeout", () => {
      request.destroy();
      resolve({
        ok: false,
        error: "Request timed out.",
      });
    });
    request.on("error", (error) => {
      resolve({
        ok: false,
        error: error.message,
      });
    });
  });
}

function getText(url, timeoutMs = 1200) {
  return new Promise((resolve) => {
    const request = http.get(url, { timeout: timeoutMs }, (response) => {
      response.resume();
      response.on("end", () => {
        resolve({
          ok: response.statusCode >= 200 && response.statusCode < 400,
          statusCode: response.statusCode,
        });
      });
    });

    request.on("timeout", () => {
      request.destroy();
      resolve({
        ok: false,
        error: "Request timed out.",
      });
    });
    request.on("error", (error) => {
      resolve({
        ok: false,
        error: error.message,
      });
    });
  });
}

function formatCheck(result, passText, failText) {
  if (result.ok) return `pass - ${passText}`;
  return `warning - ${failText}${result.error ? ` (${result.error})` : ""}`;
}

function printInstructions({ apiBaseUrl, devBaseUrl, localPort, piHost, piUser }) {
  const displayUser = piUser || "<pi-user>";
  const sentinelUrl = `${devBaseUrl.replace(/\/+$/, "")}/sentinel`;

  console.log("");
  console.log("Terminal 1: SSH tunnel");
  console.log(`npm run sentinel:launch -- --tunnel${localPort !== DEFAULT_LOCAL_PORT ? ` --port ${localPort}` : ""}${piUser ? "" : " --pi-user <user>"}`);
  console.log("");
  console.log("Equivalent raw SSH command:");
  console.log(`ssh -N -L 127.0.0.1:${localPort}:127.0.0.1:${SSH_REMOTE_API_PORT} ${displayUser}@${piHost}`);
  console.log("");
  console.log("Terminal 2: standalone frontend");
  console.log(`VITE_SENTINEL_API_BASE_URL=${apiBaseUrl} npm run dev`);
  console.log("");
  console.log("Open:");
  console.log(sentinelUrl);
}

function startTunnel({ localPort, piHost, piUser }) {
  const sshArgs = [
    "-N",
    "-L",
    `127.0.0.1:${localPort}:127.0.0.1:${SSH_REMOTE_API_PORT}`,
    `${piUser}@${piHost}`,
  ];

  console.log("");
  console.log("Starting foreground SSH tunnel");
  console.log(`Target: ${piUser}@${piHost}`);
  console.log(`Forward: 127.0.0.1:${localPort} -> Pi 127.0.0.1:${SSH_REMOTE_API_PORT}`);
  console.log("");
  console.log("Leave this terminal open.");
  console.log("Ctrl+C closes the tunnel.");
  console.log("");

  const child = spawn("ssh", sshArgs, {
    stdio: "inherit",
    shell: false,
  });

  child.on("error", (error) => {
    console.error(`Could not start SSH: ${error.message}`);
    process.exitCode = 1;
  });

  child.on("exit", (code, signal) => {
    if (signal) {
      console.log(`SSH tunnel closed by signal ${signal}.`);
      return;
    }
    if (code && code !== 0) {
      console.error(`SSH tunnel exited with code ${code}.`);
      process.exitCode = code;
      return;
    }
    console.log("SSH tunnel closed.");
  });
}

async function main() {
  const options = parseArgs(process.argv.slice(2));

  if (options.help) {
    printHelp();
    return;
  }

  if (options.unknownArgs.length) {
    console.error("Sentinel Standalone Local Launch");
    console.error("");
    console.error(`Unsupported option: ${options.unknownArgs.join(", ")}`);
    console.error("Run npm run sentinel:launch -- --help for supported options.");
    process.exit(1);
  }

  if (!Number.isInteger(options.localPort) || options.localPort <= 0 || options.localPort > 65535) {
    console.error("Sentinel Standalone Local Launch");
    console.error("");
    console.error(`Invalid --port value: ${options.localPort}`);
    process.exit(1);
  }

  if (options.tunnel && options.noTunnel) {
    console.error("Sentinel Standalone Local Launch");
    console.error("");
    console.error("Use either --tunnel or --no-tunnel, not both.");
    process.exit(1);
  }

  const apiBaseUrl = `http://127.0.0.1:${options.localPort}`;
  const devBaseUrl = localEnv.SENTINEL_LOCAL_DEV_URL || DEFAULT_DEV_BASE_URL;
  const sentinelUrl = `${devBaseUrl.replace(/\/+$/, "")}/sentinel`;
  const health = await getJson(`${apiBaseUrl}/health`);
  const authority = health.ok ? await getJson(`${apiBaseUrl}/authority/status`) : null;
  const devServer = await getText(sentinelUrl);

  console.log("Sentinel Standalone Local Launch");
  console.log("");
  console.log("Purpose:");
  console.log("Launch the standalone Sentinel operator shell locally while reaching the Pi-backed API through a localhost SSH tunnel.");
  console.log("");
  console.log("Safety:");
  console.log("- Default mode only checks status and prints instructions.");
  console.log("- Tunnel mode uses a foreground, localhost-only SSH tunnel.");
  console.log("- Does not start Vite.");
  console.log("- Does not expose the Pi API publicly.");
  console.log("- Does not change auth mode or mutate the Pi.");
  console.log("");
  console.log("Current status:");
  console.log(`- Local API endpoint ${apiBaseUrl}: ${formatCheck(
    health,
    `${health.payload?.service || "sentinel-api"} responded with ${health.payload?.status || "ok"}`,
    "not reachable. Start the SSH tunnel or confirm the Pi service is healthy.",
  )}`);

  if (authority?.ok) {
    console.log(`- Authority: ${authority.payload?.state || "unknown"} (mode=${authority.payload?.mode || "unknown"}, localBypass=${Boolean(authority.payload?.localBypass)})`);
  } else {
    console.log("- Authority: not checked because the API endpoint is unavailable.");
  }

  console.log(`- Local dev server ${sentinelUrl}: ${formatCheck(
    devServer,
    `reachable with HTTP ${devServer.statusCode}`,
    "not reachable. Start Vite in a separate terminal.",
  )}`);

  printInstructions({
    apiBaseUrl,
    devBaseUrl,
    localPort: options.localPort,
    piHost: options.piHost,
    piUser: options.piUser,
  });

  console.log("");
  console.log("Troubleshooting:");
  console.log("- If the dashboard says failed to fetch, the SSH tunnel or Pi API is unavailable.");
  console.log("- Authority state local_bypass is expected while auth is disabled.");
  console.log("- The Pi API must remain bound to 127.0.0.1 on the Pi. Do not reverse proxy it until auth is explicitly enabled.");

  if (!options.tunnel) return;

  if (health.ok) {
    console.log("");
    console.log(`Tunnel not started: ${apiBaseUrl}/health already responds.`);
    console.log("Use the existing tunnel or API process, or close it before starting another tunnel.");
    return;
  }

  if (!options.piUser) {
    console.error("");
    console.error("Cannot start tunnel: Raspberry Pi SSH user is missing.");
    console.error("Set RASPBERRY_PI_USER in local .env or pass --pi-user <user>.");
    process.exit(1);
  }

  startTunnel(options);
}

main();
