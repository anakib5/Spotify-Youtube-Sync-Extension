// SpotifyAuthContextPKCE.jsx
import React, { createContext, useState, useEffect, useMemo } from "react";

// Create the Spotify authentication context.
export const SpotifyAuthContext = createContext();

// Spotify App credentials and endpoints.
const CLIENT_ID = import.meta.env.VITE_SPOTIFY_CLIENT_ID;

// For a Chrome extension, generate the redirect URI using chrome.identity if available.
const REDIRECT_URI =
  typeof chrome !== "undefined" &&
  chrome.identity &&
  chrome.identity.getRedirectURL
    ? chrome.identity.getRedirectURL()
    : "http://127.0.0.1:3000/"; // fallback for non-extension environments.
console.log(REDIRECT_URI)
const AUTH_ENDPOINT = "https://accounts.spotify.com/authorize";
const TOKEN_ENDPOINT = "https://accounts.spotify.com/api/token";
const SCOPE = "user-read-private user-read-email playlist-modify-public playlist-modify-private"; // Adjust scopes as needed.

// Utility: Generate a random string used as the PKCE code verifier.
function generateRandomString(length) {
  const possible =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let text = "";
  for (let i = 0; i < length; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return text;
}

// Utility: Convert an ArrayBuffer to a Base64-URL-encoded string.
function base64URLEncode(buffer) {
  let binary = "";
  const bytes = new Uint8Array(buffer);
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return window
    .btoa(binary)
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

// Utility: Calculate SHA256 using the SubtleCrypto API.
async function sha256(plain) {
  const encoder = new TextEncoder();
  const data = encoder.encode(plain);
  return crypto.subtle.digest("SHA-256", data);
}

// Utility: Given a code verifier, generate the code challenge.
async function generateCodeChallenge(codeVerifier) {
  const hashBuffer = await sha256(codeVerifier);
  return base64URLEncode(hashBuffer);
}

export const SpotifyAuthProvider = ({ children }) => {
  const [token, setToken] = useState(null);

  // Exchanges the authorization code (provided by the OAuth flow) for an access token.
  const fetchAccessToken = async (code) => {
    const codeVerifier = sessionStorage.getItem("pkce_code_verifier");
    if (!codeVerifier) {
      console.error("PKCE code verifier not found.");
      return;
    }

    const bodyParams = new URLSearchParams({
      client_id: CLIENT_ID,
      grant_type: "authorization_code",
      code,
      redirect_uri: REDIRECT_URI,
      code_verifier: codeVerifier,
    });

    try {
      const response = await fetch(TOKEN_ENDPOINT, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: bodyParams.toString(),
      });
      const data = await response.json();

      if (data.error) {
        console.error("Error fetching access token:", data);
        return;
      }

      setToken(data.access_token);
      localStorage.setItem("spotify_token", data.access_token);

      // Optionally, store data.refresh_token if needed.
      sessionStorage.removeItem("pkce_code_verifier");
    } catch (error) {
      console.error("Error during token exchange:", error);
    }
  };

  // Initiates the login process using PKCE. If running in a Chrome extension, this uses
  // chrome.identity.launchWebAuthFlow to handle the OAuth flow.
  const initiateLogin = async () => {
    try {
      const codeVerifier = generateRandomString(128);
      const codeChallenge = await generateCodeChallenge(codeVerifier);

      // Save the code verifier for later use.
      sessionStorage.setItem("pkce_code_verifier", codeVerifier);

      const params = new URLSearchParams({
        client_id: CLIENT_ID,
        response_type: "code",
        redirect_uri: REDIRECT_URI,
        code_challenge_method: "S256",
        code_challenge: codeChallenge,
        scope: SCOPE,
      });
      const authUrl = `${AUTH_ENDPOINT}?${params.toString()}`;
      console.log("Auth URL:", authUrl);

      if (
        typeof chrome !== "undefined" &&
        chrome.identity &&
        chrome.identity.launchWebAuthFlow
      ) {
      
        // Use chrome.identity.launchWebAuthFlow for the OAuth process.
        chrome.identity.launchWebAuthFlow(
          { url: authUrl, interactive: true },
          (redirectUrl) => {
            if (chrome.runtime.lastError) {
              console.error(chrome.runtime.lastError);
              return;
            }
            if (redirectUrl) {
              const url = new URL(redirectUrl);
              const code = url.searchParams.get("code");
              if (code) {
                fetchAccessToken(code);
              } else {
                console.error("Authorization code not found in redirect URL.");
              }
            }
          }
        );
      } else {
        // Fallback: redirect the current window if not in a Chrome extension.
        window.location.href = authUrl;
      }
    } catch (error) {
      console.error("Error initiating login:", error);
    }
  };

  // Logout function clears the token and initiates a fresh login.
  const logout = () => {
    setToken(null);
    localStorage.removeItem("spotify_token");
    sessionStorage.removeItem("pkce_code_verifier");
    initiateLogin();
  };

  // On mount, check if a token is already stored; if not, begin the login flow.
  useEffect(() => {
    const storedToken = localStorage.getItem("spotify_token");
    if (storedToken) {
      setToken(storedToken);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Memoize the context value to prevent unnecessary re-renders.
  const contextValue = useMemo(() => ({ token, logout, initiateLogin }), [token]);

  return (
    <SpotifyAuthContext.Provider value={contextValue}>
      {children}
    </SpotifyAuthContext.Provider>
  );
};
