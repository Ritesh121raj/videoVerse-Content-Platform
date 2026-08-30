import { Link } from "react-router-dom";
import { MoreVertical } from "lucide-react";

function VideoCard({ id, image, title, channel, views, time }) {

  const saveToHistory = () => {

    const video = {
      id,
      image,
      title,
      channel,
      views,
      time,
    };

    const oldHistory =
      JSON.parse(localStorage.getItem("history")) || [];

    // Remove duplicate video if already present
    const newHistory = oldHistory.filter(
      (item) => item.id !== id
    );

    // Put latest video at the beginning
    newHistory.unshift(video);

    // Keep only last 20 videos
    const limitedHistory = newHistory.slice(0, 20);

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

        <div className="thumbnail-container">

          <img
            src={image}
            alt={title}
            className="thumbnail"
          />

          <span className="duration">
            10:25
          </span>

        </div>


        <div className="video-info">

          <div className="channel-logo">
            {channel.charAt(0)}
          </div>


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


          <MoreVertical
            size={20}
            className="more-icon"
          />

        </div>

      </div>

    </Link>
  );
}

export default VideoCard;