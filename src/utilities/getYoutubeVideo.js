import axios from "axios";

const API_KEY = import.meta.env.VITE_YOUTUBE_API_KEY;

async function getYoutubeVideo(track) {
  try {
    const searchQuery = encodeURIComponent(
      `${track.name} by ${track.artists[1]?.name || track.artists[0]?.name}`
    );
    const searchUrl = `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${searchQuery}&type=video&maxResults=1&key=${API_KEY}`;

    const response = await axios.get(searchUrl);

    const firstVideo = response.data.items[0];

    if (!firstVideo) {
      throw new Error("No video!");
    }

    return {
      href: `https://www.youtube.com/watch?v=${firstVideo.id.videoId}`,
      image: firstVideo.snippet.thumbnails.default.url,
    };
  } catch (error) {
    return {
      error: "Error finding youtube video!",
    };
  }
}

export default getYoutubeVideo;
