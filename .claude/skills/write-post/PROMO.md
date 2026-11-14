# Promo images

`pnpm promo <slug>` draws the Post's promo images (文宣圖) from its `promo` frontmatter, at 1200×630, 1080×1080 and 1080×1350. They are what someone scrolling a feed sees, most of them not engineers, so they sell the hook. Choose the template by what the Post mainly is:

- `contour` (the default): every Post, code-heavy ones included; shows the Post's cover beside the text, so draw the cover first.
- `flow`: a Post whose subject is a process, step by step; `steps` are its stages, each a `name` and an optional `command`.
- `terminal`: a Post that teaches a set of commands the Reader will type; `lines` are those commands, each with an optional `comment`.

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

Always give `titleLines`, breaking after a full-width comma or between phrases; each line stays on one line and the title shrinks to fit the longest, so balance them. Give two or three `points`, each a short phrase that makes a scroller curious: the surprising finding, a measured number, the question the Post answers (多開執行緒，反而更慢？), rather than a summary of its sections (leave `points` out and the description shows instead). Done when someone who doesn't code would want to tap it. `steps` belong only to `flow` and `lines` only to `terminal`. The field rules are `checkPromo` in `src/content/content.ts`; `GLOSSARY.md`'s Promo image entry sums them up.
