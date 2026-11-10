import { describe, expect, it } from "vitest";
import { illustrationSvg, standaloneIllustration } from "./illustration-svg";

const source = `<?xml version="1.0"?>
<!-- a comment -->
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 100" width="50%">
  <defs><marker id="arrow"/></defs>
  <path d="M0 0" marker-end="url(#arrow)"/><use href="#arrow"/>
</svg>`;

describe("illustrationSvg", () => {
  const svg = illustrationSvg(source, "illustration-2");

  it("prefixes every id and every reference to one, so two Illustrations on a page don't collide", () => {
    expect(svg).toContain('id="illustration-2-arrow"');
    expect(svg).toContain("url(#illustration-2-arrow)");
    expect(svg).toContain('href="#illustration-2-arrow"');
  });

  it("draws it at its viewBox size, hidden from assistive tech, without the file's prolog", () => {
    expect(svg).toMatch(/^<svg [^>]*width="200" height="100" aria-hidden="true"/);
    expect(svg).not.toContain('width="50%"');
    expect(svg).not.toContain("<?xml");
    expect(svg).not.toContain("comment");
  });
});

describe("standaloneIllustration", () => {
  it("defines the colour tokens inside the file, each series colour as its code colour", () => {
    const colours = {
      ink: "ink-value",
      "code-function": "blue-value",
      "code-keyword": "pink-value",
      "code-type": "orange-value",
      "code-string": "green-value",
    };

    const svg = standaloneIllustration(source, colours);

    expect(svg).toMatch(/<svg[^>]*><style>:root\{[^}]*--ink:ink-value;[^}]*--series-1:blue-value;/);
  });
});
