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

  
  // REMOVE ONE VIDEO FROM LIKED VIDEOS
  const removeFromLiked = async (videoId) => {
    const token = localStorage.getItem("videoVerseToken");

    try {
      if (token) {
        const response = await fetch(
          `https://videoverse-content-platform.onrender.com/api/user/liked/${encodeURIComponent(videoId)}`,
          {
            method: "DELETE",
            headers: {
              Authorization: `Bearer ${token}`,
              Accept: "application/json",
            },
          }
        );

        const responseText = await response.text();
        let data;

        try {
          data = responseText ? JSON.parse(responseText) : {};
        } catch {
          throw new Error(
            `Backend returned HTML instead of JSON (HTTP ${response.status}). Check the deployed API URL and backend routes.`
          );
        }

        if (!response.ok) {
          throw new Error(
            data.message || `Unable to unlike video (HTTP ${response.status})`
          );
        }

        localStorage.setItem(
          "likedVideos",
          JSON.stringify(data.likedVideos || [])
        );
      } else {
        // Guest/local-only fallback
        const saved = JSON.parse(
          localStorage.getItem("likedVideos") || "[]"
        );

        const updated = saved.filter((item) => {
          const id = typeof item === "string" ? item : item?.id;
          return String(id) !== String(videoId);
        });

        localStorage.setItem("likedVideos", JSON.stringify(updated));
      }

      setLikedVideos((previous) =>
        previous.filter((video) => String(video.id) !== String(videoId))
      );

      window.dispatchEvent(new Event("activityUpdated"));
    } catch (error) {
      console.error("Remove liked video error:", error);
      alert(error.message || "Unable to remove liked video.");
    }
  };

  // CLEAR ALL LIKED VIDEOS
  const clearAllLikedVideos = async () => {
    if (likedVideos.length === 0) return;

    const confirmed = window.confirm(
      "Are you sure you want to clear all liked videos?"
    );

    if (!confirmed) return;

    const token = localStorage.getItem("videoVerseToken");

    try {
      if (token) {
        const response = await fetch(
          "https://videoverse-content-platform.onrender.com/api/user/liked",
          {
            method: "DELETE",
            headers: {
              Authorization: `Bearer ${token}`,
              Accept: "application/json",
            },
          }
        );

        const responseText = await response.text();
        let data;

        try {
          data = responseText ? JSON.parse(responseText) : {};
        } catch {
          throw new Error(
            `Backend returned HTML instead of JSON (HTTP ${response.status}). Check the deployed API URL and backend routes.`
          );
        }

        if (!response.ok) {
          throw new Error(
            data.message || `Unable to clear liked videos (HTTP ${response.status})`
          );
        }
      }

      // Update the UI only after backend confirms success
      localStorage.setItem("likedVideos", JSON.stringify([]));
      setLikedVideos([]);

      window.dispatchEvent(new Event("activityUpdated"));
    } catch (error) {
      console.error("Clear liked videos error:", error);
      alert(error.message || "Unable to clear liked videos.");
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