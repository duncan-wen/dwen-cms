import { initBotId } from "botid/client/core";

// BotID challenges the browser before each request that sends to the Owner inbox: Server
// Actions post to their page, the About page's Contact form and each Post's Feedback block.
// The server checks the verdict in the Owner inbox.
initBotId({
  protect: [
    { path: "/about", method: "POST" },
    { path: "/posts/*", method: "POST" },
  ],
});
