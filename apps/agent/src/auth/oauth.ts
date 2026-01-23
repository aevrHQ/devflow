import open from "open";
import http from "http";
import { randomBytes } from "crypto";
import axios from "axios";

interface OAuthConfig {
  platformUrl: string;
  clientId: string;
  redirectUri: string;
}

interface OAuthToken {
  access_token: string;
  token_type: string;
  expires_in: number;
  agentId: string;
}

export async function initiateOAuthFlow(config: OAuthConfig): Promise<OAuthToken> {
  return new Promise((resolve, reject) => {
    const state = randomBytes(32).toString("hex");
    let server: http.Server | null = null;

    // Start local server to catch redirect
    server = http.createServer(async (req, res) => {
      try {
        const url = new URL(req.url || "", `http://localhost:3000`);
        const code = url.searchParams.get("code");
        const returnedState = url.searchParams.get("state");

        if (returnedState !== state) {
          throw new Error("State mismatch - authorization denied");
        }

        if (!code) {
          throw new Error("No authorization code received");
        }

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

        // Exchange code for token
        console.log("✓ Authorization successful!");
        console.log("⏳ Exchanging code for token...");

        const tokenResponse = await axios.post(
          `${config.platformUrl}/api/auth/callback`,
          {
            code,
            client_id: config.clientId,
            redirect_uri: config.redirectUri,
          }
        );

        const token: OAuthToken = tokenResponse.data;

        // Close server
        if (server) {
          server.close();
        }

        resolve(token);
      } catch (error) {
        if (server) {
          server.close();
        }
        reject(error);
      }
    });

    // Start listening
    server.listen(3333, async () => {
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
          `\n📌 Could not open browser. Please visit:\n${authUrl.toString()}\n`
        );
      }
    });

    // Timeout after 5 minutes
    setTimeout(() => {
      if (server) {
        server.close();
      }
      reject(new Error("OAuth authorization timeout"));
    }, 5 * 60 * 1000);
  });
}

export function isTokenExpired(token: OAuthToken, expiresAt: number): boolean {
  return Date.now() > expiresAt;
}

export function getTokenExpiration(expiresIn: number): number {
  return Date.now() + expiresIn * 1000;
}
