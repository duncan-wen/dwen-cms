# Spec: Screenshots of an animation mid-play

**Status:** needs-triage

## Problem Statement

`pnpm shots` asks for reduced motion, so an animation (the Agent animation on the home page) is always shot at its finished frame. Neither the Owner, reviewing from the contact sheet, nor an agent checking its work can see the animation play. To check the Agent animation, an agent wrote a one-off Playwright script and started its own server, and that went wrong several times: a stale server answered with old chunks, and `pkill -f` killed the agent's own shell.

## Solution (to grill)

An option such as `pnpm shots / --at 1.5,3.5,6` also shoots each page with motion on, the given number of seconds after load, and puts those shots beside the finished frame on the contact sheet.

## Open questions

- Shoot the whole page or crop to the animation, like Illustrations and Diagrams are cropped?
- Are seconds after page load steady enough, or should the shot seek the Player to a frame?
