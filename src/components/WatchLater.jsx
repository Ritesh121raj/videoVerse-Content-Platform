import { useEffect, useState } from "react";
import VideoGrid from "./VideoGrid";
import { getVideoById } from "../services/videoApi";

function WatchLater() {
  const [watchLaterVideos, setWatchLaterVideos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadWatchLater = async () => {
      const savedIds =
        JSON.parse(localStorage.getItem("watchLater")) || [];

      if (savedIds.length === 0) {
        setWatchLaterVideos([]);
        setLoading(false);
        return;
      }

      try {
        const videos = await Promise.all(
          savedIds.map((id) => getVideoById(id))
        );

        setWatchLaterVideos(
          videos.filter((video) => video !== null)
        );
      } catch (error) {
        console.error("Watch Later error:", error);
      } finally {
        setLoading(false);
      }
    };

    loadWatchLater();
  }, []);

  return (
    <div className="page-container">
      <h1>Watch Later</h1>

      {loading ? (
        <p className="page-message">
          Loading watch later...
        </p>
      ) : watchLaterVideos.length === 0 ? (
        <p className="page-message">
          You haven't saved any videos yet.
        </p>
      ) : (
        <VideoGrid videos={watchLaterVideos} />
      )}
    </div>
  );
}

export default WatchLater;