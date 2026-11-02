# Cover styles

The Fooocus styles the Owner approved for cover images, from a side-by-side trial of 12 styles on two Posts (branch `prototype/cover-styles`, sheet `covers-prototype/index.html`). Pass the name exactly as written to `pnpm cover --style`.

Pick the style that fits the Post's mood, and vary it across Posts: covers are where the site shows what the AI can draw.

| Style | Looks like | Fits | Watch for |
| --- | --- | --- | --- |
| `Papercraft Flat Papercut` | Layered paper silhouettes, strong shapes against a soft sky | Any Post; the safest, held its look on every scene | Backlit scenes turn into dark silhouettes; give the subject a clear outline |
| `Simple Vector Art` | Flat shapes, clean edges, limited palette | Tools, workflows, tutorials | Tends to a purple sunset palette; name the colours or time of day you want |
| `Japanese Ink Drawing` | Sepia ink on paper, misty, sketched lines | Reflection, career, calm or slow topics | Small figures vanish into the mist; make the subject large |
| `MRE Sumi E Detailed` | Monochrome sumi-e, dark brush silhouettes | Quiet, contemplative Posts | Loses its look on busy scenes and drifts to a coloured painting |
| `Papercraft Stacked Papercut` | White 3D paper relief in layers | Craft, building, architecture | Loses its look on busy scenes and drifts to a realistic render |
| `SAI Isometric` | Isometric diorama, miniature world seen from above | Systems, architecture, a whole thing seen at once | Reads isometric only from above; say "seen from above" in the scene |
| `Mk Ukiyo E` | Japanese woodblock print, patterned water and trees | Travel, nature, family, seasonal Posts | Adds Japanese buildings and people; leave them out of a scene that shouldn't have them |

## Writing the prompt

The trial showed what Fooocus draws well:

- **One concrete scene with one subject**, in plain English: `paper boats drifting down a calm river toward a small harbor, morning light`. A busy scene (a house, a person, a robot and a sunrise at once) draws as the same realistic sunset whatever the style, so the style is lost.
- **A picture, never a structure.** "A river that splits into branches and merges again" came out as just a river in all 12 styles. Pick a scene that carries the Post's feeling: the Post on two tools merging into one workflow got a waterfall joining a river.
- **Nothing that invites lettering**: screens, documents, signs, books and code come back with made-up letters. The negative prompt already bans text; the scene shouldn't ask for it.
