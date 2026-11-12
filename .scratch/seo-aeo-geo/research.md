# SEO／AEO／GEO 研究：什麼有官方依據、什麼是傳聞

- 研究日期（所有來源擷取日）：2026-11-12
- 範圍：dwen-cms（Next.js App Router、MDX、Vercel、https://duncan-wen.aibbm.org、內容以繁體中文為主）
- 證據規則：只用第一方文件當證據，每條主張都附上 URL。行銷部落格、媒體報導、社群貼文只放在第 6 節，並標成「有人宣稱，未證實」。
- 擷取限制：Bing Webmaster Tools 的 help 頁面（`bing.com/webmasters/help/...`）要靠 JavaScript 才會顯示內容，抓不到內文。Bing 的部分改用官方 Bing Blog 公告當來源。

---

## 1. 摘要

- **Google 明文寫了：AI Overviews／AI Mode 不需要正常 SEO 以外的東西。** 原文是「no additional requirements … nor other special optimizations」，也不需要「new machine readable files, AI text files, or markup」。唯一的技術門檻是頁面要被索引，而且有資格帶 snippet 顯示（[S1]、[S2]）。2026-05 Google 另外發了一份優化指南，結論是「optimizing for generative AI search is … still SEO」，還直接點名 llms.txt、把內容切小塊（chunking）、為 AI 改寫、刻意製造品牌提及都沒有用（[S2]）。
- **沒有任何主要搜尋引擎或 LLM 廠商公開承諾會讀 llms.txt。** Google Search 明說會忽略它，「neither harm nor help」（[S2]）。OpenAI、Anthropic、Perplexity 的爬蟲文件都沒提到它（[S5]、[S6]、[S7]）。唯一跟 Google 有關的動作是 Chrome Lighthouse 實驗性的「Agentic Browsing」類別會檢查 llms.txt，但那是給瀏覽器代理用的，不是 Search 排名，而且網站沒有這個檔案（404）時會判為 N/A（[S20]）。
- **「訓練」跟「搜尋／引用」在每家都是分開的 token，可以分開控制。** OpenAI 是 `GPTBot`／`OAI-SearchBot`，Anthropic 是 `ClaudeBot`／`Claude-SearchBot`，Google 是 `Google-Extended`／`Googlebot`，Apple 是 `Applebot-Extended`／`Applebot`，Bing 是 `__usage_ai-training`（robots.txt）／頁面層級的 `ai-grounding`。擋訓練用的 token 不會影響搜尋收錄，各家文件都這樣寫（[S3]、[S5]、[S6]、[S8]、[S10]）。使用者當下觸發的抓取（`ChatGPT-User`、`Perplexity-User`）官方自己說不一定遵守 robots.txt（[S5]、[S7]）。
- **Google 的 AI Overviews／AI Mode 是由 `Googlebot` 加上 `nosnippet`／`max-snippet` 控制，不是 `Google-Extended`。** `Google-Extended` 只管 Gemini 的訓練和 grounding，「does not impact a site's inclusion in Google Search」（[S3]、[S4]）。Search Console 另外有「Search generative AI control」可以整站設定（[S2]、[S19]）。
- **部落格目前還有效的 Google rich result 類型：** Article（可以用 `BlogPosting`）、Breadcrumb、Profile page（用在 About 頁）、Image metadata，以及非 rich result 但官方支援的 WebSite（網站名稱）（[S11]、[S12]、[S13]、[S14]）。**已經淘汰的：** FAQ（2026-05-08 宣布淘汰，2026-06-15 文件移除，已經不在 Search 顯示）、HowTo、Sitelinks search box（2024-11-21 停用），還有 2025–2026 一批較少用的類型（[S15]、[S16]、[S17]）。
- **結構化資料不是 AI 功能的必要條件，也不是排名因素，但它是 rich result 的資格條件。** Google 仍然建議把它當一般 SEO 來做（[S2]、[S11]）。E-E-A-T「isn't a specific ranking factor」，但清楚的作者資訊（byline 連到作者頁）是 Google 明確鼓勵的（[S18]）。
- **zh-TW／多語系：** Google 判斷語言只看頁面上的可見內容，「don't use … `lang` attributes」（[S21]）。`hreflang` 是有多個語言版本、分別放在不同 URL 時才用的工具（[S21]、[S22]）。這個網站只有一個語言版本，所以不需要 `hreflang`。`<html lang="zh-Hant">` 還是要留著，給瀏覽器、無障礙工具和其他系統用。
- **這個網站真正缺的：** `robots.ts`（現在 `/robots.txt` 回 404，Google 視為沒有限制，但也就少了 `Sitemap:` 那一行）、文章頁的 `BlogPosting` JSON-LD、About 頁的 `ProfilePage`／`Person`、首頁的 `WebSite`。llms.txt 跟要不要擋 AI 訓練爬蟲屬於政策選擇，沒有一定的對錯，留給 grilling 決定。

---

## 2. SEO：有官方依據的做法

### 2.1 基本盤：可抓取、可索引、正確的 canonical
- robots.txt「is used primarily to manage crawler traffic」，「is not a mechanism for keeping a web page out of Google」。要把頁面排除在索引外，要用 `noindex`（[S23]）。
- robots.txt 回 4xx（429 除外）時，Google 視為「a valid robots.txt file didn't exist」，也就是沒有限制（[S24]）。
- 符合特定 user-agent 的群組會**取代** `*` 群組，兩者「are not combined」（[S24]）。寫 AI 爬蟲規則時，針對某個 bot 的群組要把該有的 `Disallow` 寫完整，不會繼承 `*` 群組的規則。
- `Sitemap:` 這一行跟 user-agent 無關，所有爬蟲都能讀（[S24]）。Google 會在 robots.txt 裡找 sitemap，可以寫多行（[S25]）。
- Sitemap 的 `<lastmod>` 只有在「consistently and verifiably」準確時才會被採用，而且應該反映「last significant update」。`<priority>` 和 `<changefreq>` 會被忽略（[S25]）。

### 2.2 內容與作者（helpful content／E-E-A-T）
- 自問：「Will someone reading your content leave feeling they've had a satisfying experience?」（[S18]）
- 「While E-E-A-T itself isn't a specific ranking factor」，系統會用多種訊號辨識 E-E-A-T 好的內容，其中「trust is most important」（[S18]）。
- Who／How／Why：建議 byline 連到作者背景頁，「We strongly encourage adding accurate authorship information」（[S18]）。
- 內容沒有實質修改卻改日期讓文章看起來比較新，是「search engine-first」內容的警訊（[S18]）。
- 生成式 AI 內容：沒有被禁止，但要符合 Search Essentials 和 spam policy。大量產生沒有附加價值的頁面可能違反 scaled content abuse policy。發布前要人工查核（包括 title、meta description、structured data、alt text）。說明內容是怎麼產生的，可以給讀者更多脈絡（[S26]）。

### 2.3 結構化資料
- **Article**：可以用 `Article`／`NewsArticle`／`BlogPosting`。「There are no required properties」。建議填的屬性：`author`（Person，`name` 只放名字）、`author.url` 或 `sameAs`、`datePublished`／`dateModified`（ISO 8601，**要帶時區**，不然 Google 會用 Googlebot 的時區）、`headline`（簡短一點，太長會被截）、`image`（建議多張，每張至少 50K 像素，比例 16:9、4:3、1:1）。頁面上顯示的每位作者都要寫進 markup（[S11]）。
- **Profile page**：「The primary focus of the page must be a single person or organization that is affiliated with the overall website」，部落格的「About Me」頁是官方列出的有效例子。必填是 `mainEntity`（Person）加 `name`，建議填 `sameAs`、`image`（沒有照片就不要放預設圖）、`description` 等（[S12]）。
- **WebSite（網站名稱）**：要放在首頁，必填 `name`、`url`，`alternateName` 可選。網站名稱支援網域和子網域層級，不支援子目錄（[S13]）。`duncan-wen.aibbm.org` 是子網域，符合條件。
- **目前的 Search gallery**（[S14]）有 Article、Breadcrumb、Carousel、Course list、Dataset、Discussion forum、Education Q&A、Employer aggregate rating、Event、Image metadata、Job posting、Local business、Math solver、Movie、Organization、Product、Profile page、Q&A、Recipe、Review snippet、Software app、Speakable、Subscription and paywalled content、Vacation rental、Video。跟部落格相關的是：Article、Breadcrumb、Profile page、Image metadata。
- **已淘汰**：
  - Sitelinks search box：2024-11-21 起停止顯示。不必移除 markup，WebSite markup 仍然用於網站名稱（[S15]）。
  - HowTo：2023 年先限縮到桌機，之後整個淘汰（[S16]）。
  - FAQ：2023 年限縮到權威的政府和健康網站（[S16]）。2026-05-08 宣布淘汰，2026-06-15 移除文件，「is no longer shown in Google Search results」（[S17]）。
  - Practice problem：2026-01-06 移除文件（[S17]）。2025–2026 也淘汰了 Course info、Claim review、Estimated salary、Learning video、Special announcement、Vehicle listing 等類型（[S17]，詳細內容見 2025-06 的 blog 公告與 changelog）。
  - Google 表示殘留的舊 markup 不會造成錯誤（[S15]）。
- **Next.js 的實作方式**：官方建議在 `layout.js`／`page.js` 直接輸出原生的 `<script type="application/ld+json">`，不要用 `next/script`，並把 `<` 換成 `<` 防 XSS。可以用 `schema-dts` 加型別（[S27]）。

### 2.4 Bing
- Bing 2026-10 公告新的 AI 偏好設定（[S10]）：
  - 訓練用 robots.txt 的 `User-Agent: __usage_ai-training`，或頁面層級 `<meta name="Bingbot" content="ai-training:disallow">`／`X-Robots-Tag`。
  - Grounding（Copilot 等引用）**只能在頁面層級設定**：`ai-grounding:disallow` 或 `ai-grounding:disallowextended`（後者只允許 Microsoft 自家產品使用）。
  - 預設都是 Allow。2027-02-01 開始生效，2027-03-01 之後 NoArchive／NoCache 不再被當成 AI 偏好。
  - 原文：這些偏好「do not change eligibility for traditional Bing search results」。
- Bing Webmaster Tools 2026-02 推出 AI Performance 公開預覽，可以看哪些頁面被 Copilot／Bing AI 摘要引用（[S28]）。

---

## 3. AEO／GEO：官方怎麼說

### Google（AI Overviews、AI Mode）
- 「There are no additional requirements to appear in AI Overviews or AI Mode, nor other special optimizations necessary.」也不需要「new machine readable files, AI text files, or markup」（[S1]）。
- 2026-05-15 的 AI 優化指南（[S2]，相關 blog 見 [S29]）：
  - 「optimizing for generative AI search is optimizing for the search experience, and thus still SEO」。
  - 資格：「must be indexed and eligible to be shown in Google Search with a snippet」，而且要「included in Search generative AI features in Search Console」（Search Console 有「Search generative AI control」，整站設定，[S19]）。
  - 不需要做的事：llms.txt 或其他 AI 文字檔、Markdown 版本（「Google Search itself doesn't use them」）、把內容切小塊、為 AI 改寫文風或追 long-tail 變體、刻意製造品牌提及、過度重視結構化資料（結構化資料不是必要的，也沒有 AI 專用的 schema，但它有助於 rich result 資格）。
  - 該做的事：原創、第一手、非「commodity content」的內容，以及搭配相關的圖片和影片。
  - 量測：Search Console 的 Generative AI performance report。「No third-party tool has access to our internal ranking or AI systems.」
- 控制方式：`nosnippet` 適用於「AI Overviews, AI Mode」，可以讓內容不被當成直接輸入；`max-snippet` 也會限制 AI 能用多少內容（[S4]）。AI 流量算在 Search Console Performance report 的「Web」裡（[S1]）。

### OpenAI（ChatGPT search）
- 「To help ensure your site appears in search results, we recommend allowing OAI-SearchBot」。「Sites that are opted out of OAI-SearchBot will not be shown in ChatGPT search answers」。改 robots.txt 大約 24 小時後生效（[S5]）。
- 「If your site has allowed both bots, we may use the results from just one crawl for both use cases」（[S5]）。

### Anthropic（Claude）
- 擋 `Claude-SearchBot`「may reduce your site's visibility and accuracy in user search results」，擋 `Claude-User`「may reduce your site's visibility for user-directed web search」。Anthropic 支援非標準的 `Crawl-delay`（[S6]）。

### Perplexity
- `PerplexityBot` 是「designed to surface and link websites in search results on Perplexity」，「not used to crawl content for AI foundation models」（[S7]）。

### Apple
- 設定 `Applebot-Extended`「are not considered in ranking for Search」。`nosnippet` 會讓內容不被當成 AI 生成內容的脈絡（[S8]）。

### 小結
各家官方對「被 AI 引用」的說法，說穿了就兩件事：**讓對應的搜尋用 bot 抓得到**，以及**內容本身有價值**。沒有任何一家第一方文件說某種格式、檔案或 markup 會提高被引用的機會。

---

## 4. AI 爬蟲 user-agent 對照表

| 廠商 | Token | 用途 | 遵守 robots.txt？ | 來源 |
|---|---|---|---|---|
| Google | `Googlebot` | Search 抓取，包括 AI Overviews／AI Mode 的來源 | 是 | [S3]、[S1] |
| Google | `Google-Extended` | **只是控制 token，不是另一隻爬蟲**：管 Gemini 訓練，以及 Gemini Apps／Vertex AI 的 grounding。不影響 Search 收錄和排名 | 是（寫在 robots.txt） | [S3] |
| Microsoft | `Bingbot` | Bing 搜尋抓取 | 是 | [S10] |
| Microsoft | `__usage_ai-training`（robots.txt）／`<meta name="Bingbot" content="ai-training:…">` | 訓練偏好（2027-02-01 起生效） | 是 | [S10] |
| Microsoft | `<meta name="Bingbot" content="ai-grounding:…">` | Copilot 等的 grounding／引用偏好（只能在頁面層級設定） | 不適用（不是 robots.txt） | [S10] |
| OpenAI | `GPTBot` | 訓練 | 是 | [S5] |
| OpenAI | `OAI-SearchBot` | ChatGPT search 收錄與引用 | 是（約 24 小時生效） | [S5] |
| OpenAI | `ChatGPT-User` | 使用者當下觸發的抓取，不是自動爬取 | 「robots.txt rules may not apply」 | [S5] |
| OpenAI | `OAI-AdsBot` | 只檢查廣告到達頁 | 文件沒說 | [S5] |
| Anthropic | `ClaudeBot` | 訓練 | 是（也支援 `Crawl-delay`） | [S6] |
| Anthropic | `Claude-SearchBot` | 搜尋索引 | 是（Anthropic 說旗下 bot 都遵守） | [S6] |
| Anthropic | `Claude-User` | 使用者提問時的抓取 | 是（同上，文件沒有另外例外） | [S6] |
| Perplexity | `PerplexityBot` | 搜尋結果收錄，**不用來訓練** | 是 | [S7] |
| Perplexity | `Perplexity-User` | 使用者當下的抓取 | 「generally ignores robots.txt rules」 | [S7] |
| Apple | `Applebot` | Spotlight／Siri／Safari 搜尋（沒有自己的規則時會沿用 Googlebot 的規則） | 是（但忽略 `Crawl-delay`） | [S8] |
| Apple | `Applebot-Extended` | **不爬取**，只決定 Applebot 抓到的資料能不能拿去訓練。不影響 Search 排名 | 是 | [S8] |
| Common Crawl | `CCBot` | 公開的網路語料庫，給研究和任何人使用。官方頁沒有直接寫 AI 訓練，但這份語料常被拿去訓練（官方頁沒寫這點） | 官方教人用 robots.txt 擋 | [S9] |

---

## 5. llms.txt 現況

- **提案內容**（[S30]）：Jeremy Howard 在 2024-09-03 提出，頁面最後修改 2026-08-10（v2）。格式規定 H1 是唯一必填，其他是 blockquote 摘要、H2 連結清單、一個可以略過的「Optional」區段。也建議頁面提供 `.md` 版本，用 `rel="alternate" type="text/markdown"` 宣告。提案自己說主要用途是「*inference* rather than *training*」。
- **第一方承諾：沒有。**
  - Google Search：「Google Search ignores them」，做了「will neither harm nor help your site's visibility or rankings」（[S2]）。2026-06-15 changelog 有一條「Clarifying guidance on llms.txt files」（[S17]）。
  - OpenAI：爬蟲文件沒提到。它自己的開發者文件有一份 `/llms.txt` 當文件索引，但那是 OpenAI 自己發布，不代表爬蟲會讀別人的（[S5]）。
  - Anthropic、Perplexity：爬蟲文件都沒提到（[S6]、[S7]）。
  - llmstxt.org 自己列出的採用跡象是「有幾千個網站發布」，加上 OpenAI、Anthropic、Gemini 的開發者文件都有這個檔案。但**發布一個檔案不等於承諾會讀別人的檔案**（[S30]）。
- **Chrome Lighthouse**：實驗性的 Agentic Browsing 類別有一項 llms.txt 檢查。抓檔案時遇到 server error 會被標出來，404 判為 N/A（不扣分）（[S20]）。這是給瀏覽器代理的檢查，跟 Google Search 是兩回事。
- **對這個網站的意義**：做了不會傷害 Google，也沒有證據會幫上忙。成本是要多維護一個檔案，或寫一個從內容自動產生的 route。它唯一可能的價值，是讓使用者貼網址給 agent（例如 Claude Code、ChatGPT）時，agent 能拿到比較乾淨的入口。這只是推論，沒有第一方證據。

---

## 6. 傳聞但未證實

以下是在行銷部落格或媒體上看到的說法，**全部只是「有人宣稱，未證實」**。

| 宣稱 | 為什麼不採信 |
|---|---|
| 「放 llms.txt 會提高被 ChatGPT／Perplexity／Claude 引用的機會」 | 沒有廠商的第一方文件支持（[S2]、[S5]、[S6]、[S7]），Google 更明說會忽略。 |
| 「要為 AI 把內容切成小段、answer-first、Q&A 格式」 | Google 明文說不需要 chunking，也不需要為 AI 改寫（[S2]）。其他廠商沒有相關說法。 |
| 「加 FAQ schema 能進 AI Overviews／拿 rich result」 | FAQ rich result 已經不顯示了（[S17]），而且 Google 說 AI 功能不需要特殊 markup（[S1]、[S2]）。 |
| 「Schema／結構化資料會提高排名或 AI 引用率」 | Google 只說它影響 rich result 資格，對 AI 功能不是必要的（[S2]、[S11]）。 |
| 「E-E-A-T 是排名因素」 | Google 原文是「isn't a specific ranking factor」（[S18]）。 |
| 「定期更新日期可以保持新鮮度」 | Google 把沒有實質修改卻改日期列為警訊（[S18]），lastmod 也必須準確（[S25]）。 |
| 「到處製造品牌提及，可以讓 AI 推薦你」 | Google 說刻意製造的 mentions「isn't as helpful as it might seem」，而且 spam 系統會過濾（[S2]）。 |
| 「某某 AEO／GEO 工具可以看到 AI 怎麼排你的內容」 | Google：「No third-party tool has access to our internal ranking or AI systems」（[S2]）。 |
| 「擋 Google-Extended 可以不出現在 AI Overviews」／「擋了會掉排名」 | 兩個都不對。AI Overviews 是由 Googlebot 和 nosnippet 控制（[S1]、[S4]），Google-Extended 不影響 Search（[S3]）。 |
| 「擋 GPTBot 就不會出現在 ChatGPT search」 | OpenAI 把兩者分開，搜尋看的是 `OAI-SearchBot`（[S5]）。 |
| 「加統計數字、引言、引用來源可以提高 GEO 曝光（例如 +40%）」 | 出自 2023 年一篇學術論文（Aggarwal et al., "GEO: Generative Engine Optimization", arXiv:2311.09735），實驗是在作者自建的基準上做的。不是廠商說法，本次也沒有驗證它能否套用到現在的產品。 |
| 「Google 的 John Mueller 說 llms.txt『purely speculative』」 | 只在二手報導裡看到（例如 Search Engine Journal），沒有找到原始貼文。Google 官方文件的立場以 [S2] 為準。 |
| 「Google 一邊說不用 llms.txt，一邊又用 Lighthouse 檢查它，立場矛盾」（多家媒體） | 兩者對象不同：Search 排名（[S2]）跟瀏覽器代理的稽核（[S20]）。這是解讀，不是官方說法。 |
| 「`<html lang>` 有助於 Google 判斷語言」 | Google 明說不用（[S21]）。其他引擎有沒有用，本次沒有找到第一方文件，所以不下結論。 |

---

## 7. 對這個網站的具體建議（留給 grilling 決定的候選項）

先說現況：2026-11-12 對正式站實際 `curl` 過。

**已經有的：**
- `src/app/layout.tsx`：`metadataBase`、title template、`<html lang="zh-Hant">`。
- `src/page-alternates.ts`：每頁的 canonical 加 RSS discovery。正式站已經確認有輸出 `<link rel="canonical" href="https://duncan-wen.aibbm.org/posts/...">`。
- `src/app/posts/[slug]/page.tsx` 的 `generateMetadata`：title、description、canonical。taken-down 的文章會設 `robots: { index: false }`，`src/proxy.ts` 也會回 410。
- `opengraph-image.tsx`：1200×630。正式站已經有 og:title、og:description、og:image、twitter:card。
- `src/app/sitemap.ts`：文章的 `lastModified` 用 `latestRevision?.date ?? post.date`，符合 [S25]「last significant update」的精神。
- `/feed.xml`：`language: "zh-Hant"`。
- 文章頁有可見的 `<time dateTime="YYYY-MM-DD">`。

**缺的：**
- `/robots.txt` 回 404。
- 沒有 JSON-LD。
- `/llms.txt` 回 404。

以下是候選決策，**不替 Owner 決定政策問題**。

### 7.1 新增 `src/app/robots.ts`（技術上建議做，內容要決定）
- **確定有好處的**：加上 `sitemap: absoluteUrl("/sitemap.xml")`（[S24]、[S25]、[S27]）。現在 404 對 Google 等於沒有限制（[S24]），所以「不做」也不會出事，只是 sitemap 少了一個被發現的管道。
- **政策決定：AI 訓練爬蟲要不要放行？**（`GPTBot`、`ClaudeBot`、`Google-Extended`、`Applebot-Extended`、`CCBot`、Bing 的 `__usage_ai-training`）
  - 放行：文章可能進入未來模型的訓練資料，模型可能「知道」Duncan Wen 這個人和他的觀點，但不會有連結或流量歸屬。另外，OpenAI 說兩隻 bot 都放行時可能共用同一次抓取（[S5]），對網站負載比較省。
  - 擋：表達不授權訓練的立場。各家都說不影響搜尋收錄（[S3]、[S5]、[S6]、[S8]、[S10]）。但擋了只對**未來**的抓取有效（Anthropic 原文是「future materials」，[S6]），已經收進去的資料不受影響。
  - 這是價值選擇，沒有技術上的正確答案。
- **搜尋／引用用的 bot**（`OAI-SearchBot`、`Claude-SearchBot`、`Claude-User`、`PerplexityBot`、`Googlebot`、`Bingbot`、`Applebot`）：如果網站目標包含「被 AI 引用」（見 memory：網站要展示技術能力），擋這些就會直接失去曝光（[S5]、[S6]、[S7]）。**通常不會想擋**，但還是由 Owner 確認。
- 寫法上要注意：針對特定 bot 的群組會取代 `*`（[S24]），所以如果要給某個 bot 開例外，規則要寫完整。
- 要不要讓 robots.ts 依 `VERCEL_ENV` 在 preview 環境整站 Disallow？Vercel 文件說，指派給 Git branch 的自訂網域預覽要自己加 `X-Robots-Tag: noindex`（[S31]）。這個專案目前預覽用的是 `*.vercel.app` 網址，影響不大，列出來備查。

### 7.2 文章頁 `BlogPosting` JSON-LD（建議做，好處是 rich result 資格加上更清楚的作者和日期）
- 放在 `src/app/posts/[slug]/page.tsx`，用原生 `<script type="application/ld+json">` 加上 `<` 跳脫（[S27]）。
- 候選欄位（[S11]、[S32]）：
  - `headline`（post.title）、`description`
  - `datePublished`（post.date）、`dateModified`（latestRevision?.date ?? post.date）
  - `author`：`{ "@type": "Person", name: "Duncan Wen", url: absoluteUrl("/about") }`
  - `image`、`inLanguage: "zh-Hant"`、`keywords`（tags）、`mainEntityOfPage`／`url`（canonical）
- **待決定 1：日期要不要帶時區？** 現在的日期是 `YYYY-MM-DD`，沒有時間。[S11] 建議帶時區，否則 Google 會用 Googlebot 的時區。選項：(a) 輸出 `2026-11-12T00:00:00+08:00`，但這等於捏造一個時間點；(b) 只輸出日期（Date 格式本身合法）。這是精確度跟誠實之間的取捨。
- **待決定 2：圖片比例。** 現在的 OG 圖是 1200×630（約 1.9:1），不是 [S11] 建議的 16:9、4:3、1:1 之一（這是「建議」，不是必填）。選項：(a) 先只放現有的 OG 圖；(b) 另外產生 1:1、4:3、16:9 的版本（`generateCover` 已經存在，技術上做得到）。
- 這段 JSON-LD 跟 `feed.xml`、`generateMetadata` 用的是同一批欄位，可以考慮抽成同一個資料來源，免得三處不一致。這是設計上的選項。

### 7.3 About 頁 `ProfilePage` 加上 `Person`（建議做）
- `src/app/about/page.tsx` 符合 [S12] 的「About Me」有效例子。
- 欄位：`mainEntity: { "@type": "Person", name, sameAs: [GitHub, LinkedIn…], image?, description? }`。
- `image`：沒有真人照片就不要放（[S12] 明說不要放預設圖或 icon）。印章算不算「profile image」由 Owner 決定。
- `sameAs` 要放哪些外部個人檔案，涉及公開程度。memory 有提到求職的事不公開，這裡列哪些帳號由 Owner 決定。

### 7.4 首頁 `WebSite`（建議做，成本很低）
- `src/app/page.tsx`：`{ "@type": "WebSite", name: SITE_NAME, url: absoluteUrl("/") }`，可以加 `alternateName`（[S13]）。
- 讓 Google 用「Duncan Wen」當網站名稱，而不是網域。不要加 SearchAction（sitelinks search box 已經停用，[S15]）。

### 7.5 不建議做的
- FAQ、HowTo schema：已淘汰（[S16]、[S17]）。
- `hreflang`：這個網站只有一個語言版本，不需要（[S21]、[S22]）。`lang="zh-Hant"` 維持現狀，它跟 `feed.xml` 的 language、JSON-LD 的 `inLanguage` 用同一個值就好（BCP 47，[S32]）。
- 為了 AI 把文章改寫成 Q&A 或切小段：Google 明說不需要（[S2]）。
- 買或用「AI 曝光度」第三方工具：[S2]。

### 7.6 llms.txt（政策加成本的決定，兩邊都可以）
- 做：成本低，可以寫成 `src/app/llms.txt/route.ts`，從 `listPublishedPosts()` 自動產生 H1、摘要和文章連結（[S30]）。agent 拿到網址時入口比較乾淨，Lighthouse 的 Agentic Browsing 稽核也會通過（[S20]）。這也可以當成「展示技術能力」的小作品。
- 不做：沒有任何廠商承諾會讀它，Google 會忽略它（[S2]）。不做的話，Lighthouse 判 N/A，不扣分（[S20]）。
- 相關但成本更高的選項：每篇文章提供 `.md` 版本（[S30]）。MDX 原稿已經存在，技術上可行。同樣沒有第一方證據說有用，Google 明說 Search 不用 Markdown（[S2]）。

### 7.7 不用改程式的動作（Owner 帳號才能做）
- Google Search Console：確認網站已驗證、提交 sitemap、看「Search generative AI control」的設定和 Generative AI performance report（[S2]、[S19]）。
- Bing Webmaster Tools：提交 sitemap，看 AI Performance（[S28]）。Bing 的 AI 偏好預設是 Allow，沒有要擋就不用動（[S10]）。

### 7.8 內容與透明度（政策決定）
- 作者資訊：文章頁目前有出現「Duncan Wen」（正式站 HTML 出現 2 次），但 byline 有沒有連到 /about 要確認。[S18] 建議 byline 連到作者背景。
- AI 輔助寫作要不要揭露：這個 repo 有 `write-post` skill，會用 Owner 的文風寫文章。[S26] 說「Sharing information about how a piece of content was created can help give your readers more context」，並要求發布前人工查核。[S18] 說在讀者會想知道的情況下要揭露 AI 的使用。要不要揭露、怎麼揭露，是 Owner 的決定。取捨在透明度跟讀者觀感之間，跟 SEO 排名沒有直接關係。

---

## 8. 來源清單

全部於 2026-11-12 擷取。

- [S1] Google Search Central — AI features and your website：https://developers.google.com/search/docs/appearance/ai-features
- [S2] Google Search Central — Optimizing your website for generative AI features on Google Search（2026-05-15）：https://developers.google.com/search/docs/fundamentals/ai-optimization-guide（純文字版：https://developers.google.com/search/docs/fundamentals/ai-optimization-guide.md.txt）
- [S3] Google — Google's common crawlers（Googlebot、Google-Extended）：https://developers.google.com/search/docs/crawling-indexing/google-common-crawlers
- [S4] Google — Robots meta tag, data-nosnippet, and X-Robots-Tag：https://developers.google.com/search/docs/crawling-indexing/robots-meta-tag
- [S5] OpenAI — Overview of OpenAI Crawlers：https://developers.openai.com/api/docs/bots（舊網址 https://platform.openai.com/docs/bots 會 301 轉過去）
- [S6] Anthropic — Does Anthropic crawl data from the web, and how can site owners block the crawler?：https://support.claude.com/en/articles/8896518-does-anthropic-crawl-data-from-the-web-and-how-can-site-owners-block-the-crawler
- [S7] Perplexity — Perplexity Crawlers：https://docs.perplexity.ai/guides/bots
- [S8] Apple — About Applebot：https://support.apple.com/en-us/119829
- [S9] Common Crawl — CCBot：https://commoncrawl.org/ccbot
- [S10] Bing Blog — Your content, your choice: clearer preferences for training and grounding（2026-10）：https://blogs.bing.com/search/2026/10/your-content-your-choice-clearer-preferences-for-training-and-grounding/
- [S11] Google — Article structured data：https://developers.google.com/search/docs/appearance/structured-data/article
- [S12] Google — Profile page structured data：https://developers.google.com/search/docs/appearance/structured-data/profile-page
- [S13] Google — Site names：https://developers.google.com/search/docs/appearance/site-names
- [S14] Google — Search gallery：https://developers.google.com/search/docs/appearance/structured-data/search-gallery
- [S15] Google Search Central Blog — Farewell, Sitelinks Search Box（2024-10）：https://developers.google.com/search/blog/2024/10/sitelinks-search-box
- [S16] Google Search Central Blog — Changes to HowTo and FAQ rich results（2023-08）：https://developers.google.com/search/blog/2023/08/howto-faq-changes
- [S17] Google — Latest Google Search Documentation Updates（changelog，包括 2026-05-08 FAQ 淘汰、2026-06-15 FAQ 文件移除和 llms.txt 說明、2026-01-06 practice problem）：https://developers.google.com/search/updates；另見 https://developers.google.com/search/blog/2025/06/simplifying-search-results、https://developers.google.com/search/blog/2025/11/update-on-our-efforts
- [S18] Google — Creating helpful, reliable, people-first content：https://developers.google.com/search/docs/fundamentals/creating-helpful-content
- [S19] Google — Control what you share with Google Search（Search generative AI control）：https://developers.google.com/search/docs/crawling-indexing/control-what-you-share
- [S20] Chrome for Developers — Lighthouse Agentic Browsing: llms.txt：https://developer.chrome.com/docs/lighthouse/agentic-browsing/llms-txt（本次透過搜尋摘要取得內容，沒有直接全文擷取）
- [S21] Google — Managing multi-regional and multilingual sites：https://developers.google.com/search/docs/specialty/international/managing-multi-regional-sites
- [S22] Google — Tell Google about localized versions of your page（hreflang）：https://developers.google.com/search/docs/specialty/international/localized-versions
- [S23] Google — Introduction to robots.txt：https://developers.google.com/search/docs/crawling-indexing/robots/intro
- [S24] Google — How Google interprets the robots.txt specification：https://developers.google.com/search/docs/crawling-indexing/robots/robots_txt
- [S25] Google — Build and submit a sitemap：https://developers.google.com/search/docs/crawling-indexing/sitemaps/build-sitemap
- [S26] Google — Google Search's guidance on using generative AI content on your website：https://developers.google.com/search/docs/fundamentals/using-gen-ai-content
- [S27] Next.js 官方文件（透過 context7，來源是 vercel/next.js canary docs）— JSON-LD guide：https://nextjs.org/docs/app/guides/json-ld；robots.txt file convention：https://nextjs.org/docs/app/api-reference/file-conventions/metadata/robots
- [S28] Bing Webmaster Blog — Introducing AI Performance in Bing Webmaster Tools Public Preview（2026-02）：https://blogs.bing.com/webmaster/February-2026/Introducing-AI-Performance-in-Bing-Webmaster-Tools-Public-Preview（只看到搜尋結果摘要，沒有全文擷取）
- [S29] Google Search Central Blog — A new resource for optimizing for generative AI in Google Search（2026-05）：https://developers.google.com/search/blog/2026/05/a-new-resource-for-optimizing
- [S30] llms.txt 提案：https://llmstxt.org/
- [S31] Vercel — Response headers（preview 環境的 X-Robots-Tag 範例）：https://vercel.com/docs/headers/response-headers
- [S32] schema.org — BlogPosting：https://schema.org/BlogPosting（Person、ProfilePage、WebSite 的定義見 https://schema.org/Person、https://schema.org/ProfilePage、https://schema.org/WebSite，本次沒有逐頁擷取）
