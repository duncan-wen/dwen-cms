# dwen-cms

Duncan Wen's personal tech-brand site and AI portfolio, written for prospective employers and clients first and fellow engineers second. Traditional Chinese only.

## Roles

**Owner**:
The person who owns the site and the only one who decides whether any content goes live.
_Avoid_: Admin, author, editor

**Reader**:
Anyone visiting the site, primarily prospective employers and clients, secondarily fellow engineers.
_Avoid_: Visitor, user, audience

**Writing Agent**:
An AI agent that drafts and revises content on the Owner's behalf; it never publishes on its own.
_Avoid_: Bot, assistant, writer

## Content

**Post**:
Dated content with tags that appears in listings and feeds. Shown to readers as 「文章」.
_Avoid_: Article, blog, entry

**Slug**:
The lowercase English kebab-case identifier in a Post's URL (`/posts/<slug>`); when it changes, the old one is kept and redirected permanently.
_Avoid_: Permalink, path, ID

**Tag**:
A lowercase English label from the approved tag list; a Post has one or more. Shown to readers as 「標籤」, and only once at least one Post carries it.
_Avoid_: Category, label, topic, 主題, 分類

**Page**:
Standalone undated content outside listings, such as the About page.
_Avoid_: Static page

**Cover**:
The image at the top of a Post and on its listing card, shown to readers as 「封面」. It is either the **generated cover**, contour lines seeded by the Slug (the default), or a **cover image**, the file the `cover` field names, which a Writing Agent draws with Fooocus while drafting. A cover carries no text.
_Avoid_: Hero, thumbnail, banner, featured image

**Body image**:
An image inside the body of a Post, stored next to it.
_Avoid_: Inline image, figure

**Illustration**:
A static Body image a Writing Agent draws itself to explain one concept Mermaid can't show, such as threads interleaving over time; it follows the site's theme. Shown to readers as 「插圖」. Anything animated or interactive is a Demo instead.
_Avoid_: Figure, drawing, picture, graphic

**Diagram**:
A process or architecture drawn from a Mermaid block in a Post's body, in the site's colours. Shown to readers as 「圖表」.
_Avoid_: Chart, graph, flowchart (for the general term)

**Lightbox**:
The layer over a page that shows one Body image enlarged; the Reader opens it with 「放大圖片」 and leaves it with 「關閉」.
_Avoid_: Modal, popup, zoom

**Promo image**:
A ready-to-post image of a Post for social media (文宣圖), written by `pnpm promo <slug>` at 1200×630, 1080×1080 and 1080×1350 from one of three brand templates: `contour` (the default, the Post's Cover beside the text: its cover image, else its generated cover), `flow` for a Post whose subject is a process, `terminal` for one teaching commands the Reader will type. The Post's optional `promo` frontmatter picks the `template` and gives its `titleLines` (where the title breaks; each stays on one line, and the title shrinks until the longest fits), its key `points` (at least one; leave the field out to show the description), flow's `steps` (`name`, optional `command`) or terminal's `lines` (`command`, optional `comment`). Unlike the OG image it carries no seal; the OG image breaks its title at the same `titleLines`.
_Avoid_: Banner, social card, thumbnail

**LinkedIn share**:
The text the Owner posts a Post to LinkedIn with, stored next to it as `linkedin.txt`, above a link card LinkedIn draws from the Post's OG image, title and description. A Writing Agent drafts it with the Post; it goes out only when the Owner says so, once, and records the LinkedIn post's URL when it does.
_Avoid_: Social post, cross-post, LinkedIn article

**Demo**:
An interactive AI showcase that stands on its own and can also be embedded in a Post; a Post containing a Demo is still a Post.
_Avoid_: Playground, lab, project

**Agent animation**:
The looping animation beside the home page's headline of an AI agent answering a question by calling a tool, with made-up data. Nothing in it is interactive and no AI runs, so it is not a Demo. Shown to readers as 「示意動畫」.
_Avoid_: Demo, video

## Lifecycle

**Draft**:
Content readers can't see; everything a Writing Agent produces starts here.
_Avoid_: Pending, unpublished

**Published**:
Content readers can see; only an Owner action moves content from Draft to Published. Shown to readers as 「發布」.
_Avoid_: Live, released

**Review**:
The Owner's act of approving a Draft for publication; an action, not a state. Shown to readers as 「審閱」.
_Avoid_: In review, pending approval

**Correction**:
A change to a Published Post that readers won't notice, such as a typo or broken link; no update date is shown.
_Avoid_: Fix, edit

**Revision**:
A substantive change to a Published Post that changes what readers learn; shown as 「更新於」 with a short note.
_Avoid_: Update, rewrite

**Takedown**:
Removing a Published Post entirely; its URL then returns 410 Gone. There is no "unpublished" state. Shown to readers as 「移除」.
_Avoid_: Unpublish, archive

## Reader interaction

Nothing a Reader sends ever appears on the site; it reaches only the Owner.

**Contact form**:
The form in the About page's contact section where a Reader sends the Owner a message: their name, an email to reply to, and the message, all required. It replaces the email link among the Owner's contact links; every 「聯絡我」 on the site leads to it. Shown to readers as 「聯絡表單」.
_Avoid_: Contact us, inquiry, comment

**Feedback**:
A Reader's answer, at the end of a Post, to whether the Post helped them: a thumbs up or down, optionally with one line of text. Counts are never shown on the site.
_Avoid_: Rating, reaction, like, comment
