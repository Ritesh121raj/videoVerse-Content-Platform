import { useEffect, useState } from "react";
import { Trash2 } from "lucide-react";
import VideoCard from "./VideoCard";
import { getVideoById } from "../services/videoApi";

function DislikedVideos() {
  const [dislikedVideos, setDislikedVideos] = useState([]);
  const [loading, setLoading] = useState(true);

  // ======================================================
  // GET CURRENT USER ID
  // ======================================================

  const getCurrentUserId = () => {
    try {
      const currentUser = JSON.parse(
        localStorage.getItem("videoVerseCurrentUser")
      );

      return (
        currentUser?._id ||
        currentUser?.id ||
        currentUser?.userId ||
        currentUser?.email ||
        null
      );
    } catch (error) {
      console.error(
        "Error reading current user:",
        error
      );

      return null;
    }
  };

  // ======================================================
  // GET USER-SPECIFIC STORAGE KEY
  // ======================================================

  const getDislikedStorageKey = () => {
    return "dislikedVideos";
  };

  // ======================================================
  // GET VIDEO ID
  // ======================================================

  const getVideoId = (item) => {
    if (typeof item === "string") {
      return item;
    }

    return item?.id || null;
  };

  // ======================================================
  // LOAD DISLIKED VIDEOS
  // ======================================================

  const loadDislikedVideos = async () => {
    try {
      setLoading(true);

      const token =
        localStorage.getItem(
          "videoVerseToken"
        );

      if (!token) {
        setDislikedVideos([]);
        return;
      }

      const response = await fetch(
        `${API_BASE_URL}/user/disliked`,
        {
          method: "GET",

          headers: {
            Authorization:
              `Bearer ${token}`,
          },
        }
      );

      const text =
        await response.text();

      let data = {};

      try {
        data = text
          ? JSON.parse(text)
          : {};
      } catch {
        throw new Error(
          "Backend returned invalid response"
        );
      }

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Unable to load disliked videos"
        );
      }

      const videos =
        Array.isArray(
          data.dislikedVideos
        )
          ? data.dislikedVideos
          : [];

      setDislikedVideos(videos);

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

  // ======================================================
  // INITIAL LOAD
  // ======================================================

  useEffect(() => {
    loadDislikedVideos();

    // ----------------------------------------------------
    // WATCH FOR ACTIVITY CHANGES
    // ----------------------------------------------------

    const handleActivityUpdate = () => {
      loadDislikedVideos();
    };

    // ----------------------------------------------------
    // WATCH FOR LOGIN / LOGOUT
    // ----------------------------------------------------

    const handleAuthUpdate = () => {
      loadDislikedVideos();
    };

    window.addEventListener(
      "activityUpdated",
      handleActivityUpdate
    );

    window.addEventListener(
      "authUpdated",
      handleAuthUpdate
    );

    return () => {
      window.removeEventListener(
        "activityUpdated",
        handleActivityUpdate
      );

      window.removeEventListener(
        "authUpdated",
        handleAuthUpdate
      );
    };
  }, []);

  // ======================================================
  // REMOVE ONE DISLIKED VIDEO
  // ======================================================

  const removeFromDisliked = async (
    videoId
  ) => {
    const token =
      localStorage.getItem(
        "videoVerseToken"
      );

    if (!token) {
      return;
    }

    try {
      const response = await fetch(
        `${API_BASE_URL}/user/disliked/${videoId}`,
        {
          method: "DELETE",

          headers: {
            Authorization:
              `Bearer ${token}`,
          },
        }
      );

      const text =
        await response.text();

      let data = {};

      try {
        data = text
          ? JSON.parse(text)
          : {};
      } catch {
        throw new Error(
          "Backend returned invalid response"
        );
      }

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Unable to remove video"
        );
      }

      setDislikedVideos(
        (prev) =>
          prev.filter(
            (video) =>
              video.id !== videoId
          )
      );

      window.dispatchEvent(
        new Event("activityUpdated")
      );

    } catch (error) {
      console.error(
        "Remove disliked video error:",
        error
      );

      alert(
        error.message ||
          "Unable to remove video"
      );
    }
  };
  // ======================================================
  // CLEAR ALL DISLIKED VIDEOS
  // ======================================================

  const clearAllDislikedVideos =
    async () => {
      const token =
        localStorage.getItem(
          "videoVerseToken"
        );

      if (!token) {
        return;
      }

      try {
        const response = await fetch(
          `${API_BASE_URL}/user/disliked`,
          {
            method: "DELETE",

            headers: {
              Authorization:
                `Bearer ${token}`,
            },
          }
        );

        const text =
          await response.text();

        let data = {};

        try {
          data = text
            ? JSON.parse(text)
            : {};
        } catch {
          throw new Error(
            "Backend returned invalid response"
          );
        }

        if (!response.ok) {
          throw new Error(
            data.message ||
              "Unable to clear disliked videos"
          );
        }

        setDislikedVideos([]);

        window.dispatchEvent(
          new Event("activityUpdated")
        );

      } catch (error) {
        console.error(
          "Clear disliked videos error:",
          error
        );

        alert(
          error.message ||
            "Unable to clear disliked videos"
        );
      }
    };

  // ======================================================
  // UI
  // ======================================================

  return (
    <div className="page-container">

      {/* ==================================================
          HEADER
      ================================================== */}

      <div className="disliked-videos-header">

        <div>

          <h1>
            Disliked Videos
          </h1>

          {!loading &&
            dislikedVideos.length >
              0 && (
              <p className="disliked-videos-count">
                {dislikedVideos.length}{" "}
                {dislikedVideos.length ===
                1
                  ? "video"
                  : "videos"}{" "}
                disliked
              </p>
            )}

        </div>

        {!loading &&
          dislikedVideos.length >
            0 && (

          <button
            className="clear-disliked-btn"
            onClick={
              clearAllDislikedVideos
            }
          >
            <Trash2 size={16} />
            Clear all
          </button>

        )}

      </div>

      {/* ==================================================
          LOADING
      ================================================== */}

      {loading ? (

        <p className="page-message">
          Loading disliked videos...
        </p>

      ) : dislikedVideos.length ===
        0 ? (

        /* ==================================================
            EMPTY
        ================================================== */

        <div className="disliked-videos-empty">

          <h2>
            No disliked videos
          </h2>

          <p>
            Videos you dislike will
            appear here.
          </p>

        </div>

      ) : (

        /* ==================================================
            VIDEO GRID
        ================================================== */

        <div className="disliked-videos-grid">

          {dislikedVideos.map(
            (video) => (

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

                  title={
                    video.title
                  }

                  channel={
                    video.channel
                  }

                  channelImage={
                    video.channelImage
                  }

                  views={
                    video.views
                  }

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

            )
          )}

        </div>

      )}

    </div>
  );
}

export default DislikedVideos;