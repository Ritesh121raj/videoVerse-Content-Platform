import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import {
  ThumbsUp,
  ThumbsDown,
  Share2,
  Download,
  Trash2,
} from "lucide-react";

import {
  getVideoById,
  searchVideos,
} from "../services/videoApi";

import VideoGrid from "../components/VideoGrid";
import Navbar from "../components/Navbar";


function Watch() {
  const { id } = useParams();

  const [video, setVideo] = useState(null);
  const [loading, setLoading] = useState(true);

  const [recommendedVideos, setRecommendedVideos] =
    useState([]);

  const [liked, setLiked] = useState(false);
  const [disliked, setDisliked] = useState(false);

  const [likeCount, setLikeCount] =
    useState(1200);

  const [dislikeCount, setDislikeCount] =
    useState(25);

  const [subscribed, setSubscribed] =
    useState(false);

  const [comments, setComments] =
    useState([]);

  const [commentText, setCommentText] =
    useState("");


  // ==================================================
  // Format Numbers
  // ==================================================

  const formatNumber = (value) => {
    const number = Number(value) || 0;

    if (number >= 1000000000) {
      return `${(
        number / 1000000000
      ).toFixed(2)}B`;
    }

    if (number >= 1000000) {
      return `${(
        number / 1000000
      ).toFixed(2)}M`;
    }

    if (number >= 1000) {
      return `${(
        number / 1000
      ).toFixed(1)}K`;
    }

    return number.toString();
  };


  // ==================================================
  // Load Video
  // ==================================================

  useEffect(() => {
    const loadVideo = async () => {
      try {
        setLoading(true);

        const data =
          await getVideoById(id);

        if (!data) {
          setVideo(null);
          return;
        }

        setVideo(data);


        // ============================================
        // Load Recommended Videos
        // ============================================

        try {
          const recommended =
            await searchVideos(
              data.title
            );

          setRecommendedVideos(
            recommended.filter(
              (item) =>
                item.id !== id
            )
          );
        } catch (error) {
          console.error(
            "Error loading recommendations:",
            error
          );

          setRecommendedVideos([]);
        }


        // ============================================
        // Check Subscription
        // ============================================

        const subscriptions =
          JSON.parse(
            localStorage.getItem(
              "subscribedChannels"
            )
          ) || [];

        const isSubscribed =
          subscriptions.some(
            (channel) =>
              channel.id ===
              data.channelId
          );

        setSubscribed(
          isSubscribed
        );


        // ============================================
        // Check Like / Dislike
        // ============================================

        const likedVideos =
          JSON.parse(
            localStorage.getItem(
              "likedVideos"
            )
          ) || [];

        const dislikedVideos =
          JSON.parse(
            localStorage.getItem(
              "dislikedVideos"
            )
          ) || [];

        setLiked(
          likedVideos.some(
            (item) =>
              item.id === data.id
          )
        );

        setDisliked(
          dislikedVideos.some(
            (item) =>
              item.id === data.id
          )
        );


        // ============================================
        // Load Comments
        // ============================================

        const savedComments =
          JSON.parse(
            localStorage.getItem(
              `comments_${id}`
            )
          ) || [];

        setComments(
          savedComments
        );

      } catch (error) {
        console.error(
          "Error loading video:",
          error
        );
      } finally {
        setLoading(false);
      }
    };

    loadVideo();
  }, [id]);


  // ==================================================
  // Like
  // ==================================================

  const handleLike = () => {
    const likedVideos =
      JSON.parse(
        localStorage.getItem(
          "likedVideos"
        )
      ) || [];

    const dislikedVideos =
      JSON.parse(
        localStorage.getItem(
          "dislikedVideos"
        )
      ) || [];


    if (liked) {
      // Remove Like

      const updated =
        likedVideos.filter(
          (item) =>
            item.id !== video.id
        );

      localStorage.setItem(
        "likedVideos",
        JSON.stringify(updated)
      );

      setLiked(false);

      setLikeCount(
        (prev) =>
          Math.max(0, prev - 1)
      );

    } else {
      // Add Like

      const updated =
        likedVideos.some(
          (item) =>
            item.id === video.id
        )
          ? likedVideos
          : [
              ...likedVideos,
              {
                ...video,
                image:
                  video.thumbnail,
              },
            ];

      localStorage.setItem(
        "likedVideos",
        JSON.stringify(updated)
      );

      setLiked(true);

      setLikeCount(
        (prev) =>
          prev + 1
      );


      // Remove Dislike
      if (disliked) {
        const updatedDisliked =
          dislikedVideos.filter(
            (item) =>
              item.id !==
              video.id
          );

        localStorage.setItem(
          "dislikedVideos",
          JSON.stringify(
            updatedDisliked
          )
        );

        setDisliked(false);

        setDislikeCount(
          (prev) =>
            Math.max(0, prev - 1)
        );
      }
    }
  };


  // ==================================================
  // Dislike
  // ==================================================

  const handleDislike = () => {
    const dislikedVideos =
      JSON.parse(
        localStorage.getItem(
          "dislikedVideos"
        )
      ) || [];

    const likedVideos =
      JSON.parse(
        localStorage.getItem(
          "likedVideos"
        )
      ) || [];


    if (disliked) {
      // Remove Dislike

      const updated =
        dislikedVideos.filter(
          (item) =>
            item.id !== video.id
        );

      localStorage.setItem(
        "dislikedVideos",
        JSON.stringify(updated)
      );

      setDisliked(false);

      setDislikeCount(
        (prev) =>
          Math.max(0, prev - 1)
      );

    } else {
      // Add Dislike

      const updated =
        dislikedVideos.some(
          (item) =>
            item.id === video.id
        )
          ? dislikedVideos
          : [
              ...dislikedVideos,
              {
                ...video,
                image:
                  video.thumbnail,
              },
            ];

      localStorage.setItem(
        "dislikedVideos",
        JSON.stringify(updated)
      );

      setDisliked(true);

      setDislikeCount(
        (prev) =>
          prev + 1
      );


      // Remove Like
      if (liked) {
        const updatedLiked =
          likedVideos.filter(
            (item) =>
              item.id !==
              video.id
          );

        localStorage.setItem(
          "likedVideos",
          JSON.stringify(
            updatedLiked
          )
        );

        setLiked(false);

        setLikeCount(
          (prev) =>
            Math.max(0, prev - 1)
        );
      }
    }
  };


  // ==================================================
  // Subscribe
  // ==================================================

  const handleSubscribe = () => {
    const subscriptions =
      JSON.parse(
        localStorage.getItem(
          "subscribedChannels"
        )
      ) || [];


    if (subscribed) {
      // Unsubscribe

      const updated =
        subscriptions.filter(
          (channel) =>
            channel.id !==
            video.channelId
        );

      localStorage.setItem(
        "subscribedChannels",
        JSON.stringify(updated)
      );

      setSubscribed(false);

    } else {
      // Subscribe

      const alreadyExists =
        subscriptions.some(
          (channel) =>
            channel.id ===
            video.channelId
        );

      if (!alreadyExists) {
        const updated = [
          ...subscriptions,
          {
            id: video.channelId,
            name: video.channel,
          },
        ];

        localStorage.setItem(
          "subscribedChannels",
          JSON.stringify(updated)
        );
      }

      setSubscribed(true);
    }
  };


  // ==================================================
  // Share
  // ==================================================

  const handleShare = async () => {
    const url =
      window.location.href;

    try {
      await navigator.clipboard.writeText(
        url
      );

      alert(
        "Video link copied!"
      );
    } catch (error) {
      console.error(
        "Unable to copy link:",
        error
      );
    }
  };


  // ==================================================
  // Download
  // ==================================================

  const handleDownload = () => {
    alert(
      "YouTube videos cannot be directly downloaded from this website."
    );
  };


  // ==================================================
  // Add Comment
  // ==================================================

  const handleComment = () => {
    if (!commentText.trim()) {
      return;
    }

    const newComment = {
      id: Date.now(),

      name: "You",

      text: commentText.trim(),

      date: new Date().toLocaleString(),
    };


    const updatedComments = [
      newComment,
      ...comments,
    ];

    setComments(
      updatedComments
    );

    localStorage.setItem(
      `comments_${id}`,
      JSON.stringify(
        updatedComments
      )
    );

    setCommentText("");
  };


  // ==================================================
  // Delete Comment
  // ==================================================

  const handleDeleteComment = (
    commentId
  ) => {
    const updated =
      comments.filter(
        (comment) =>
          comment.id !==
          commentId
      );

    setComments(updated);

    localStorage.setItem(
      `comments_${id}`,
      JSON.stringify(updated)
    );
  };


  // ==================================================
  // Loading
  // ==================================================

  if (loading) {
    return (
      <div className="watch-page">

        <Navbar />

        <main className="main-content">

          <p className="page-message">
            Loading video...
          </p>

        </main>

      </div>
    );
  }


  // ==================================================
  // Video Not Found
  // ==================================================

  if (!video) {
    return (
      <div className="watch-page">

        <Navbar />

        <main className="main-content">

          <p className="page-message">
            Video not found.
          </p>

          <Link to="/">
            Go back to Home
          </Link>

        </main>

      </div>
    );
  }


  // ==================================================
  // Watch Page
  // ==================================================

  return (
    <div className="watch-page">
      <Navbar />

      <main className="watch-content">

        {/* ==========================================
            TOP WATCH AREA
        ========================================== */}

        <div className="watch-main-layout">

          {/* ========================================
              LEFT SIDE
          ======================================== */}

          <div className="watch-left">

            {/* Video Player */}
            <div className="video-player">
              <iframe
                src={`https://www.youtube.com/embed/${video.id}?autoplay=1&rel=0`}
                title={video.title}
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
              />
            </div>

            {/* Video Title */}
            <h1 className="watch-title">
              {video.title}
            </h1>

            {/* Channel + Actions */}
            <div className="watch-info">

              {/* Channel */}
              <div className="watch-channel">

                <Link
                  to={`/channel/${video.channelId}`}
                  className="watch-channel-link"
                >

                  <div className="watch-channel-avatar">
                    {video.channelImage ? (
                      <img
                        src={video.channelImage}
                        alt={video.channel}
                        onError={(e) => {
                          e.currentTarget.style.display =
                            "none";
                        }}
                      />
                    ) : (
                      <div className="channel-avatar-fallback">
                        {video.channel
                          ?.charAt(0)
                          .toUpperCase() || "C"}
                      </div>
                    )}
                  </div>

                  <div className="watch-channel-details">

                    <h3>
                      {video.channel}
                    </h3>

                    <p>
                      {formatNumber(
                        video.subscribers
                      )}{" "}
                      subscribers
                    </p>

                  </div>

                </Link>

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

                <button
                  onClick={handleLike}
                  className={
                    liked
                      ? "action-btn active"
                      : "action-btn"
                  }
                >
                  <ThumbsUp size={22} />

                  <span>
                    {formatNumber(likeCount)}
                  </span>
                </button>

                <button
                  onClick={handleDislike}
                  className={
                    disliked
                      ? "action-btn active"
                      : "action-btn"
                  }
                >
                  <ThumbsDown size={22} />

                  <span>
                    {formatNumber(dislikeCount)}
                  </span>
                </button>

                <button
                  onClick={handleShare}
                  className="action-btn"
                >
                  <Share2 size={22} />

                  <span>
                    Share
                  </span>
                </button>

                <button
                  onClick={handleDownload}
                  className="action-btn"
                >
                  <Download size={22} />

                  <span>
                    Download
                  </span>
                </button>

              </div>

            </div>

            {/* Video Information */}
            <div className="video-description">

              <strong>
                {formatNumber(video.views)} views
              </strong>

              <p>
                Watch this video and learn
                something new.
              </p>

            </div>

          </div>


          {/* ========================================
              RIGHT SIDE - RECOMMENDED
          ======================================== */}

          <aside className="watch-recommended">

            <h2>
              Recommended Videos
            </h2>

            {recommendedVideos.length === 0 ? (
              <p className="page-message">
                No recommended videos available.
              </p>
            ) : (
              <VideoGrid
                videos={recommendedVideos}
              />
            )}

          </aside>

        </div>


        {/* ==========================================
            COMMENTS
        ========================================== */}

        <div className="comments-section">

          <h2>
            Comments
          </h2>

          {/* Add Comment */}
          <div className="comment-input">

            <input
              type="text"
              placeholder="Add a comment..."
              value={commentText}
              onChange={(e) =>
                setCommentText(e.target.value)
              }
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleComment();
                }
              }}
            />

            <button
              onClick={handleComment}
            >
              Comment
            </button>

          </div>

          {/* Comment List */}
          <div className="comment-list">

            {comments.length === 0 ? (
              <p className="page-message">
                No comments yet.
              </p>
            ) : (
              comments.map((comment) => (
                <div
                  className="comment"
                  key={comment.id}
                >

                  <div className="comment-avatar">
                    Y
                  </div>

                  <div className="comment-content">

                    <div className="comment-header">

                      <strong>
                        {comment.name}
                      </strong>

                      <span>
                        {comment.date}
                      </span>

                    </div>

                    <p>
                      {comment.text}
                    </p>

                    <button
                      className="delete-comment"
                      onClick={() =>
                        handleDeleteComment(
                          comment.id
                        )
                      }
                    >
                      <Trash2 size={16} />
                      Delete
                    </button>

                  </div>

                </div>
              ))
            )}

          </div>

        </div>

      </main>

    </div>
  );
}

export default Watch;