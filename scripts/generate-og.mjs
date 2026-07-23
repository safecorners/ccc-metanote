/**
 * OG 이미지·PNG 아이콘 생성 (1회성 도구, 빌드 파이프라인 무관)
 * 실행: node scripts/generate-og.mjs  (프로젝트 루트에서)
 */
import { readFileSync } from "node:fs";
import { chromium } from "@playwright/test";

const font = readFileSync(
  "node_modules/pretendard/dist/web/variable/woff2/PretendardVariable.woff2",
).toString("base64");

const baseStyle = `
  @font-face {
    font-family: P;
    src: url(data:font/woff2;base64,${font}) format("woff2");
  }
  * { margin: 0; box-sizing: border-box; }
  body { font-family: P, sans-serif; }
`;

const CATEGORY_COLORS = ["#62aef0", "#dd5b00", "#ff64c8", "#2a9d99", "#d6b6f6"];
const dots = CATEGORY_COLORS.map(
  (c) => `<span style="width:20px;height:20px;border-radius:50%;background:${c}"></span>`,
).join("");

const ogHtml = `<!doctype html><style>${baseStyle}</style>
<body style="width:1200px;height:630px;background:#213183;color:#fff;display:flex;flex-direction:column;justify-content:space-between;padding:72px 80px;position:relative;overflow:hidden">
  <svg style="position:absolute;inset:0" width="1200" height="630" viewBox="0 0 1200 630" fill="none">
    <circle cx="960" cy="180" r="240" fill="url(#g)"/>
    <defs><radialGradient id="g" cx="0.5" cy="0.5" r="0.5">
      <stop offset="0" stop-color="#fff" stop-opacity="0.1"/><stop offset="1" stop-color="#fff" stop-opacity="0"/>
    </radialGradient></defs>
    <circle cx="880" cy="170" r="3" fill="#fff" opacity="0.45"/>
    <circle cx="980" cy="100" r="3.5" fill="#fff" opacity="0.55"/>
    <circle cx="1080" cy="150" r="3" fill="#fff" opacity="0.4"/>
    <circle cx="1040" cy="60" r="2.5" fill="#fff" opacity="0.3"/>
    <circle cx="1130" cy="250" r="3.5" fill="#fff" opacity="0.5"/>
    <circle cx="920" cy="300" r="2.5" fill="#fff" opacity="0.3"/>
    <path d="M880 170 L980 100 L1080 150 L1130 250" stroke="#fff" stroke-opacity="0.14"/>
    <path d="M0-13 C2-4 4-2 13 0 C4 2 2 4 0 13 C-2 4 -4 2 -13 0 C-4-2 -2-4 0-13 Z" transform="translate(1050,320)" fill="#62aef0" opacity="0.85"/>
    <path d="M0-10 C1.6-3.4 3.4-1.6 10 0 C3.4 1.6 1.6 3.4 0 10 C-1.6 3.4 -3.4 1.6 -10 0 C-3.4-1.6 -1.6-3.4 0-10 Z" transform="translate(910,120)" fill="#d6b6f6" opacity="0.75"/>
  </svg>
  <div style="display:flex;align-items:center;gap:16px;position:relative">
    <svg width="44" height="44" viewBox="0 0 32 32"><rect width="32" height="32" rx="7" fill="#0075de"/><path d="M8 23 V10 L16 18.5 L24 10 V23" fill="none" stroke="#fff" stroke-width="3.4" stroke-linecap="round" stroke-linejoin="round"/></svg>
    <span style="font-size:34px;font-weight:700;letter-spacing:-0.5px">MetaNote</span>
  </div>
  <div style="position:relative">
    <h1 style="font-size:76px;font-weight:700;line-height:1.12;letter-spacing:-2px;word-break:keep-all">왜 틀렸는지 아는 것이<br/>진짜 공부의 시작</h1>
    <div style="display:flex;gap:14px;margin-top:36px">${dots}</div>
  </div>
</body>`;

const iconHtml = (size) => `<!doctype html><style>${baseStyle}</style>
<body style="width:${size}px;height:${size}px">
  <svg width="${size}" height="${size}" viewBox="0 0 32 32"><rect width="32" height="32" rx="7" fill="#0075de"/><path d="M8 23 V10 L16 18.5 L24 10 V23" fill="none" stroke="#fff" stroke-width="3.4" stroke-linecap="round" stroke-linejoin="round"/></svg>
</body>`;

const browser = await chromium.launch();

const og = await browser.newPage({
  viewport: { width: 1200, height: 630 },
  deviceScaleFactor: 1,
});
await og.setContent(ogHtml, { waitUntil: "networkidle" });
await og.screenshot({ path: "src/app/opengraph-image.png" });

for (const [file, size] of [
  ["src/app/apple-icon.png", 180],
  ["src/app/icon.png", 512],
]) {
  const page = await browser.newPage({
    viewport: { width: size, height: size },
    deviceScaleFactor: 1,
  });
  await page.setContent(iconHtml(size), { waitUntil: "networkidle" });
  await page.screenshot({ path: file, omitBackground: true });
  await page.close();
}

await browser.close();
console.log("generated: opengraph-image.png, apple-icon.png, icon.png");
