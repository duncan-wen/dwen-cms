import { expect, test } from "@playwright/test";

test("a Published Post answers 200 with its title", async ({ request }) => {
  const response = await request.get("/posts/why-mdx-in-git");

  expect(response.status()).toBe(200);
  expect(await response.text()).toContain("為什麼這個網站的文章寫在 git 裡");
});

test("the Post list answers 200 and links to a Published Post and its Tags", async ({
  request,
}) => {
  const response = await request.get("/posts");

  expect(response.status()).toBe(200);
  const html = await response.text();
  expect(html).toContain('href="/posts/why-mdx-in-git"');
  expect(html).toContain('href="/tags/meta"');
});

test("the home page answers 200, shows the latest Posts and links to the Post list", async ({
  request,
}) => {
  const response = await request.get("/");

  expect(response.status()).toBe(200);
  const html = await response.text();
  expect(html).toContain('href="/posts/why-mdx-in-git"');
  expect(html).toContain('href="/posts"');
});

test("the Tag index answers 200 and links to each Tag's page", async ({ request }) => {
  const response = await request.get("/tags");

  expect(response.status()).toBe(200);
  expect(await response.text()).toContain('href="/tags/meta"');
});

test("a Tag's page answers 200 and links to its Posts", async ({ request }) => {
  const response = await request.get("/tags/meta");

  expect(response.status()).toBe(200);
  expect(await response.text()).toContain('href="/posts/why-mdx-in-git"');
});

test("a Post page links to its Tags", async ({ request }) => {
  const response = await request.get("/posts/why-mdx-in-git");

  expect(await response.text()).toContain('href="/tags/meta"');
});

test("an unknown Tag answers 404", async ({ request }) => {
  const response = await request.get("/tags/no-such-tag");

  expect(response.status()).toBe(404);
});

test("a previous Slug permanently redirects to the Post's current URL", async ({ request }) => {
  const response = await request.get("/posts/mdx-in-git", { maxRedirects: 0 });

  expect([301, 308]).toContain(response.status());
  expect(response.headers()["location"]).toBe("/posts/why-mdx-in-git");
});
