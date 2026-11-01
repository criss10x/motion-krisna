import { spawn, spawnSync } from "node:child_process";
import { closeSync, existsSync, mkdirSync, mkdtempSync, openSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { pathToFileURL } from "node:url";

// Steps window.__film.seek(t) in headless Chrome over CDP and pipes JPEG frames into ffmpeg (x264, 30 fps,
// 540x960 CSS at 2x = 1080x1920). Usage:
//   node record.mjs --project DIR                       -> DIR/film/video.mp4
//   node record.mjs --project DIR --stills 0,1.5,12     -> DIR/shots/film-<t>.png (JSON info per still)
//   --page, --out, --from, --to, --fps, --dir, --name, --eval "<js run after each still's seek>"
// Optional, for a machine that makes two films at once: when RENDER_LOCK names a lock file, a video render re-runs
// itself under flock(1) (Linux), so only one heavy render runs at a time (it says so while it waits). Leave it unset
// otherwise.
if (process.env.RENDER_LOCK && !process.env.RENDER_LOCK_HELD && !process.argv.includes("--stills")) {
  const again = (wait) => spawnSync("flock", [...(wait ? [] : ["-n", "-E", "75"]), process.env.RENDER_LOCK, process.execPath,
    ...process.execArgv, ...process.argv.slice(1)], { stdio: "inherit", env: { ...process.env, RENDER_LOCK_HELD: "1" } });
  let run = again(false);
  if (run.status === 75) {
    console.error(`render lock busy (the other lane is rendering): waiting for ${process.env.RENDER_LOCK}`);
    run = again(true);
  }
  process.exit(run.status ?? 1);
}
const args = process.argv.slice(2);
const flag = (name, fallback) => {
  const i = args.indexOf(name);
  return i >= 0 ? args[i + 1] : fallback;
};
const project = resolve(flag("--project", "."));
const HERE = join(project, "film");
const page = resolve(flag("--page", join(HERE, "film.html")));
const from = Number(flag("--from", 0));
const to = flag("--to", null);
// a partial render (--from/--to) never overwrites the full film/video.mp4
const out = resolve(flag("--out", join(HERE, from > 0 || to !== null ? "video-part.mp4" : "video.mp4")));
const stills = flag("--stills", null);
const fps = Number(flag("--fps", 30));
const CHROMES = [process.env.CHROME_PATH, "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome", "/Applications/Chromium.app/Contents/MacOS/Chromium", "/usr/bin/google-chrome", "/usr/bin/google-chrome-stable", "/usr/bin/chromium", "/usr/bin/chromium-browser", "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe"].filter(Boolean);
const chrome = CHROMES.find((p) => existsSync(p)) || CHROMES[0];

const profile = mkdtempSync(join(tmpdir(), "mc-film-"));
// Chrome logs to a file, not a pipe: its crash handler can outlive it and hold a pipe open, and node would never exit
const chromeLog = openSync(join(profile, "chrome.log"), "w");
const browser = spawn(chrome, ["--headless=new", "--remote-debugging-port=0", `--user-data-dir=${profile}`, "--no-first-run", "--no-default-browser-check", "--hide-scrollbars", "--allow-file-access-from-files", "--force-color-profile=srgb", "--font-render-hinting=none", "about:blank"], { stdio: ["ignore", "ignore", chromeLog] });
// kill Chrome however this script ends (an error, Ctrl+C), so no headless browser is left running
const cleanup = () => {
  try {
    browser.kill();
  } catch {}
};
process.on("exit", cleanup);
process.on("SIGINT", () => process.exit(130));
process.on("SIGTERM", () => process.exit(143));
// Chrome writes its debugging port to DevToolsActivePort in the profile once it is listening
const port = await (async () => {
  const file = join(profile, "DevToolsActivePort");
  for (let i = 0; i < 400 && browser.exitCode === null; i++) {
    const first = existsSync(file) ? readFileSync(file, "utf8").split("\n")[0].trim() : "";
    if (/^\d+$/.test(first)) return first;
    await new Promise((r) => setTimeout(r, 50));
  }
  const log = readFileSync(join(profile, "chrome.log"), "utf8").trim().split("\n").slice(-10).join("\n");
  throw new Error(`Chrome did not start: ${chrome}${log ? "\n" + log : ""}`);
})();
const target = await (await fetch(`http://127.0.0.1:${port}/json/new?about:blank`, { method: "PUT" })).json();
const ws = new WebSocket(target.webSocketDebuggerUrl);
await new Promise((done) => ws.addEventListener("open", done, { once: true }));
let seq = 0;
const pending = new Map();
ws.addEventListener("message", (event) => {
  const msg = JSON.parse(event.data);
  if (msg.id && pending.has(msg.id)) {
    const { done, fail } = pending.get(msg.id);
    pending.delete(msg.id);
    msg.error ? fail(new Error(JSON.stringify(msg.error))) : done(msg.result);
  }
});
const send = (method, params = {}) => new Promise((done, fail) => {
  const id = ++seq;
  pending.set(id, { done, fail });
  ws.send(JSON.stringify({ id, method, params }));
});
const evaluate = async (expression) => {
  const r = await send("Runtime.evaluate", { expression, returnByValue: true, awaitPromise: true });
  if (r.exceptionDetails) throw new Error(r.exceptionDetails.exception?.description || r.exceptionDetails.text);
  return r.result.value;
};

await send("Page.enable");
await send("Runtime.enable");
await send("Emulation.setDeviceMetricsOverride", { width: 540, height: 960, deviceScaleFactor: 2, mobile: false });
await send("Page.navigate", { url: pathToFileURL(page).href });
for (let i = 0; i < 200; i++) {
  if (await evaluate("document.documentElement.dataset.ready === '1'").catch(() => false)) break;
  await new Promise((r) => setTimeout(r, 50));
}
const duration = await evaluate("window.__film.duration");
const shot = async (format = "jpeg") => Buffer.from((await send("Page.captureScreenshot", { format, quality: format === "jpeg" ? 93 : undefined, captureBeyondViewport: false })).data, "base64");

if (stills) {
  const times = stills.split(",").map(Number);
  const dir = resolve(flag("--dir", join(project, "shots")));
  mkdirSync(dir, { recursive: true });
  for (const t of times) {
    const info = await evaluate(`JSON.stringify(window.__film.seek(${t}))`);
    // --eval runs after the seek (hide captions for a cover, measure tags...); a returned value is printed.
    const extra = flag("--eval", null) ? await evaluate(flag("--eval", null)) : undefined;
    const file = join(dir, `${flag("--name", "film")}-${t.toFixed(2)}.png`);
    writeFileSync(file, await shot("png"));
    console.log(file, info, extra === undefined ? "" : JSON.stringify(extra));
  }
} else {
  const end = to === null ? duration : Math.min(duration, Number(to));
  const frames = Math.round((end - from) * fps);
  const ffmpeg = spawn("ffmpeg", ["-y", "-loglevel", "error", "-f", "image2pipe", "-framerate", String(fps), "-c:v", "mjpeg", "-i", "-", "-c:v", "libx264", "-preset", "slow", "-crf", "16", "-pix_fmt", "yuv420p", "-profile:v", "high", "-movflags", "+faststart", out], { stdio: ["pipe", "inherit", "inherit"] });
  const started = Date.now();
  for (let i = 0; i < frames; i++) {
    await evaluate(`window.__film.seek(${(from + i / fps).toFixed(4)}), 0`);
    const jpg = await shot();
    if (!ffmpeg.stdin.write(jpg)) await new Promise((r) => ffmpeg.stdin.once("drain", r));
    if (i % 90 === 0) console.log(`frame ${i}/${frames} · ${((Date.now() - started) / 1000).toFixed(0)} s`);
  }
  ffmpeg.stdin.end();
  await new Promise((r) => ffmpeg.on("close", r));
  console.log("wrote", out, frames, "frames in", ((Date.now() - started) / 1000).toFixed(0), "s");
}
ws.close();
// wait for Chrome to exit, at most 5 s
await new Promise((r) => {
  if (browser.exitCode !== null || browser.signalCode !== null) return r();
  browser.once("exit", r);
  browser.kill();
  setTimeout(r, 5000).unref();
});
closeSync(chromeLog);
try {
  rmSync(profile, { recursive: true, force: true });
} catch {}
