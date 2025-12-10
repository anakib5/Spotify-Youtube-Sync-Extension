// PlaylistContainer.jsx, returns a div of playlistWidgets (one for each playlist)
import React, { useState, useEffect, useContext } from "react";
import PlaylistWidget from "../components/playlistWidget";
import { SpotifyAuthContext } from "../contexts/SpotifyContext";
import { CircularProgress, Typography } from "@mui/material";
import { Grid } from "@mui/material";
import PlaylistSkeleton from "../components/playlistsSkeleton";
import Box from "@mui/material/Box";

function PlaylistContainer() {
  const [playlists, setPlaylists] = useState([]);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const { token } = useContext(SpotifyAuthContext);

  useEffect(() => {
    async function fetchPlaylists() {
      try {
        const response = await fetch(
          "https://api.spotify.com/v1/me/playlists",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!response.ok) {
          throw new Error(
            `Error fetching playlists: ${response.status} ${response.statusText}`
          );
        }

        const data = await response.json();
        setPlaylists(data.items);
        setTimeout(() => setIsLoading(false), 200);
      } catch (err) {
        setError(err.message);
        console.error(err);
      }
    }

    if (token) {
      fetchPlaylists();
    }
  }, [token]);

  if (error) {
    return <p>Error: {error}</p>;
  }

  if (isLoading) {
    return <PlaylistSkeleton />;
  }
  //prev is loading body
  // return <div className="flex items-center justify-center h-screen">
  //           <CircularProgress className="m-[20px]" />
  //         </div>

  return (
    <Box sx = {{maxHeight: "600px", overflow: "hidden"}}>
      <Box
      className="m-[10px] mt-[10px]"
        sx={{
          display: "flex",
          alignItems: "center",
          //mb: 1.25, // Margin bottom
          //mt: 1.25,
          flexShrink: 0, // Prevent Header from shrinking
          backgroundColor: "#1ED760",
          borderRadius: "4px",
          width: "300px"
          
        }}
      >
        <Typography
          variant="h5"
          sx={{
            fontWeight: "700", // Adjust to the correct numerical font weight (e.g., 900 for "black")
            height: "50px",
            width: "200px",
            color: "black",
            padding: "17px",
            paddingTop: "10px",
          }}
        >
          Your Library
        </Typography>
      </Box>
      <Grid
        container
        rowSpacing={1.8}
        columnSpacing={1.8}
        // Translate Tailwind 'justify-center' to MUI prop
        justifyContent="center"
        // Translate Tailwind 'p-[10px]' to sx prop using MUI spacing unit (1.25 * 8px = 10px)
        // or use absolute value: sx={{ padding: '10px' }}
        sx={{
          p: 1.25,
          // paddingTop: 1.25,    // 10px
          // paddingBottom: 1.25, // 10px
          // paddingLeft: .5,   // 10px
          // // Increase this value to "move" the scrollbar further left visually.
          // paddingRight: 3, // Example: 3 * 8px = 24px

          // No background color needed here if the parent container is already dark.
          // If this Grid needs its own dark background, add:
          bgcolor: "#121212", // or another dark color

          // --- Make the Grid scrollable ---
          maxHeight: "550px", // Example: Limit height to viewport height minus 100px (adjust as needed)
          // or use a fixed height like: height: '500px',
          overflowY: "auto", // Enable vertical scrollbar only when content overflows

          // --- Scrollbar Styling (Webkit browsers: Chrome, Safari, Edge) ---
          "&::-webkit-scrollbar": {
            width: "8px", // Width of the vertical scrollbar
            height: "10px", // Height of the horizontal scrollbar (if needed)
          },
          "&::-webkit-scrollbar-track": {
            background: "#2b2b2b", // Color of the track (slightly lighter dark)
            borderRadius: "6px", // Rounded corners for the track
          },
          "&::-webkit-scrollbar-thumb": {
            background: "#555", // Color of the scrollbar thumb
            borderRadius: "6px", // Rounded corners for the thumb
            //border: '2px solid #2b2b2b', // Creates padding around thumb matching track color
          },
          "&::-webkit-scrollbar-thumb:hover": {
            background: "#777", // Color of the thumb on hover
          },
          "&::-webkit-scrollbar-corner": {
            background: "#121212", // Match the container background color
          },
        }}
        // Removed className="p-[10px] justify-center"
      >
        {playlists?.map((playlist) => (
          // PlaylistWidget needs to be dark-mode aware internally
          // Its background, text, icons, etc., should adapt to dark mode.
          <PlaylistWidget
            key={playlist?.id || Math.random()}
            playlist={playlist}
          />
        ))}
      </Grid>
    </Box>
  );
}

export default PlaylistContainer;
