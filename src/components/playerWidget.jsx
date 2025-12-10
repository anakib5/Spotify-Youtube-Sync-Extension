import React, { useState, useContext, useCallback, useEffect } from "react";
import { SpotifyAuthContext } from "../contexts/SpotifyContext";
import AddFromInfoToPlaylist from "./addFromInfoToPlaylist";
import { PlayerContext } from "../contexts/PlayerContext";
// MUI Components
import Box from "@mui/material/Box";
import Avatar from "@mui/material/Avatar";
import Typography from "@mui/material/Typography";
import IconButton from "@mui/material/IconButton";
import { styled } from "@mui/material/styles"; // For potential custom styling
// MUI Icons (Make sure you have @mui/icons-material installed)
import SkipNextIcon from "@mui/icons-material/SkipNext";
import SkipPreviousIcon from "@mui/icons-material/SkipPrevious";
import { LinearProgress } from "@mui/material";

// --- Styled Components (Optional) ---
// You can use styled components for more complex styling if needed
const WidgetContainer = styled(Box)(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  padding: theme.spacing(1.5), // Add some padding around the widget
  gap: theme.spacing(2), // Space between Album Art and the rest
  backgroundColor: theme.palette.background.paper, // Example background
  borderRadius: theme.shape.borderRadius, // Use theme's border radius
  border: `1px solid ${theme.palette.divider}`, // Example border
  minWidth: 250, // Ensure it has some minimum width
}));

const InfoContainer = styled(Box)({
  display: "flex",
  flexDirection: "column", // Stack Title and Controls vertically
  flexGrow: 1, // Allow this container to take up remaining space
  minWidth: 0, // Prevent flex item overflow issues
});

const ControlsContainer = styled(Box)(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between", // Space out controls and add button
  marginTop: theme.spacing(0.5), // Add a little space below the title
}));

const NavigationButtons = styled(Box)(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  gap: theme.spacing(0.5), // Space between arrow buttons
}));

function PlayerWidget({ fetchPlaylist }) {
  const {
    currentTrack,
    currentTrackTime,
    playlist,
    currentPlaylistIndex,
    setCurrentTrackByIndex,
    currentTrackDuration,
  } = useContext(PlayerContext);
  const [isPreviousDisabled, setIsPreviousDisabled] = useState(false);
  const [isNextDisabled, setIsNextDisabled] = useState(false);

  const tracks = playlist?.tracks?.items;
  const trackName = currentTrack?.name;

  // --- Get the ID to search for ---
  const currentTrackId = currentTrack?.id;
  // Get album art URL - choose smallest image
  const imageUrl =
    currentTrack?.album?.images?.length > 0
      ? currentTrack.album.images[currentTrack.album.images.length - 1].url // Smallest image
      : undefined; // Fallback if no images
  // playlist ID
  const playlistId = playlist?.id;

  // --- Search through playlist items ---
  // The 'some' method stops iterating as soon as a match is found.
  const found = currentPlaylistIndex != -1;

  // // If song not in current playlist, dont show next/ prev arrows
  // if (!found) {
  //     setIsPreviousDisabled(true);
  //     setIsNextDisabled(true);
  // } else if (currentPlaylistIndex == 0){ // if first song, don't show prev arrow
  //     setIsPreviousDisabled(true);
  // } else if (currentPlaylistIndex == tracks.length - 1){ // if last song, dont show next arrow
  //     setIsNextDisabled(true);
  // }

  useEffect(() => {
    setIsPreviousDisabled(!found || currentPlaylistIndex == 0);
    setIsNextDisabled(!found || currentPlaylistIndex == tracks.length - 1);
  }, [currentPlaylistIndex]);

  if (!currentTrack || !playlist) {
    return <div></div>;
  }

  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        gap: 2, // Spacing between Avatar and InfoContainer
        p: 1.5, // Padding around the widget
        backgroundColor: "#121212", // Dark background
        color: "#ffffff", // Default light text color
        overflow: "hidden", // Ensure content stays within bounds
      }}
    >
      {/* Album Art / Icon - Avatar generally adapts well */}
      <Avatar
        src={imageUrl}
        alt={trackName}
        variant="rounded"
        sx={{
          width: 56,
          height: 56,
          // Fallback character color will inherit from parent Box's color ('#ffffff')
          // bgcolor: 'grey.800' // Optional: Slightly different bg for avatar if image fails
        }}
      >
        {/* Fallback if no image URL */}
        {trackName ? trackName.charAt(0) : "?"}
      </Avatar>

      {/* Replace InfoContainer with Box */}
      <Box
        sx={{
          flexGrow: 1, // Take remaining space
          display: "flex",
          flexDirection: "column",
          minWidth: 0, // Prevent flex item overflow issues
        }}
      >
        {/* Title - Inherits light color */}
        <Typography
          variant="subtitle1"
          component="div"
          noWrap // Prevent title from wrapping
          title={trackName} // Show full title on hover
          sx={{
            fontWeight: "medium",
            color: "inherit", // Explicitly inherit the white color
          }}
        >
          {trackName || "Unknown Track"}
        </Typography>

        <LinearProgress
        className="rounded-[5px]"
          variant="determinate"
          value={
            currentTrackDuration
              ? (currentTrackTime / currentTrackDuration) * 100
              : 0
          }
          sx={{
            backgroundColor: "#2b2b2b", // This sets the root background color
            "& .MuiLinearProgress-bar": {
              backgroundColor: "#1ED760", // This styles the bar itself
            },
          }}
        />

        {/* Replace ControlsContainer with Box */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between", // Pushes Nav buttons and Add button apart
            mt: 0.5, // Small margin top for spacing
          }}
        >
          {/* Replace NavigationButtons with Box */}
          <Box sx={{ display: "flex" }}>
            {/* Navigation Buttons - Style for dark mode */}
            <IconButton
              aria-label="previous track"
              size="small"
              onClick={() => setCurrentTrackByIndex(currentPlaylistIndex - 1)}
              disabled={isPreviousDisabled}
              sx={{
                color: "#ffffff", // Light icon color
                "&.Mui-disabled": {
                  color: "rgba(255, 255, 255, 0.3)", // Lighter disabled color for dark bg
                  // or use theme: color: 'action.disabled' if theme is configured
                },
              }}
            >
              <SkipPreviousIcon fontSize="inherit" />
            </IconButton>
            <IconButton
              aria-label="next track"
              size="small"
              onClick={() => setCurrentTrackByIndex(currentPlaylistIndex + 1)}
              disabled={isNextDisabled}
              sx={{
                color: "#ffffff", // Light icon color
                "&.Mui-disabled": {
                  color: "rgba(255, 255, 255, 0.3)", // Lighter disabled color for dark bg
                },
              }}
            >
              <SkipNextIcon fontSize="inherit" />
            </IconButton>
          </Box>

          <AddFromInfoToPlaylist
            size="small"
            id={playlistId}
            isFound={found}
            fetchPlaylist={fetchPlaylist}
          />
        </Box>
      </Box>
    </Box>
  );
}

export default PlayerWidget;
