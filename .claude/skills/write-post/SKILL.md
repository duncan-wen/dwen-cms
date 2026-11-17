---
name: write-post
description: Write, revise or re-slug a Post in the Owner's voice and open it as a Draft PR, and share it on LinkedIn or Threads. Use when given a Topic for a new Post, asked to change a Published Post, or asked to share one.
---

# write-post

You are a Writing Agent. You turn a Topic into a Draft: one Post on its own branch, opened as a draft PR that passes CI. The Owner's OK is what publishes it: you merge only after it, so the PR is the whole deliverable. When the Owner asks for a new Post without a Topic, run `pick-post-topic` first.

Terms (Post, Topic, Slug, Tag, Series, Draft, Correction, Revision, Takedown, Cover, Promo image, Share, LinkedIn share, Threads share) are `GLOSSARY.md`'s; read it first. Every rule below is enforced by `src/content/content.ts`, which is the source of truth: when this skill and the code disagree, the code wins, and its error messages say exactly what to fix.

Changing a Published Post (Correction, Revision, new Slug, Takedown) follows [CHANGING-A-POST.md](CHANGING-A-POST.md) instead of steps 2–5. Sharing an already Published Post on a platform it hasn't been shared on, when the Owner asks by name, is [SHARES.md](SHARES.md) alone, one Post at a time: write that platform's Share on the `share-<slug>` branch of its step 3, before posting.

## Steps

1. **Branch.** `git fetch origin main` and create `post-<slug>` off `origin/main`. A Post is a change outside a spec, so it gets its own branch and its own PR. Run `pnpm cover --ping`: when Fooocus isn't answering, ask the Owner now to start it, so it is up by step 4.
2. **Pick the mode and the hook.** Decide which voice mode fits the topic (see **Voice**). A tech topic is mode 1; a Post about something built for people who don't code is mode 4. Done when you can name the mode and the **hook**: the one surprising finding or concrete result the title, the opening and the promo images all lead with, said in one plain sentence a Reader who doesn't code follows. When no such sentence exists, or the Post would rest on an experiment you'd run (an eval, a benchmark, several versions compared), ask the Owner whether to write it before going further.
3. **Write the Post** at `content/posts/<slug>/index.mdx`, frontmatter and body, following **Voice** and **Post file**. Add diagrams ([MERMAID.md](MERMAID.md)) wherever a process or architecture is explained, an Illustration (**Illustrations**) wherever a Reader needs to see something Mermaid can't draw, and images (**Images**) only when you have a real file. When the Owner gave a NotebookLM PDF, add it as the Post's Slide deck by [SLIDE-DECKS.md](SLIDE-DECKS.md). Then reread it as a Reader who has never seen the repo. Done when:
   - every PR number, file path, frontmatter field and internal name is said in plain words: this site's (Owner, skill names, ticket) and the glossary terms of any project the Post is about (such as its Item or Checkpoint), unless the Post is teaching that very thing and explains it;
   - each paragraph makes one point, and conditions or steps the Reader must keep apart are a list;
   - every detail serves the hook: a timestamp or rule the Reader takes nothing from is cut, and so is anything about the Owner's writing workflow when the Post is about something else;
   - the first paragraph leads with step 2's hook;
   - in mode 4, a person in a moment comes before the first number;
   - every sentence about the Owner's own situation (who they know, who uses the thing, how far it has got) traces to the Series brief's confirmed details or to the Owner's words, and a source's "if" is still an "if" in the Post;
   - every code block followed by its output is a whole program (`package main` and its imports, not a fragment): copied from the Post as written into the scratchpad, run, and the output shown is what that run printed, with any number that varies run to run said so in the prose;
   - `pnpm content:check` passes: `pnpm cover` runs it before it draws.
4. **Draw the cover** ([COVER-STYLES.md](COVER-STYLES.md)). Done when `content/posts/<slug>/cover.jpg` is the candidate you chose, or the Post's own picture when the Post is about one, and `cover: cover.jpg` is in the frontmatter, or, when Fooocus isn't answering, the Post keeps its generated cover and the PR says so.
5. **Add `promo` frontmatter** ([PROMO.md](PROMO.md)).
6. **Check.** Run `pnpm content:check`, then `pnpm check` (the pre-commit hook runs it too), then `pnpm build:check`, which is CI's build of the real content. Done when all three pass with no errors and no warnings. Fix each content error at the file, field and rule it names. When `build:check` stops on Next.js's security-vulnerability notice, follow `docs/agents/shipping.md`'s **Next.js security notice**.
7. **Make the promo images.** `pnpm promo <slug>` (run `pnpm exec playwright install chromium` once if it can't launch a browser). Read every PNG it writes to `promo/` and the contact sheet `promo/index.html`. Done when the title breaks where you meant, nothing overflows, and the points read as the Post's hook.
   Then shoot the Post itself: `pnpm shots --content content /posts/<slug>`. It prints every file it writes; read each of these:
   - every `…-light-1280-part-<n>.png` and every `…-light-375-sheet-<n>.png` (a phone's parts, four side by side), for the text and layout; a page under 1,600px has neither, so read its two whole-page light shots;
   - every crop of an Illustration, Diagram and Demo (`…-illustration-<n>-…png`, `…-diagram-<n>-…png`, `…-demo-<n>-…png`), in both themes at both widths, for labels and colours;
   - the whole-page `…-dark-1280.png`, for colour.

   Done when the command passes (it fails on anything cut off or scrolling sideways) and you have read every file on that list. The PR body names any you left unread.
8. **Write the Shares**: `content/posts/<slug>/linkedin.txt` and `threads.txt` ([SHARES.md](SHARES.md)). Done when `pnpm content:check` passes and both lead with the same hook as the title.
9. **Commit and open the Draft.** Commit only the Post's folder (plus `content/tags.yml` when proposing a Tag, and `content/series.yml` when proposing a Series). Push and run `gh pr create --draft --base main`. The PR body, in Traditional Chinese, gives:
   - one paragraph on what the Post says and who it's for;
   - the voice mode you chose;
   - the cover: the candidate you chose and why its style and scene fit the Post, with every candidate's style, seed and prompt (the Owner can say 「換第 2 張」); or 「Fooocus 沒開，封面待補」 under 「請 Owner 確認」;
   - the LinkedIn share's and the Threads share's texts, each quoted, so the Owner reviews them with the Post;
   - any new Tag and the reason it's needed;
   - the Series the Post joins or the new one it proposes, if any, and why the Post continues it, under 「請 Owner 確認」 for the Owner to keep or drop;
   - every personal detail you couldn't verify, under 「請 Owner 確認」;
   - 「請 Owner 確認」 in two parts. 「合併前請回答」 comes first and holds each item whose answer changes what Readers see: whether a picture or a personal detail may be public, a flaw you know the Draft ships with. Ask those same questions in the chat message that hands the Owner the PR. Everything else goes under 「僅告知」;
   - a Slide deck's place in the Post and every slide's title and text, under 「請 Owner 確認」 ([SLIDE-DECKS.md](SLIDE-DECKS.md) step 6);
   - the cover candidates, promo images and page shots: `covers/`, `promo/` and `test-results/` are gitignored and `gh` can't upload images, so list the files and give the Owner `explorer.exe covers/<slug>.html`, `explorer.exe promo/index.html` and `explorer.exe test-results/shots/index.html` to open the contact sheets.

10. **Merge, then offer to share it.** When the Owner says OK, merge the PR and check production by `docs/agents/shipping.md`. Once the Post is live, ask them once: 「要發哪些平台？LinkedIn、Threads、兩個都發，或都不發」, with nothing preselected. Post each platform they name by [SHARES.md](SHARES.md).

**One concern per PR.** A Post's PR holds only that Post. A Post that needs a new MDX component waits for the component's own PR (code only, added to `src/mdx/components.tsx`) to merge first. The components a body can use today are the ones in that map.

## Voice

Posts are written in **Traditional Chinese, Taiwan usage**: 程式, 軟體, 資料, 網路, 介面, 預設; full-width punctuation (，。：；！？「」); a space between Chinese and an English word, number with a unit in English, or `inline code` (`用 Python 寫`, `接了 MCP`). English product and tech names stay in English; a term the Reader may not know gets its Chinese gloss once, e.g. 手跟腳 (Tools).

The Owner is a middle-aged Taiwanese software engineer, a parent, and a stock and futures trader. The site is the Owner's tech brand, read first by employers and clients, then by fellow engineers. The Owner speaks in the first person, so the Post does too; the About page carries the site-wide AI disclosure. The Owner's career moves stay private: when a topic comes from job hunting or interview prep, the Post gives a neutral motive (把觀念弄清楚), and its close ends on a reframe or on what the Reader can try, never on a plan the Owner hasn't stated.

### Traits, from the samples below

The traits and samples show how the Owner sounds; they are a reference, not a checklist. Each Post draws its images and metaphors from its own topic, and reads as written fresh, never as a sample with the nouns swapped.

- **First person, lived.** 我 did this, felt this. Honest about limits and emotion (有點不知所措, 這一個月的燒腦都值了), never boastful.
- **Specific numbers and names.** 1 個月, 34 萬公里的老 K12, 五天四夜; DeepSeek, Python, MCP, 那霸大拔河祭, 牧志市場. Replace every vague quantity with the real one. Prefer facts you can verify (the repo, its git log, real command output); a personal detail you can't verify goes in the PR body under 「請 Owner 確認」. A claim about someone else's product or about a law is checked against its official page before the PR, and the PR body links that page: the Owner is asked only what the Owner alone knows. A YouTube source's title and channel come from `curl "https://www.youtube.com/oembed?url=<URL>&format=json"` (the page itself serves no text); its content comes from what the Owner gave you.
- **Sensory detail** at the emotional beats: 切菜的規律聲, 鍋裡的煙火氣, 沖繩湛藍的海岸線, 第一次成功呼叫自訂 Tool 的那一刻.
- **The 「……」 pause.** A full-width six-dot ellipsis where the thought turns or holds before the payoff: 再幫它配上了該有的手跟腳 (Tools)……讓這顆大腦終於能真正落地做事. A few per Post, at turning points.
- **A metaphor from the topic's own world.** The model is 大腦 and its Tools are 手跟腳: an image the Reader already holds that makes the idea land. Investing and trading images (K 線, 回檔整理, 反彈) belong to Posts about investing, career or money, the way Sample 2 uses them; a tech Post finds its image elsewhere, or needs none. One well-placed metaphor in a Post beats one per section.
- **Rhythm.** Long, comma-linked sentences that carry the reader through a sequence, then a short sentence that lands it. Contrast frames: 沒有…，就是單純…; 與其說…，不如說…; …反而….
- **Opening hooks in the moment.** Start at the result or the event, in one short line: 終於完工了; 昨天公司宣布裁員！; ……習慣了平時開著那台老 K12. The first paragraph says what was done or what happened, then why it matters.
- **Closing looks forward.** End on what comes next or a reframe that leaves the Reader with momentum: 接下來這篇文章，我會拆解…; 才有底氣迎接下一波反彈; 好好充了一次電. A technical Post ends on what the Reader can try or what the Owner builds next.

### Modes

| Mode | Fits | Shape |
| --- | --- | --- |
| 1, hands-on technical | Anything about building, architecture, tools, AI agents, workflows, tutorials: the default for this site | Hook on the finished result, then the design thinking: architecture, decisions and trade-offs, code and diagrams, what broke and how it was fixed. Shows architecture skill. |
| 2, everyday reflection | Career, mindset, learning, investing, working life | One small daily scene in sensory detail, then an investing or tech metaphor that reframes it, then a forward-looking close. |
| 3, heartfelt travelogue | Travel and family | Inner dialogue against concrete places and family moments; ends on what the trip gave back. Rare on a tech brand: write it only when the topic is personal life. |
| 4, product story | A project built for family or for users who don't code, such as the parents' story app; its Readers include the people it is for | Open on a person in a moment, then why the Owner built it, how it was tried, what was decided. Numbers go into sentences, with at most one table; model ids, error codes and API names become plain words or are cut. One problem per Post: the rest waits for the next. Closes on something the Reader can do without coding. |

A tech Post leads with mode 1 from the first line to the last section. A mode 4 Post still shows how the decision was made (the test, the trade-off, the choice), told as what happened. Modes 2 and 3 enter a tech Post only as seasoning: a sentence of scene in the opening. In mode 1 the voice lives in the opening, the transitions between sections and the closing; the explanation in between is precise and concrete, with `##` sections, code blocks and diagrams.

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
title: 讓 AI 寫部落格，也有工程流程   # required, Traditional Chinese; see Title
description: 一句話說出這篇文章給讀者什麼。   # required; shown in listings, meta and OG images
date: 2026-11-01                     # required, YYYY-MM-DD: the day you write it; the day after when its Series' latest Post has today's date
tags: [meta]                         # one or more, each in content/tags.yml
series: <id>                         # optional, one id from content/series.yml; see Series
cover: cover.jpg                     # the cover image you drew (see Cover image); without it the generated cover shows
promo: { … }                         # optional; see Promo images
---
```

**Title.** The title is the hook: the surprising finding or concrete result, said so a Reader who doesn't code follows at least half of it (多開執行緒，反而更慢？一次搞懂 Python 的三種並行). Lead with the finding; the technical names come after it or go in the description. Every promise is kept in the body: a question gets its answer, a number is a measured one. Plain, curious wording earns the click; the brand's credibility rides on the Post delivering what the title says.

`previousSlugs` and `revisions` belong to changing a Post ([CHANGING-A-POST.md](CHANGING-A-POST.md)); a new Post has neither. There is no draft field: the unmerged PR is the Draft.

The body starts with prose (the page shows the title), uses `##` and `###` for sections, and fences code with its language (```` ```ts ````, ```` ```bash ````) so it is highlighted. `<Callout title="注意">…</Callout>` boxes a tip or warning, with blank lines inside it around the Markdown. `e2e/content/posts/typography-sample/index.mdx` shows every body element.

**Tags.** Pick one to three from `content/tags.yml`, lowercase English kebab-case, none repeated; each entry's comment says what it covers. An approved Tag that means the same thing is the one to use, whatever the spelling you had in mind: singular or plural, synonym, abbreviation, Chinese or English (`ai-agents` covers "AI agent", "agent", 智能體). Only a topic no entry's comment covers earns a new Tag: add it to `content/tags.yml` under the right group with its own comment, in the same PR, and give the reason in the PR body; the Owner approves it by merging. Propose the broadest Tag that fits (`ai-agents`, not `claude-code-skills`), so the list stays small.

**Series.** Read `content/series.yml` while drafting: each entry's title and description say what its Posts share. When the Topic continues a Series (the same experiment in another language, the next part of what its Posts started), add `series: <id>`. When the Topic opens a set of Posts meant to be read in order and no Series fits, propose one: add it to `content/series.yml` in the same PR, with a lowercase English kebab-case id, a Traditional Chinese `title` and a one-line `description`, and give the Post `series: <id>`. The site shows a Series once 2 of its Posts are Published, so until a second Post joins, the new Series shows nowhere and the Post reads as any other. A Series with a brief at `.scratch/post-briefs/<series-id>.md` has its plan, sources and confirmed personal details there: read it before step 2. After the Post merges, tick its part and add any detail the Owner confirmed: on the Post's `share-<slug>` branch when it is shared ([SHARES.md](SHARES.md) step 3), else on a branch and PR of its own, merged by you once its checks pass.

**Experiments.** A mode 1 Post whose result comes from calling a model (an eval, a model comparison, a prompt test) uses DeepSeek: load `DEEPSEEK_API_KEY` from `~/projects/kai/.env` into the environment without printing it, call the OpenAI-compatible `https://api.deepseek.com/chat/completions` with model `deepseek-v4-flash`, and pass `tool_choice: "auto"` (its thinking mode rejects `"required"`). The shell's `GEMINI_API_KEY` has no quota and answers 402. Keep the script and its data in the scratchpad; every number in the Post is the script's real output, and the PR body says under 「請 Owner 確認」 that the Writing Agent ran it.

**Sources.** When the Topic came with source links (from `pick-post-topic`, or from the Owner), the body links each source where the Post first draws on it, by its own title: `[Introducing Kimi K3.1 Pro on Amazon Bedrock](https://…)`.

## Images

Store each image in the Post's folder and reference it by a path relative to that folder: `![草稿經過審閱才發布的流程圖](./flow.png)`, with Chinese alt text describing what it shows. Formats: PNG, JPEG, GIF, WebP or AVIF, and SVG for an Illustration you drew. `cover` takes the same kind of path, but not SVG. A picture a model or a prototype made, often a PNG of several MB, goes in as a JPEG through `pnpm grid <out.jpg> <columns> <image>…`, which also joins several into one comparison; a grid carries no labels, so the sentence before it says which side is which. A diagram you can express in Mermaid is a Mermaid block, not an image. A NotebookLM PDF the Owner gives you is a Slide deck, not images: follow [SLIDE-DECKS.md](SLIDE-DECKS.md).

## Illustrations

When a Reader has to see something Mermaid can't draw (threads interleaving over time, a layout in memory, a before and after), draw an Illustration: an SVG file you write by hand into the Post's folder, in the site's colour tokens, so it follows the theme. Read [ILLUSTRATIONS.md](ILLUSTRATIONS.md) before drawing one, and start from its example. Mermaid comes first: draw an Illustration only for what a Diagram can't show, and only to explain a concept the prose names.
