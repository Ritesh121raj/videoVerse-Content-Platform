import { useEffect, useState } from "react";
import VideoGrid from "./VideoGrid";
import videos from "../data/videos";

function WatchLater() {
  const [savedVideos, setSavedVideos] = useState([]);

  useEffect(() => {
    const savedIds =
      JSON.parse(localStorage.getItem("watchLater")) || [];

    const savedVideosList = savedIds
      .map((id) =>
        videos.find((video) => video.id === id)
      )
      .filter(Boolean);

    setSavedVideos(savedVideosList);
  }, []);

  return (
    <div className="page-container">

      <h1>Watch Later ⏰</h1>

      {savedVideos.length === 0 ? (
        <p className="page-message">
          You haven't saved any videos yet.
        </p>
      ) : (
        <VideoGrid videos={savedVideos} />
      )}

    </div>
  );
}

export default WatchLater;