import { initBotId } from "botid/client/core";

// BotID challenges the browser before each request that sends to the Owner inbox. The
// Contact form's Server Action posts to the About page; the server checks in the Owner inbox.
initBotId({ protect: [{ path: "/about", method: "POST" }] });
