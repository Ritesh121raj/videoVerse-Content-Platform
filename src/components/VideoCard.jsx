import { Link } from "react-router-dom";
import { MoreVertical } from "lucide-react";

function VideoCard({
  id,
  image,
  title,
  channel,
  views,
  time,
  duration,
}) {

  // =========================
  // SAVE VIDEO TO HISTORY
  // =========================

  const saveToHistory = () => {

    const oldHistory =
      JSON.parse(localStorage.getItem("history")) || [];

    // Remove duplicate
    const newHistory = oldHistory.filter(
      (item) => item !== id
    );

    // Add latest video at beginning
    newHistory.unshift(id);

    // Keep only last 20 videos
    const limitedHistory =
      newHistory.slice(0, 20);

    localStorage.setItem(
      "history",
      JSON.stringify(limitedHistory)
    );
  };


  return (

    <Link
      to={`/watch/${id}`}
      className="video-link"
      onClick={saveToHistory}
    >

      <div className="video-card">


        {/* =========================
            THUMBNAIL
        ========================= */}

        <div className="thumbnail-container">

          <img
            src={image}
            alt={title}
            className="thumbnail"
          />

          <span className="duration">
            {duration || "10:25"}
          </span>

        </div>


        {/* =========================
            VIDEO INFORMATION
        ========================= */}

        <div className="video-info">


          {/* CHANNEL LOGO */}

          <div className="channel-logo">
            {channel?.charAt(0)}
          </div>


          {/* TEXT */}

          <div className="video-text">

            <h3>
              {title}
            </h3>

            <p>
              {channel}
            </p>

            <p>
              {views} views • {time}
            </p>

          </div>


          {/* MORE BUTTON */}

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