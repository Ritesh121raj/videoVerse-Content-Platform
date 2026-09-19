import { useEffect, useState } from "react";
import { Trash2 } from "lucide-react";
import VideoCard from "./VideoCard";
import { getVideoById } from "../services/videoApi";

function DislikedVideos() {
  const [dislikedVideos, setDislikedVideos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDislikedVideos = async () => {
      const savedVideos =
        JSON.parse(
          localStorage.getItem("dislikedVideos")
        ) || [];

      if (savedVideos.length === 0) {
        setDislikedVideos([]);
        setLoading(false);
        return;
      }

      try {
        const videos = await Promise.all(
          savedVideos.map(async (item) => {
            if (
              typeof item === "object" &&
              item?.id
            ) {
              return item;
            }

            if (typeof item === "string") {
              return await getVideoById(item);
            }

            return null;
          })
        );

        setDislikedVideos(
          videos.filter(
            (video) => video !== null
          )
        );
      } catch (error) {
        console.error(
          "Disliked videos error:",
          error
        );

        setDislikedVideos([]);
      } finally {
        setLoading(false);
      }
    };

    loadDislikedVideos();
  }, []);

  const removeFromDisliked = (videoId) => {
    const savedVideos =
      JSON.parse(
        localStorage.getItem("dislikedVideos")
      ) || [];

    const updatedVideos =
      savedVideos.filter((item) => {
        if (typeof item === "string") {
          return item !== videoId;
        }

        return item?.id !== videoId;
      });

    localStorage.setItem(
      "dislikedVideos",
      JSON.stringify(updatedVideos)
    );

    setDislikedVideos((prevVideos) =>
      prevVideos.filter(
        (video) => video.id !== videoId
      )
    );
  };

  const clearAllDislikedVideos = () => {
    localStorage.removeItem("dislikedVideos");
    setDislikedVideos([]);
  };

  return (
    <div className="page-container">
      <div className="disliked-videos-header">
        <div>
          <h1>Disliked Videos</h1>

          {!loading &&
            dislikedVideos.length > 0 && (
              <p className="disliked-videos-count">
                {dislikedVideos.length}{" "}
                {dislikedVideos.length === 1
                  ? "video"
                  : "videos"}{" "}
                disliked
              </p>
            )}
        </div>

        {!loading &&
          dislikedVideos.length > 0 && (
            <button
              className="clear-disliked-btn"
              onClick={clearAllDislikedVideos}
            >
              <Trash2 size={16} />
              Clear all
            </button>
          )}
      </div>

      {loading ? (
        <p className="page-message">
          Loading disliked videos...
        </p>
      ) : dislikedVideos.length === 0 ? (
        <div className="disliked-videos-empty">
          <h2>No disliked videos</h2>

          <p>
            Videos you dislike will appear here.
          </p>
        </div>
      ) : (
        <div className="disliked-videos-grid">
          {dislikedVideos.map((video) => (
            <div
              className="disliked-video-card"
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
                className="disliked-video-remove"
                onClick={() =>
                  removeFromDisliked(
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

export default DislikedVideos;
