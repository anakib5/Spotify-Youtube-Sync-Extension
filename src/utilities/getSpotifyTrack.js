import axios from "axios";

const getSpotifyTrack = async (query, token) => {
  try {
    const response = await axios.get("https://api.spotify.com/v1/search", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      params: {
        q: query, // The search query
        type: "track", // We are searching for tracks only
        limit: 5, // Limit the response to 1 item for efficiency
      },
    });

    // The Spotify API returns the tracks in response.data.tracks.items
    const tracks = response.data.tracks.items;
    if (tracks && tracks.length > 0) {
      return tracks[0]; // Return the first track found
    } else {
      console.warn("No tracks found for query:", query);
      return null;
    }
  } catch (error) {
    console.error("Error fetching track from Spotify API:", error);
    throw error;
  }
};

export {getSpotifyTrack}