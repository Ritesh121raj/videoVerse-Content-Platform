import { useEffect, useState } from "react";
import { Trash2 } from "lucide-react";
import VideoGrid from "./VideoGrid";
import { getVideoById } from "../services/videoApi";

function LikedVideos() {
  const [likedVideos, setLikedVideos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadLikedVideos = async () => {
      const likedIds =
        JSON.parse(localStorage.getItem("likedVideos")) || [];

      if (likedIds.length === 0) {
        setLikedVideos([]);
        setLoading(false);
        return;
      }

      try {
        const videos = await Promise.all(
          likedIds.map((id) => getVideoById(id))
        );

        setLikedVideos(
          videos.filter((video) => video !== null)
        );
      } catch (error) {
        console.error("Liked videos error:", error);
      } finally {
        setLoading(false);
      }
    };

    loadLikedVideos();
  }, []);

  const removeFromLiked = (videoId) => {
    const likedIds =
      JSON.parse(localStorage.getItem("likedVideos")) || [];

    const updatedIds = likedIds.filter(
      (id) => id !== videoId
    );

    localStorage.setItem(
      "likedVideos",
      JSON.stringify(updatedIds)
    );

    setLikedVideos((prevVideos) =>
      prevVideos.filter(
        (video) => video.id !== videoId
      )
    );
  };

  return (
    <div className="page-container">
      <div className="liked-videos-header">
        <div>
          <h1>Liked Videos</h1>

          {!loading && likedVideos.length > 0 && (
            <p className="liked-videos-count">
              {likedVideos.length}{" "}
              {likedVideos.length === 1
                ? "video"
                : "videos"}{" "}
              liked
            </p>
          )}
        </div>
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
        <div className="liked-videos-content">
          {likedVideos.map((video) => (
            <div
              className="liked-video-item"
              key={video.id}
            >
              <VideoGrid videos={[video]} />

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