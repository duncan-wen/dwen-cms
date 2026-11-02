import { describe, expect, it } from "vitest";
import {
  COVER_NEGATIVE_PROMPT,
  coverCandidateSheet,
  coverTask,
  finishedImagePath,
  nextCandidateNumber,
  type FooocusConfig,
} from "./cover-image";

// The shape of Fooocus's Gradio 3 `/config`, cut down to what drawing one image touches:
// clicking Generate runs a chain of `then` handlers; one takes every setting and stores a
// task in session state, the next runs that task and fills the galleries.
const config: FooocusConfig = {
  components: [
    { id: 1, type: "state", props: {} },
    { id: 9, type: "gallery", props: { label: "Gallery" } },
    { id: 7, type: "gallery", props: { label: "Finished Images" } },
    { id: 12, type: "textbox", props: { elem_id: "positive_prompt", value: "" } },
    { id: 223, type: "textbox", props: { label: "Negative Prompt", value: "" } },
    { id: 231, type: "checkboxgroup", props: { label: "Selected Styles", value: ["Fooocus V2"] } },
    { id: 217, type: "radio", props: { label: "Performance", value: "Speed" } },
    {
      id: 219,
      type: "radio",
      props: {
        label: "Aspect Ratios",
        value: "1152×896 <span>9:7</span>",
        choices: [["1152×896 <span>9:7</span>"], ["1216×832 <span>19:13</span>"]],
      },
    },
    { id: 221, type: "slider", props: { label: "Image Number", value: 2 } },
    { id: 222, type: "radio", props: { label: "Output Format", value: "png" } },
    { id: 225, type: "textbox", props: { label: "Seed", value: "0" } },
    { id: 272, type: "slider", props: { label: "Image Sharpness", value: 2 } },
  ],
  dependencies: [
    { inputs: [12], outputs: [12], trigger_after: null },
    { inputs: [], outputs: [9], trigger_after: null },
    { inputs: [225], outputs: [225], trigger_after: 1 },
    {
      inputs: [1, 12, 223, 231, 217, 219, 221, 222, 225, 272],
      outputs: [1],
      trigger_after: 2,
    },
    { inputs: [1], outputs: [7, 9], trigger_after: 3 },
  ],
};

const request = { prompt: "paper boats on a river", style: "Papercraft Flat Papercut", seed: 42 };

describe("coverTask", () => {
  it("finds the handler that creates the task and the one that runs it", () => {
    const task = coverTask(config, request);
    expect(task.createFn).toBe(3);
    expect(task.runFn).toBe(4);
  });

  it("sets the prompt, style, seed and the fixed cover settings, keeping every other default", () => {
    expect(coverTask(config, request).createData).toEqual([
      null,
      "paper boats on a river",
      COVER_NEGATIVE_PROMPT,
      ["Papercraft Flat Papercut"],
      "Lightning",
      "1216×832 <span>19:13</span>",
      1,
      "jpeg",
      "42",
      2,
    ]);
  });

  it("keeps text out of every cover through the negative prompt", () => {
    expect(COVER_NEGATIVE_PROMPT).toMatch(/\btext\b/);
    expect(COVER_NEGATIVE_PROMPT).toMatch(/\bletters\b/);
  });

  it("names the setting it can't find, so a Fooocus update fails loudly", () => {
    const withoutSeed = {
      ...config,
      components: config.components.map((c) =>
        c.props.label === "Seed" ? { ...c, props: { ...c.props, label: "Random Seed" } } : c,
      ),
    };
    expect(() => coverTask(withoutSeed, request)).toThrow(/Seed/);
  });
});

describe("finishedImagePath", () => {
  it("reads the last image in the run handler's Gallery", () => {
    const output = [
      { __type__: "update", visible: false },
      {
        __type__: "update",
        value: [
          { name: "C:\\Temp\\fooocus\\a.jpeg", is_file: true },
          { name: "C:\\Temp\\fooocus\\b.jpeg", is_file: true },
        ],
      },
    ];
    expect(finishedImagePath(config, 4, output)).toBe("C:\\Temp\\fooocus\\b.jpeg");
  });

  it("fails when the run produced no image", () => {
    expect(() => finishedImagePath(config, 4, [null, { value: [] }])).toThrow(/no image/);
  });
});

describe("nextCandidateNumber", () => {
  it("numbers a Post's candidates from 1, after its highest existing one", () => {
    expect(nextCandidateNumber("my-post", [])).toBe(1);
    expect(nextCandidateNumber("my-post", ["my-post-1.jpg", "my-post-3.jpg", "my-post-1.json"])).toBe(4);
  });

  it("ignores other Posts' candidates, even ones whose Slug starts the same", () => {
    expect(nextCandidateNumber("my-post", ["my-post-extra-7.jpg", "other-2.jpg"])).toBe(1);
  });
});

describe("coverCandidateSheet", () => {
  it("shows every candidate with its number, style, seed and prompt", () => {
    const html = coverCandidateSheet("my-post", [
      { number: 1, file: "my-post-1.jpg", style: "SAI Isometric", seed: 7, prompt: "a <small> house" },
      { number: 2, file: "my-post-2.jpg", style: "Mk Ukiyo E", seed: 8, prompt: "a river" },
    ]);
    expect(html).toContain('src="my-post-1.jpg"');
    expect(html).toContain('src="my-post-2.jpg"');
    expect(html).toContain("SAI Isometric");
    expect(html).toContain("8");
    expect(html).toContain("a &lt;small&gt; house");
    expect(html.indexOf("my-post-1.jpg")).toBeLessThan(html.indexOf("my-post-2.jpg"));
  });
});
