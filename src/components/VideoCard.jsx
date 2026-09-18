import { Link } from "react-router-dom";
import { MoreVertical } from "lucide-react";

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
  const saveToHistory = () => {
    const oldHistory =
      JSON.parse(localStorage.getItem("history")) || [];

    const newHistory = oldHistory.filter(
      (item) => item !== id
    );

    newHistory.unshift(id);

    localStorage.setItem(
      "history",
      JSON.stringify(newHistory.slice(0, 20))
    );
  };

  const formatViews = (views) => {
    const number = Number(views);

    if (isNaN(number)) {
      return views || "0";
    }

    if (number >= 1000000000) {
      const value = number / 1000000000;
      return `${value % 1 === 0 ? value : value.toFixed(1)}B`;
    }

    if (number >= 1000000) {
      const value = number / 1000000;
      return `${value % 1 === 0 ? value : value.toFixed(1)}M`;
    }

    if (number >= 1000) {
      const value = number / 1000;
      return `${value % 1 === 0 ? value : value.toFixed(1)}K`;
    }

    return number.toLocaleString();
  };

  const formatDate = (date) => {
    if (!date) return "";

    const uploadedDate = new Date(date);

    if (isNaN(uploadedDate.getTime())) {
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

    const months = Math.floor(diff / 30);

    if (months === 1) {
      return "1 month ago";
    }

    if (months < 12) {
      return `${months} months ago`;
    }

    const years = Math.floor(months / 12);

    if (years === 1) {
      return "1 year ago";
    }

    return `${years} years ago`;
  };

  // Support both old and new API property names
  const videoThumbnail = thumbnail || image;
  const uploadDate = publishedAt || time;

  return (
    <Link
      to={`/watch/${id}`}
      className="video-link"
      onClick={saveToHistory}
    >
      <div className="video-card">

        {/* ================= THUMBNAIL ================= */}

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

        {/* ================= VIDEO INFORMATION ================= */}

        <div className="video-info">

          {/* Channel Logo */}

          <div className="channel-logo">
            {channelImage ? (
              <img
                src={channelImage}
                alt={channel}
              />
            ) : (
              <div className="channel-letter">
                {channel?.charAt(0)?.toUpperCase() || "C"}
              </div>
            )}
          </div>

          {/* Text */}

          <div className="video-text">

            <h3>{title}</h3>

            <p>{channel}</p>

            <p>
              {formatViews(views)} views
              {uploadDate && " • "}
              {formatDate(uploadDate)}
            </p>

          </div>

          {/* More Button */}

          <button
            className="more-button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
            }}
          >
            <MoreVertical size={20} />
          </button>

        </div>
      </div>
    </Link>
  );
}

export default VideoCard;