import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";
import test from "node:test";

async function render() {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("test", `${process.pid}-${Date.now()}`);
  const { default: worker } = await import(workerUrl.href);

  return worker.fetch(
    new Request("http://localhost/", { headers: { accept: "text/html" } }),
    { ASSETS: { fetch: async () => new Response("Not found", { status: 404 }) } },
    { waitUntil() {}, passThroughOnException() {} },
  );
}

test("server-renders the LoreCue consultation prototype", async () => {
  const response = await render();
  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-type") ?? "", /^text\/html\b/i);

  const html = await response.text();
  assert.match(html, /<title>LoreCue · 主持人咨询台<\/title>/i);
  assert.match(html, /萨菲港旧案/);
  assert.match(html, /主持人咨询台/);
  assert.match(html, /原文摘录/);
  assert.match(html, /AI 拟词/);
  assert.match(html, /AI 新编/);
  assert.match(html, /使用并记录/);
  assert.match(html, /团后待确认/);
  assert.doesNotMatch(html, /codex-preview|react-loading-skeleton/i);
});

test("ships five interactive validation scenarios without starter remnants", async () => {
  const [page, prototype, scenarios, layout, packageJson] = await Promise.all([
    readFile(new URL("../app/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/gm_consultation_prototype.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/prototype_scenarios.ts", import.meta.url), "utf8"),
    readFile(new URL("../app/layout.tsx", import.meta.url), "utf8"),
    readFile(new URL("../package.json", import.meta.url), "utf8"),
  ]);

  assert.match(page, /<GmConsultationPrototype \/>/);
  assert.match(prototype, /"use client"/);
  assert.match(prototype, /handleUseAndRecord/);
  assert.match(prototype, /handleConfirmRecord/);
  assert.match(prototype, /aria-live="polite"/);
  assert.match(prototype, /使用并记录/);
  assert.match(scenarios, /明确答案/);
  assert.match(scenarios, /合理推断/);
  assert.match(scenarios, /临场新编/);
  assert.match(scenarios, /泄密风险/);
  assert.match(scenarios, /团后确认/);
  assert.match(layout, /lang="zh-CN"/);
  assert.doesNotMatch(page, /codex-preview|SkeletonPreview/);
  assert.doesNotMatch(packageJson, /react-loading-skeleton/);

  await assert.rejects(access(new URL("../app/_sites-preview", import.meta.url)));
  await access(new URL("../.openai/hosting.json", import.meta.url));
});
