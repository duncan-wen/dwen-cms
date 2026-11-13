# Threads share：用官方 Threads API 從自己的帳號發文

研究日期：2026-11-13。只用 Meta 官方文件（`developers.facebook.com/documentation/threads/…`，舊網址 `developers.facebook.com/docs/threads/…` 會轉到這裡）與官方 Changelog。每條說法後面標來源編號（見文末 Sources）。標 **〔未證實〕** 的是二手來源或官方文件沒寫、由我推論的內容。

---

## 1. 個人能不能用官方 API 發到自己的 Threads？最小設定

**可以。** 只要發文的人是 app 上的 **Threads Tester**，就不需要 App Review、也不需要把 app 發佈（publish）：

- 「Threads testers can grant your app these permissions at any time. For app users without a role on your app to grant your app these permissions, each permission must first be approved through the App Review process, and your app must be published.」[S2]
- 「If your app has not been approved for advanced access for the `threads_content_publish` permission, you can only post on behalf of Threads testers on your app.」[S5][S6]
- App Review 「is required if your app will be used by people without a role on your app」[S11]；Testing 步驟「is only required if you are submitting your app for App Review; if your app will access data you don't own or manage」[S10]。
- 2025-09-23 起，**沒有連結 Instagram 的 Threads 帳號也能用 Threads API**（只有 `followers_count`、`follower_demographics` 例外）[S13]。

### App 類型與 use case

- 建 app 時選 **Access the Threads API** use case（文件也寫作 「Threads use case」）[S2][S10][S11]。Meta 現在的建 app 流程是「選 use case」，不是舊的「選 app type」[S11]。
- 一個 app 會有兩組 app ID／secret，Threads API 要用 **Threads app ID** 與 **Threads app secret**（在 use case 的 Settings 頁）[S2][S10]。
- Business portfolio 可選 「I don't want to connect a business portfolio yet」；只有要存取「你不擁有或管理的資料」才必須連 business portfolio [S11]。

### 權限（scopes）

| 權限 | 用途 | 本案需要？ |
| --- | --- | --- |
| `threads_basic` | 所有 Threads endpoint 都要；use case 內建、不能移除 [S2][S10] | 必要 |
| `threads_content_publish` | 發文 endpoint（`/threads`、`/threads_publish`、`threads_publishing_limit`）[S2][S7] | 必要 |
| `threads_delete` | 刪文（`DELETE /{threads-media-id}`）[S7][S10] | 選配，若想讓腳本能撤回 |
| 其他（`threads_manage_replies`、`threads_read_replies`、`threads_manage_insights`、`threads_keyword_search`…）| 回覆、洞察、搜尋 [S2][S10] | 不需要 |

### 人工要點的步驟（照官方文件整理）

1. 到 <https://developers.facebook.com/apps/creation/> 建 app：填 app 名稱與聯絡 email → Next [S11]。
2. Use cases：勾 **Access the Threads API** → Next [S11]。（注意：use case 建立後不能移除 [S11]。）
3. Business：選 「I don't want to connect a business portfolio yet」→ Next → Requirements → Next → Overview → **Go to dashboard** [S11]。
4. Dashboard → **Use cases** → 點 Threads use case → 在權限清單把 `threads_content_publish`（需要的話加 `threads_delete`）按 **Add** [S10]。
5. 同一個 use case 左側 **Settings**：抄下 **Threads app ID**、**Threads app secret**；在 **Client OAuth Settings** 填一個 valid OAuth redirect URI；另外兩欄 Deauthorize callback URL、Data Deletion Requests URL 也在這頁 → **Save** [S10]。（這兩欄對未發佈、只給自己用的 app 是否必填，官方文件沒說 **〔未證實〕**。）
6. 同頁點 **Add or Remove Threads Test Users** → 跳到 **App roles > Roles** → **Add People** → 選 **Threads Tester**，輸入自己的 Threads 帳號 [S2][S10]。
7. 用自己的帳號登入 Threads（網頁或 app）→ **Account Settings** → **Website permissions** → 接受邀請 [S2]（網址 `https://www.threads.com/settings/account`）。
8. 取得 token（見第 2 節）。

不需要：App icon、Privacy Policy URL、data deletion URL、Data Protection Officer 這些是 **Publish app** 才要的資產 [S10]；只當 tester 用就不必 publish。

---

## 2. Auth：拿自己帳號的 token、壽命、刷新

### 正式流程：OAuth Authorization Window（官方唯一完整記載的方法）

1. 開瀏覽器到：
   ```
   https://threads.com/oauth/authorize
     ?client_id=<THREADS_APP_ID>
     &redirect_uri=<REDIRECT_URI>
     &scope=threads_basic,threads_content_publish
     &response_type=code
     &state=<STATE>   // 選填
   ```
   除 `state` 外都必填；`redirect_uri` 必須與 Settings 裡登記的完全一致（Dashboard 可能自動加結尾斜線）[S3]。
2. 同意後被導回 `redirect_uri?code=...#_`；`#_` 不是 code 的一部分要去掉。code 一小時內有效、只能用一次 [S3]。
3. 換 short-lived token：`POST https://graph.threads.com/oauth/access_token`，body：`client_id`、`client_secret`、`code`、`grant_type=authorization_code`、`redirect_uri`。回 `{ access_token, token_type, user_id }` [S3]（`token_type` 是 2026-08-12 才加的 [S13]）。
4. 換 long-lived token：`GET https://graph.threads.com/access_token?grant_type=th_exchange_token&client_secret=<SECRET>&access_token=<SHORT_LIVED>`。要在 server 端做（含 secret）。回 `{ access_token, token_type: "bearer", expires_in }` [S4]。

> redirect URI 是否可以是 `localhost`／`http`，官方文件沒寫（所有範例都是 `https`）**〔未證實〕**。對一個本機腳本，可行的做法是登記一個自己控制的 https 網址（例如網站本身的某個路徑），導回後從網址列把 `code` 複製下來貼給腳本——這是我的推論 **〔未證實〕**。

### 有沒有像 LinkedIn 那樣的 token generator？

- 官方「Create posts」頁有一句：「While you are testing, you can generate tokens and grant your app permissions by using the **Graph API Explorer**.」[S5]（沒有進一步步驟。）
- 二手來源說 Threads use case 的 **Settings** 頁底部有 **User Token Generator**，對已接受邀請的 Threads Tester 按 **Generate Access Token** 即可拿到 token [U1][U2]。官方文件沒有記載此功能，產生的 token 是 short- 還是 long-lived 也未證實 **〔未證實〕**。
- 檢查任何 token：官方 **Access Token Debugger**（<https://developers.facebook.com/tools/debug/accesstoken/>）[S2]，或 `GET https://graph.threads.com/v1.0/debug_token?access_token=<APP_TOKEN 或 tester token>&input_token=<TOKEN>`，回 `expires_at`、`data_access_expires_at`、`scopes`、`is_valid` [S9]。App access token 格式是 `TH|<THREADS_APP_ID>|<THREADS_APP_SECRET>` [S9]（2026-08-18 起可用於 `/debug_token` [S13]）。

### 壽命

| 東西 | 壽命 | 來源 |
| --- | --- | --- |
| Authorization code | 1 小時、一次性 | [S2][S3] |
| Short-lived token | 1 小時；過期就不能換 long-lived | [S2][S4] |
| Long-lived token | 60 天 | [S2][S4] |
| 權限授權本身（permission grant）| 公開帳號 90 天，**每次 refresh 會再延 90 天**；私人帳號不能延，到期要重新授權 | [S2] |

（注意：long-lived-tokens 頁的寫法與 get-started 頁對「90 天」的描述有出入；以 get-started 頁的完整說法為準 [S2][S4]。）

### Refresh

- `GET https://graph.threads.com/refresh_access_token?grant_type=th_refresh_token&access_token=<LONG_LIVED>` [S4]
- 條件：token **至少 24 小時大、尚未過期**，且使用者授予過 `threads_basic` [S4]。
- 新 token 從 refresh 當天起再算 60 天；回應同樣是 `{ access_token, token_type, expires_in }` [S4]。
- **不需要 app secret**（參數只有 `grant_type`、`access_token`）[S4]。
- 60 天內沒 refresh 就過期、不能再 refresh，只能重跑 OAuth [S4]。

**能不能用腳本自動化？** 可以：refresh 是一個單純的 GET，不需要瀏覽器或 secret [S4]。腳本可以在每次執行時（token 滿 24 小時）先 refresh，再把新 token 與日期寫回 `.env.local`。限制是：如果超過 60 天都沒執行過，就得人工重跑 OAuth。這是依官方 endpoint 規格的推論，不是官方建議的做法。

---

## 3. 發文：container → publish

API host：`graph.threads.com` 或 `graph.threads.net` 都可 [S1]；範例都用 `https://graph.threads.com/v1.0/` [S6][S7]。

### 步驟

1. **建 container**：`POST /{threads-user-id}/threads` [S6][S7]
   - `media_type`：`TEXT`、`IMAGE`、`VIDEO`、`CAROUSEL`（單篇不能用 `CAROUSEL`）[S6][S7]
   - `text`：`TEXT` 必填 [S6]
   - `image_url`：`IMAGE` 必填，Threads 會自己去抓，**必須在公開伺服器上** [S2][S6]
   - `link_attachment`：連結預覽卡的 URL，**只限 `media_type=TEXT`**；必須是有效、公開的 URL [S6]
   - `topic_tag`：見下方 [S6][S7]
   - 其他可能有用的：`is_made_with_ai`（AI 標籤，預設 `false`）、`alt_text`（≤1,000 字）、`reply_control`、`auto_publish_text`（`true` 時文字 post 建 container 就直接發佈，免第二步；只限文字 post）[S6][S7]
   - 回 `{ "id": "<THREADS_MEDIA_CONTAINER_ID>" }` [S6]
2. **（可選）查狀態**：`GET /{threads-container-id}?fields=status,error_message`，狀態 `IN_PROGRESS`／`FINISHED`／`ERROR`／`EXPIRED`／`PUBLISHED`；container 24 小時沒發佈就 `EXPIRED`；建議每分鐘查一次、最多 5 分鐘 [S7][S8]
3. **發佈**：`POST /{threads-user-id}/threads_publish`，參數 `creation_id=<container id>` [S6][S7]
   - 官方建議建 container 後 **等約 30 秒** 再 publish [S6]（文件把這條放在通用說明裡，沒區分文字或圖片 post）

`threads-user-id` 可從 OAuth 回應的 `user_id` 取得 [S3]，或 `GET /me?fields=id,...`（官方範例裡 GET 都可用 `me` 代替 user id，例如 `GET /me/threads` [S12]、`GET /me?fields=id,is_eligible_for_geo_gating` [S16]；POST 範例則一律寫 `<THREADS_USER_ID>` [S6]）。

### Media types

- **TEXT**：純文字，可帶 `link_attachment`、GIF、text attachment、poll [S6][S7]
- **IMAGE**：JPEG/PNG、≤8 MB、長寬比上限 10:1、寬 320–1440（自動縮放）、sRGB [S1][S6]
- **CAROUSEL**：先為每張圖建 `is_carousel_item=true` 的子 container，再建 `media_type=CAROUSEL` + `children=<id,id,…>` 的父 container，最後 publish 父 container；2–20 個子項；算一篇 [S6]
- （VIDEO 也支援，本案不需要 [S6]）

### 文字 post 能不能帶連結預覽卡？

**可以，但只限文字 post。**

- 有給 `link_attachment` 就用它當預覽卡；沒給的話，**文字 post 裡第一個連結自動變成預覽卡** [S6]。
- 圖片／影片／carousel post **不能用** `link_attachment`；text 裡的第一個 URL 被當成連結預覽 [S6]（實際上圖片 post 會不會畫出卡片，文件沒說清楚 **〔未證實〕**）。
- 卡片內容：官方文件**沒有說明**預覽卡是從頁面的 OG tags 抓的，也沒有像 LinkedIn 那樣可以自己指定 title／description／thumbnail 的參數 [S6][S7]。由 Threads 爬取頁面的 OG tags 產生卡片是業界常態，但這是推論 **〔未證實〕**。換句話說：卡片長怎樣由 Threads 決定，腳本控制不了。
- 每篇最多 **5 個不重複連結**，`text` 裡的 URL 與 `link_attachment` 合併計算（相同 URL 只算一次）；2025-12-22 起超過會在建 container 時回 `THREADS_API__LINK_LIMIT_EXCEEDED` [S6][S13]。

### 文字長度

- **500 字元** [S1][S6]。
- 「Emojis are counted as the number of UTF-8 bytes」[S6][S7]，連結到 `grapheme-splitter` 套件。**中文字是算 1 個字元還是 3 個 UTF-8 bytes，官方沒寫** **〔未證實〕**；這對全中文的分享文很關鍵，實作時要以實測為準（例如先用 `auto_publish_text` 以外的流程建 container 試一個 499 字的中文 text 看會不會被拒）。
- 另有 **text attachment**：文字 post 可附一段最多 10,000 字的長文（`text_attachment.plaintext`，可加樣式與一個 `link_attachment_url`）；不能與 poll 並用；主 post 已有 `link_attachment` 時，text attachment 裡就不能再放連結 [S14]（2025-10-03 加入 [S13]）。

### Hashtag／topic tag

- **每篇只能有 1 個 topic** [S6]。
- 偏好用 `topic_tag` 參數；在 text 裡寫 `#tag` 是「not preferred but is kept for backward compatibility」，且**第一個有效的 `#tag` 才是該 post 的 topic** [S6]。
- 規則：1–50 字元；不能含 `.`、`&`；in-text tag 會在空白、tab、換行、`.`、`&`、`@`、`!`、`?`、`,`、`;`、`:` 處截斷；`#1` 這種純數字不轉成 tag [S6]。
- text 裡第二、第三個 `#tag` 會怎樣顯示（保留成純文字 `#xxx`？），以及同時給 `topic_tag` 參數又在 text 裡寫 `#tag` 時哪個勝出，文件沒寫 **〔未證實〕**。
- 2025-07-14 加入 `topic_tag` 參數 [S13]。

### Rate limit

- 每個 profile：**250 篇 API 發佈的 post／滾動 24 小時**（carousel 算 1 篇），由 `threads_publish` 執行 [S1][S6]。
- 回覆 1,000／24h、刪除 100／24h [S1]。
- 查用量：`GET /{threads-user-id}/threads_publishing_limit?fields=quota_usage,config` [S1]。
- 另有 app 層級呼叫數：`4800 × Number of Impressions`／24h（impressions 最低以 10 計）[S1]。一個月發幾篇的個人用途遠低於這些上限。

---

## 4. Publish 回應與公開網址

- `threads_publish` 只回 `{ "id": "<THREADS_MEDIA_ID>" }` [S6]，**沒有網址**。
- 要網址，再查：`GET /{threads-media-id}?fields=permalink`（也可要 `shortcode`、`username`）[S12][S15]。範例：`"permalink": "https://www.threads.com/@threadsapitestuser/post/abcdefg"` [S12]。
- `permalink` 在「media contains copyrighted material or has been flagged for a copyright violation」時會被省略 [S12]，所以腳本要處理沒有 `permalink` 的情況（例如退而用 `https://www.threads.com/@<username>/post/<shortcode>` 自己組——組法是從範例推得的 **〔未證實〕**）。
- 2024-08-28 起，符合條件的 API post 也會同步到 fediverse（若使用者在 Threads 開啟了 fediverse 分享）[S5]。

---

## 5. 台灣帳號有沒有差別？

- 官方 Threads API 文件**沒有任何依國家限制 API 使用的條文**；唯一跟國家有關的是：
  - **Geo-gating**（`allowlisted_country_codes`，讓 post 只在指定國家顯示）——是選用功能，且「Only users with access to this feature on threads.com can use this feature through the Threads API」，可用 `GET /me?fields=is_eligible_for_geo_gating` 查資格 [S16]。本案不需要。
  - 發佈 app 時，**在歐盟營業**才需要 Data Protection Officer 聯絡資訊 [S10]；台灣不適用，而且只當 tester 用不必 publish。
- 中文內容的唯一實務差異是第 3 節的**字元計算**（UTF-8 bytes 的說法只講 emoji，中文怎麼算未證實）。
- 結論：依官方文件，台灣帳號沒有額外限制；但官方也沒有逐國列出可用地區 **〔未證實：沒有正面確認〕**。

---

## 6. 對應到現有 LinkedIn 腳本（給之後 `/grilling` 的候選決定，不替 Owner 決定）

### 可以直接照搬的

- **檔案與流程**：`content/posts/<slug>/threads.txt`（對應 `linkedin.txt`）、`pnpm threads <slug>` 預覽 vs `--post` 才發、發完把 `posted: <permalink>` 寫回檔案第一行、已有 `posted:` 就拒絕。
- **先確認頁面已上線**：抓 `https://duncan-wen.aibbm.org/posts/<slug>`、檢查 canonical，與 LinkedIn 腳本相同。
- **Token 放 `.env.local`**：`THREADS_ACCESS_TOKEN`、`THREADS_TOKEN_DATE`（對應 `LINKEDIN_*`），60 天到期提醒邏輯一樣（Threads long-lived 也是 60 天 [S4]）。
- **錯誤訊息模式**：401/OAuthException 時提示重拿 token。
- **之後的 PR 流程**：`share-<slug>` 分支記錄 `posted:` 行。

### 不同、需要決定的

1. **Token 取得與刷新**
   - LinkedIn：dashboard token generator、到期只能重拿。Threads：官方只寫 OAuth 流程 [S3]（Graph API Explorer [S5]、dashboard 上的 User Token Generator 是二手說法 [U1]），但有官方 **refresh endpoint**，不需 secret [S4]。
   - 候選：(a) 腳本每次執行時自動 refresh 並改寫 `.env.local`；(b) 另寫 `pnpm threads --refresh`；(c) 跟 LinkedIn 一樣只提醒、人工重拿。
   - 候選：要不要寫一個 `pnpm threads --login` 跑 OAuth（需要 app secret 存在 `.env.local`、決定 redirect URI 用哪個網址），還是靠 dashboard 的 generator 手動貼。
   - 注意：Owner 若 60 天以上沒分享，token 一定會過期，自動 refresh 也救不了 [S4]。
2. **字數上限**：500（LinkedIn 3,000）[S6]，而且中文字計算方式未證實。候選：同一份文字共用（以 500 為準）vs 每個平台各寫一份；content check 的上限要怎麼算（JS 字串長度、grapheme 數、UTF-8 bytes——最保守是 UTF-8 bytes）。
3. **Tags**：Threads 每篇只有 1 個 topic [S6]，LinkedIn 規則是 2–3 個 hashtag。候選：(a) 文字不放 `#`，從 Post 的第一個 Tag 用 `topic_tag` 參數帶；(b) 在 `threads.txt` 裡寫一個 `#tag`；(c) 讓 Owner 每篇指定。Tag 不能含 `.`、`&`、空白 [S6]（例如 `Next.js` 這種 Tag 要轉換或換掉）。
4. **連結卡**：LinkedIn 腳本自己上傳 OG 圖片、自己填 title／description；Threads 只能給 `link_attachment` URL，卡片由 Threads 自己畫、無法指定 [S6]。候選：只給 URL 讓 Threads 畫卡（最像 LinkedIn 的效果，但預覽階段看不到真正的卡片）；或改發 IMAGE post（用 promo 圖片、`image_url` 指向網站上的公開圖片 [S6]）但那樣 `link_attachment` 不可用，連結得放在 text 裡。
5. **URL 放不放在文字裡**：LinkedIn 規則是「No URL: the card carries it」。Threads 文字 post 給 `link_attachment` 就不必把 URL 寫進 text [S6]；可沿用同一規則。
6. **兩段式發文與等待**：要 sleep 約 30 秒 [S6]，或輪詢 `status` 直到 `FINISHED` [S8]，或文字 post 用 `auto_publish_text=true` 一步完成 [S7]。另外 publish 後要多一次 `GET ?fields=permalink` 才拿得到網址 [S12]。
7. **AI 標籤**：Threads 有 `is_made_with_ai` [S6]；網站在 About 頁有 AI 揭露。要不要在 Threads post 上打這個標籤，是 Owner 的決定。
8. **詢問時機**：write-post skill 第 10 步目前只問「要發 LinkedIn 嗎？」。候選：改成一次問兩個平台，或分開問。
9. **Glossary**：是否新增 **Threads share** 一詞（對照現有 **LinkedIn share**）。

---

## Sources

官方（primary）：

- [S1] Threads API overview（rate limits、500 字、image specs、graph.threads.com/.net）— https://developers.facebook.com/documentation/threads/overview
- [S2] Get started with the Threads API（use case、permissions、Threads testers、token 壽命、90 天 permission grant）— https://developers.facebook.com/documentation/threads/get-started
- [S3] Get access tokens（Authorization Window、code exchange）— https://developers.facebook.com/documentation/threads/get-started/get-access-tokens-and-permissions
- [S4] Long-lived tokens（exchange、refresh、條件）— https://developers.facebook.com/documentation/threads/get-started/long-lived-tokens
- [S5] Create posts（Graph API Explorer、tester 限制、fediverse）— https://developers.facebook.com/documentation/threads/create-posts
- [S6] Threads posts（container/publish、30 秒、link_attachment、topic tags、carousel、AI label）— https://developers.facebook.com/documentation/threads/posts
- [S7] Publishing reference（完整參數、`auto_publish_text`、status endpoint）— https://developers.facebook.com/documentation/threads/reference/publishing
- [S8] Troubleshooting（container status、24 小時 expiry、輪詢建議）— https://developers.facebook.com/documentation/threads/troubleshooting
- [S9] Debug access token — https://developers.facebook.com/documentation/threads/troubleshooting/debug-access-token
- [S10] Customize the Threads API use case（權限表、Settings、Threads Testers、publish 資產）— https://developers.facebook.com/documentation/development/create-an-app/threads-use-case （同內容亦見 https://developers.facebook.com/documentation/threads/get-started/create-an-app ）
- [S11] Create an App with Meta（建 app 步驟、business portfolio、App Review 何時需要）— https://developers.facebook.com/documentation/development/create-an-app
- [S12] Retrieve user posts（`permalink`、`shortcode` 欄位與範例）— https://developers.facebook.com/documentation/threads/retrieve-and-discover-posts/retrieve-posts
- [S13] Threads Changelog — https://developers.facebook.com/documentation/threads/changelog
- [S14] Text attachments — https://developers.facebook.com/documentation/threads/create-posts/text-attachments
- [S15] Media retrieval reference — https://developers.facebook.com/documentation/threads/reference/media-retrieval
- [S16] Geo-gated content — https://developers.facebook.com/documentation/threads/posts/geo-gating
- （參考）Web intents，非 API 的備案：`https://www.threads.com/intent/post?text=…&url=…&tag=…` 開啟預填的發文視窗，由人按送出 — https://developers.facebook.com/documentation/threads/threads-web-intents

二手（unverified，只用於標 〔未證實〕 的內容）：

- [U1] How to renew access token to Threads API（個人部落格，提到 Settings 頁的 User Token Generator）— https://scdotnetv3.pages.dev/til/how-to-renew-access-token-to-threads-api
- [U2] n8n Threads 設定教學（社群文章）— https://slashpage.com/n8n-guide/dk58wg2e4kj63mnqevxz?tl=en
