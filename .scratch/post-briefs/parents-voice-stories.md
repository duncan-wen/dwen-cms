# 素材包：系列「用爸媽的聲音講故事」

給 `write-post` 用。這是素材，不是草稿：文章的聲音、結構和標題照 `write-post` 的規則寫，語氣模式是 4（產品故事）。
系列 id：`parents-voice-stories`。專案 repo 在同一台機器：`/home/lumpa7223/projects/parents-story`，議題在它的 GitHub Issues（`gh issue view <N>`，在那個資料夾裡跑）。

## 這個系列是什麼

Owner 在做一個服務：爸媽錄一段聲音、寫個故事大綱，AI 做出有插圖的繪本，用爸媽自己的聲音唸給小孩聽。系列一篇解決一個問題，從原型一路寫到產品。

Owner 對第一篇初版的意見（2026-11-15）：「不太生動，有點工程師的思維」。所以每一篇：

- 先一個家裡的場景，帶出一個爸媽也會問的問題，再講怎麼試、最後怎麼決定；
- 只講一個問題，其他的料留給後面；
- 技術細節放後半，寫成白話。

## 已確認的個人細節

Owner 親口說的，可以直接寫：

- 小孩叫 Eunice，4 歲（2026-11）。Owner 沒說性別：文中寫「Eunice」「孩子」，不寫他或她、兒子或女兒。
- 動機：有個純用機器合成語音做的 Podcast，竟然有幾萬人在聽，所以想用真人的聲音試試看。Owner 沒說是哪個節目，文中不點名。
- 第一篇發布時，Owner 對原型的評語：動畫還很簡陋，聲音不錯，故事內容只是原型、還沒真的編排。
- 把 AI 當成真人那一刻的心情：很開心，研究一步一步達成，選模型、看到成果都很快，覺得會成功。

還沒確認的：Eunice 有沒有實際玩過播放器。寫到她的反應前先問 Owner，她做了什麼、說了什麼都要是真的。

## 各篇規劃

順序可以依 Owner 實際做到哪裡調整。下面每一行只是題目，結論以議題為準：動筆前在 parents-story 的資料夾裡跑 `gh issue view <N> --comments`，結案留言有結論和原型分支；議題還沒結案就先問 Owner。

- [x] 1. AI 連口氣都學走了：三輪盲聽、為什麼選 ElevenLabs。已發布：`content/posts/voice-clone-bedtime-story/`。料：parents-story 議題 #2、#6，分支 `prototype/voice-audition`。
- [ ] 2. 小孩拿到平板，手指先往哪裡去：三種播放器實測、字跟著聲音亮（逐字時間戳）、iPhone 不讓網頁自己出聲、鎖螢幕後停播。料：議題 #5、#7，分支 `prototype/player` 的 `prototypes/player/README.md`（「What to watch while the Listener plays」是觀察清單）。需要 Eunice 實際玩過的觀察。第一篇已經放了播放器的互動展示 `listener-player`。
- [x] 3. 主角每一頁都要長同一張臉：插圖一致性試做，Google 的模型因條款出局，首選的 FLUX 盲評輸給 GPT Image。已發布（系列第 2 篇，2026-11-15）：`content/posts/picture-book-character-consistency/`。料：議題 #3、#8，分支 `prototype/illustration-consistency`（評分在 `results.json`，圖在本機的 `out/`，不在 repo）。
- [ ] 4. 別人爸媽的聲音，我敢不敢收：聲音同意、防冒用、小孩端什麼都不蒐集、服務條款。料：議題 #4、#9，分支 `research/privacy-requirements`。
- [ ] 5. AI 寫的故事能直接給小孩聽嗎：故事生成流程與內容安全。料：議題 #10。
- [ ] 6. 一本故事要多少錢：成本模型與用量上限。料：議題 #11。

第一篇原本有、修訂時拿掉留給後面的段落，在 git 裡：`git show d27bf7b:content/posts/voice-clone-bedtime-story/index.mdx`（「發現三」給第 2 篇，「其他研究裡踩到的坑」給第 2、3、4 篇）。

## 用詞

parents-story 的 `GLOSSARY.md` 用 Family、Narrator、Listener、Story、Page。文章裡說白話：家庭、唸故事的人（爸媽、奶奶）、小孩、繪本、頁。
