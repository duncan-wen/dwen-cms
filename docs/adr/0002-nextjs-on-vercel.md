# Next.js on Vercel, not Astro

The site is built with Next.js App Router and deployed on Vercel. For a content-only v1, Astro would be lighter and ship less JavaScript, and we considered it. We chose Next.js because the Owner already knows it and phase-2 Demos need server-side model calls and streaming responses, which Next.js Route Handlers on Vercel cover without a separate backend.
