import { useEffect, useState } from "react";
import { Trash2 } from "lucide-react";
import VideoCard from "./VideoCard";
import { getVideoById } from "../services/videoApi";

function LikedVideos() {
  const [likedVideos, setLikedVideos] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadLikedVideos = async () => {
    try {
      setLoading(true);

      const token =
        localStorage.getItem("videoVerseToken");

      // ==========================================
      // NOT LOGGED IN
      // ==========================================

      if (!token) {
        setLikedVideos([]);
        return;
      }

      // ==========================================
      // GET LIKED VIDEO IDS FROM BACKEND
      // ==========================================

      const response = await fetch(
        "https://videoverse-content-platform.onrender.com/api/user/liked",
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Unable to load liked videos"
        );
      }

      const likedIds =
        data.likedVideos || [];

      // ==========================================
      // GET VIDEO DETAILS
      // ==========================================

      const videoResults =
        await Promise.all(
          likedIds.map(async (videoId) => {
            try {
              return await getVideoById(videoId);
            } catch (error) {
              console.error(
                `Unable to load video ${videoId}:`,
                error
              );

              return null;
            }
          })
        );

      const validVideos =
        videoResults.filter(Boolean);

      setLikedVideos(validVideos);

        // Keep localStorage synchronized with IDs only
        localStorage.setItem(
          "likedVideos",
          JSON.stringify(likedIds)
        );
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

  useEffect(() => {
    loadLikedVideos();

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

  // ==========================================
  // REMOVE FROM LIKED
  // ==========================================

  const removeFromLiked = async (videoId) => {
    try {
      const token =
        localStorage.getItem("videoVerseToken");

      if (token) {
        const response = await fetch(
          `https://videoverse-content-platform.onrender.com/api/user/liked/${videoId}`,
          {
            method: "DELETE",
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data.message ||
              "Unable to remove liked video"
          );
        }
      }

      // Update local UI
      setLikedVideos((prevVideos) =>
        prevVideos.filter(
          (video) => video.id !== videoId
        )
      );

      // Update localStorage
      const savedLikedVideos =
        JSON.parse(
          localStorage.getItem("likedVideos")
        ) || [];

      const updatedVideos =
        savedLikedVideos.filter(
          (video) =>
            typeof video === "string"
              ? video !== videoId
              : video?.id !== videoId
        );

      localStorage.setItem(
        "likedVideos",
        JSON.stringify(updatedVideos)
      );

      window.dispatchEvent(
        new Event("activityUpdated")
      );
    } catch (error) {
      console.error(
        "Remove liked video error:",
        error
      );

      alert(
        "Unable to remove liked video."
      );
    }
  };

  // ==========================================
  // CLEAR ALL
  // ==========================================

  const clearAllLikedVideos = async () => {
    try {
      const token =
        localStorage.getItem("videoVerseToken");

      if (token) {
        // Remove every liked video from backend
        await Promise.all(
          likedVideos.map(async (video) => {
            try {
              await fetch(
                `https://videoverse-content-platform.onrender.com/api/user/liked/${video.id}`,
                {
                  method: "DELETE",
                  headers: {
                    Authorization: `Bearer ${token}`,
                  },
                }
              );
            } catch (error) {
              console.error(
                "Delete liked video error:",
                error
              );
            }
          })
        );
      }

      localStorage.removeItem(
        "likedVideos"
      );

      setLikedVideos([]);

      window.dispatchEvent(
        new Event("activityUpdated")
      );
    } catch (error) {
      console.error(
        "Clear liked videos error:",
        error
      );

      alert(
        "Unable to clear liked videos."
      );
    }
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
              onClick={
                clearAllLikedVideos
              }
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
                duration={
                  video.duration
                }
              />

              <button
                className="liked-video-remove"
                onClick={() =>
                  removeFromLiked(
                    video.id
                  )
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