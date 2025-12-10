import {
    Box,
    Skeleton,
    Typography,
    IconButton
} from "@mui/material";
  
export default function PlaylistPageHeaderSkeleton() {
    return (
        <Box sx={{ padding: 3.2, bgcolor: "#121212", color: "white" , maxHeight: "600px", overflowY: 'hidden',}}>
            {/* Now Playing Section */}
            <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 3 , bgcolor: "#1e1e1e", borderRadius: 1}}>
                <Skeleton variant="rectangular" width={64} height={64} />
                <Box sx={{ flex: 1, display: "flex", flexDirection: "column", gap: 0.5 }}>
                    <Skeleton variant="text" width="60%" height={16} />
                    <Skeleton variant="rectangular" height={4} sx={{ bgcolor: "#1e1e1e" , mt: 1 }} />
                </Box>
            </Box>

            {/* Playlist Title Section */}
            <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
                <Typography variant="h5"></Typography>
            </Box>

            {/* Track Skeleton List */}
            {Array.from({ length: 5 }).map((_, index) => (
                <Box
                key={index}
                sx={{
                    display: "flex",
                    alignItems: "center",
                    bgcolor: "#1e1e1e",
                    borderRadius: 1,
                    padding: .5,
                    mb: 1.5 ,
                    overflowY: 'hidden',
                    width: '100%'
                }}
                >
                <Skeleton
                    variant="rectangular"
                    width={64}
                    height={64}
                    sx={{ borderRadius: 1, flexShrink: 0 }}
                />
                <Box sx={{ ml: 2, flex: 1 }}>
                    <Skeleton variant="text" width="80%" height={20} />
                    <Skeleton variant="text" width="60%" height={16} />
                </Box>
                </Box>
            ))}
        </Box>
    );
}
