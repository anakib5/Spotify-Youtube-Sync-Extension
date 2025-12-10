// playlist.js returns returns a div of trackWidgets which each have
// an event listener to go to the associated youtube song.
// playlist.jsx
import React, { useState, useEffect, useContext } from "react";
import { useParams } from "react-router";
import TrackWidget from "../components/trackWidget";
import { SpotifyAuthContext } from "../contexts/SpotifyContext";
import { CircularProgress, Typography } from "@mui/material";
import { IconButton } from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { Link } from "react-router";
import { extractYouTubeInfo } from "../utilities/extractYoutubeInfo";
import { PlayerContext } from "../contexts/PlayerContext";
import PlayerWidget from "../components/playerWidget";
import Box from "@mui/material/Box";
import PlaylistPageHeaderSkeleton from "../components/playlistHeaderPageSkeleton";
import PlaylistPageSkeleton from "../components/playlistPageSkeleton";

function Playlist() {
  const { id } = useParams(); // e.g., if URL is /playlist/123, id = "123"
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const { setPlaylist, playlist, currentTrack } = useContext(PlayerContext);

  const { token } = useContext(SpotifyAuthContext);

  async function fetchPlaylist() {
    try {
      const response = await fetch(
        `https://api.spotify.com/v1/playlists/${id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error(
          `Error fetching playlist: ${response.status} ${response.statusText}`
        );
      }
      const data = await response.json();
      setPlaylist(data);
      setTimeout(() => {
        setIsLoading(false);
      }, 100);
    } catch (err) {
      console.error(err);
      setError(err.message);
    }

    let results = await extractYouTubeInfo();
    console.log(results);
  }

  useEffect(() => {
    if (id) {
      fetchPlaylist();
    }
  }, [id, token]);

  if (error) {
    return <p>Error: {error}</p>;
  }

  if (isLoading && currentTrack) {
    return <PlaylistPageHeaderSkeleton />;
  } else if (isLoading && !currentTrack) {
    // no header here
    return <PlaylistPageSkeleton />;
  }

  // playlist.tracks.items is an array of objects shaped like: { track: {...} }
  // For each item, the actual track data is in item.track
  return (
    // Use Box for overall structure and apply dark theme
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        height: "100vh", // Fill viewport height
        p: 1.25, // Overall padding
        backgroundColor: "#121212", // Dark background for the entire page
        color: "#ffffff", // Default light text color for the page
      }}
    >
      {/* --- Non-Scrolling Part 1: Header --- */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          mb: 1.25, // Margin bottom
          flexShrink: 0, // Prevent Header from shrinking
          backgroundColor: "#1ED760",
          borderRadius: "4px",
        }}
      >
        <IconButton
          sx={{
            m: 0.625,
            color: "black",
            "&:hover": {
              // Optional: adjust hover state if needed
              backgroundColor: "rgba(255, 255, 255, 0.08)",
            },
          }}
          component={Link}
          to="/index.html" // Assuming this path is correct
          aria-label="back to home"
        >
          <ArrowBackIcon />
        </IconButton>
        <Typography
          variant="h5"
          sx={{
            ml: 2,
            color: "black",
            fontWeight: "700",
          }}
          className="trucate"
        >
          {playlist?.name || "Playlist"}{" "}
          {/* Handle potentially undefined playlist */}
        </Typography>
      </Box>
      {/* --- Non-Scrolling Part 1: Player Widget --- */}
      <Box sx={{ flexShrink: 0, backgroundColor: "#1ED760" }}>
        {" "}
        {/* Prevent PlayerWidget from shrinking */}
        {/* PlayerWidget needs to be dark-mode aware internally */}
        <PlayerWidget fetchPlaylist={fetchPlaylist} />
      </Box>
      {/* --- Scrolling Part: Track List --- */}
      <Box
        sx={{
          flexGrow: 1, // Allow this Box to take up remaining vertical space
          overflowY: "auto", // Enable vertical scrolling ONLY for this Box
          overflowX: "hidden",
          minHeight: 0, // Crucial for flexGrow + overflow
          // Background color is inherited from the main container
          // Consider custom scrollbar styling for better dark mode aesthetics if needed
          // Example (Webkit):
          "&::-webkit-scrollbar": { width: "8px" },
          "&::-webkit-scrollbar-track": {
            background: "#2b2b2b",
            borderRadius: "4px",
          },
          "&::-webkit-scrollbar-thumb": {
            background: "#555555",
            borderRadius: "6px",
          },
          "&::-webkit-scrollbar-thumb:hover": { background: "#777777" },
        }}
      >
        {/* Using Box with sx prop for gap between tracks */}
        <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
          {playlist?.tracks?.items?.map((item) => {
            // Basic check for item and track structure
            if (!item || !item.track) {
              console.warn("Skipping invalid playlist item:", item);
              return null;
            }
            const track = item.track;

            return (
              // TrackWidget needs to be dark-mode aware internally
              <TrackWidget
                key={track.id || Math.random()} // Use unique key, fallback if id is missing
                track={track}
                setIsLoading={setIsLoading}
                // You might need to pass down playlistId or other context if needed by TrackWidget's add button
              />
            );
          })}
          {(!playlist?.tracks?.items || playlist.tracks.items.length === 0) && (
            <Typography
              sx={{ color: "text.secondary", textAlign: "center", mt: 2 }}
            >
              No tracks in this playlist.
            </Typography>
          )}
        </Box>
      </Box>{" "}
      {/* --- End Scrolling Box --- */}
    </Box> // --- End Main Container Box ---
  );
}

export default Playlist;
