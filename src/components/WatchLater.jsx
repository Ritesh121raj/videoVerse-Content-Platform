import { useEffect, useState } from "react";
import { Trash2 } from "lucide-react";
import VideoCard from "./VideoCard";
import { getVideoById } from "../services/videoApi";

function WatchLater() {
  const [watchLaterVideos, setWatchLaterVideos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadWatchLater = async () => {
      const savedVideos =
        JSON.parse(
          localStorage.getItem("watchLater")
        ) || [];

      if (savedVideos.length === 0) {
        setWatchLaterVideos([]);
        setLoading(false);
        return;
      }

      try {
        const videos = await Promise.all(
          savedVideos.map(async (item) => {
            // New format: complete video object
            if (
              typeof item === "object" &&
              item?.id
            ) {
              return item;
            }

            // Old format: only video ID
            if (typeof item === "string") {
              return await getVideoById(item);
            }

            return null;
          })
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

        setWatchLaterVideos([]);
      } finally {
        setLoading(false);
      }
    };

    loadWatchLater();

    // Listen for Watch Later changes
    const handleActivityUpdate = () => {
      loadWatchLater();
    };

    window.addEventListener(
      "activityUpdated",
      handleActivityUpdate
    );

    return () => {
      window.removeEventListener(
        "activityUpdated",
        handleActivityUpdate
      );
    };
  }, []);

  const removeFromWatchLater = (videoId) => {
    const savedVideos =
      JSON.parse(
        localStorage.getItem("watchLater")
      ) || [];

    const updatedVideos =
      savedVideos.filter((item) => {
        if (typeof item === "string") {
          return item !== videoId;
        }

        return item?.id !== videoId;
      });

    localStorage.setItem(
      "watchLater",
      JSON.stringify(updatedVideos)
    );

    setWatchLaterVideos((prevVideos) =>
      prevVideos.filter(
        (video) => video.id !== videoId
      )
    );

    window.dispatchEvent(
      new Event("activityUpdated")
    );
  };

  const clearAllWatchLater = () => {
    localStorage.removeItem("watchLater");

    setWatchLaterVideos([]);

    window.dispatchEvent(
      new Event("activityUpdated")
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

        {!loading &&
          watchLaterVideos.length > 0 && (
            <button
              className="clear-watch-later-btn"
              onClick={clearAllWatchLater}
            >
              <Trash2 size={16} />
              Clear all
            </button>
          )}
      </div>

      {loading ? (
        <p className="page-message">
          Loading watch later...
        </p>
      ) : watchLaterVideos.length === 0 ? (
        <div className="watch-later-empty">
          <h2>No saved videos</h2>

          <p>
            Videos you save will appear here.
          </p>
        </div>
      ) : (
        <div className="watch-later-grid">
          {watchLaterVideos.map((video) => (
            <div
              className="watch-later-card"
              key={video.id}
            >
              <VideoCard
                id={video.id}
                image={
                  video.image ||
                  video.thumbnail
                }
                thumbnail={
                  video.thumbnail ||
                  video.image
                }
                title={video.title}
                channel={video.channel}
                channelImage={
                  video.channelImage
                }
                views={video.views}
                time={
                  video.time ||
                  video.publishedAt
                }
                publishedAt={
                  video.publishedAt ||
                  video.time
                }
                duration={video.duration}
              />

              <button
                className="watch-later-remove"
                onClick={() =>
                  removeFromWatchLater(
                    video.id
                  )
                }
              >
                <Trash2 size={16} />
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