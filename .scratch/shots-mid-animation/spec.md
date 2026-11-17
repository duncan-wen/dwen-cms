# Spec: Screenshots of an animation mid-play

**Status:** done

## Problem Statement

`pnpm shots` asks for reduced motion, so every Animation is shot at its finished frame. Neither the Owner nor an agent can see one play. To check the Agent animation, and again for the oversell and central-stock Animations, an agent wrote a one-off Playwright script and started its own server; it went wrong each time (a stale server answering with old chunks, `pkill -f` killing the agent's own shell, a build of the wrong content because `CONTENT_DIR` wasn't set).

## Solution

`?at=<seconds>,<seconds>…` on a path given to `pnpm shots` also shoots each Animation on that page mid-play, that many seconds after it starts, cropped to the Animation. Without `?at=` nothing changes.

## User Stories

1. As a Writing Agent changing an Animation, I want to see it at a few moments of its play, so I can check its motion and colours without writing my own script.
2. As the Owner, I want those moments beside the finished frame on the contact sheet.

## Implementation Decisions

- **Option**: a query parameter like `?open=` and `?scroll=`: `pnpm shots '/posts/<slug>?at=2,5,9'`. It isn't sent to the site. Each value is a non-negative number of seconds; anything else fails with a message naming the path.
- **What is shot**: for each `?at=` time and each Animation on the page, a crop of that Animation only, in light and dark, at 1280px, as `<path>-animation-<n>-at-<seconds>-<theme>-1280.png` (n counts Animations from the top of the page, as the finished-frame crops do). The path's usual shots are taken as well.
- **Timing**: motion is on for these shots. A Post Animation (`figure[data-playback]`) is scrolled into view in a fresh page, and its clock starts when `data-playback` turns `playing`. The home page's Agent animation plays on load, so its clock starts at page load. The shot is taken after waiting that many real seconds; about ±0.2s is fine for checking motion. The Player is not seeked to a frame: that would need a hook in production code.
- **Server and build**: the run's own server and build, so `--no-build` and `--content` work as for any shot.
- **Contact sheet**: each Animation's mid-play shots sit in a row beside its finished-frame crops, captioned 「第 <seconds> 秒」 with theme.
- **Docs**: `docs/agents/shipping.md` **Screenshots** and `write-post` step 7 say that after changing an Animation, an agent also shoots it with `?at=` at a few moments and reads those shots.

## Testing Decisions

- The `?at=` parsing (valid list, bad values) is unit-tested without a browser.
- A real run of `pnpm shots '/posts/animation-smoke-post?at=2,6'` writes 2 × 3 × 2 mid-play crops, and they differ from the finished frames.

## Out of Scope

- Seeking the Player to an exact frame; video or GIF output; mid-play shots at phone width.

## Further Notes

- Agreed with the Owner on 2026-11-17 in chat.

## Comments

- Built in ticket 01. Animations are found by a `data-animation` attribute, added to `AnimationFigure` and the Agent animation, so the finished-frame crops now include the home page's Agent animation too. `?at=` is left out of the path's file names, so its usual shots keep their names.
