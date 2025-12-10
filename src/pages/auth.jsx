import React, { useContext } from "react";
import { Button, Typography } from "@mui/material";
import { SpotifyAuthContext } from "../contexts/SpotifyContext";

function Auth() {
  const { initiateLogin } = useContext(SpotifyAuthContext);

  return (
    <div className="flex flex-col items-center justify-center h-[600px] bg-[#121212]">
      <div className="flex items-center justify-center pb-[50px]">
        <img
          className="w-[50px] h-[50px] mr-[10px]"
          src="nice-spotify.png"
          alt="Spotify Logo"
        />
        <Typography
          variant="h5"
          sx={{
            fontWeight: "900",
            color: "#1ED760",
          }}
          className="ml-2" /* optional: adds left margin to separate text from image */
        >
          SmileySpotify
        </Typography>
      </div>

      <Typography
        variant="body2"
        sx={{
          color: "rgba(255, 255, 255, 0.7)", // Light grey for dark background
        }}
        className="pb-[10px] text-center" // Optional: margin bottom and text-center for additional centering effect
      >
        Sign in with your Spotify to start viewing and adding songs
      </Typography>

      <Button
        variant="contained"
        onClick={initiateLogin}
        sx={{
          backgroundColor: "#1ED760",
          color: "#000", // button text color
          "&:hover": {
            backgroundColor: "#17b14e", // darker shade for hover
          },
        }}
      >
        Sign In
      </Button>
    </div>
  );
}

export default Auth;
