import { useEffect, useRef, useState } from "react";
import {
  useParams,
  Link,
  useNavigate,
  useSearchParams,
} from "react-router-dom";

import {
  ThumbsUp,
  ThumbsDown,
  Share2,
  Download,
  Trash2,
  Clock,
  ListPlus,
  X,
} from "lucide-react";

import {
  getVideoById,
  searchVideos,
} from "../services/videoApi";

import VideoGrid from "../components/VideoGrid";
import Navbar from "../components/Navbar";

function Watch() {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const playlistId = searchParams.get("playlist");
  const navigate = useNavigate();

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

  const [showPlaylistModal, setShowPlaylistModal] =
    useState(false);

  const [playlists, setPlaylists] = useState([]);

  const [newPlaylistName, setNewPlaylistName] =
    useState("");

  const [newPlaylistDescription, setNewPlaylistDescription] =
    useState("");

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

  const [editingCommentId, setEditingCommentId] =
    useState(null);

  const [editingCommentText, setEditingCommentText] =
    useState("");

  const [replyingToCommentId, setReplyingToCommentId] =
    useState(null);

  const [replyText, setReplyText] =
    useState("");

  const iframeRef = useRef(null);
  const playerRef = useRef(null);
  const recommendedVideosRef = useRef([]);
  const playlistVideosRef = useRef([]);

  // ==================================================
  // Format Numbers
  // ==================================================

  const formatNumber = (value) => {
    const number = Number(value) || 0;

    if (number >= 1000000000) {
      return `${(number / 1000000000).toFixed(2)}B`;
    }

    if (number >= 1000000) {
      return `${(number / 1000000).toFixed(2)}M`;
    }

    if (number >= 1000) {
      return `${(number / 1000).toFixed(1)}K`;
    }

    return number.toString();
  };

  // ==================================================
  // Comment Count
  // ==================================================

  const totalCommentCount = comments.reduce(
    (total, comment) =>
      total +
      1 +
      (Array.isArray(comment.replies)
        ? comment.replies.length
        : 0),
    0
  );

  // ==================================================
  // Load Video
  // ==================================================

  const loadVideo = async () => {
    try {
      setLoading(true);
      setError(null);

      const data = await getVideoById(id);

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
          await searchVideos(data.title);

        setRecommendedVideos(
          recommended.filter(
            (item) => item.id !== id
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
            channel.id === data.channelId
        );

      setSubscribed(isSubscribed);

      // ============================================
      // Check Like / Dislike
      // ============================================

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

      setComments(savedComments);
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

    setShowPlaylistModal(false);
  }, [id]);

  // ==================================================
  // Load Playlists
  // ==================================================

  useEffect(() => {
    try {
      const savedPlaylists =
        JSON.parse(
          localStorage.getItem("playlists")
        ) || [];

      setPlaylists(
        Array.isArray(savedPlaylists)
          ? savedPlaylists
          : []
      );
    } catch (error) {
      console.error(
        "Playlist loading error:",
        error
      );

      setPlaylists([]);
    }
  }, []);

  // ==================================================
  // Playlist Playback
  // ==================================================

  useEffect(() => {
    if (!playlistId) {
      playlistVideosRef.current = [];
      return;
    }

    try {
      const savedPlaylists =
        JSON.parse(
          localStorage.getItem("playlists")
        ) || [];

      const currentPlaylist =
        savedPlaylists.find(
          (playlist) =>
            playlist.id === playlistId
        );

      playlistVideosRef.current =
        Array.isArray(
          currentPlaylist?.videos
        )
          ? currentPlaylist.videos
          : [];
    } catch (error) {
      console.error(
        "Playlist playback error:",
        error
      );

      playlistVideosRef.current = [];
    }
  }, [playlistId, id]);

  // ==================================================
  // YouTube Player + Autoplay Next
  // ==================================================

  useEffect(() => {
    recommendedVideosRef.current =
      recommendedVideos;
  }, [recommendedVideos]);

  useEffect(() => {
    if (!video?.id) {
      return;
    }

    const initializePlayer = () => {
      if (
        !window.YT ||
        !window.YT.Player ||
        !iframeRef.current
      ) {
        return;
      }

      if (playerRef.current) {
        try {
          playerRef.current.destroy();
        } catch {
          // Ignore player cleanup errors
        }
      }

      playerRef.current =
        new window.YT.Player(
          iframeRef.current,
          {
            events: {
              onStateChange: (event) => {
                if (
                  event.data ===
                    window.YT.PlayerState.ENDED &&
                  localStorage.getItem(
                    "autoplay"
                  ) !== "false"
                ) {
                  const playlistVideos =
                    playlistVideosRef.current;

                  if (
                    playlistVideos.length > 0
                  ) {
                    const currentIndex =
                      playlistVideos.findIndex(
                        (item) =>
                          item?.id ===
                          video?.id
                      );

                    const nextVideo =
                      playlistVideos[
                        currentIndex + 1
                      ];

                    if (nextVideo?.id) {
                      navigate(
                        `/watch/${nextVideo.id}?playlist=${playlistId}`
                      );

                      return;
                    }
                  }

                  const nextVideo =
                    recommendedVideosRef
                      .current[0];

                  if (nextVideo?.id) {
                    navigate(
                      `/watch/${nextVideo.id}`
                    );
                  }
                }
              },
            },
          }
        );
    };

    if (
      window.YT &&
      window.YT.Player
    ) {
      initializePlayer();
      return;
    }

    let script =
      document.getElementById(
        "youtube-iframe-api"
      );

    if (!script) {
      script =
        document.createElement(
          "script"
        );

      script.id =
        "youtube-iframe-api";

      script.src =
        "https://www.youtube.com/iframe_api";

      document.body.appendChild(
        script
      );
    }

    const previousCallback =
      window.onYouTubeIframeAPIReady;

    window.onYouTubeIframeAPIReady =
      () => {
        if (previousCallback) {
          previousCallback();
        }

        initializePlayer();
      };

    return () => {
      if (
        window.onYouTubeIframeAPIReady ===
        initializePlayer
      ) {
        window.onYouTubeIframeAPIReady =
          previousCallback;
      }

      if (playerRef.current) {
        try {
          playerRef.current.destroy();
        } catch {
          // Ignore player cleanup errors
        }

        playerRef.current = null;
      }
    };
  }, [video?.id, navigate]);

  // ==================================================
  // Next Video
  // ==================================================

  const handleNextVideo = () => {
    const playlistVideos =
      playlistVideosRef.current;

    if (playlistVideos.length > 0) {
      const currentIndex =
        playlistVideos.findIndex(
          (item) =>
            item?.id === video?.id
        );

      const nextVideo =
        playlistVideos[
          currentIndex + 1
        ];

      if (nextVideo?.id) {
        navigate(
          `/watch/${nextVideo.id}?playlist=${playlistId}`
        );

        return;
      }
    }

    const nextVideo =
      recommendedVideos[0];

    if (!nextVideo?.id) {
      return;
    }

    navigate(
      `/watch/${nextVideo.id}`
    );
  };

  const handlePreviousVideo = () => {
    const playlistVideos =
      playlistVideosRef.current;

    if (playlistVideos.length === 0) {
      return;
    }

    const currentIndex =
      playlistVideos.findIndex(
        (item) =>
          item?.id === video?.id
      );

    const previousVideo =
      playlistVideos[
        currentIndex - 1
      ];

    if (!previousVideo?.id) {
      return;
    }

    navigate(
      `/watch/${previousVideo.id}?playlist=${playlistId}`
    );
  };

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
            getVideoId(item) !==
            video.id
        );

      localStorage.setItem(
        "likedVideos",
        JSON.stringify(
          updatedLikedVideos
        )
      );

      setLiked(false);

      setLikeCount((prev) =>
        Math.max(0, prev - 1)
      );
    } else {
      const alreadyLiked =
        likedVideos.some(
          (item) =>
            getVideoId(item) ===
            video.id
        );

      let updatedLikedVideos;

      if (alreadyLiked) {
        updatedLikedVideos =
          likedVideos;
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
              getVideoId(item) !==
              video.id
          ),
        ];
      }

      localStorage.setItem(
        "likedVideos",
        JSON.stringify(
          updatedLikedVideos
        )
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
              getVideoId(item) !==
              video.id
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
              item.id !== video.id
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
        localStorage.getItem(
          "watchLater"
        )
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
            getVideoId(item) !==
            video.id
        );

      localStorage.setItem(
        "watchLater",
        JSON.stringify(
          updatedWatchLater
        )
      );

      setWatchLater(false);

      alert(
        "Removed from Watch Later"
      );
    } else {
      const alreadySaved =
        savedWatchLater.some(
          (item) =>
            getVideoId(item) ===
            video.id
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
  // Playlist
  // ==================================================

  const savePlaylists = (
    updatedPlaylists
  ) => {
    localStorage.setItem(
      "playlists",
      JSON.stringify(
        updatedPlaylists
      )
    );

    setPlaylists(
      updatedPlaylists
    );
  };

  const handleAddToPlaylist = (
    playlistId
  ) => {
    if (!video) {
      return;
    }

    const currentPlaylists =
      JSON.parse(
        localStorage.getItem(
          "playlists"
        )
      ) || [];

    const updatedPlaylists =
      currentPlaylists.map(
        (playlist) => {
          if (
            playlist.id !==
            playlistId
          ) {
            return playlist;
          }

          const existingVideos =
            Array.isArray(
              playlist.videos
            )
              ? playlist.videos
              : [];

          const alreadyExists =
            existingVideos.some(
              (item) =>
                item?.id ===
                video.id
            );

          if (alreadyExists) {
            return playlist;
          }

          return {
            ...playlist,
            videos: [
              ...existingVideos,
              {
                ...video,
                image:
                  video.thumbnail ||
                  video.image,
              },
            ],
          };
        }
      );

    savePlaylists(
      updatedPlaylists
    );

    setShowPlaylistModal(false);

    const selectedPlaylist =
      updatedPlaylists.find(
        (playlist) =>
          playlist.id ===
          playlistId
      );

    const wasAlreadyAdded =
      currentPlaylists
        .find(
          (playlist) =>
            playlist.id ===
            playlistId
        )
        ?.videos?.some(
          (item) =>
            item?.id ===
            video.id
        );

    alert(
      wasAlreadyAdded
        ? `Already in ${
            selectedPlaylist?.name ||
            "playlist"
          }`
        : `Added to ${
            selectedPlaylist?.name ||
            "playlist"
          }`
    );
  };

  const handleCreatePlaylist = () => {
    const name =
      newPlaylistName.trim();

    if (!name) {
      alert(
        "Please enter a playlist name."
      );

      return;
    }

    const currentPlaylists =
      JSON.parse(
        localStorage.getItem(
          "playlists"
        )
      ) || [];

    const alreadyExists =
      currentPlaylists.some(
        (playlist) =>
          playlist.name?.toLowerCase() ===
          name.toLowerCase()
      );

    if (alreadyExists) {
      alert(
        "A playlist with this name already exists."
      );

      return;
    }

    const newPlaylist = {
      id: `playlist-${Date.now()}`,
      name,
      description:
        newPlaylistDescription.trim(),
      videos: video
        ? [
            {
              ...video,
              image:
                video.thumbnail ||
                video.image,
            },
          ]
        : [],
      createdAt:
        new Date().toISOString(),
    };

    const updatedPlaylists = [
      newPlaylist,
      ...currentPlaylists,
    ];

    savePlaylists(
      updatedPlaylists
    );

    setNewPlaylistName("");
    setNewPlaylistDescription("");
    setShowPlaylistModal(false);

    alert(
      `Playlist "${name}" created and video added.`
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
      likes: 0,
      liked: false,
      replies: [],
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
  // Edit Comment
  // ==================================================

  const handleEditComment = (
    commentId
  ) => {
    const comment =
      comments.find(
        (item) =>
          item.id ===
          commentId
      );

    if (!comment) {
      return;
    }

    setEditingCommentId(
      commentId
    );

    setEditingCommentText(
      comment.text || ""
    );
  };

  const handleSaveEditedComment = (
    commentId
  ) => {
    const updatedText =
      editingCommentText.trim();

    if (!updatedText) {
      return;
    }

    const updatedComments =
      comments.map(
        (comment) =>
          comment.id ===
          commentId
            ? {
                ...comment,
                text: updatedText,
                edited: true,
              }
            : comment
      );

    setComments(
      updatedComments
    );

    localStorage.setItem(
      `comments_${id}`,
      JSON.stringify(
        updatedComments
      )
    );

    setEditingCommentId(null);
    setEditingCommentText("");
  };

  const handleCancelEditComment =
    () => {
      setEditingCommentId(null);
      setEditingCommentText("");
    };

  // ==================================================
  // Like Comment
  // ==================================================

  const handleLikeComment = (
    commentId
  ) => {
    const updatedComments =
      comments.map(
        (comment) => {
          if (
            comment.id !==
            commentId
          ) {
            return comment;
          }

          const alreadyLiked =
            comment.liked === true;

          return {
            ...comment,
            liked: !alreadyLiked,
            likes:
              Math.max(
                0,
                Number(
                  comment.likes
                ) || 0
              ) +
              (alreadyLiked
                ? -1
                : 1),
          };
        }
      );

    setComments(
      updatedComments
    );

    localStorage.setItem(
      `comments_${id}`,
      JSON.stringify(
        updatedComments
      )
    );
  };

  // ==================================================
  // Reply to Comment
  // ==================================================

  const handleReply = (
    commentId
  ) => {
    if (!replyText.trim()) {
      return;
    }

    const newReply = {
      id: Date.now(),
      name: "You",
      text: replyText.trim(),
      date: new Date().toLocaleString(),
    };

    const updatedComments =
      comments.map(
        (comment) => {
          if (
            comment.id !==
            commentId
          ) {
            return comment;
          }

          return {
            ...comment,
            replies: [
              ...(Array.isArray(
                comment.replies
              )
                ? comment.replies
                : []),
              newReply,
            ],
          };
        }
      );

    setComments(
      updatedComments
    );

    localStorage.setItem(
      `comments_${id}`,
      JSON.stringify(
        updatedComments
      )
    );

    setReplyText("");
    setReplyingToCommentId(
      null
    );
  };

  const handleDeleteReply = (
    commentId,
    replyId
  ) => {
    const updatedComments =
      comments.map(
        (comment) => {
          if (
            comment.id !==
            commentId
          ) {
            return comment;
          }

          return {
            ...comment,
            replies: (
              comment.replies ||
              []
            ).filter(
              (reply) =>
                reply.id !==
                replyId
            ),
          };
        }
      );

    setComments(
      updatedComments
    );

    localStorage.setItem(
      `comments_${id}`,
      JSON.stringify(
        updatedComments
      )
    );
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

    if (
      editingCommentId ===
      commentId
    ) {
      setEditingCommentId(null);
      setEditingCommentText("");
    }

    if (
      replyingToCommentId ===
      commentId
    ) {
      setReplyingToCommentId(
        null
      );

      setReplyText("");
    }
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

            <p>{error}</p>

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
            MAIN WATCH LAYOUT
        ========================================== */}

        <div className="watch-main-layout">

          {/* ========================================
              LEFT SIDE
          ======================================== */}

          <div className="watch-left">

            {/* Video Player */}

            <div className="video-player-wrapper">
              <div className="video-player">

                <iframe
                  ref={iframeRef}
                  src={`https://www.youtube.com/embed/${video.id}?autoplay=${
                    localStorage.getItem(
                      "autoplay"
                    ) !== "false"
                      ? "1"
                      : "0"
                  }&mute=${
                    localStorage.getItem(
                      "defaultMute"
                    ) === "true"
                      ? "1"
                      : "0"
                  }&rel=0&enablejsapi=1&origin=${window.location.origin}`}
                  title={video.title}
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                />

              </div>
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
                          .toUpperCase() ||
                          "C"}
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
                  onClick={
                    handleSubscribe
                  }
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
                    {formatNumber(
                      likeCount
                    )}
                  </span>
                </button>

                <button
                  onClick={
                    handleDislike
                  }
                  className={
                    disliked
                      ? "action-btn active"
                      : "action-btn"
                  }
                >
                  <ThumbsDown size={22} />

                  <span>
                    {formatNumber(
                      dislikeCount
                    )}
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
                  onClick={
                    handleDownload
                  }
                  className="action-btn"
                >
                  <Download size={22} />

                  <span>
                    Download
                  </span>
                </button>

                <button
                  onClick={() =>
                    setShowPlaylistModal(
                      true
                    )
                  }
                  className="action-btn"
                >
                  <ListPlus size={22} />

                  <span>
                    Save to playlist
                  </span>
                </button>

                <button
                  onClick={
                    handleWatchLater
                  }
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

                {playlistId &&
                  playlistVideosRef.current
                    .length > 0 && (
                    <button
                      onClick={
                        handlePreviousVideo
                      }
                      className="action-btn"
                    >
                      <span>
                        ◀ Previous
                      </span>
                    </button>
                  )}

                {(playlistId &&
                  playlistVideosRef.current
                    .length > 0) ||
                recommendedVideos.length >
                  0 ? (
                  <button
                    onClick={
                      handleNextVideo
                    }
                    className="action-btn"
                  >
                    <span>
                      Next ▶
                    </span>
                  </button>
                ) : null}

              </div>

            </div>

            {/* Playlist Modal */}

            {showPlaylistModal && (
              <div className="playlist-modal-overlay">

                <div className="playlist-modal">

                  <div className="playlist-modal-header">

                    <div>

                      <h2>
                        Save to playlist
                      </h2>

                      <p>
                        Choose a playlist for this video.
                      </p>

                    </div>

                    <button
                      className="playlist-modal-close"
                      onClick={() =>
                        setShowPlaylistModal(
                          false
                        )
                      }
                      aria-label="Close playlist modal"
                    >
                      <X size={20} />
                    </button>

                  </div>

                  <div className="playlist-list">

                    {playlists.length ===
                    0 ? (
                      <p className="playlist-empty-message">
                        No playlists yet. Create your first playlist below.
                      </p>
                    ) : (
                      playlists.map(
                        (playlist) => {
                          const alreadyAdded =
                            playlist.videos?.some(
                              (item) =>
                                item?.id ===
                                video.id
                            );

                          return (
                            <button
                              key={
                                playlist.id
                              }
                              className="playlist-select-item"
                              onClick={() =>
                                handleAddToPlaylist(
                                  playlist.id
                                )
                              }
                            >

                              <div>

                                <strong>
                                  {
                                    playlist.name
                                  }
                                </strong>

                                <span>
                                  {
                                    playlist
                                      .videos
                                      ?.length ||
                                    0
                                  }{" "}
                                  {(playlist
                                    .videos
                                    ?.length ||
                                    0) ===
                                  1
                                    ? "video"
                                    : "videos"}
                                </span>

                              </div>

                              <span className="playlist-status">
                                {alreadyAdded
                                  ? "Added"
                                  : "Add"}
                              </span>

                            </button>
                          );
                        }
                      )
                    )}

                  </div>

                  <div className="create-playlist-form">

                    <h3>
                      Create new playlist
                    </h3>

                    <input
                      type="text"
                      placeholder="Playlist name"
                      value={
                        newPlaylistName
                      }
                      onChange={(e) =>
                        setNewPlaylistName(
                          e.target.value
                        )
                      }
                    />

                    <textarea
                      placeholder="Description (optional)"
                      value={
                        newPlaylistDescription
                      }
                      onChange={(e) =>
                        setNewPlaylistDescription(
                          e.target.value
                        )
                      }
                      rows="3"
                    />

                    <button
                      className="create-playlist-btn"
                      onClick={
                        handleCreatePlaylist
                      }
                    >
                      Create playlist
                    </button>

                  </div>

                </div>

              </div>
            )}

            {/* Video Information */}

            <div className="video-description">

              <strong>
                {formatNumber(
                  video.views
                )}{" "}
                views
              </strong>

              <p>
                Watch this video and learn
                something new.
              </p>

            </div>

            {/* ==========================================
                COMMENTS
                MOVED INSIDE LEFT SIDE
            ========================================== */}

            <div className="comments-section">

              <div className="comments-title-row">

                <h2>
                  Comments
                </h2>

                <span className="comment-count-badge">
                  {totalCommentCount}{" "}
                  {totalCommentCount ===
                  1
                    ? "comment"
                    : "comments"}
                </span>

              </div>

              {/* Add Comment */}

              <div className="comment-input">

                <input
                  type="text"
                  placeholder="Add a comment..."
                  value={
                    commentText
                  }
                  onChange={(e) =>
                    setCommentText(
                      e.target.value
                    )
                  }
                  onKeyDown={(e) => {
                    if (
                      e.key ===
                      "Enter"
                    ) {
                      handleComment();
                    }
                  }}
                />

                <button
                  onClick={
                    handleComment
                  }
                >
                  Comment
                </button>

              </div>

              {/* Comment List */}

              <div className="comment-list">

                {comments.length ===
                0 ? (
                  <p className="page-message">
                    No comments yet.
                  </p>
                ) : (
                  comments.map(
                    (comment) => (
                      <div
                        className="comment"
                        key={
                          comment.id
                        }
                      >

                        <div className="comment-avatar">
                          Y
                        </div>

                        <div className="comment-content">

                          <div className="comment-header">

                            <strong>
                              {
                                comment.name
                              }
                            </strong>

                            <span>
                              {
                                comment.date
                              }
                            </span>

                          </div>

                          {editingCommentId ===
                          comment.id ? (
                            <div className="edit-comment-box">

                              <input
                                type="text"
                                value={
                                  editingCommentText
                                }
                                onChange={(
                                  e
                                ) =>
                                  setEditingCommentText(
                                    e.target.value
                                  )
                                }
                                onKeyDown={(
                                  e
                                ) => {
                                  if (
                                    e.key ===
                                    "Enter"
                                  ) {
                                    handleSaveEditedComment(
                                      comment.id
                                    );
                                  }

                                  if (
                                    e.key ===
                                    "Escape"
                                  ) {
                                    handleCancelEditComment();
                                  }
                                }}
                                autoFocus
                              />

                              <div className="edit-comment-actions">

                                <button
                                  className="save-comment-edit"
                                  onClick={() =>
                                    handleSaveEditedComment(
                                      comment.id
                                    )
                                  }
                                >
                                  Save
                                </button>

                                <button
                                  className="cancel-comment-edit"
                                  onClick={
                                    handleCancelEditComment
                                  }
                                >
                                  Cancel
                                </button>

                              </div>

                            </div>
                          ) : (
                            <p>

                              {
                                comment.text
                              }

                              {comment.edited && (
                                <span className="comment-edited">
                                  {" "}
                                  (edited)
                                </span>
                              )}

                            </p>
                          )}

                          <div className="comment-actions">

                            <button
                              className={
                                comment.liked
                                  ? "comment-like active"
                                  : "comment-like"
                              }
                              onClick={() =>
                                handleLikeComment(
                                  comment.id
                                )
                              }
                            >
                              <ThumbsUp size={15} />

                              <span>
                                {
                                  Number(
                                    comment.likes
                                  ) || 0
                                }
                              </span>

                            </button>

                            {editingCommentId !==
                              comment.id && (
                              <button
                                className="edit-comment"
                                onClick={() =>
                                  handleEditComment(
                                    comment.id
                                  )
                                }
                              >
                                Edit
                              </button>
                            )}

                            {editingCommentId !==
                              comment.id && (
                              <button
                                className="reply-comment"
                                onClick={() => {
                                  setReplyingToCommentId(
                                    replyingToCommentId ===
                                      comment.id
                                      ? null
                                      : comment.id
                                  );

                                  setReplyText(
                                    ""
                                  );
                                }}
                              >
                                Reply
                              </button>
                            )}

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

                          {replyingToCommentId ===
                            comment.id && (
                            <div className="reply-input-box">

                              <input
                                type="text"
                                placeholder="Write a reply..."
                                value={
                                  replyText
                                }
                                onChange={(e) =>
                                  setReplyText(
                                    e.target.value
                                  )
                                }
                                onKeyDown={(e) => {
                                  if (
                                    e.key ===
                                    "Enter"
                                  ) {
                                    handleReply(
                                      comment.id
                                    );
                                  }

                                  if (
                                    e.key ===
                                    "Escape"
                                  ) {
                                    setReplyingToCommentId(
                                      null
                                    );

                                    setReplyText(
                                      ""
                                    );
                                  }
                                }}
                                autoFocus
                              />

                              <div className="reply-input-actions">

                                <button
                                  className="submit-reply"
                                  onClick={() =>
                                    handleReply(
                                      comment.id
                                    )
                                  }
                                >
                                  Reply
                                </button>

                                <button
                                  className="cancel-reply"
                                  onClick={() => {
                                    setReplyingToCommentId(
                                      null
                                    );

                                    setReplyText(
                                      ""
                                    );
                                  }}
                                >
                                  Cancel
                                </button>

                              </div>

                            </div>
                          )}

                          {(comment.replies ||
                            []).length >
                            0 && (
                            <div className="comment-replies">

                              {comment.replies.map(
                                (reply) => (
                                  <div
                                    className="comment-reply"
                                    key={
                                      reply.id
                                    }
                                  >

                                    <div className="comment-avatar reply-avatar">
                                      Y
                                    </div>

                                    <div className="reply-content">

                                      <div className="comment-header">

                                        <strong>
                                          {
                                            reply.name
                                          }
                                        </strong>

                                        <span>
                                          {
                                            reply.date
                                          }
                                        </span>

                                      </div>

                                      <p>
                                        {
                                          reply.text
                                        }
                                      </p>

                                      <button
                                        className="delete-reply"
                                        onClick={() =>
                                          handleDeleteReply(
                                            comment.id,
                                            reply.id
                                          )
                                        }
                                      >
                                        <Trash2 size={14} />

                                        Delete
                                      </button>

                                    </div>

                                  </div>
                                )
                              )}

                            </div>
                          )}

                        </div>

                      </div>
                    )
                  )
                )}

              </div>

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

            ) : recommendedVideos.length ===
              0 ? (

              <p className="page-message">
                No recommended videos available.
              </p>

            ) : (

              <VideoGrid
                videos={
                  recommendedVideos
                }
              />

            )}

          </aside>

        </div>

      </main>

    </div>
  );
}

export default Watch;