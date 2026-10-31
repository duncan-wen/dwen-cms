import { expect, test } from "@playwright/test";

test("a Published Post answers 200 with its title", async ({ request }) => {
  const response = await request.get("/posts/why-mdx-in-git");

  expect(response.status()).toBe(200);
  expect(await response.text()).toContain("為什麼這個網站的文章寫在 git 裡");
});

test("the Post list answers 200 and links to a Published Post", async ({ request }) => {
  const response = await request.get("/posts");

  expect(response.status()).toBe(200);
  expect(await response.text()).toContain('href="/posts/why-mdx-in-git"');
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
