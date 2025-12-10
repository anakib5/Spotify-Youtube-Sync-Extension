import React, { useState, useEffect } from "react";
import getYoutubeVideo from "../utilities/getYoutubeVideo";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import CardMedia from "@mui/material/CardMedia";
import Typography from "@mui/material/Typography";
import { CardActionArea } from "@mui/material";

function TrackWidget({ track, setIsLoading }) {
  async function goToYoutubeVideo() {
    //setIsLoading(true);

    const youtubeVideo = await getYoutubeVideo(track);

    if (youtubeVideo && !youtubeVideo.error) {
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        if (tabs.length > 0) {
          const currentTab = tabs[0];
          // Update the tab's URL:
          chrome.tabs.update(currentTab.id, { url: youtubeVideo.href });
        }
      });
    }

    //setIsLoading(false);
  }

  function getArtistNames() {
    let name = "";

    for (let i = 0; i < track.artists.length; i++) {
      const artist = track.artists[i];
      name += artist.name;

      if (i < track.artists.length - 1) {
        name += ", ";
      }
    }

    return name;
  }

  return (
    <Card
      className="h-[75px] w-[280px]" // Keep existing Tailwind size classes
      sx={{
        // Apply dark background for the card surface
        bgcolor: '#1e1e1e', // A common dark surface color, adjust if needed
        // Alternatively, use the same as page bg: bgcolor: '#121212',
      }}
    >
      <CardActionArea onClick={goToYoutubeVideo}>
        {/* Keep using div with Tailwind for layout, or replace with Box */}
        <div className="flex flex-row">
          {/* CardMedia typically doesn't need dark mode changes */}
          <CardMedia
            component="img"
            sx={{
              width: 75,
              height: 75,
              objectFit: 'cover', // Changed from "cover" to 'cover' for consistency
            }}
            image={track?.album?.images?.[1]?.url || ""} // Added safe navigation
            alt={`${track?.name || 'Track'} album cover`} // Improved alt text
          />
          {/* Keep existing Tailwind classes here */}
          <CardContent
               className="text-left min-w-0" // Removed redundant text-left
               sx={{
                  // Override default CardContent padding if needed, e.g., p: 1
                  // Ensure padding works with fixed height/width
                  // Might need finer control if content overflows vertically
                  pt: 1, // Example: Adjust padding top
                  pb: 1, // Example: Adjust padding bottom
                  pl: 1.5, // Example: Adjust padding left
                  pr: 1.5, // Example: Adjust padding right
                  // Add flex properties if needed to better control internal layout
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center' // Example: Vertically center content
               }}
          >
            {/* Title Typography: Set light color */}
            <Typography
              variant="h6"
              component="div"
              className="truncate" // Keep Tailwind class for truncation
              sx={{
                color: '#ffffff', // Set primary text color to white
                lineHeight: 1.3, // Adjust line height if needed for truncation
              }}
              title={track?.name} // Add title attribute for full name on hover
            >
              {track?.name || 'Unknown Track'}
            </Typography>
  
            {/* Artist Typography: Remove color prop, use sx for light secondary text */}
            <Typography
              variant="body2"
              // color="textSecondary" // Remove this prop
              className="truncate" // Keep Tailwind class for truncation
              sx={{
                // Set secondary text color suitable for dark background
                color: 'rgba(255, 255, 255, 0.7)', // Light grey
                // or color: 'grey.400' if using theme context
                lineHeight: 1.3, // Adjust line height
              }}
               title={getArtistNames ? getArtistNames() : ''} // Add title attribute
            >
              {/* Ensure getArtistNames is defined and returns a string */}
              {getArtistNames ? getArtistNames() : 'Unknown Artist'}
            </Typography>
          </CardContent>
        </div>
      </CardActionArea>
    </Card>
  );
}

export default TrackWidget;
