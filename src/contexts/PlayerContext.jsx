import React, { createContext, useState, useEffect, useContext } from "react";
import { onYoutubeVideo } from "../utilities/onYoutubeVideo";
import { extractYouTubeInfo } from "../utilities/extractYoutubeInfo";
import { getSpotifyTrack } from "../utilities/getSpotifyTrack";
import { SpotifyAuthContext } from "../contexts/SpotifyContext";
import getYoutubeVideo from "../utilities/getYoutubeVideo";

export const PlayerContext = createContext();

export const PlayerProvider = ({ children }) => {
  const [currentTrack, setCurrentTrack] = useState(null);
  const [currentTrackTime, setCurrentTrackTime] = useState(0);
  const [currentTrackDuration, setCurrentTrackDuration] = useState(0);
  const [playlist, setPlaylist] = useState(null);
  const [currentPlaylistIndex, setCurrentPlaylistIndex] = useState(0);
  const [isScanCheckInit, setIsScanCheckInit] = useState(false);
  // Flag that, when true, tells the scan logic to skip running.
  const [manualUpdate, setManualUpdate] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const { token } = useContext(SpotifyAuthContext);

  // Update track by index, and mark as manual update
  async function setCurrentTrackByIndex(index) {
    const newTrackData = playlist.tracks.items[index];
    if (newTrackData) {
      const youtubeVideo = await getYoutubeVideo(newTrackData.track);
      if (youtubeVideo && !youtubeVideo.error) {
        // Set flag to skip scanning.
        setManualUpdate(true);
        // Optionally, reset manualUpdate after 5 seconds (or your preferred duration)
        setTimeout(() => {
          setManualUpdate(false);
        }, 5000);

        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
          if (tabs.length > 0) {
            const currentTab = tabs[0];
            // Update the tab's URL:
            chrome.tabs.update(currentTab.id, { url: youtubeVideo.href });
            setCurrentTrack(newTrackData.track);
            setCurrentPlaylistIndex(index);
          }
        });
      }
    }
  }

  const contextValue = {
    currentTrack,
    currentTrackTime,
    currentTrackDuration,
    playlist,
    currentPlaylistIndex,
    setPlaylist,
    setCurrentTrackByIndex,
  };

  // Scanning function: find the current track using YouTube details.
  async function scan() {
    if (!token) {
      return true;
    }
    const isYoutubeVideo = await onYoutubeVideo();
    if (isYoutubeVideo) {
      const youtubeVideo = await extractYouTubeInfo();
      if (youtubeVideo?.channelName === "Unknown Channel") {
        return true;
      }
      if (youtubeVideo?.channelName && youtubeVideo?.title) {
        const query = `${youtubeVideo.title}`;
        const spotifyTrack = await getSpotifyTrack(query, token);
        if (spotifyTrack) {
          setCurrentTrack(spotifyTrack);
          console.log("Current track is ", spotifyTrack.name);
        } else {
          setCurrentTrack(null);
        }
      }
    } else {
      setCurrentTrack(null);
    }
  }

  // Attempts scanning on a delay.
  async function attempt() {
    setTimeout(() => {
      let isDefer = scan();
      if (isDefer) {
        setTimeout(() => {
          scan();
        }, 1000);
      }
    }, 500);
  }

  // Set up scanning with chrome.tabs listener.
  useEffect(() => {
    if (token && !isScanCheckInit) {
      setIsScanCheckInit(true);
      console.log("Listening for tab updates");
      chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
        if (changeInfo.status === "complete") {
          // Only run scan if no manual update was done recently.
          if (!manualUpdate) {
            console.log("Running automatic scan...");
            attempt();
          } else {
            console.log("Manual update active, skipping scan.");
          }
        }
      });
    }
    // Also, if there’s no manual update, run an initial scan.
    if (token && !manualUpdate) {
      attempt();
    }
  }, [token, isScanCheckInit, manualUpdate]);

  // Effect to update currentTrackTime.
  // Inside PlayerProvider component

  useEffect(() => {
    let intervalID;

    const getTimeFromActiveTab = async () => {
      try {
        // Find the active YouTube tab
        const tabs = await chrome.tabs.query({
          active: true,
          currentWindow: true,
        });
        // Ensure we have a tab and it's a YouTube video page
        const currentTab = tabs?.[0];

        if (
          !currentTab ||
          !currentTab.id ||
          !currentTab.url ||
          !currentTab.url.includes("youtube.com/watch")
        ) {
          // Not on a YouTube video page, or tab info unavailable
          setCurrentTrackTime(0); // Reset time or handle appropriately
          return;
        }

        const injectionResults = await chrome.scripting.executeScript({
          target: { tabId: currentTab.id },
          func: injectedGetTimeFunction, // The function defined below
        });

        // executeScript returns an array of results, one per frame.
        // We expect one result from the main frame.

        if (injectionResults && injectionResults[0]) {
          const newTime = injectionResults[0].result.currentTime;
          const newDuration = injectionResults[0].result.duration;

          setCurrentTrackTime(newTime);
          setCurrentTrackDuration(newDuration);

          if (newDuration - newTime < 1.2 && currentPlaylistIndex != -1) {
            if (
              currentPlaylistIndex != playlist.tracks.items.length - 1 &&
              !isLoading
            ) {
              setIsLoading(true);
              setCurrentTrackByIndex(currentPlaylistIndex + 1);
              setTimeout(() => {
                setIsLoading(false);
              }, 5000);
            }
          }
        } else {
          // Handle cases where injection failed or video wasn't found
          console.log(
            "Failed to get time or video not found in tab:",
            currentTab.id
          );
          setCurrentTrackTime(0); // Reset time
        }
      } catch (error) {
        console.error("Error executing script or querying tabs:", error);
        setCurrentTrackTime(0); // Reset time on error
      }
    };

    if (currentTrack) {
      // Run immediately once and then set interval
      getTimeFromActiveTab();
      intervalID = setInterval(getTimeFromActiveTab, 1000); // 1 second interval
    } else {
      setCurrentTrackTime(0);
    }

    // Cleanup function to clear the interval when the component unmounts
    // or when currentTrack changes and becomes null.
    return () => {
      if (intervalID) {
        clearInterval(intervalID);
      }
    };
  }); // Dependency array includes currentTrack

  // Function to be injected into the YouTube page context
  function injectedGetTimeFunction() {
    // Use a reliable selector for the main video element
    const videoElement = document.querySelector("video.html5-main-video");
    if (videoElement && typeof videoElement.currentTime === "number") {
      return {
        currentTime: videoElement.currentTime,
        duration: videoElement.duration,
      };
    }
    // Return null or another indicator if the video element isn't found
    // or currentTime isn't accessible
    return null;
  }

  // Effect to update the current playlist index.
  useEffect(() => {
    if (playlist && currentTrack?.id) {
      const index = playlist.tracks.items.findIndex(
        (item) =>
          item &&
          item.track &&
          (item.track.id === currentTrack.id ||
            item.track.name === currentTrack.name)
      );
      setCurrentPlaylistIndex(index);
      console.log(index);
    }
  }, [currentTrack, playlist]);

  return (
    <PlayerContext.Provider value={contextValue}>
      {children}
    </PlayerContext.Provider>
  );
};

export default PlayerProvider;
