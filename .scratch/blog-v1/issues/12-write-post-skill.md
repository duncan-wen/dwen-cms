# 12: write-post skill

**What to build:** A project skill that lets a Writing Agent turn a topic into a valid Draft PR. It covers:
- the Owner's voice
- frontmatter and file layout, including co-located images
- choosing Tags from the approved list (proposing a new one only with a reason in the PR)
- telling a Correction from a Revision and how to record a Revision
- changing a Slug safely
- one concern per PR, with new MDX components in their own PR first
- drawing flowcharts and architecture diagrams in Mermaid (14)
- generating promo images with `pnpm promo` and attaching them to the PR, choosing contour by default, flow for a process Post and terminal for a coding Post (15)
- running the content check before opening the PR

**Blocked by:** 03, 04, 06, 07, 14, 15

**Status:** ready-for-agent

- [ ] All rule sections are written and match the content module's actual validation
- [ ] The voice section is derived from the Owner's 2–3 sample texts (needs-info until provided)
- [ ] A Writing Agent given only a topic produces a PR that passes CI

## Comments

- 2026-11-01: the Owner provided three voice samples, quoted verbatim below. Derive the voice section from them; keep the samples themselves in the skill as reference.

**Sample 1: hands-on technical (for tech communities, shows architecture skill)**

> 終於完工了，經歷了1個月和 DeepSeek 並肩完成一個自己建立的智能體。以 Python 寫了迴圈，接了 MCP，再幫它配上了該有的手跟腳 (Tools)……讓這顆大腦終於能真正落地做事。沒有套用坊間過度封裝的框架，就是單純用非同步邏輯刻出核心，透過 Model Context Protocol 完美打通了 AI 與本機環境的邊界。看著它第一次成功呼叫自訂 Tool 執行指令、甚至接管繁瑣工作的那一刻，這一個月的燒腦都值了。接下來這篇文章，我會拆解這套架構的設計思維，以及如何打造一個真正符合自己工作流的 Agent 系統。

**Sample 2: everyday reflection (calming anxiety through small daily things and an investing outlook)**

> 昨天公司宣布裁員！中年的我有點不知所措……索性今天什麼都不想，走進廚房為家人炒了一盤蝦子，煮了一鍋炸醬麵。切菜的規律聲和鍋裡的煙火氣，反而讓焦慮的心慢慢平靜下來。這幾年除了寫程式，我也習慣在股市和期貨裡看數字起伏，知道任何線型都有回檔整理的時候。現在的職涯低谷，或許也是人生 K 線圖上的一個回測點，把心態歸零，才有底氣迎接下一波反彈。

**Sample 3: heartfelt travelogue (inner dialogue and family atmosphere)**

> ……習慣了平時開著那台 34 萬公里的老 K12 穿梭在台灣的車陣裡，突然換到這台平順的 Freed，看著車窗外沖繩湛藍的海岸線，心裡有種說不出的平靜。在那霸大拔河祭看著絢爛煙火的感動，以及牽著孩子逛牧志市場時感受到的市井煙火氣，都讓人徹底卸下了日常的緊繃。這五天四夜的旅程，與其說是帶家人出來放鬆，不如說是給這個疲憊的中年靈魂，好好充了一次電。
