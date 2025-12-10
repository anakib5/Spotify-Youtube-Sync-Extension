async function extractYouTubeInfo() {
    return new Promise((resolve, reject) => {
      // Query for the active tab in the current window.
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        if (chrome.runtime.lastError) {
          reject(chrome.runtime.lastError);
          return;
        }
        
        const activeTab = tabs[0];
        if (!activeTab || !activeTab.id) {
          reject(new Error("No active tab found or tab has no id."));
          return;
        }
        
        // The function to be injected in the YouTube page.
        function extractData() {
          // Attempt to select the video title using common selectors.
          const titleElement = document.querySelector("#title h1 .ytd-watch-metadata");
          const title = titleElement ? titleElement.innerText.trim() : "Unknown Name";
    
          // Attempt to select the channel name.
          const channelAnchor = document.querySelector("#channel-name a");
          const channelName = channelAnchor ? channelAnchor.innerText.trim() : "Unknown Channel";
    
          return { title, channelName };
        }
        
        // Inject the script using chrome.scripting.executeScript.
        chrome.scripting.executeScript(
          {
            target: { tabId: activeTab.id },
            func: extractData, // The function to execute in the context of the YouTube page.
          },
          (results) => {
            if (chrome.runtime.lastError) {
              reject(chrome.runtime.lastError);
              return;
            }
            if (results && results.length > 0) {
              resolve(results[0].result);
            } else {
              reject(new Error("No results returned."));
            }
          }
        );
      });
    });
  }
  
export { extractYouTubeInfo };
  