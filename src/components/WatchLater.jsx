import { useEffect, useState } from "react";
import { Trash2 } from "lucide-react";
import VideoCard from "./VideoCard";
import { getVideoById } from "../services/videoApi";

function WatchLater() {
  const [watchLaterVideos, setWatchLaterVideos] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const API_BASE_URL =
    "https://videoverse-content-platform.onrender.com/api";

  // ======================================================
  // LOAD WATCH LATER
  // ======================================================

  const loadWatchLater = async () => {
    try {
      setLoading(true);

      const token =
        localStorage.getItem(
          "videoVerseToken"
        );

      let savedVideos = [];

      // ==================================================
      // LOGGED IN USER
      // LOAD WATCH LATER FROM BACKEND
      // ==================================================

      if (token) {
        try {
          const response = await fetch(
            `${API_BASE_URL}/user/watch-later`,
            {
              method: "GET",

              headers: {
                Authorization:
                  `Bearer ${token}`,
              },
            }
          );

          const data =
            await response.json();

          if (!response.ok) {
            throw new Error(
              data.message ||
                "Unable to load Watch Later"
            );
          }

          // Backend currently returns
          // watchLater as video IDs
          savedVideos =
            Array.isArray(
              data.watchLater
            )
              ? data.watchLater
              : [];

          // Keep localStorage synchronized
          localStorage.setItem(
            "watchLater",
            JSON.stringify(
              savedVideos
            )
          );
        } catch (backendError) {
          console.error(
            "Backend Watch Later error:",
            backendError
          );

          // ----------------------------------------------
          // FALLBACK TO LOCAL STORAGE
          // ----------------------------------------------

          savedVideos =
            JSON.parse(
              localStorage.getItem(
                "watchLater"
              )
            ) || [];
        }
      } else {
        // =================================================
        // LOGGED OUT
        // USE LOCAL STORAGE
        // =================================================

        savedVideos =
          JSON.parse(
            localStorage.getItem(
              "watchLater"
            )
          ) || [];
      }

      // ==================================================
      // NO WATCH LATER VIDEOS
      // ==================================================

      if (
        !Array.isArray(savedVideos) ||
        savedVideos.length === 0
      ) {
        setWatchLaterVideos([]);
        return;
      }

      // ==================================================
      // CONVERT IDs / OBJECTS INTO COMPLETE VIDEO OBJECTS
      // ==================================================

      const videos =
        await Promise.all(
          savedVideos.map(
            async (item) => {
              try {
                // ------------------------------------------
                // COMPLETE VIDEO OBJECT
                // ------------------------------------------

                if (
                  typeof item ===
                    "object" &&
                  item?.id
                ) {
                  return item;
                }

                // ------------------------------------------
                // VIDEO ID
                // LOAD COMPLETE VIDEO
                // ------------------------------------------

                if (
                  typeof item ===
                    "string"
                ) {
                  const video =
                    await getVideoById(
                      item
                    );

                  return video;
                }

                return null;
              } catch (videoError) {
                console.error(
                  `Error loading Watch Later video ${item}:`,
                  videoError
                );

                return null;
              }
            }
          )
        );

      // ==================================================
      // REMOVE NULL + DUPLICATES
      // ==================================================

      const uniqueVideos =
        videos
          .filter(
            (video) =>
              video &&
              video.id
          )
          .filter(
            (
              video,
              index,
              array
            ) =>
              index ===
              array.findIndex(
                (item) =>
                  item.id ===
                  video.id
              )
          );

      setWatchLaterVideos(
        uniqueVideos
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

  // ======================================================
  // INITIAL LOAD
  // ======================================================

  useEffect(() => {
    loadWatchLater();

    // ====================================================
    // LISTEN FOR WATCH LATER CHANGES
    // ====================================================

    const handleActivityUpdate =
      () => {
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

  // ======================================================
  // REMOVE FROM WATCH LATER
  // ======================================================

  
  // ======================================================
  // REMOVE ONE VIDEO FROM WATCH LATER
  // ======================================================

  const removeFromWatchLater = async (videoId) => {
    const token = localStorage.getItem("videoVerseToken");

    try {
      if (token) {
        const response = await fetch(
          `${API_BASE_URL}/user/watch-later/${encodeURIComponent(videoId)}`,
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
            data.message || "Unable to remove video"
          );
        }

        localStorage.setItem(
          "watchLater",
          JSON.stringify(data.watchLater || [])
        );
      } else {
        const savedVideos = JSON.parse(
          localStorage.getItem("watchLater") || "[]"
        );

        const updatedVideos = savedVideos.filter((item) => {
          const id =
            typeof item === "string" ? item : item?.id;
          return id !== videoId;
        });

        localStorage.setItem(
          "watchLater",
          JSON.stringify(updatedVideos)
        );
      }

      setWatchLaterVideos((prev) =>
        prev.filter((video) => video.id !== videoId)
      );

      window.dispatchEvent(new Event("activityUpdated"));
    } catch (error) {
      console.error("Remove Watch Later error:", error);
      alert(error.message || "Could not remove this video.");
    }
  };


  // ======================================================
  // CLEAR ALL WATCH LATER
  // ======================================================

  
  const clearAllWatchLater = async () => {
    if (watchLaterVideos.length === 0) return;

    const confirmed = window.confirm(
      "Are you sure you want to clear all Watch Later videos?"
    );

    if (!confirmed) return;

    const token = localStorage.getItem("videoVerseToken");

    try {
      // Logged-in user: clear videos from backend first
      if (token) {
        const response = await fetch(
          `${API_BASE_URL}/user/watch-later`,
          {
            method: "DELETE",
            headers: {
              Authorization: `Bearer ${token}`,
              Accept: "application/json",
            },
          }
        );

        // Safely handle JSON and HTML responses
        const responseText = await response.text();
        let data = {};

        try {
          data = responseText ? JSON.parse(responseText) : {};
        } catch {
          throw new Error(
            `Backend returned HTML instead of JSON (HTTP ${response.status}). Check API URL and redeploy the backend.`
          );
        }

        if (!response.ok) {
          throw new Error(
            data.message || `Failed to clear Watch Later (HTTP ${response.status})`
          );
        }
      }

      // Update frontend only after backend succeeds
      localStorage.setItem("watchLater", JSON.stringify([]));
      setWatchLaterVideos([]);

      window.dispatchEvent(new Event("activityUpdated"));
    } catch (error) {
      console.error("Clear Watch Later error:", error);
      alert(error.message || "Could not clear Watch Later.");
    }
  };
  // ======================================================
  // UI
  // ======================================================

  return (
    <div className="page-container">
      <div className="watch-later-header">
        <div>
          <h1>
            Watch Later
          </h1>

          {!loading &&
            watchLaterVideos.length >
              0 && (
              <p className="watch-later-count">
                {
                  watchLaterVideos.length
                }{" "}
                {
                  watchLaterVideos.length ===
                  1
                    ? "video"
                    : "videos"
                }{" "}
                saved
              </p>
            )}
        </div>

        {!loading &&
          watchLaterVideos.length >
            0 && (
            <button
              className="clear-watch-later-btn"
              onClick={
                clearAllWatchLater
              }
            >
              <Trash2
                size={16}
              />
              Clear all
            </button>
          )}
      </div>

      {loading ? (
        <p className="page-message">
          Loading watch later...
        </p>
      ) : watchLaterVideos.length ===
        0 ? (
        <div className="watch-later-empty">
          <h2>
            No saved videos
          </h2>

          <p>
            Videos you save will
            appear here.
          </p>
        </div>
      ) : (
        <div className="watch-later-grid">
          {watchLaterVideos.map(
            (video) => (
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
                  className="watch-later-remove"
                  onClick={() =>
                    removeFromWatchLater(
                      video.id
                    )
                  }
                >
                  <Trash2
                    size={16}
                  />
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

export default WatchLater;