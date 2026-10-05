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

  const removeFromWatchLater =
    async (videoId) => {
      const token =
        localStorage.getItem(
          "videoVerseToken"
        );

      // ==================================================
      // LOGGED IN USER
      // REMOVE FROM BACKEND
      // ==================================================

      if (token) {
        try {
          const response =
            await fetch(
              `${API_BASE_URL}/user/watch-later/${videoId}`,
              {
                method: "DELETE",

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
                "Unable to remove video from Watch Later"
            );
          }

          // Backend returns updated IDs
          const updatedWatchLater =
            Array.isArray(
              data.watchLater
            )
              ? data.watchLater
              : [];

          localStorage.setItem(
            "watchLater",
            JSON.stringify(
              updatedWatchLater
            )
          );
        } catch (error) {
          console.error(
            "Remove Watch Later error:",
            error
          );

          return;
        }
      } else {
        // =================================================
        // LOGGED OUT / LOCAL FALLBACK
        // =================================================

        const savedVideos =
          JSON.parse(
            localStorage.getItem(
              "watchLater"
            )
          ) || [];

        const updatedVideos =
          savedVideos.filter(
            (item) => {
              if (
                typeof item ===
                "string"
              ) {
                return (
                  item !==
                  videoId
                );
              }

              return (
                item?.id !==
                videoId
              );
            }
          );

        localStorage.setItem(
          "watchLater",
          JSON.stringify(
            updatedVideos
          )
        );
      }

      // ==================================================
      // UPDATE UI IMMEDIATELY
      // ==================================================

      setWatchLaterVideos(
        (prevVideos) =>
          prevVideos.filter(
            (video) =>
              video.id !==
              videoId
          )
      );

      window.dispatchEvent(
        new Event(
          "activityUpdated"
        )
      );
    };

  // ======================================================
  // CLEAR ALL WATCH LATER
  // ======================================================

  const clearAllWatchLater =
    async () => {
      const token =
        localStorage.getItem(
          "videoVerseToken"
        );

      // ==================================================
      // LOGGED IN USER
      // REMOVE ALL BACKEND ITEMS
      // ==================================================

      if (token) {
        try {
          const savedVideos =
            JSON.parse(
              localStorage.getItem(
                "watchLater"
              )
            ) || [];

          // Remove every saved video
          await Promise.all(
            savedVideos.map(
              async (item) => {
                const videoId =
                  typeof item ===
                  "string"
                    ? item
                    : item?.id;

                if (!videoId) {
                  return;
                }

                try {
                  await fetch(
                    `${API_BASE_URL}/user/watch-later/${videoId}`,
                    {
                      method:
                        "DELETE",

                      headers: {
                        Authorization:
                          `Bearer ${token}`,
                      },
                    }
                  );
                } catch (
                  deleteError
                ) {
                  console.error(
                    `Error removing ${videoId}:`,
                    deleteError
                  );
                }
              }
            )
          );
        } catch (error) {
          console.error(
            "Clear Watch Later error:",
            error
          );
        }
      }

      // ==================================================
      // CLEAR LOCAL DATA
      // ==================================================

      localStorage.removeItem(
        "watchLater"
      );

      // ==================================================
      // UPDATE UI
      // ==================================================

      setWatchLaterVideos([]);

      window.dispatchEvent(
        new Event(
          "activityUpdated"
        )
      );
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