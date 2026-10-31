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

**Demo**:
An interactive AI showcase that stands on its own and can also be embedded in a Post; a Post containing a Demo is still a Post.
_Avoid_: Playground, lab, project

## Lifecycle

**Draft**:
Content readers can't see; everything a Writing Agent produces starts here.
_Avoid_: Pending, unpublished

**Published**:
Content readers can see; only an Owner action moves content from Draft to Published.
_Avoid_: Live, released

**Review**:
The Owner's act of approving a Draft for publication; an action, not a state.
_Avoid_: In review, pending approval

**Correction**:
A change to a Published Post that readers won't notice, such as a typo or broken link; no update date is shown.
_Avoid_: Fix, edit

**Revision**:
A substantive change to a Published Post that changes what readers learn; shown as 「更新於」 with a short note.
_Avoid_: Update, rewrite

**Takedown**:
Removing a Published Post entirely; its URL then returns 410 Gone. There is no "unpublished" state.
_Avoid_: Unpublish, archive
