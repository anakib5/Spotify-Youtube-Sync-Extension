export const onYoutubeVideo = async () => {
    try {
      // --- Get Active Tab ---
      // Use browser.tabs.query (works in Firefox and Chrome with polyfill)
      // or chrome.tabs.query directly if only targeting Chrome.
      // Ensure your manifest.json requests the "tabs" permission.
      let tabs;
      if (typeof browser !== "undefined" && browser.tabs) {
        // Use standard WebExtensions API (Firefox, Chrome with polyfill)
        tabs = await browser.tabs.query({ active: true, currentWindow: true });
      } else if (typeof chrome !== "undefined" && chrome.tabs) {
        // Fallback to Chrome specific API
         console.warn("Using chrome.tabs API. Consider using the webextension-polyfill for cross-browser compatibility.");
         tabs = await new Promise(resolve => {
             chrome.tabs.query({ active: true, currentWindow: true }, resolve);
         });
      } else {
          console.error("Browser Tabs API not found. This function must run in a browser extension context.");
          return false; // Cannot determine URL outside extension context
      }
  
  
      // --- Validate Tab and URL ---
      // Check if we got a result and the tab has a URL we can parse
      if (tabs && tabs.length > 0 && tabs[0].url) {
        const currentUrlString = tabs[0].url;
  
        // Check if the URL is potentially a YouTube URL before parsing fully
        // This avoids errors with non-HTTP/HTTPS URLs like about:blank
        if (!currentUrlString.startsWith('http://') && !currentUrlString.startsWith('https://')) {
            console.log("Active tab URL is not HTTP/HTTPS:", currentUrlString);
            return false;
        }
  
        // --- Parse and Check URL ---
        const url = new URL(currentUrlString);
  
        // Define valid YouTube hostnames
        const validHostnames = [
            'www.youtube.com',
            'youtube.com',
            'm.youtube.com' // Consider mobile YouTube
        ];
  
        // Check hostname and pathname
        const isYouTubeDomain = validHostnames.includes(url.hostname);
        // Check if it's a standard video watch page
        const isWatchPage = url.pathname === '/watch';
        // Optional: You could also include shorts -> url.pathname.startsWith('/shorts/')
        // const isShortsPage = url.pathname.startsWith('/shorts/');
  
        if (isYouTubeDomain && isWatchPage /* || isShortsPage */) {
          return true; // It's a valid YouTube video page
        } else {
          return false; // Not a video page (could be channel, search results, etc.)
        }
      } else {
        // No active tab found, or the active tab has no URL (e.g., a new tab page)
        console.log("No active tab with a valid URL found.");
        return false;
      }
    } catch (error) {
      // Handle potential errors during API calls or URL parsing
      console.error("Error in onYoutubeVideo function:", error);
      // Return false on error to prevent enabling the button incorrectly
      return false;
    }
  };