import React from "react";
import { Link } from "react-router";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import CardMedia from "@mui/material/CardMedia";
import Typography from "@mui/material/Typography";
import { CardActionArea, Box } from "@mui/material";
import ImageNotSupportedIcon from "@mui/icons-material/ImageNotSupported";

function PlaylistWidget({ playlist }) {
  const imageUrl = playlist?.images?.[1]?.url;

  return (
    <Card className="w-fit"
    sx = {{bgcolor: '#1e1e1e',}}> 
      <CardActionArea component={Link} to={`/playlist/${playlist.id}`}>
        <div>
          {imageUrl ? (
            <CardMedia
              component="img"
              sx={{ width: 135, height: 135, objectFit: "cover" }}
              image={imageUrl}
              alt="Album cover"
            />
          ) : (
            <Box
              sx={{
                width: 135,
                height: 135,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                backgroundColor: "#f0f0f0", // optional background
              }}
            >
              <ImageNotSupportedIcon sx={{ fontSize: 80 }} />
            </Box>
          )}
          <CardContent className="text-left w-[135px]">
            <Typography variant="h6" component="div" className="truncate" sx={{color: '#ffffff',}}>
              {playlist.name}
            </Typography>
          </CardContent>
        </div>
      </CardActionArea>
    </Card>
  );
  
}

export default PlaylistWidget;
