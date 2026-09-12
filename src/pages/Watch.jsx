import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { getVideoById, searchVideos } from "../services/videoApi";
import VideoGrid from "../components/VideoGrid";
import Navbar from "../components/Navbar";

import {
  ThumbsUp,
  ThumbsDown,
  Share2,
  Download,
  Bookmark,
  Trash2,
} from "lucide-react";

function Watch() {
  const { id } = useParams();

  const [video, setVideo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [recommendedVideos, setRecommendedVideos] = useState([]);

  const [liked, setLiked] = useState(false);
  const [disliked, setDisliked] = useState(false);
  const [subscribed, setSubscribed] = useState(false);

  const [likeCount, setLikeCount] = useState(1200);
  const [dislikeCount, setDislikeCount] = useState(25);

  const [commentText, setCommentText] = useState("");
  const [comments, setComments] = useState([]);
  // Fetch video + recommended videos
    useEffect(() => {
      const loadVideo = async () => {
        try {
          setLoading(true);

          const data = await getVideoById(id);
            setVideo(data);

            // Load recommendations separately
            try {
              const recommended = await searchVideos(data.title);

              setRecommendedVideos(
                recommended.filter((item) => item.id !== id)
              );
            } catch (error) {
              console.error("Error loading recommendations:", error);
              setRecommendedVideos([]);
            }
        } catch (error) {
          console.error("Error loading video:", error);
        } finally {
          setLoading(false);
        }
      };

      loadVideo();
    }, [id]);

  // Load saved data
  useEffect(() => {
    if (!video) return;

    // ---------------- LIKE ----------------
    const likedIds =
      JSON.parse(localStorage.getItem("likedVideos")) || [];

    setLiked(likedIds.includes(id));

    // ---------------- DISLIKE ----------------
    const dislikedIds =
      JSON.parse(localStorage.getItem("dislikedVideos")) || [];

    setDisliked(dislikedIds.includes(id));

    // ---------------- SUBSCRIPTION ----------------
    const subscribedChannels =
      JSON.parse(
        localStorage.getItem("subscribedChannels")
      ) || [];

    const isSubscribed = subscribedChannels.some(
      (channel) => channel.id === video.channelId
    );

    setSubscribed(isSubscribed);

    // ---------------- COMMENTS ----------------
    const savedComments =
      JSON.parse(
        localStorage.getItem(`comments_${id}`)
      ) || [];

    setComments(savedComments);
  }, [id, video]);

  // Like / Unlike
  const handleLike = () => {
    const likedIds =
      JSON.parse(localStorage.getItem("likedVideos")) || [];

    const dislikedIds =
      JSON.parse(localStorage.getItem("dislikedVideos")) || [];

    if (liked) {
      const updatedLikes = likedIds.filter(
        (videoId) => videoId !== id
      );

      localStorage.setItem(
        "likedVideos",
        JSON.stringify(updatedLikes)
      );

      setLiked(false);
      setLikeCount((prev) => prev - 1);

      return;
    }

    if (disliked) {
      const updatedDislikes = dislikedIds.filter(
        (videoId) => videoId !== id
      );

      localStorage.setItem(
        "dislikedVideos",
        JSON.stringify(updatedDislikes)
      );

      setDisliked(false);
      setDislikeCount((prev) => prev - 1);
    }

    if (!likedIds.includes(id)) {
      likedIds.unshift(id);
    }

    localStorage.setItem(
      "likedVideos",
      JSON.stringify(likedIds)
    );

    setLiked(true);
    setLikeCount((prev) => prev + 1);
  };

  // Dislike
  const handleDislike = () => {
    const likedIds =
      JSON.parse(localStorage.getItem("likedVideos")) || [];

    const dislikedIds =
      JSON.parse(localStorage.getItem("dislikedVideos")) || [];

    if (disliked) {
      const updatedDislikes = dislikedIds.filter(
        (videoId) => videoId !== id
      );

      localStorage.setItem(
        "dislikedVideos",
        JSON.stringify(updatedDislikes)
      );

      setDisliked(false);
      setDislikeCount((prev) => prev - 1);

      return;
    }

    if (liked) {
      const updatedLikes = likedIds.filter(
        (videoId) => videoId !== id
      );

      localStorage.setItem(
        "likedVideos",
        JSON.stringify(updatedLikes)
      );

      setLiked(false);
      setLikeCount((prev) => prev - 1);
    }

    if (!dislikedIds.includes(id)) {
      dislikedIds.unshift(id);
    }

    localStorage.setItem(
      "dislikedVideos",
      JSON.stringify(dislikedIds)
    );

    setDisliked(true);
    setDislikeCount((prev) => prev + 1);
  };

  // Share
  const handleShare = async () => {
    const shareUrl = window.location.href;

    try {
      await navigator.clipboard.writeText(shareUrl);
      alert("Video link copied!");
    } catch (error) {
      alert("Unable to copy video link.");
    }
  };

  // Watch Later
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

  // Subscribe / Unsubscribe
  const handleSubscribe = () => {
    const old =
      JSON.parse(
        localStorage.getItem("subscribedChannels")
      ) || [];

    let updated;

    if (subscribed) {
      // Unsubscribe
      updated = old.filter(
        (channel) => channel.id !== video.channelId
      );
    } else {
      // Subscribe
      updated = [
        ...old,
        {
          id: video.channelId,
          name: video.channel,
        },
      ];
    }

    localStorage.setItem(
      "subscribedChannels",
      JSON.stringify(updated)
    );

    setSubscribed(!subscribed);
  };

  // Add comment
  const handleAddComment = () => {
    if (!commentText.trim()) return;

    const newComment = {
      id: Date.now(),
      name: "You",
      text: commentText,
    };

    const updatedComments = [
      newComment,
      ...comments,
    ];

    setComments(updatedComments);

    localStorage.setItem(
      `comments_${id}`,
      JSON.stringify(updatedComments)
    );

    setCommentText("");
  };

  // Delete comment
  const handleDeleteComment = (commentId) => {
    const updatedComments = comments.filter(
      (comment) => comment.id !== commentId
    );

    setComments(updatedComments);

    localStorage.setItem(
      `comments_${id}`,
      JSON.stringify(updatedComments)
    );
  };

  // Loading
  if (loading) {
    return (
      <div className="watch-page">
        <Navbar />

        <div className="watch-loading">
          <div className="loading-player"></div>

          <div className="loading-title"></div>
          <div className="loading-line"></div>
          <div className="loading-line short"></div>

          <div className="loading-actions">
            <div></div>
            <div></div>
            <div></div>
          </div>
        </div>
      </div>
    );
  }

  // Video not found
  if (!video) {
    return (
      <div className="watch-page">
        <h1>Video not found</h1>
      </div>
    );
  }

  return (
    <div className="watch-page">

      {/* Video Player */}
      <div className="player">
        <iframe
          width="100%"
          height="100%"
          src={`https://www.youtube.com/embed/${video.id}`}
          title={video.title}
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        ></iframe>
      </div>

      {/* Video Title */}
      <h1>{video.title}</h1>

      {/* Channel + Actions */}
      <div className="watch-info">

        <div className="channel-details">

          {/* CLICKABLE CHANNEL */}
          <Link
            to={`/channel/${video.channelId}`}
            className="channel-link"
          >
            <div className="channel-logo large">
              {video.channelImage ? (
                <img
                  src={video.channelImage}
                  alt={video.channel}
                />
              ) : (
                video.channel.charAt(0)
              )}
            </div>

            <div>
              <h3>{video.channel}</h3>

              <p>
                {video.subscribers || "0"} subscribers
              </p>
            </div>
          </Link>

          {/* SUBSCRIBE BUTTON */}
          <button
            className={
              subscribed
                ? "subscribe subscribed"
                : "subscribe"
            }
            onClick={handleSubscribe}
          >
            {subscribed
              ? "Subscribed"
              : "Subscribe"}
          </button>

        </div>

        {/* Actions */}
        <div className="watch-actions">

          {/* LIKE */}
          <button
            onClick={handleLike}
            className={
              liked ? "liked-button" : ""
            }
          >
            <ThumbsUp
              size={20}
              fill={
                liked
                  ? "currentColor"
                  : "none"
              }
            />
            {likeCount}
          </button>

          {/* DISLIKE */}
          <button
            onClick={handleDislike}
            className={
              disliked
                ? "disliked-button"
                : ""
            }
          >
            <ThumbsDown
              size={20}
              fill={
                disliked
                  ? "currentColor"
                  : "none"
              }
            />
            {dislikeCount}
          </button>

          {/* SHARE */}
          <button onClick={handleShare}>
            <Share2 size={20} />
            Share
          </button>

          {/* DOWNLOAD */}
          <button>
            <Download size={20} />
            Download
          </button>

          {/* SAVE */}
          <button onClick={saveToWatchLater}>
            <Bookmark size={20} />
            Save
          </button>

        </div>
      </div>

      {/* Description */}
      <div className="description">

        <strong>
          {Number(video.views).toLocaleString()} views
        </strong>

        <p>
          {video.description ||
            "Watch this video and learn something new."}
        </p>

      </div>

      {/* Comments */}
      <div className="comments">

        <h2>
          {comments.length + 2} Comments
        </h2>

        {/* Add Comment */}
        <div className="comment-input">

          <div className="comment-avatar">
            Y
          </div>

          <input
            type="text"
            placeholder="Add a comment..."
            value={commentText}
            onChange={(e) =>
              setCommentText(e.target.value)
            }
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                handleAddComment();
              }
            }}
          />

          <button onClick={handleAddComment}>
            Comment
          </button>

        </div>

        {/* User Comments */}
        {comments.map((comment) => (
          <div
            className="comment"
            key={comment.id}
          >

            <div className="comment-avatar">
              Y
            </div>

            <div className="comment-content">

              <strong>
                {comment.name}
              </strong>

              <p>
                {comment.text}
              </p>

              <button
                className="delete-comment"
                onClick={() =>
                  handleDeleteComment(comment.id)
                }
              >
                <Trash2 size={16} />
                Delete
              </button>

            </div>

          </div>
        ))}

        {/* Demo Comment */}
        <div className="comment">

          <div className="comment-avatar">
            A
          </div>

          <div>
            <strong>Alex</strong>
            <p>Great video! 🔥</p>
          </div>

        </div>

        {/* Demo Comment */}
        <div className="comment">

          <div className="comment-avatar">
            R
          </div>

          <div>
            <strong>Rahul</strong>
            <p>Very useful video!</p>
          </div>

        </div>

      </div>
        {/* Recommended Videos */}
      <div className="recommended-section">
        <h2>Recommended Videos</h2>

        {recommendedVideos.length === 0 ? (
          <p className="page-message">
            No recommended videos available.
          </p>
        ) : (
          <VideoGrid videos={recommendedVideos} />
        )}
      </div>

    </div>
  );
}

export default Watch;