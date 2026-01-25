import open from "open";
import http from "http";
import { randomBytes } from "crypto";

interface OAuthConfig {
  platformUrl: string;
  clientId: string;
  redirectUri: string;
}

interface OAuthToken {
  access_token: string;
  token_type: string;
  expires_in: number;
  agent_id: string; // API returns agent_id (snake_case)
}

export async function initiateOAuthFlow(
  config: OAuthConfig,
): Promise<OAuthToken> {
  return new Promise((resolve, reject) => {
    const state = randomBytes(32).toString("hex");
    let server: http.Server | null = null;
    let isHandlingCallback = false;

    // Start local server to catch redirect
    server = http.createServer(async (req, res) => {
      console.log(`[CLI] HTTP ${req.method} ${req.url}`);

      // Ignore favicon requests
      if (req.url?.includes("favicon")) {
        res.writeHead(404);
        res.end();
        return;
      }

      // Only handle the first callback, ignore subsequent requests
      if (isHandlingCallback) {
        console.log("[CLI] Already handling callback, ignoring this request");
        res.writeHead(400);
        res.end("Callback already processed");
        return;
      }

      try {
        const url = new URL(req.url || "", `http://localhost:3333`);

        // Log the request for debugging
        console.log(
          `[CLI] Incoming request: ${req.method} ${url.pathname}${url.search}`,
        );

        // Ignore favicon and other assets explicitly
        if (url.pathname === "/favicon.ico" || !url.searchParams.has("state")) {
          res.writeHead(404);
          res.end();
          return;
        }

        const code = url.searchParams.get("code");
        const returnedState = url.searchParams.get("state");

        console.log("[CLI] Received callback candidate");

        // Validate state
        if (returnedState !== state) {
          console.warn(
            `[CLI] State mismatch (Expected: ${state.substring(0, 8)}..., Got: ${returnedState?.substring(0, 8)}...)`,
          );
          res.writeHead(400);
          res.end("State mismatch - authorization denied");
          return; // Do not reject the promise, just ignore this request
        }

        console.log("[CLI] State verified successfully");

        if (!code) {
          console.warn("[CLI] No authorization code received");
          res.writeHead(400);
          res.end("No authorization code received");
          return;
        }

        isHandlingCallback = true;

        // Send success response
        res.writeHead(200, { "Content-Type": "text/html" });
        res.end(`
          <html>
            <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; padding: 40px; text-align: center;">
              <h1>✓ Authorization Successful!</h1>
              <p>You can now close this window and return to the terminal.</p>
              <p>Your DevFlow Agent is configured and ready to use.</p>
            </body>
          </html>
        `);

        // Wait a moment for the response to be sent, then close server
        console.log("[CLI] Response sent, closing server in 100ms");
        setTimeout(async () => {
          if (server) {
            console.log("[CLI] Closing local callback server");
            server.close(() => {
              console.log("[CLI] Server closed successfully");
            });
          }

          // Exchange code for token
          try {
            console.log("[CLI] Exchanging code for token...");
            const tokenResponse = await fetch(
              `${config.platformUrl}/api/auth/callback`,
              {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({
                  code,
                  client_id: config.clientId,
                  redirect_uri: config.redirectUri,
                }),
              },
            );

            if (!tokenResponse.ok) {
              // Only reject if the Token Exchange ITSELF fails after a valid code
              throw new Error(
                `Token exchange failed: ${tokenResponse.status} ${tokenResponse.statusText}`,
              );
            }

            const token: OAuthToken =
              (await tokenResponse.json()) as OAuthToken;
            console.log(
              "[CLI] Token exchange successful, agent ID:",
              token.agent_id,
            );

            resolve(token);
          } catch (error) {
            reject(error);
          }
        }, 100);
      } catch (error) {
        console.error(`[CLI] Request handling error:`, error);
        res.writeHead(500);
        res.end("Internal Server Error");
        // Do not reject the main promise on transient request handling errors
      }
    });

    // Start listening
    server.listen(3333, async () => {
      console.log("[CLI] Local callback server listening on port 3333");

      const authUrl = new URL(`${config.platformUrl}/auth/agent`);
      authUrl.searchParams.set("client_id", config.clientId);
      authUrl.searchParams.set("redirect_uri", config.redirectUri);
      authUrl.searchParams.set("state", state);

      console.log("\n🌐 Opening browser for authentication...");
      console.log(`📍 URL: ${authUrl.toString()}\n`);

      try {
        await open(authUrl.toString());
      } catch (error) {
        console.log(
          `\n📌 Could not open browser. Please visit:\n${authUrl.toString()}\n`,
        );
      }
    });

    // Timeout after 5 minutes
    const timeoutHandle = setTimeout(
      () => {
        if (server) {
          console.log("[CLI] OAuth timeout, closing server");
          server.close();
        }
        reject(new Error("OAuth authorization timeout"));
      },
      5 * 60 * 1000,
    );
    // Ensure timeout doesn't block process exit if it's the only thing left (though we clear it anyway)
    timeoutHandle.unref();

    // ... inside server handler ...
    // When resolving, we don't strictly need to clear if unref'd, but it's cleaner.
    // However, since we define it at the bottom, we need to access it inside the callback.
    // Let's rely on unref() or move the definition up.
    // Actually, simpler to just unref it immediately.
  });
}

export function isTokenExpired(token: OAuthToken, expiresAt: number): boolean {
  return Date.now() > expiresAt;
}

export function getTokenExpiration(expiresIn: number): number {
  return Date.now() + expiresIn * 1000;
}
