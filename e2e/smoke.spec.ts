import { expect, test } from "@playwright/test";

// Smoke tests run against a build of e2e/content, never the real content.

test("a Published Post answers 200 with its title", async ({ request }) => {
  const response = await request.get("/posts/smoke-post");

  expect(response.status()).toBe(200);
  expect(await response.text()).toContain("煙霧測試文章");
});

test("the Post list answers 200 and links to a Published Post and its Tags", async ({
  request,
}) => {
  const response = await request.get("/posts");

  expect(response.status()).toBe(200);
  const html = await response.text();
  expect(html).toContain('href="/posts/smoke-post"');
  expect(html).toContain('href="/tags/smoke"');
});

test("the home page answers 200, shows the latest Posts and links to the Post list", async ({
  request,
}) => {
  const response = await request.get("/");

  expect(response.status()).toBe(200);
  const html = await response.text();
  expect(html).toContain('href="/posts/smoke-post"');
  expect(html).toContain('href="/posts"');
});

test("the Tag index answers 200 and links to each Tag's page", async ({ request }) => {
  const response = await request.get("/tags");

  expect(response.status()).toBe(200);
  expect(await response.text()).toContain('href="/tags/smoke"');
});

test("a Tag's page answers 200 and links to its Posts", async ({ request }) => {
  const response = await request.get("/tags/smoke");

  expect(response.status()).toBe(200);
  expect(await response.text()).toContain('href="/posts/smoke-post"');
});

test("a Post page links to its Tags", async ({ request }) => {
  const response = await request.get("/posts/smoke-post");

  expect(await response.text()).toContain('href="/tags/smoke"');
});

test("a Post with a Revision shows 「更新於」 with the Revision's note", async ({ request }) => {
  const html = await (await request.get("/posts/revised-smoke-post")).text();

  expect(html).toContain("更新於");
  expect(html).toContain("補上第二個段落");
});

test("a Post without a Revision shows no 「更新於」", async ({ request }) => {
  const html = await (await request.get("/posts/smoke-post")).text();

  expect(html).not.toContain("更新於");
});

test("an unknown Tag answers 404", async ({ request }) => {
  const response = await request.get("/tags/no-such-tag");

  expect(response.status()).toBe(404);
});

test("a previous Slug permanently redirects to the Post's current URL", async ({ request }) => {
  const response = await request.get("/posts/old-smoke-post", { maxRedirects: 0 });

  expect([301, 308]).toContain(response.status());
  expect(response.headers()["location"]).toBe("/posts/smoke-post");
});

test("a taken-down Slug answers 410 with an explanation and a link to the Post list", async ({
  request,
}) => {
  const response = await request.get("/posts/taken-down-post");

  expect(response.status()).toBe(410);
  const html = await response.text();
  expect(html).toContain("這篇文章已移除");
  expect(html).toContain('href="/posts"');
});

test("an unknown URL answers 404 with links back to the content", async ({ request }) => {
  const response = await request.get("/no-such-url");

  expect(response.status()).toBe(404);
  const html = await response.text();
  expect(html).toContain("找不到這個網址");
  expect(html).toContain('href="/posts"');
});
