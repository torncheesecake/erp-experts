import http from "node:http";

const args = new Set(process.argv.slice(2));
const allowedArgs = new Set(["--check"]);
const unknownArgs = [...args].filter((arg) => !allowedArgs.has(arg));

const piHost = process.env.RASPBERRY_PI_HOST || "192.168.4.22";
const piUser = process.env.RASPBERRY_PI_USER || "matthew";
const apiBaseUrl = String(process.env.VITE_SENTINEL_API_BASE_URL || "http://127.0.0.1:4317").replace(/\/+$/, "");
const devBaseUrl = process.env.SENTINEL_LOCAL_DEV_URL || "http://localhost:5173";
const sentinelUrl = `${devBaseUrl.replace(/\/+$/, "")}/sentinel`;

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

async function main() {
  if (unknownArgs.length) {
    console.error("Sentinel Standalone Local Launch");
    console.error("");
    console.error(`Unsupported option: ${unknownArgs.join(", ")}`);
    console.error("Supported options: --check");
    process.exit(1);
  }

  const health = await getJson(`${apiBaseUrl}/health`);
  const authority = health.ok ? await getJson(`${apiBaseUrl}/authority/status`) : null;
  const devServer = await getText(sentinelUrl);

  console.log("Sentinel Standalone Local Launch");
  console.log("");
  console.log("Purpose:");
  console.log("Launch the standalone Sentinel operator shell locally while reaching the Pi-backed API through a localhost SSH tunnel.");
  console.log("");
  console.log("Safety:");
  console.log("- Does not start SSH.");
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
    "not reachable. Start Vite in the second terminal.",
  )}`);
  console.log("");
  console.log("Terminal 1: SSH tunnel");
  console.log(`ssh -N -L 4317:127.0.0.1:4317 ${piUser}@${piHost}`);
  console.log("");
  console.log("Terminal 2: standalone frontend");
  console.log("VITE_SENTINEL_API_BASE_URL=http://127.0.0.1:4317 npm run dev");
  console.log("");
  console.log("Open:");
  console.log(sentinelUrl);
  console.log("");
  console.log("Troubleshooting:");
  console.log("- If the dashboard says failed to fetch, the SSH tunnel or Pi API is unavailable.");
  console.log("- Authority state local_bypass is expected while auth is disabled.");
  console.log("- The Pi API must remain bound to 127.0.0.1 on the Pi. Do not reverse proxy it until auth is explicitly enabled.");
}

main();
