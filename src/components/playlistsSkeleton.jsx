import { Box, Skeleton, Typography } from "@mui/material";

function PlaylistSkeleton() {
    // Simulate multiple cards
    return (
      <Box
        sx={{
          display: "flex",
          flexWrap: "wrap",
          gap: 1.75,
          padding: 1.75,
          bgcolor: "#121212", // Dark background
          maxHeight: "600px",          // or whatever max height
          overflowY: "auto",           // enable scrolling

          '&::-webkit-scrollbar': {
            width: '8px',
            },
            '&::-webkit-scrollbar-track': {
            backgroundColor: '#121212',
            },
            '&::-webkit-scrollbar-thumb': {
            backgroundColor: '#444',
            borderRadius: '4px',
            },
            '&::-webkit-scrollbar-thumb:hover': {
            backgroundColor: '#666',
            },

        }}
      >
        {Array.from({ length: 6 }).map((_, idx) => (
            <Box
            key={idx}
            sx={{
                width: 135,
                bgcolor: "#1e1e1e",
                borderRadius: 1,
                overflow: "hidden",
                paddingBottom: 1,
            }}
            >
            {/* 2x2 Grid of Skeleton "album covers" */}
            <Box sx={{ display: "flex", flexWrap: "wrap", width: "100%" }}>
                {Array.from({ length: 4 }).map((__, i) => (
                <Skeleton
                    key={i}
                    variant="rectangular"
                    width={66}
                    height={86}
                />
                ))}
            </Box>

            {/* Text Skeleton */}
            <Box sx={{ px: 1.5, pt: 1 }}>
                <Skeleton variant="text" width="80%" sx={{ bgcolor: "#444" }} />
            </Box>
            </Box>
        ))}
        </Box>

    );
  }
  
  export default PlaylistSkeleton;