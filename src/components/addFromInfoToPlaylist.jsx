import React, { useState, useContext, useCallback, useEffect } from "react";
import { useNavigate } from "react-router";
// Assuming SpotifyAuthContext provides { token }
import { SpotifyAuthContext } from "../contexts/SpotifyContext";
import { CircularProgress, Typography, Button } from "@mui/material";
// Assuming getYoutubeInfo returns { title, artist }
// import getYoutubeInfo from "../utilities/getYoutubeInfo";
import IconButton from "@mui/material/IconButton";
import AddCircleIcon from "@mui/icons-material/AddCircle";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import Box from "@mui/material/Box";
import { PlayerContext } from "../contexts/PlayerContext";

// Mock context for demonstration if SpotifyAuthContext is not provided
// const SpotifyAuthContext = React.createContext({ token: null });
// Mock utility function if getYoutubeInfo is not provided
// const getYoutubeInfo = () => ({ title: "California Gurls", artist: "Katy Perry" });

function AddFromInfoToPlaylist({ id, isFound, fetchPlaylist }) {
  // --- State Hooks ---
  const { token } = useContext(SpotifyAuthContext); // Get Spotify token from context
  const [error, setError] = useState(null); // State for storing error messages
  const [isLoading, setIsLoading] = useState(false); // State for loading indicator
  const [isAdded, setIsAdded] = useState(isFound); // State to track if the song was successfully added
  const {playlist, currentTrack} = useContext(PlayerContext)
  let navigate = useNavigate();
  console.log(currentTrack.uri);
  useEffect(() => {
    setIsAdded(isFound);
  }, [isFound, currentTrack]);

  // --- API Interaction Logic ---
  const handleAddSong = useCallback(async () => {
    try {
      setError(null); // Clear previous errors
      setIsLoading(true); // Start loading indicator

      // Use the correct Spotify API endpoint for adding tracks to a playlist
      const addTrackUrl = `https://api.spotify.com/v1/playlists/${id}/tracks`;
      console.log("Add Track URL:", addTrackUrl);

      const addRes = await fetch(addTrackUrl, {
        method: "POST", // Use POST method to add items
        headers: {
          "Content-Type": "application/json", // Specify the content type of the request body
          Authorization: `Bearer ${token}`, // Pass the authorization token
        },
        body: JSON.stringify({
          // Provide the Spotify URI of the track to add
          uris: [currentTrack.uri],
        }),
      });

      // Check if adding the track was successful
      if (!addRes.ok) {
        // Try to get more details from the response body
        let errorDetails = `${addRes.status} ${addRes.statusText}`;
        try {
          // A 403 error specifically might indicate scope issues
          if (addRes.status === 403) {
            errorDetails +=
              " (Potential scope issue: Ensure you have playlist-modify-public or playlist-modify-private scope)";
          }
          const errorBody = await addRes.json();
          errorDetails += `: ${
            errorBody?.error?.message || "No additional details"
          }`;
        } catch (e) {
          /* Ignore if response body isn't JSON */
        }
        throw new Error(`Error adding track to playlist: ${errorDetails}`);
      }

      // If the code reaches here, the track was added successfully
      console.log("Track added successfully!");
      setIsAdded(true); // Update state to indicate success
      
      fetchPlaylist();
      navigate(`/`)
      navigate(`/playlist/${playlist.id}`)
    } catch (err) {
      // Catch any errors during the process
      console.error("Error in handleAddSong:", err);
      setError(err.message); // Display the error message to the user
    } finally {
      // This block runs regardless of success or failure
      setIsLoading(false); // Stop the loading indicator
    }
  }, [token, id, currentTrack]); // Dependencies for useCallback

  // --- Render Logic ---
  return (
    // Use Box instead of div for easier styling with sx prop
    <Box
      sx={{
        // Use a dark grey for the component's background, assuming it's a surface
        backgroundColor: "#121212",
        // Default text/icon color within this box
        color: "#ffffff",
        p: 1, // Add some padding if desired
      }}
    >
      <IconButton
        // variant="contained" // IconButton doesn't have a 'variant' prop like Button
        size="small"
        onClick={handleAddSong}
        disabled={isLoading || isAdded}
        sx={{
          color: "#ffffff", // Ensure icon button color is white
          "&.Mui-disabled": {
            // Style for disabled state on dark background
            color: "grey.700", // Adjust disabled color if needed
          },
        }}
      >
        {isAdded && <CheckCircleIcon fontSize="inherit" />}

        {!isAdded && <AddCircleIcon fontSize="inherit" />}
      </IconButton>
    </Box>
  );
}

// Export the component for use in other parts of the application
export default AddFromInfoToPlaylist;
