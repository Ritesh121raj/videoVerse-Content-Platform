import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import {
  MoreVertical,
  Clock,
  ThumbsUp,
  ThumbsDown,
  Share2,
} from "lucide-react";

function VideoCard({
  id,
  image,
  thumbnail,
  title,
  channel,
  views,
  time,
  publishedAt,
  duration,
  channelImage,
}) {
  const [showMenu, setShowMenu] = useState(false);

  const menuRef = useRef(null);
  const moreButtonRef = useRef(null);

  useEffect(() => {
    const handleOutsideClick = (event) => {
      const clickedInsideMenu =
        menuRef.current?.contains(event.target);

      const clickedMoreButton =
        moreButtonRef.current?.contains(event.target);

      if (!clickedInsideMenu && !clickedMoreButton) {
        setShowMenu(false);
      }
    };

    if (showMenu) {
      document.addEventListener("mousedown", handleOutsideClick);
    }

    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, [showMenu]);

const getDislikedStorageKey = () => {
  const userId = getCurrentUserId();

  if (!userId) {
    return null;
  }

  return `dislikedVideos_${userId}`;
};

  /* ==============================
     ADD NOTIFICATION
     ============================== */

  const addNotification = (
    notificationTitle,
    notificationMessage,
    notificationType
  ) => {
    try {
      // ==========================================
      // GLOBAL NOTIFICATION SETTING
      // ==========================================

      const notificationsEnabled =
        localStorage.getItem("notificationsEnabled") !== "false";

      if (!notificationsEnabled) {
        console.log(
          "Notifications are disabled from Settings."
        );

        return;
      }

      // ==========================================
      // TYPE-SPECIFIC NOTIFICATION SETTING
      // ==========================================

      const settingKey = {
        like: "likeNotifications",
        dislike: "dislikeNotifications",
        watchLater: "watchLaterNotifications",
      }[notificationType];

      if (
        settingKey &&
        localStorage.getItem(settingKey) === "false"
      ) {
        console.log(
          `${notificationType} notifications are disabled from Settings.`
        );

        return;
      }

      // ==========================================
      // GET EXISTING NOTIFICATIONS
      // ==========================================

      let notifications = [];

      try {
        const savedNotifications =
          localStorage.getItem("notifications");

        const parsedNotifications = savedNotifications
          ? JSON.parse(savedNotifications)
          : [];

        notifications = Array.isArray(parsedNotifications)
          ? parsedNotifications
          : [];
      } catch (error) {
        console.error(
          "Unable to read notifications:",
          error
        );

        notifications = [];
      }

      // ==========================================
      // CREATE NEW NOTIFICATION
      // ==========================================

      const newNotification = {
        id: `${Date.now()}-${Math.random()
          .toString(36)
          .slice(2, 8)}`,

        title: notificationTitle,

        message: notificationMessage,

        videoId: id,

        type: notificationType,

        time: "Just now",

        read: false,
      };

      // ==========================================
      // SAVE NOTIFICATION
      // ==========================================

      const updatedNotifications = [
        newNotification,
        ...notifications,
      ].slice(0, 20);

      localStorage.setItem(
        "notifications",
        JSON.stringify(updatedNotifications)
      );

      // ==========================================
      // UPDATE NOTIFICATION UI
      // ==========================================

      window.dispatchEvent(
        new Event("notificationsUpdated")
      );

      console.log(
        "Notification added:",
        newNotification
      );
    } catch (error) {
      console.error(
        "Notification save error:",
        error
      );
    }
  };
  /* ==============================
     HISTORY
     ============================== */

  const saveToHistory = () => {
    const history =
      JSON.parse(
        localStorage.getItem("history")
      ) || [];

    const updatedHistory = [
      videoData,
      ...history.filter(
        (item) => item.id !== videoData.id
      ),
    ].slice(0, 20);

    localStorage.setItem(
      "history",
      JSON.stringify(updatedHistory)
    );

    window.dispatchEvent(
      new Event("historyUpdated")
    );
  };

  /* ==============================
     VIDEO DATA
     ============================== */

  const videoData = {
    id,
    image: thumbnail || image,
    thumbnail: thumbnail || image,
    title,
    channel,
    channelImage,
    views,
    time: time || publishedAt,
    publishedAt:
      publishedAt || time,
    duration,
  };

  /* ==============================
     LIKE
     ============================== */

  const handleLike = async () => {
    const savedActivityEnabled =
      localStorage.getItem("savedActivityEnabled") !== "false";

    if (!savedActivityEnabled) {
      setShowMenu(false);

      alert(
        "Saved activity is disabled. Enable it from Settings → Privacy."
      );

      return;
    }

    const token = localStorage.getItem("videoVerseToken");

    if (!token) {
      setShowMenu(false);

      alert("Please login to like videos.");

      return;
    }

    try {
      const likedVideos =
        JSON.parse(
          localStorage.getItem("likedVideos")
        ) || [];

      const alreadyLiked = likedVideos.some(
        (video) =>
          typeof video === "string"
            ? video === id
            : video?.id === id
      );

      /* ==============================
        UNLIKE
        ============================== */

      if (alreadyLiked) {
        const response = await fetch(
          `https://videoverse-content-platform.onrender.com/api/user/liked/${id}`,
          {
            method: "DELETE",
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const data = await response.json().catch(() => ({}));

        if (!response.ok) {
          throw new Error(
            data.message || "Unable to remove liked video"
          );
        }

        const updatedLikedVideos =
          likedVideos.filter(
            (video) =>
              typeof video === "string"
                ? video !== id
                : video?.id !== id
          );

        localStorage.setItem(
          "likedVideos",
          JSON.stringify(updatedLikedVideos)
        );

        window.dispatchEvent(
          new Event("activityUpdated")
        );

        setShowMenu(false);

        alert("Removed from Liked Videos");

        return;
      }

      /* ==============================
        LIKE
        ============================== */

      const response = await fetch(
        "https://videoverse-content-platform.onrender.com/api/user/liked",
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },

          body: JSON.stringify({
            videoId: id,
          }),
        }
      );

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(
          data.message || "Unable to like video"
        );
      }

      /*
      * Backend se liked videos mile to
      * unhe localStorage mein rakho.
      * Otherwise current video ko locally add karo.
      */

      const backendLikedVideos =
        Array.isArray(data.likedVideos)
          ? data.likedVideos
          : null;

      if (backendLikedVideos) {
        localStorage.setItem(
          "likedVideos",
          JSON.stringify(backendLikedVideos)
        );
      } else {
        const updatedLikedVideos = [
          videoData,
          ...likedVideos.filter(
            (video) =>
              typeof video === "string"
                ? video !== id
                : video?.id !== id
          ),
        ];

        localStorage.setItem(
          "likedVideos",
          JSON.stringify(updatedLikedVideos)
        );
      }

      /* ==============================
        REMOVE DISLIKE
        ============================== */

      try {
        await fetch(
          `https://videoverse-content-platform.onrender.com/api/user/disliked/${id}`,
          {
            method: "DELETE",

            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
      } catch (error) {
        console.error(
          "Unable to remove backend dislike:",
          error
        );
      }

      /*
      * Remove dislike locally.
      * Current project can have either:
      * dislikedVideos
      * or dislikedVideos_userId
      */

      const currentUser = (() => {
        try {
          return JSON.parse(
            localStorage.getItem(
              "videoVerseCurrentUser"
            )
          );
        } catch {
          return null;
        }
      })();

      const userId =
        currentUser?._id ||
        currentUser?.id ||
        currentUser?.userId ||
        currentUser?.email ||
        null;

      const dislikedStorageKey = userId
        ? `dislikedVideos_${userId}`
        : "dislikedVideos";

      const dislikedVideos =
        JSON.parse(
          localStorage.getItem(
            dislikedStorageKey
          )
        ) || [];

      const updatedDislikedVideos =
        dislikedVideos.filter(
          (video) =>
            typeof video === "string"
              ? video !== id
              : video?.id !== id
        );

      localStorage.setItem(
        dislikedStorageKey,
        JSON.stringify(updatedDislikedVideos)
      );

      /* ==============================
        NOTIFICATION
        ============================== */

      addNotification(
        "Video liked",
        `"${title}" was added to your liked videos.`,
        "like"
      );

      window.dispatchEvent(
        new Event("activityUpdated")
      );

      setShowMenu(false);

      alert("Added to Liked Videos");
    } catch (error) {
      console.error(
        "Like video error:",
        error
      );

      setShowMenu(false);

      alert(
        error?.message ||
          "Unable to update liked video."
      );
    }
  };


  const handleDislike = async () => {
    const savedActivityEnabled =
      localStorage.getItem("savedActivityEnabled") !== "false";

    if (!savedActivityEnabled) {
      setShowMenu(false);

      alert(
        "Saved activity is disabled. Enable it from Settings → Privacy."
      );

      return;
    }

    const token = localStorage.getItem("videoVerseToken");

    if (!token) {
      setShowMenu(false);

      alert("Please login to dislike videos.");

      return;
    }

    try {
      /* ==============================
        CURRENT USER
        ============================== */

      let currentUser = null;

      try {
        currentUser = JSON.parse(
          localStorage.getItem(
            "videoVerseCurrentUser"
          )
        );
      } catch {
        currentUser = null;
      }

      const userId =
        currentUser?._id ||
        currentUser?.id ||
        currentUser?.userId ||
        currentUser?.email ||
        null;

      const dislikedStorageKey = userId
        ? `dislikedVideos_${userId}`
        : "dislikedVideos";

      const dislikedVideos =
        JSON.parse(
          localStorage.getItem(
            dislikedStorageKey
          )
        ) || [];

      const alreadyDisliked =
        dislikedVideos.some(
          (video) =>
            typeof video === "string"
              ? video === id
              : video?.id === id
        );

      /* ==============================
        REMOVE DISLIKE
        ============================== */

      if (alreadyDisliked) {
        const response = await fetch(
          `https://videoverse-content-platform.onrender.com/api/user/disliked/${id}`,
          {
            method: "DELETE",

            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const data = await response
          .json()
          .catch(() => ({}));

        if (!response.ok) {
          throw new Error(
            data.message ||
              "Unable to remove disliked video"
          );
        }

        const updatedDislikedVideos =
          dislikedVideos.filter(
            (video) =>
              typeof video === "string"
                ? video !== id
                : video?.id !== id
          );

        localStorage.setItem(
          dislikedStorageKey,
          JSON.stringify(
            updatedDislikedVideos
          )
        );

        window.dispatchEvent(
          new Event("activityUpdated")
        );

        setShowMenu(false);

        alert(
          "Removed from Disliked Videos"
        );

        return;
      }

      /* ==============================
        ADD DISLIKE
        ============================== */

      const response = await fetch(
        "https://videoverse-content-platform.onrender.com/api/user/disliked",
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },

          body: JSON.stringify({
            video: {
              ...videoData,

              image:
                videoData.thumbnail ||
                videoData.image ||
                "",
            },
          }),
        }
      );

      const data = await response
        .json()
        .catch(() => ({}));

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Unable to dislike video"
        );
      }

      /* ==============================
        SAVE DISLIKE LOCALLY
        ============================== */

      const updatedDislikedVideos = [
        videoData,

        ...dislikedVideos.filter(
          (video) =>
            typeof video === "string"
              ? video !== id
              : video?.id !== id
        ),
      ];

      localStorage.setItem(
        dislikedStorageKey,
        JSON.stringify(
          updatedDislikedVideos
        )
      );

      /* ==============================
        REMOVE LIKE
        ============================== */

      try {
        await fetch(
          `https://videoverse-content-platform.onrender.com/api/user/liked/${id}`,
          {
            method: "DELETE",

            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
      } catch (error) {
        console.error(
          "Unable to remove backend like:",
          error
        );
      }

      const likedVideos =
        JSON.parse(
          localStorage.getItem(
            "likedVideos"
          )
        ) || [];

      const updatedLikedVideos =
        likedVideos.filter(
          (video) =>
            typeof video === "string"
              ? video !== id
              : video?.id !== id
        );

      localStorage.setItem(
        "likedVideos",
        JSON.stringify(
          updatedLikedVideos
        )
      );

      /* ==============================
        NOTIFICATION
        ============================== */

      addNotification(
        "Video disliked",
        `"${title}" was added to your disliked videos.`,
        "dislike"
      );

      window.dispatchEvent(
        new Event("activityUpdated")
      );

      setShowMenu(false);

      alert("Added to Disliked Videos");
    } catch (error) {
      console.error(
        "Dislike video error:",
        error
      );

      setShowMenu(false);

      alert(
        error?.message ||
          "Unable to update disliked video."
      );
    }
  };
  const handleWatchLater = async () => {
    const token = localStorage.getItem("videoVerseToken");

    if (!token) {
      setShowMenu(false);
      alert("Please login to use Watch Later.");
      return;
    }

    try {
      const response = await fetch(
        "https://videoverse-content-platform.onrender.com/api/user/watch-later",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            videoId: id,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Unable to add video to Watch Later"
        );
      }

      const watchLaterIds = Array.isArray(data.watchLater)
        ? data.watchLater
        : [];

      localStorage.setItem(
        "watchLater",
        JSON.stringify(watchLaterIds)
      );

      window.dispatchEvent(
        new Event("activityUpdated")
      );

      setShowMenu(false);

      alert("Added to Watch Later");
    } catch (error) {
      console.error("Watch Later error:", error);

      setShowMenu(false);

      alert(
        error?.message ||
          "Unable to update Watch Later."
      );
    }
  };
  /* ==============================
     SHARE
     ============================== */

  const handleShare = async () => {
    const videoUrl =
      `${window.location.origin}/watch/${id}`;

    try {
      await navigator.clipboard.writeText(
        videoUrl
      );

      alert(
        "Video link copied!"
      );
    } catch (error) {
      console.error(
        "Share error:",
        error
      );

      alert(
        "Unable to copy video link."
      );
    }

    setShowMenu(false);
  };

  /* ==============================
     FORMAT VIEWS
     ============================== */

  const formatViews = (views) => {
    const number = Number(views);

    if (isNaN(number)) {
      return views || "0";
    }

    if (number >= 1000000000) {
      const value =
        number / 1000000000;

      return `${
        value % 1 === 0
          ? value
          : value.toFixed(1)
      }B`;
    }

    if (number >= 1000000) {
      const value =
        number / 1000000;

      return `${
        value % 1 === 0
          ? value
          : value.toFixed(1)
      }M`;
    }

    if (number >= 1000) {
      const value =
        number / 1000;

      return `${
        value % 1 === 0
          ? value
          : value.toFixed(1)
      }K`;
    }

    return number.toLocaleString();
  };

  /* ==============================
     FORMAT DATE
     ============================== */

  const formatDate = (date) => {
    if (!date) return "";

    const uploadedDate =
      new Date(date);

    if (
      isNaN(
        uploadedDate.getTime()
      )
    ) {
      return "";
    }

    const now = new Date();

    const diff = Math.floor(
      (now - uploadedDate) /
        (1000 * 60 * 60 * 24)
    );

    if (diff < 0) {
      return "just now";
    }

    if (diff === 0) {
      return "today";
    }

    if (diff === 1) {
      return "1 day ago";
    }

    if (diff < 30) {
      return `${diff} days ago`;
    }

    const months =
      Math.floor(diff / 30);

    if (months === 1) {
      return "1 month ago";
    }

    if (months < 12) {
      return `${months} months ago`;
    }

    const years =
      Math.floor(months / 12);

    if (years === 1) {
      return "1 year ago";
    }

    return `${years} years ago`;
  };

  const videoThumbnail =
  thumbnail ||
  image ||
  `https://i.ytimg.com/vi/${id}/hqdefault.jpg`;

  const uploadDate =
    publishedAt || time;

  return (
    <div className="video-card-wrapper">
      <Link
        to={`/watch/${id}`}
        className="video-link"
        onClick={saveToHistory}
      >
        <div className="video-card">

          <div className="thumbnail-container">
            {videoThumbnail ? (
              <img
                src={videoThumbnail}
                    loading="lazy"
                    decoding="async"
                alt={title || "Video thumbnail"}
                className="thumbnail"
                onError={(event) => {
                  const fallbackUrl = id
                    ? `https://i.ytimg.com/vi/${id}/hqdefault.jpg`
                    : null;

                  if (
                    fallbackUrl &&
                    event.currentTarget.src !== fallbackUrl
                  ) {
                    event.currentTarget.src = fallbackUrl;
                  } else {
                    event.currentTarget.style.display = "none";
                  }
                }}
              />
            ) : (
              <div className="thumbnail-placeholder">
                No thumbnail
              </div>
            )}

            {duration && (
              <span className="duration">
                {duration}
              </span>
            )}
          </div>

          <div className="video-info">

            <div className="channel-logo">
              {channelImage ? (
                <img
                  src={channelImage}
                    loading="lazy"
                    decoding="async"
                  alt={channel}
                />
              ) : (
                <div className="channel-letter">
                  {channel
                    ?.charAt(0)
                    ?.toUpperCase() ||
                    "C"}
                </div>
              )}
            </div>

            <div className="video-text">
              <h3>{title}</h3>

              <p>{channel}</p>

              <p>
                {formatViews(views)}
                {" "}
                views
                {uploadDate && " • "}
                {formatDate(
                  uploadDate
                )}
              </p>
            </div>

            <button
              ref={moreButtonRef}
              className="more-button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();

                setShowMenu(
                  (prev) => !prev
                );
              }}
            >
              <MoreVertical size={20} />
            </button>

          </div>
        </div>
      </Link>

      {showMenu && (
        <div
          ref={menuRef}
          className="video-options-menu"
        >

          <button
            onClick={
              handleWatchLater
            }
          >
            <Clock size={18} />
            <span>
              Save to Watch Later
            </span>
          </button>

          <button
            onClick={handleLike}
          >
            <ThumbsUp size={18} />
            <span>
              Like
            </span>
          </button>

          <button
            onClick={handleDislike}
          >
            <ThumbsDown size={18} />
            <span>
              Dislike
            </span>
          </button>

          <button
            onClick={handleShare}
          >
            <Share2 size={18} />
            <span>
              Share
            </span>
          </button>

        </div>
      )}
    </div>
  );
}

export default VideoCard;