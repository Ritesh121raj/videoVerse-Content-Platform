import { useEffect, useState } from "react";
import { Trash2 } from "lucide-react";
import VideoCard from "./VideoCard";

function LikedVideos() {
  const [likedVideos, setLikedVideos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadLikedVideos = () => {
      try {
        const savedLikedVideos =
          JSON.parse(
            localStorage.getItem("likedVideos")
          ) || [];

        const validVideos =
          savedLikedVideos.filter(
            (video) =>
              video &&
              typeof video === "object" &&
              video.id
          );

        setLikedVideos(validVideos);
      } catch (error) {
        console.error(
          "Liked videos error:",
          error
        );

        setLikedVideos([]);
      } finally {
        setLoading(false);
      }
    };

    loadLikedVideos();

    // Listen for liked-video changes
    const handleActivityUpdate = () => {
      loadLikedVideos();
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

  const removeFromLiked = (videoId) => {
    const savedLikedVideos =
      JSON.parse(
        localStorage.getItem("likedVideos")
      ) || [];

    const updatedVideos =
      savedLikedVideos.filter((video) => {
        if (typeof video === "string") {
          return video !== videoId;
        }

        return video?.id !== videoId;
      });

    localStorage.setItem(
      "likedVideos",
      JSON.stringify(updatedVideos)
    );

    setLikedVideos((prevVideos) =>
      prevVideos.filter(
        (video) => video.id !== videoId
      )
    );

    window.dispatchEvent(
      new Event("activityUpdated")
    );
  };

  const clearAllLikedVideos = () => {
    localStorage.removeItem("likedVideos");

    setLikedVideos([]);

    window.dispatchEvent(
      new Event("activityUpdated")
    );
  };

  return (
    <div className="page-container">
      <div className="liked-videos-header">
        <div>
          <h1>Liked Videos</h1>

          {!loading &&
            likedVideos.length > 0 && (
              <p className="liked-videos-count">
                {likedVideos.length}{" "}
                {likedVideos.length === 1
                  ? "video"
                  : "videos"}{" "}
                liked
              </p>
            )}
        </div>

        {!loading &&
          likedVideos.length > 0 && (
            <button
              className="clear-liked-btn"
              onClick={clearAllLikedVideos}
            >
              <Trash2 size={16} />
              Clear all liked videos
            </button>
          )}
      </div>

      {loading ? (
        <p className="page-message">
          Loading liked videos...
        </p>
      ) : likedVideos.length === 0 ? (
        <div className="liked-videos-empty">
          <h2>No liked videos</h2>

          <p>
            Videos you like will appear here.
          </p>
        </div>
      ) : (
        <div className="liked-videos-grid">
          {likedVideos.map((video) => (
            <div
              className="liked-video-card"
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
                className="liked-video-remove"
                onClick={() =>
                  removeFromLiked(video.id)
                }
              >
                <Trash2 size={16} />
                Unlike
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default LikedVideos;