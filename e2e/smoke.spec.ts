import { expect, test } from "@playwright/test";

test("a Published Post answers 200 with its title", async ({ request }) => {
  const response = await request.get("/posts/why-mdx-in-git");

  expect(response.status()).toBe(200);
  expect(await response.text()).toContain("為什麼這個網站的文章寫在 git 裡");
});
