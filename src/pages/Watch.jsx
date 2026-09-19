import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import {
  ThumbsUp,
  ThumbsDown,
  Share2,
  Download,
  Trash2,
  Clock,
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
  const [error, setError] = useState(null);

  const [recommendedVideos, setRecommendedVideos] =
    useState([]);

  const [recommendedError, setRecommendedError] =
    useState(null);

  const [liked, setLiked] = useState(false);
  const [disliked, setDisliked] = useState(false);
  const [watchLater, setWatchLater] = useState(false);

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

  const loadVideo = async () => {
    try {
      setLoading(true);
      setError(null);

      const data =
        await getVideoById(id);

      if (!data) {
        setVideo(null);

        setError(
          "Video information could not be loaded."
        );

        return;
      }

      setVideo(data);

      // ============================================
      // Load Recommended Videos
      // ============================================

      try {
        setRecommendedError(null);

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

        setRecommendedError(
          error?.message ||
            "Unable to load recommended videos."
        );
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

      const getVideoId = (item) => {
        if (typeof item === "string") {
          return item;
        }

        return item?.id;
      };

      setLiked(
        likedVideos.some(
          (item) =>
            getVideoId(item) === data.id
        )
      );


      // ============================================
      // Check Watch Later
      // ============================================

      const savedWatchLater =
        JSON.parse(
          localStorage.getItem("watchLater")
        ) || [];

      const isWatchLater =
        savedWatchLater.some((item) => {
          if (typeof item === "string") {
            return item === data.id;
          }

          return item?.id === data.id;
        });

      setWatchLater(isWatchLater);


      setDisliked(
        dislikedVideos.some(
          (item) =>
            getVideoId(item) === data.id
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

      setVideo(null);

      setError(
        error?.message ||
          "Unable to load video. Please try again."
      );

    } finally {
      setLoading(false);
    }
  };


  useEffect(() => {
    if (id) {
      loadVideo();
    }
  }, [id]);


  // ==================================================
  // Like
  // ==================================================

  const handleLike = () => {
    const likedVideos =
      JSON.parse(
        localStorage.getItem("likedVideos")
      ) || [];

    const dislikedVideos =
      JSON.parse(
        localStorage.getItem("dislikedVideos")
      ) || [];

    const getVideoId = (item) => {
      if (typeof item === "string") {
        return item;
      }

      return item?.id;
    };

    if (liked) {
      const updatedLikedVideos =
        likedVideos.filter(
          (item) =>
            getVideoId(item) !== video.id
        );

      localStorage.setItem(
        "likedVideos",
        JSON.stringify(updatedLikedVideos)
      );

      setLiked(false);

      setLikeCount((prev) =>
        Math.max(0, prev - 1)
      );
    } else {
      const alreadyLiked =
        likedVideos.some(
          (item) =>
            getVideoId(item) === video.id
        );

      let updatedLikedVideos;

      if (alreadyLiked) {
        updatedLikedVideos = likedVideos;
      } else {
        updatedLikedVideos = [
          {
            ...video,
            image:
              video.thumbnail ||
              video.image,
          },
          ...likedVideos.filter(
            (item) =>
              getVideoId(item) !== video.id
          ),
        ];
      }

      localStorage.setItem(
        "likedVideos",
        JSON.stringify(updatedLikedVideos)
      );

      setLiked(true);

      if (!alreadyLiked) {
        setLikeCount((prev) =>
          prev + 1
        );
      }

      if (disliked) {
        const updatedDislikedVideos =
          dislikedVideos.filter(
            (item) =>
              getVideoId(item) !== video.id
          );

        localStorage.setItem(
          "dislikedVideos",
          JSON.stringify(
            updatedDislikedVideos
          )
        );

        setDisliked(false);

        setDislikeCount((prev) =>
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
  // Watch Later
  // ==================================================

  const handleWatchLater = () => {
    const savedWatchLater =
      JSON.parse(
        localStorage.getItem("watchLater")
      ) || [];

    const getVideoId = (item) => {
      if (typeof item === "string") {
        return item;
      }

      return item?.id;
    };

    if (watchLater) {
      const updatedWatchLater =
        savedWatchLater.filter(
          (item) =>
            getVideoId(item) !== video.id
        );

      localStorage.setItem(
        "watchLater",
        JSON.stringify(updatedWatchLater)
      );

      setWatchLater(false);

      alert(
        "Removed from Watch Later"
      );
    } else {
      const alreadySaved =
        savedWatchLater.some(
          (item) =>
            getVideoId(item) === video.id
        );

      if (!alreadySaved) {
        const updatedWatchLater = [
          {
            ...video,
            image:
              video.thumbnail ||
              video.image,
          },
          ...savedWatchLater,
        ];

        localStorage.setItem(
          "watchLater",
          JSON.stringify(
            updatedWatchLater
          )
        );
      }

      setWatchLater(true);

      alert(
        "Added to Watch Later"
      );
    }
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
  // API Error
  // ==================================================

  if (error) {
    return (
      <div className="watch-page">

        <Navbar />

        <main className="main-content">

          <div className="page-message">

            <h2>
              Something went wrong
            </h2>

            <p>
              {error}
            </p>

            <button
              onClick={loadVideo}
              style={{
                marginTop: "15px",
                padding: "10px 18px",
                border: "none",
                borderRadius: "8px",
                cursor: "pointer",
                fontWeight: "600",
              }}
            >
              Try Again
            </button>

          </div>

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
                src={`https://www.youtube.com/embed/${video.id}?autoplay=${
                  localStorage.getItem("autoplay") !== "false"
                    ? "1"
                    : "0"
                }&mute=${
                  localStorage.getItem("defaultMute") === "true"
                    ? "1"
                    : "0"
                }&rel=0`}
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


                <button
                  onClick={handleWatchLater}
                  className={
                    watchLater
                      ? "action-btn active"
                      : "action-btn"
                  }
                >
                  <Clock size={22} />

                  <span>
                    {watchLater
                      ? "Saved"
                      : "Watch later"}
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

            {recommendedError ? (

              <div className="page-message">

                <p>
                  {recommendedError}
                </p>

              </div>

            ) : recommendedVideos.length === 0 ? (

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