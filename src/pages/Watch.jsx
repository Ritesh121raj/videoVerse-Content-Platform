import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import videos from "../data/videos";

import {
  ThumbsUp,
  ThumbsDown,
  Share2,
  Download,
  Bookmark,
} from "lucide-react";

function Watch() {
  const { id } = useParams();

  // Find the video using URL id
  const video = videos.find((item) => item.id === id);

  // Like state
  const [liked, setLiked] = useState(false);

  // Subscribe state
  const [subscribed, setSubscribed] = useState(false);

  // Check saved Like and Subscribe data
  useEffect(() => {
    if (!video) return;

    // Check Like
    const likedIds =
      JSON.parse(localStorage.getItem("likedVideos")) || [];

    setLiked(likedIds.includes(id));

    // Check Subscribe
    const subscribedChannels =
      JSON.parse(
        localStorage.getItem("subscribedChannels")
      ) || [];

    setSubscribed(
      subscribedChannels.includes(video.channel)
    );
  }, [id, video]);

  // ---------------- LIKE ----------------

  const handleLike = () => {
    const likedIds =
      JSON.parse(localStorage.getItem("likedVideos")) || [];

    if (likedIds.includes(id)) {
      // Remove Like
      const updatedIds = likedIds.filter(
        (videoId) => videoId !== id
      );

      localStorage.setItem(
        "likedVideos",
        JSON.stringify(updatedIds)
      );

      setLiked(false);
    } else {
      // Add Like
      likedIds.unshift(id);

      localStorage.setItem(
        "likedVideos",
        JSON.stringify(likedIds)
      );

      setLiked(true);
    }
  };

  // ---------------- WATCH LATER ----------------

  const saveToWatchLater = () => {
    const savedIds =
      JSON.parse(localStorage.getItem("watchLater")) || [];

    if (savedIds.includes(id)) {
      alert("Video is already in Watch Later!");
      return;
    }

    savedIds.unshift(id);

    localStorage.setItem(
      "watchLater",
      JSON.stringify(savedIds)
    );

    alert("Video saved to Watch Later!");
  };

  // ---------------- SUBSCRIBE ----------------

  const handleSubscribe = () => {
    if (!video) return;

    const subscribedChannels =
      JSON.parse(
        localStorage.getItem("subscribedChannels")
      ) || [];

    if (subscribedChannels.includes(video.channel)) {
      // Unsubscribe
      const updatedChannels =
        subscribedChannels.filter(
          (channel) => channel !== video.channel
        );

      localStorage.setItem(
        "subscribedChannels",
        JSON.stringify(updatedChannels)
      );

      setSubscribed(false);
    } else {
      // Subscribe
      subscribedChannels.unshift(video.channel);

      localStorage.setItem(
        "subscribedChannels",
        JSON.stringify(subscribedChannels)
      );

      setSubscribed(true);
    }
  };

  // ---------------- VIDEO NOT FOUND ----------------

  if (!video) {
    return (
      <div className="watch-page">
        <h1>Video not found</h1>
      </div>
    );
  }

  return (
    <div className="watch-page">

      {/* VIDEO PLAYER */}
      <div className="player">
        <iframe
          width="100%"
          height="100%"
          src={video.videoUrl}
          title={video.title}
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        ></iframe>
      </div>

      {/* VIDEO TITLE */}
      <h1>{video.title}</h1>

      {/* CHANNEL + ACTIONS */}
      <div className="watch-info">

        {/* CHANNEL DETAILS */}
        <div className="channel-details">

          <div className="channel-logo large">
            {video.channel.charAt(0)}
          </div>

          <div>
            <h3>{video.channel}</h3>

            <p>
              {video.subscribers || "500K"} subscribers
            </p>
          </div>

          {/* SUBSCRIBE BUTTON */}
          <button
            className={
              subscribed
                ? "subscribe subscribed"
                : "subscribe"
            }
            onClick={handleSubscribe}
          >
            {subscribed ? "Subscribed" : "Subscribe"}
          </button>
        </div>

        {/* ACTION BUTTONS */}
        <div className="watch-actions">

          {/* LIKE */}
          <button
            onClick={handleLike}
            className={liked ? "liked-button" : ""}
          >
            <ThumbsUp
              size={20}
              fill={liked ? "currentColor" : "none"}
            />

            {liked ? "Liked" : "Like"}
          </button>

          {/* DISLIKE */}
          <button>
            <ThumbsDown size={20} />
            Dislike
          </button>

          {/* SHARE */}
          <button>
            <Share2 size={20} />
            Share
          </button>

          {/* DOWNLOAD */}
          <button>
            <Download size={20} />
            Download
          </button>

          {/* WATCH LATER */}
          <button onClick={saveToWatchLater}>
            <Bookmark size={20} />
            Save
          </button>

        </div>
      </div>

      {/* DESCRIPTION */}
      <div className="description">

        <strong>
          {video.views} views • {video.time}
        </strong>

        <p>
          {video.description ||
            "Watch this video and learn something new."}
        </p>

      </div>

      {/* COMMENTS */}
      <div className="comments">

        <h2>Comments</h2>

        <div className="comment">

          <div className="comment-avatar">
            A
          </div>

          <div>
            <strong>Alex</strong>

            <p>
              Great video! 🔥
            </p>
          </div>

        </div>

        <div className="comment">

          <div className="comment-avatar">
            R
          </div>

          <div>
            <strong>Rahul</strong>

            <p>
              Very useful video!
            </p>
          </div>

        </div>

      </div>
    </div>
  );
}

export default Watch;