import { useEffect, useState } from "react";
import { Trash2 } from "lucide-react";
import VideoGrid from "./VideoGrid";
import { getVideoById } from "../services/videoApi";

function WatchLater() {
  const [watchLaterVideos, setWatchLaterVideos] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  useEffect(() => {
    const loadWatchLater = async () => {
      const savedIds =
        JSON.parse(
          localStorage.getItem("watchLater")
        ) || [];

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
          videos.filter(
            (video) => video !== null
          )
        );
      } catch (error) {
        console.error(
          "Watch Later error:",
          error
        );
      } finally {
        setLoading(false);
      }
    };

    loadWatchLater();
  }, []);

  const removeFromWatchLater = (videoId) => {
    const savedIds =
      JSON.parse(
        localStorage.getItem("watchLater")
      ) || [];

    const updatedIds = savedIds.filter(
      (id) => id !== videoId
    );

    localStorage.setItem(
      "watchLater",
      JSON.stringify(updatedIds)
    );

    setWatchLaterVideos((prevVideos) =>
      prevVideos.filter(
        (video) => video.id !== videoId
      )
    );
  };

  return (
    <div className="page-container">

      <div className="watch-later-header">
        <div>
          <h1>Watch Later</h1>

          {!loading &&
            watchLaterVideos.length > 0 && (
              <p className="watch-later-count">
                {watchLaterVideos.length}{" "}
                {watchLaterVideos.length === 1
                  ? "video"
                  : "videos"}{" "}
                saved
              </p>
            )}
        </div>
      </div>

      {loading ? (
        <p className="page-message">
          Loading watch later...
        </p>
      ) : watchLaterVideos.length === 0 ? (
        <div className="watch-later-empty">
          <h2>
            You haven't saved any videos yet.
          </h2>

          <p>
            Videos you save for later will
            appear here.
          </p>
        </div>
      ) : (
        <div className="watch-later-content">

          {watchLaterVideos.map((video) => (
            <div
              className="watch-later-item"
              key={video.id}
            >
              <VideoGrid
                videos={[video]}
              />

              <button
                className="watch-later-remove"
                onClick={() =>
                  removeFromWatchLater(
                    video.id
                  )
                }
                title="Remove from Watch Later"
              >
                <Trash2 size={18} />
                Remove
              </button>
            </div>
          ))}

        </div>
      )}

    </div>
  );
}

export default WatchLater;