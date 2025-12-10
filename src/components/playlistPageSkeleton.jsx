import { Box, Skeleton, IconButton, Typography } from '@mui/material';

export default function playlistPageSkeleton() {
  return (
    <Box sx={{ padding: 2, bgcolor: '#121212', minHeight: '600px' }}>
      {/* Header with back button and title */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
        <Skeleton variant="text" width={120} height={32} />
      </Box>

      {/* Skeleton track list */}
      {Array.from({ length: 5 }).map((_, index) => (
        <Box
          key={index}
          sx={{
            display: 'flex',
            alignItems: 'center',
            bgcolor: '#1e1e1e',
            borderRadius: 2,
            padding: 1,
            mb: 1.5,
          }}
        >
          {/* Album Art */}
          <Skeleton
            variant="rectangular"
            width={64}
            height={64}
            sx={{ borderRadius: 1 }}
          />

          {/* Text */}
          <Box sx={{ ml: 2, flex: 1 }}>
            <Skeleton variant="text" height={20} width="80%" />
            <Skeleton variant="text" height={16} width="60%" />
          </Box>
        </Box>
      ))}
    </Box>
  );
}