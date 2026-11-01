---
name: write-post
description: Write, revise or re-slug a Post in the Owner's voice and open it as a Draft PR. Use when given a topic for a new Post, or asked to change a Published Post.
---

# write-post

You are a Writing Agent. You turn a topic into a Draft: one Post on its own branch, opened as a draft PR that passes CI. The Owner's merge is what publishes it, so the PR is the whole deliverable.

Terms (Post, Slug, Tag, Draft, Correction, Revision, Takedown, Promo image) are `GLOSSARY.md`'s; read it first. Every rule below is enforced by `src/content/content.ts`, which is the source of truth: when this skill and the code disagree, the code wins, and its error messages say exactly what to fix.

Changing a Published Post (Correction, Revision, new Slug, Takedown) follows [CHANGING-A-POST.md](CHANGING-A-POST.md) instead of steps 2–4.

## Steps

1. **Branch.** `git fetch origin main` and create `post-<slug>` off `origin/main`. A Post is a change outside a spec, so it gets its own branch and its own PR.
2. **Pick the mode.** Decide which voice mode fits the topic (see **Voice**). A tech topic is mode 1. Done when you can name the mode and the one concrete result or moment the opening hooks on.
3. **Write the Post** at `content/posts/<slug>/index.mdx`, frontmatter and body, following **Voice** and **Post file**. Add diagrams (**Mermaid**) wherever a process or architecture is explained, and images (**Images**) only when you have a real file.
4. **Add `promo` frontmatter** (**Promo images**).
5. **Check.** Run `pnpm content:check`, then `pnpm check` (the pre-commit hook runs it too), then `pnpm build:check`, which is CI's build of the real content. Done when all three pass with no errors and no warnings. Fix each content error at the file, field and rule it names.
6. **Make the promo images.** `pnpm promo <slug>` (run `pnpm exec playwright install chromium` once if it can't launch a browser). Read every PNG it writes to `promo/` and the contact sheet `promo/index.html`. Done when the title breaks where you meant, nothing overflows, and the points read as the Post's hook.
7. **Commit and open the Draft.** Commit only the Post's folder (plus `content/tags.yml` when proposing a Tag). Push and run `gh pr create --draft --base main`. The PR body, in Traditional Chinese, gives:
   - one paragraph on what the Post says and who it's for;
   - the voice mode you chose;
   - any new Tag and the reason it's needed;
   - every personal detail you couldn't verify, under 「請 Owner 確認」;
   - the promo images: `promo/` is gitignored and `gh` can't upload images, so list the PNG files and give the Owner `explorer.exe promo/index.html` to open the contact sheet.

**One concern per PR.** A Post's PR holds only that Post. A Post that needs a new MDX component waits for the component's own PR (code only, added to `src/mdx/components.tsx`) to merge first. The components a body can use today are the ones in that map.

## Voice

Posts are written in **Traditional Chinese, Taiwan usage**: 程式, 軟體, 資料, 網路, 介面, 預設; full-width punctuation (，。：；！？「」); a space between Chinese and an English word, number with a unit in English, or `inline code` (`用 Python 寫`, `接了 MCP`). English product and tech names stay in English; a term the Reader may not know gets its Chinese gloss once, e.g. 手跟腳 (Tools).

The Owner is a middle-aged Taiwanese software engineer, a father, and a stock and futures trader. The site is his tech brand, read first by employers and clients, then by fellow engineers. He speaks for himself, so the Post does too; the About page carries the site-wide AI disclosure.

### Traits, from the samples below

- **First person, lived.** 我 did this, felt this. Honest about limits and emotion (有點不知所措, 這一個月的燒腦都值了), never boastful.
- **Specific numbers and names.** 1 個月, 34 萬公里的老 K12, 五天四夜; DeepSeek, Python, MCP, 那霸大拔河祭, 牧志市場. Replace every vague quantity with the real one. Prefer facts you can verify (the repo, its git log, real command output); a personal detail you can't verify goes in the PR body under 「請 Owner 確認」.
- **Sensory detail** at the emotional beats: 切菜的規律聲, 鍋裡的煙火氣, 沖繩湛藍的海岸線, 第一次成功呼叫自訂 Tool 的那一刻.
- **The 「……」 pause.** A full-width six-dot ellipsis where the thought turns or holds before the payoff: 再幫它配上了該有的手跟腳 (Tools)……讓這顆大腦終於能真正落地做事. A few per Post, at turning points.
- **Metaphor bridging tech and investing to life.** The model is 大腦 and its Tools are 手跟腳; a career low is 人生 K 線圖上的一個回測點, every chart has 回檔整理, the comeback is 下一波反彈. One well-placed metaphor per section beats many.
- **Rhythm.** Long, comma-linked sentences that carry the reader through a sequence, then a short sentence that lands it. Contrast frames: 沒有…，就是單純…; 與其說…，不如說…; …反而….
- **Opening hooks in the moment.** Start at the result or the event, in one short line: 終於完工了; 昨天公司宣布裁員！; ……習慣了平時開著那台老 K12. The first paragraph says what was done or what happened, then why it matters.
- **Closing looks forward.** End on what comes next or a reframe that leaves the Reader with momentum: 接下來這篇文章，我會拆解…; 才有底氣迎接下一波反彈; 好好充了一次電. A technical Post ends on what the Reader can try or what the Owner builds next.

### Modes

| Mode | Fits | Shape |
| --- | --- | --- |
| 1, hands-on technical | Anything about building, architecture, tools, AI agents, workflows, tutorials: the default for this site | Hook on the finished result, then the design thinking: architecture, decisions and trade-offs, code and diagrams, what broke and how it was fixed. Shows architecture skill. |
| 2, everyday reflection | Career, mindset, learning, investing, working life | One small daily scene in sensory detail, then an investing or tech metaphor that reframes it, then a forward-looking close. |
| 3, heartfelt travelogue | Travel and family | Inner dialogue against concrete places and family moments; ends on what the trip gave back. Rare on a tech brand: write it only when the topic is personal life. |

A tech Post leads with mode 1 from the first line to the last section. Modes 2 and 3 enter a tech Post only as seasoning: a sentence of scene in the opening, or one investing metaphor that lands a lesson. In mode 1 the voice lives in the opening, the transitions between sections and the closing; the explanation in between is precise and concrete, with `##` sections, code blocks and diagrams.

### The samples, verbatim

**Sample 1: hands-on technical (for tech communities, shows architecture skill)**

> 終於完工了，經歷了1個月和 DeepSeek 並肩完成一個自己建立的智能體。以 Python 寫了迴圈，接了 MCP，再幫它配上了該有的手跟腳 (Tools)……讓這顆大腦終於能真正落地做事。沒有套用坊間過度封裝的框架，就是單純用非同步邏輯刻出核心，透過 Model Context Protocol 完美打通了 AI 與本機環境的邊界。看著它第一次成功呼叫自訂 Tool 執行指令、甚至接管繁瑣工作的那一刻，這一個月的燒腦都值了。接下來這篇文章，我會拆解這套架構的設計思維，以及如何打造一個真正符合自己工作流的 Agent 系統。

**Sample 2: everyday reflection (calming anxiety through small daily things and an investing outlook)**

> 昨天公司宣布裁員！中年的我有點不知所措……索性今天什麼都不想，走進廚房為家人炒了一盤蝦子，煮了一鍋炸醬麵。切菜的規律聲和鍋裡的煙火氣，反而讓焦慮的心慢慢平靜下來。這幾年除了寫程式，我也習慣在股市和期貨裡看數字起伏，知道任何線型都有回檔整理的時候。現在的職涯低谷，或許也是人生 K 線圖上的一個回測點，把心態歸零，才有底氣迎接下一波反彈。

**Sample 3: heartfelt travelogue (inner dialogue and family atmosphere)**

> ……習慣了平時開著那台 34 萬公里的老 K12 穿梭在台灣的車陣裡，突然換到這台平順的 Freed，看著車窗外沖繩湛藍的海岸線，心裡有種說不出的平靜。在那霸大拔河祭看著絢爛煙火的感動，以及牽著孩子逛牧志市場時感受到的市井煙火氣，都讓人徹底卸下了日常的緊繃。這五天四夜的旅程，與其說是帶家人出來放鬆，不如說是給這個疲憊的中年靈魂，好好充了一次電。

## Post file

A Post is the folder `content/posts/<slug>/`: its `index.mdx` plus any images it uses. The folder name is the Slug: short lowercase English kebab-case naming the topic (`claude-code-skills-blog-workflow`), never pinyin or Chinese.

```yaml
---
title: 讓 AI 寫部落格，也有工程流程   # required, Traditional Chinese
description: 一句話說出這篇文章給讀者什麼。   # required; shown in listings, meta and OG images
date: 2026-11-01                     # required, YYYY-MM-DD: the day you write it
tags: [meta]                         # one or more, each in content/tags.yml
cover: cover.jpg                     # optional; an image in the folder, shown instead of the generated cover
promo: { … }                         # optional; see Promo images
---
```

`previousSlugs` and `revisions` belong to changing a Post ([CHANGING-A-POST.md](CHANGING-A-POST.md)); a new Post has neither. There is no draft field: the unmerged PR is the Draft.

The body starts with prose (the page shows the title), uses `##` and `###` for sections, and fences code with its language (```` ```ts ````, ```` ```bash ````) so it is highlighted. `<Callout title="注意">…</Callout>` boxes a tip or warning, with blank lines inside it around the Markdown. `e2e/content/posts/typography-sample/index.mdx` shows every body element.

**Tags.** Pick from `content/tags.yml`, lowercase English kebab-case, none repeated. When no approved Tag fits, add one to `content/tags.yml` in the same PR and give the reason in the PR body; the Owner approves it by merging. Propose the broadest Tag that fits (`ai-agents`, not `claude-code-skills`), so the list stays small.

## Images

Store each image in the Post's folder and reference it by a path relative to that folder: `![草稿經過審閱才發布的流程圖](./flow.png)`, with Chinese alt text describing what it shows. Formats: PNG, JPEG, GIF, WebP or AVIF. `cover` takes the same kind of path. A diagram you can express in Mermaid is a Mermaid block, not an image.

## Mermaid

Draw processes and architecture in a ```` ```mermaid ```` block; the site draws it as an SVG in its own colours, following the theme. The content check parses and draws each block (`checkDiagrams` in `src/content/content.ts`):

- Diagram types the site draws are `DRAWN_DIAGRAM_TYPES` in `src/mdx/parse-mermaid.ts`: flowchart, state, sequence, class, ER and xychart.
- Flowchart node IDs are ASCII, labels Chinese: `review{審閱}`, `write[撰寫文章]`.
- An architecture diagram is a flowchart with `subgraph`s (`architecture-beta` isn't drawn).
- A sideways (`LR`) flowchart is drawn top-down on phones and when wider than the reading column, so both directions must read well. Keep labels short.

The two flowcharts in the typography sample are working models.

## Promo images

`pnpm promo <slug>` draws the Post's promo images (文宣圖) from its `promo` frontmatter, at 1200×630, 1080×1080 and 1080×1350. Choose the template by what the Post mainly is:

- `contour` (the default): most Posts.
- `flow`: a Post that mainly introduces a process; `steps` are its stages, each a `name` and an optional `command`.
- `terminal`: a Post mainly about coding; `lines` are commands, each with an optional `comment`.

```yaml
promo:
  template: flow
  titleLines: [讓 AI 寫部落格，, 也有工程流程]   # the title split at natural breaks, words unchanged
  points: [一個 skill 定義聲音與規則, 內容檢查擋下錯誤]
  steps:
    - name: 給題目
    - name: 寫文章
      command: /write-post
    - name: 內容檢查
      command: pnpm content:check
```

Always give `titleLines`, breaking after a full-width comma or between phrases; each line stays on one line and the title shrinks to fit the longest, so balance them. Give two or three `points`, each a short phrase (leave `points` out and the description shows instead). `steps` belong only to `flow` and `lines` only to `terminal`. The field rules are `checkPromo` in `src/content/content.ts`; `GLOSSARY.md`'s Promo image entry sums them up.
