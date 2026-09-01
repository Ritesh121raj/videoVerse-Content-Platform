import { useEffect, useState } from "react";
import VideoGrid from "./VideoGrid";
import videos from "../data/videos";

function LikedVideos() {
  const [likedVideos, setLikedVideos] = useState([]);

  useEffect(() => {
    const saved =
      JSON.parse(localStorage.getItem("likedVideos")) || [];

    // Get only the IDs
    const likedIds = saved.map((item) => {
      if (typeof item === "string") {
        return item;
      }

      return item.id;
    });

    // Get latest video information from videos.js
    const updatedVideos = likedIds
      .map((id) => videos.find((video) => video.id === id))
      .filter(Boolean);

    setLikedVideos(updatedVideos);
  }, []);

  return (
    <div className="page-container">
      <h1>Liked Videos 👍</h1>

      {likedVideos.length === 0 ? (
        <p className="page-message">
          You haven't liked any videos yet.
        </p>
      ) : (
        <VideoGrid videos={likedVideos} />
      )}
    </div>
  );
}

export default LikedVideos;