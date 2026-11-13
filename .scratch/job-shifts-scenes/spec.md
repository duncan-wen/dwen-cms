# Spec: Job shifts Animation as illustrated scenes

**Status:** ready-for-agent

## Problem Statement

The job shifts Animation (`.scratch/job-shifts-animation/`, live in the Post `ai-transition-era`) is a table of words that builds itself row by row. The Owner wants it lively: a Reader should see the story in pictures, not read it.

## Solution

Replace the table with three illustrated scenes, drawn in code as vector shapes in the site's colour tokens so they follow the theme and their parts can move. Each scene tells one shift: the old way of working, the moment it turns, the new role. The Animation then settles on a summary of all three. The Post keeps `<JobShiftsAnimation />` unchanged, so the live Post picks up the new Animation once it merges.

Its main job is still to help the Reader see the pattern; showing the Owner's technical skill is a side effect.

## Decisions

- **The scenes**, each old way → the turn → the new role:
  1. **工業革命**: a weaver at a hand loom, the shuttle going back and forth → gears turn as a power loom appears → a mechanic with a wrench beside the machine.
  2. **電腦普及**: a row of typewriters and a clerk adding up figures → the typewriters fade and a screen lights up → a programmer at a computer.
  3. **AI**: a person buried in a pile of documents and books → an AI chat bubble pops up with an answer → a person directing the AI, with a medical cross beside them (護理師 → AI 應用工程師).
- **People** are simple geometric figures: round head, rounded body, no face. The tools and objects around them say what the job is. This avoids stereotypes of gender, age and looks. The nurse is shown by a medical cross, never a nurse's cap or uniform.
- **Style:** line and flat-colour vector shapes, like the Agent animation's clean lines and accent green. The old way ends greyed out (`--ink-soft`); the new role is in `--accent`.
- **Text:** one short label per scene, e.g. 「工業革命：織布工 → 機械師」. The visually hidden list for screen readers and the caption 「示意動畫：三次技術轉變中消失與崛起的工作。」 stay as they are.
- **Summary frame:** the three shifts stacked top to bottom, each row old figure → arrow → new figure with its label, so it reads on a 343px phone column. It is the finished frame: what the Animation stops on, what reduced motion shows and what `pnpm shots` captures.
- **Scenes change** like turning a page: one scene at a time fills the frame, then the summary.
- **Playback** as before: starts once when half visible, stops on the summary, 「重播」 plays it again; reduced motion shows the summary still with no 「重播」. No sound. 20–25 seconds at 30fps.
- **Size:** at most 500px wide, as before.
- **Prototype first:** the 工業革命 scene alone is built on the branch `prototype/job-shifts-scenes` and shown to the Owner as captures taken mid-play. The other scenes and the summary follow its look once the Owner approves it.
- **Out of scope:** changes to the Post's text, sound, a video export, a general scene component.
