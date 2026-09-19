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

  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (
        menuRef.current &&
        !menuRef.current.contains(event.target)
      ) {
        setShowMenu(false);
      }
    };

    if (showMenu) {
      document.addEventListener(
        "mousedown",
        handleOutsideClick
      );
    }

    return () => {
      document.removeEventListener(
        "mousedown",
        handleOutsideClick
      );
    };
  }, [showMenu]);

  /* ==============================
     ADD NOTIFICATION
     ============================== */

  const addNotification = (
    notificationTitle,
    notificationMessage,
    notificationType
  ) => {
    const notificationsEnabled =
      localStorage.getItem("notificationsEnabled") !== "false";

    if (!notificationsEnabled) {
      return;
    }

    const settingKey = {
      like: "likeNotifications",
      dislike: "dislikeNotifications",
      watchLater: "watchLaterNotifications",
    }[notificationType];

    if (
      settingKey &&
      localStorage.getItem(settingKey) === "false"
    ) {
      return;
    }

    const notifications =
      JSON.parse(
        localStorage.getItem("notifications")
      ) || [];

    const newNotification = {
      id: `${Date.now()}-${Math.random()
        .toString(36)
        .slice(2, 8)}`,
      title: notificationTitle,
      message: notificationMessage,
      videoId: id,
      time: "Just now",
      read: false,
    };

    const updatedNotifications = [
      newNotification,
      ...notifications,
    ].slice(0, 20);

    localStorage.setItem(
      "notifications",
      JSON.stringify(updatedNotifications)
    );

    window.dispatchEvent(
      new Event("notificationsUpdated")
    );
  };
  /* ==============================
     HISTORY
     ============================== */

  const saveToHistory = () => {
    const historyEnabled =
      localStorage.getItem("historyEnabled") !== "false";

    // If watch history is disabled, don't save the video
    if (!historyEnabled) {
      return;
    }

    const oldHistory =
      JSON.parse(
        localStorage.getItem("history")
      ) || [];

    const newHistory =
      oldHistory.filter(
        (item) => item !== id
      );

    newHistory.unshift(id);

    localStorage.setItem(
      "history",
      JSON.stringify(
        newHistory.slice(0, 20)
      )
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

  const handleLike = () => {
    const savedActivityEnabled =
      localStorage.getItem("savedActivityEnabled") !== "false";

    // If saved activity is disabled, don't save Like
    if (!savedActivityEnabled) {
      setShowMenu(false);

      alert(
        "Saved activity is disabled. Enable it from Settings → Privacy."
      );

      return;
    }

    const likedVideos =
      JSON.parse(
        localStorage.getItem("likedVideos")
      ) || [];

    const alreadyLiked =
      likedVideos.some(
        (video) =>
          typeof video === "string"
            ? video === id
            : video?.id === id
      );

    if (!alreadyLiked) {
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

      addNotification(
        "Video liked",
        `"${title}" was added to your liked videos.`,
        "like"
      );
    }

    /* Remove from disliked */
    const dislikedVideos =
      JSON.parse(
        localStorage.getItem("dislikedVideos")
      ) || [];

    const updatedDislikedVideos =
      dislikedVideos.filter(
        (video) =>
          typeof video === "string"
            ? video !== id
            : video?.id !== id
      );

    localStorage.setItem(
      "dislikedVideos",
      JSON.stringify(updatedDislikedVideos)
    );

    setShowMenu(false);

    alert("Added to Liked Videos");
  };

  /* ==============================
     DISLIKE
     ============================== */

  const handleDislike = () => {
    const savedActivityEnabled =
      localStorage.getItem("savedActivityEnabled") !== "false";

    // If saved activity is disabled, don't save Dislike
    if (!savedActivityEnabled) {
      setShowMenu(false);

      alert(
        "Saved activity is disabled. Enable it from Settings → Privacy."
      );

      return;
    }

    const dislikedVideos =
      JSON.parse(
        localStorage.getItem("dislikedVideos")
      ) || [];

    const alreadyDisliked =
      dislikedVideos.some(
        (video) =>
          typeof video === "string"
            ? video === id
            : video?.id === id
      );

    if (!alreadyDisliked) {
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
        "dislikedVideos",
        JSON.stringify(updatedDislikedVideos)
      );

      addNotification(
        "Video disliked",
        `"${title}" was added to your disliked videos.`,
        "dislike"
      );
    }

    /* Remove from liked */
    const likedVideos =
      JSON.parse(
        localStorage.getItem("likedVideos")
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
      JSON.stringify(updatedLikedVideos)
    );

    setShowMenu(false);

    alert("Added to Disliked Videos");
  };
  /* ==============================
     WATCH LATER
     ============================== */

  const handleWatchLater = () => {
    const savedActivityEnabled =
      localStorage.getItem("savedActivityEnabled") !== "false";

    // If saved activity is disabled, don't save Watch Later
    if (!savedActivityEnabled) {
      setShowMenu(false);

      alert(
        "Saved activity is disabled. Enable it from Settings → Privacy."
      );

      return;
    }

    const watchLaterVideos =
      JSON.parse(
        localStorage.getItem("watchLater")
      ) || [];

    const getVideoId = (item) => {
      if (typeof item === "string") {
        return item;
      }

      return item?.id;
    };

    const alreadySaved =
      watchLaterVideos.some(
        (item) =>
          getVideoId(item) === id
      );

    if (!alreadySaved) {
      const updatedVideos = [
        id,
        ...watchLaterVideos.filter(
          (item) =>
            getVideoId(item) !== id
        ),
      ];

      localStorage.setItem(
        "watchLater",
        JSON.stringify(updatedVideos)
      );

      addNotification(
        "Watch Later",
        `"${title}" was added to Watch Later.`,
        "watchLater"
      );

      alert(
        "Added to Watch Later"
      );
    } else {
      alert(
        "Already saved to Watch Later"
      );
    }

    setShowMenu(false);
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
    thumbnail || image;

  const uploadDate =
    publishedAt || time;

  return (
    <div
      className="video-card-wrapper"
      ref={menuRef}
    >
      <Link
        to={`/watch/${id}`}
        className="video-link"
        onClick={saveToHistory}
      >
        <div className="video-card">

          <div className="thumbnail-container">
            <img
              src={videoThumbnail}
              alt={title}
              className="thumbnail"
            />

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
        <div className="video-options-menu">

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