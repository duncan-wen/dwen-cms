import { initBotId } from "botid/client/core";

// BotID challenges the browser before each request that sends to the Owner inbox: the About
// page's Contact form (a Server Action, which posts to its page) and the Feedback endpoint.
// The server checks the verdict in the Owner inbox.
initBotId({
  protect: [
    { path: "/about", method: "POST" },
    { path: "/api/feedback", method: "POST" },
  ],
});
