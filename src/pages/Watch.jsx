import { useEffect, useRef, useState, useCallback } from "react";
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
import Sidebar from "../components/Sidebar";

function Watch() {
  const { id } = useParams();
  const [searchParams] = useSearchParams();

  const playlistId = searchParams.get("playlist");

  const navigate = useNavigate();

  // ==================================================
  // STATES
  // ==================================================

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

  const [
    newPlaylistDescription,
    setNewPlaylistDescription,
  ] = useState("");

  const [likeCount, setLikeCount] = useState(1200);

  const [dislikeCount, setDislikeCount] =
    useState(25);

  const [subscribed, setSubscribed] = useState(false);

  const [comments, setComments] = useState([]);

  const [commentText, setCommentText] =
    useState("");

  const [editingCommentId, setEditingCommentId] =
    useState(null);

  const [editingCommentText, setEditingCommentText] =
    useState("");

  const [
    replyingToCommentId,
    setReplyingToCommentId,
  ] = useState(null);

  const [replyText, setReplyText] = useState("");

  // ==================================================
  // REFS
  // ==================================================

  const iframeRef = useRef(null);

  const playerRef = useRef(null);

  const recommendedVideosRef = useRef([]);

  const playlistVideosRef = useRef([]);

  // ==================================================
  // FORMAT NUMBER
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
  // SAVE HISTORY
  // ==================================================

  const saveHistory = useCallback(() => {
    if (!video?.id) {
      return;
    }

    try {
      const savedHistory =
        JSON.parse(
          localStorage.getItem("history")
        ) || [];

      const historyItem = {
        ...video,

        image:
          video.thumbnail ||
          video.image,

        watchedAt: Date.now(),
      };

      const updatedHistory = [
        historyItem,

        ...savedHistory.filter(
          (item) =>
            (typeof item === "string"
              ? item
              : item?.id) !== video.id
        ),
      ].slice(0, 50);

      localStorage.setItem(
        "history",
        JSON.stringify(updatedHistory)
      );

      window.dispatchEvent(
        new Event("activityUpdated")
      );
    } catch (error) {
      console.error(
        "History save error:",
        error
      );
    }
  }, [video]);

  // ==================================================
  // CONTINUE WATCHING
  // ==================================================

  const saveContinueWatching = useCallback(() => {
    if (!video || !playerRef.current) {
      return;
    }

    try {
      if (
        typeof playerRef.current.getCurrentTime !==
        "function"
      ) {
        return;
      }

      if (
        typeof playerRef.current.getDuration !==
        "function"
      ) {
        return;
      }

      const currentTime =
        playerRef.current.getCurrentTime();

      const duration =
        playerRef.current.getDuration();

      if (
        !duration ||
        duration <= 0 ||
        currentTime <= 2
      ) {
        return;
      }

      const saved =
        JSON.parse(
          localStorage.getItem(
            "continueWatching"
          )
        ) || [];

      if (currentTime >= duration - 10) {
        const updated = saved.filter(
          (item) =>
            item?.id !== video.id
        );

        localStorage.setItem(
          "continueWatching",
          JSON.stringify(updated)
        );

        return;
      }

      const continueVideo = {
        ...video,

        image:
          video.thumbnail ||
          video.image,

        currentTime,

        duration,

        progress:
          (currentTime / duration) * 100,

        updatedAt: Date.now(),
      };

      const updated = [
        continueVideo,

        ...saved.filter(
          (item) =>
            item?.id !== video.id
        ),
      ].slice(0, 10);

      localStorage.setItem(
        "continueWatching",
        JSON.stringify(updated)
      );
    } catch (error) {
      console.error(
        "Continue Watching save error:",
        error
      );
    }
  }, [video]);

  // ==================================================
  // COMMENT COUNT
  // ==================================================

  const totalCommentCount =
    comments.reduce(
      (total, comment) =>
        total +
        1 +
        (Array.isArray(comment.replies)
          ? comment.replies.length
          : 0),
      0
    );

  // ==================================================
  // LOAD VIDEO
  // ==================================================

  const loadVideo = useCallback(async () => {
    if (!id) {
      return;
    }

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

      // ==================================================
      // RECOMMENDED VIDEOS
      // ==================================================

      try {
        setRecommendedError(null);

        const recommended =
          await searchVideos(data.title);

        const filtered =
          Array.isArray(recommended)
            ? recommended.filter(
                (item) => item.id !== id
              )
            : [];

        setRecommendedVideos(filtered);
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

      // ==================================================
      // SUBSCRIPTION
      // ==================================================

      try {
        const subscriptions =
          JSON.parse(
            localStorage.getItem(
              "subscribedChannels"
            )
          ) || [];

        const isSubscribed =
          subscriptions.some(
            (channel) =>
              channel?.id ===
              data.channelId
          );

        setSubscribed(isSubscribed);
      } catch (error) {
        console.error(
          "Subscription loading error:",
          error
        );

        setSubscribed(false);
      }

      // ==================================================
      // LIKE FROM BACKEND
      // ==================================================

      const token =
        localStorage.getItem(
          "videoVerseToken"
        );

      if (token) {
        try {
          const response =
            await fetch(
              "https://videoverse-content-platform.onrender.com/api/user/liked",
              {
                method: "GET",

                headers: {
                  Authorization: `Bearer ${token}`,
                },
              }
            );

          const likedData =
            await response.json();

          if (response.ok) {
            const likedIds =
              Array.isArray(
                likedData.likedVideos
              )
                ? likedData.likedVideos
                : [];

            setLiked(
              likedIds.includes(data.id)
            );

            // IMPORTANT:
            // localStorage contains ONLY IDs
            localStorage.setItem(
              "likedVideos",
              JSON.stringify(
                likedIds
              )
            );
          } else {
            setLiked(false);
          }
        } catch (error) {
          console.error(
            "Load liked videos error:",
            error
          );

          setLiked(false);
        }
      } else {
        setLiked(false);
      }

      // ==================================================
      // DISLIKE
      // ==================================================

      try {
        const dislikedVideos =
          JSON.parse(
            localStorage.getItem(
              "dislikedVideos"
            )
          ) || [];

        const getVideoId = (item) => {
          if (
            typeof item === "string"
          ) {
            return item;
          }

          return item?.id;
        };

        setDisliked(
          dislikedVideos.some(
            (item) =>
              getVideoId(item) ===
              data.id
          )
        );
      } catch (error) {
        console.error(
          "Dislike loading error:",
          error
        );

        setDisliked(false);
      }

      // ==================================================
      // WATCH LATER FROM BACKEND
      // ==================================================

      if (token) {
        try {
          const response =
            await fetch(
              "https://videoverse-content-platform.onrender.com/api/user/watch-later",
              {
                method: "GET",

                headers: {
                  Authorization: `Bearer ${token}`,
                },
              }
            );

          const watchLaterData =
            await response.json();

          if (response.ok) {
            const watchLaterIds =
              Array.isArray(
                watchLaterData.watchLater
              )
                ? watchLaterData.watchLater
                : [];

            setWatchLater(
              watchLaterIds.includes(
                data.id
              )
            );

            // Backend IDs ko local cache me rakho
            localStorage.setItem(
              "watchLater",
              JSON.stringify(
                watchLaterIds
              )
            );
          } else {
            setWatchLater(false);
          }
        } catch (error) {
          console.error(
            "Load watch later error:",
            error
          );

          setWatchLater(false);
        }
      } else {
        setWatchLater(false);
      }
      // ==================================================
      // COMMENTS
      // ==================================================

      try {
        const savedComments =
          JSON.parse(
            localStorage.getItem(
              `comments_${id}`
            )
          ) || [];

        setComments(
          Array.isArray(
            savedComments
          )
            ? savedComments
            : []
        );
      } catch (error) {
        console.error(
          "Comments loading error:",
          error
        );

        setComments([]);
      }
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
  }, [id]);

  // ==================================================
  // LOAD VIDEO WHEN ID CHANGES
  // ==================================================

  useEffect(() => {
    loadVideo();

    setShowPlaylistModal(false);
  }, [loadVideo]);

  // ==================================================
  // LOAD PLAYLISTS
  // ==================================================

  useEffect(() => {
    try {
      const savedPlaylists =
        JSON.parse(
          localStorage.getItem(
            "playlists"
          )
        ) || [];

      setPlaylists(
        Array.isArray(
          savedPlaylists
        )
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
  // PLAYLIST PLAYBACK
  // ==================================================

  useEffect(() => {
    if (!playlistId) {
      playlistVideosRef.current = [];

      return;
    }

    try {
      const savedPlaylists =
        JSON.parse(
          localStorage.getItem(
            "playlists"
          )
        ) || [];

      const currentPlaylist =
        savedPlaylists.find(
          (playlist) =>
            playlist.id ===
            playlistId
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
  // RECOMMENDED REF
  // ==================================================

  useEffect(() => {
    recommendedVideosRef.current =
      recommendedVideos;
  }, [recommendedVideos]);

  // ==================================================
  // YOUTUBE IFRAME PLAYER
  // ==================================================

  useEffect(() => {
    if (
      !video?.id ||
      !iframeRef.current
    ) {
      return;
    }

    let cancelled = false;

    const initializePlayer = () => {
      if (cancelled) {
        return;
      }

      if (
        !window.YT ||
        !window.YT.Player ||
        !iframeRef.current
      ) {
        return;
      }

      // Destroy previous player
      if (playerRef.current) {
        try {
          playerRef.current.destroy();
        } catch (error) {
          console.log(
            "Previous player cleanup:",
            error
          );
        }

        playerRef.current = null;
      }

      try {
        playerRef.current =
          new window.YT.Player(
            iframeRef.current,
            {
              videoId: video.id,

              playerVars: {
                autoplay: 0,
                controls: 1,
                rel: 0,
                modestbranding: 1,
                playsinline: 1,
                enablejsapi: 1,
                origin:
                  window.location.origin,
              },

              events: {
                // ======================================
                // PLAYER READY
                // ======================================

                onReady: (event) => {
                  try {
                    // Save to history
                    saveHistory();

                    // Resume Continue Watching
                    const saved =
                      JSON.parse(
                        localStorage.getItem(
                          "continueWatching"
                        )
                      ) || [];

                    const savedVideo =
                      saved.find(
                        (item) =>
                          item?.id ===
                          video.id
                      );

                    if (
                      savedVideo &&
                      Number(
                        savedVideo.currentTime
                      ) > 5
                    ) {
                      event.target.seekTo(
                        Number(
                          savedVideo.currentTime
                        ),
                        true
                      );
                    }
                  } catch (error) {
                    console.error(
                      "Player ready error:",
                      error
                    );
                  }
                },

                // ======================================
                // PLAYER STATE CHANGE
                // ======================================

                onStateChange: (event) => {
                  // PLAYING
                  if (
                    event.data ===
                    window.YT.PlayerState
                      .PLAYING
                  ) {
                    // Save history whenever playback starts
                    saveHistory();

                    return;
                  }

                  // PAUSED
                  if (
                    event.data ===
                    window.YT.PlayerState
                      .PAUSED
                  ) {
                    saveHistory();

                    saveContinueWatching();

                    return;
                  }

                  // ENDED
                  if (
                    event.data ===
                    window.YT.PlayerState
                      .ENDED
                  ) {
                    saveHistory();

                    // Remove completed video
                    try {
                      const saved =
                        JSON.parse(
                          localStorage.getItem(
                            "continueWatching"
                          )
                        ) || [];

                      const updated =
                        saved.filter(
                          (item) =>
                            item?.id !==
                            video.id
                        );

                      localStorage.setItem(
                        "continueWatching",
                        JSON.stringify(
                          updated
                        )
                      );
                    } catch (error) {
                      console.error(
                        "Continue Watching cleanup error:",
                        error
                      );
                    }

                    // Autoplay disabled
                    if (
                      localStorage.getItem(
                        "autoplay"
                      ) === "false"
                    ) {
                      return;
                    }

                    // ==================================
                    // PLAYLIST NEXT
                    // ==================================

                    const playlistVideos =
                      playlistVideosRef.current;

                    if (
                      playlistVideos.length >
                      0
                    ) {
                      const currentIndex =
                        playlistVideos.findIndex(
                          (item) =>
                            item?.id ===
                            video.id
                        );

                      const nextVideo =
                        playlistVideos[
                          currentIndex + 1
                        ];

                      if (
                        nextVideo?.id
                      ) {
                        navigate(
                          `/watch/${nextVideo.id}?playlist=${playlistId}`
                        );

                        return;
                      }
                    }

                    // ==================================
                    // RECOMMENDED NEXT
                    // ==================================

                    const nextVideo =
                      recommendedVideosRef
                        .current[0];

                    if (
                      nextVideo?.id
                    ) {
                      navigate(
                        `/watch/${nextVideo.id}`
                      );
                    }
                  }
                },

                onError: (event) => {
                  console.error(
                    "YouTube Player Error:",
                    event.data
                  );
                },
              },
            }
          );
      } catch (error) {
        console.error(
          "YouTube player initialization error:",
          error
        );
      }
    };

    // ==================================================
    // YOUTUBE API ALREADY LOADED
    // ==================================================

    if (
      window.YT &&
      window.YT.Player
    ) {
      initializePlayer();
    } else {
      // ==================================================
      // LOAD YOUTUBE IFRAME API
      // ==================================================

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

        script.async = true;

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
    }

    // ==================================================
    // CLEANUP
    // ==================================================

    return () => {
      cancelled = true;

      saveHistory();

      saveContinueWatching();

      if (
        playerRef.current
      ) {
        try {
          playerRef.current.destroy();
        } catch (error) {
          console.log(
            "Player destroy error:",
            error
          );
        }

        playerRef.current = null;
      }
    };
  }, [
    video?.id,
    navigate,
    playlistId,
    saveContinueWatching,
    saveHistory,
  ]);

  // ==================================================
  // AUTO SAVE EVERY 5 SECONDS
  // ==================================================

  useEffect(() => {
    if (!video?.id) {
      return;
    }

    const interval =
      setInterval(() => {
        saveContinueWatching();
      }, 5000);

    return () => {
      clearInterval(interval);
    };
  }, [
    video?.id,
    saveContinueWatching,
  ]);

  // ==================================================
  // SAVE BEFORE LEAVING PAGE
  // ==================================================

  useEffect(() => {
    const handleBeforeUnload =
      () => {
        saveHistory();

        saveContinueWatching();
      };

    window.addEventListener(
      "beforeunload",
      handleBeforeUnload
    );

    return () => {
      window.removeEventListener(
        "beforeunload",
        handleBeforeUnload
      );
    };
  }, [
    saveHistory,
    saveContinueWatching,
  ]);

  // ==================================================
  // NEXT VIDEO
  // ==================================================

  const handleNextVideo = () => {
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
      recommendedVideos[0];

    if (!nextVideo?.id) {
      return;
    }

    navigate(
      `/watch/${nextVideo.id}`
    );
  };

  // ==================================================
  // PREVIOUS VIDEO
  // ==================================================

  const handlePreviousVideo = () => {
    const playlistVideos =
      playlistVideosRef.current;

    if (
      playlistVideos.length ===
      0
    ) {
      return;
    }

    const currentIndex =
      playlistVideos.findIndex(
        (item) =>
          item?.id ===
          video?.id
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
  // LIKE
  // ==================================================

  const handleLike = async () => {
    if (!video?.id) {
      return;
    }

    const token =
      localStorage.getItem(
        "videoVerseToken"
      );

    // ==================================================
    // NOT LOGGED IN
    // ==================================================

    if (!token) {
      alert(
        "Please login to like videos."
      );

      return;
    }

    try {
      // ==================================================
      // UNLIKE
      // ==================================================

      if (liked) {
        const response =
          await fetch(
            `https://videoverse-content-platform.onrender.com/api/user/liked/${video.id}`,
            {
              method: "DELETE",

              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );

        const data =
          await response.json();

        if (!response.ok) {
          throw new Error(
            data.message ||
              "Unable to remove liked video"
          );
        }

        setLiked(false);

        setLikeCount(
          (prev) =>
            Math.max(
              0,
              prev - 1
            )
        );

        const likedIds =
          Array.isArray(
            data.likedVideos
          )
            ? data.likedVideos
            : [];

        // ONLY IDs
        localStorage.setItem(
          "likedVideos",
          JSON.stringify(
            likedIds
          )
        );

        window.dispatchEvent(
          new Event(
            "activityUpdated"
          )
        );

        return;
      }

      // ==================================================
      // LIKE
      // ==================================================

      const response =
        await fetch(
          "https://videoverse-content-platform.onrender.com/api/user/liked",
          {
            method: "POST",

            headers: {
              "Content-Type":
                "application/json",

              Authorization: `Bearer ${token}`,
            },

            body: JSON.stringify({
              videoId: video.id,
            }),
          }
        );

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Unable to like video"
        );
      }

      setLiked(true);

      setLikeCount(
        (prev) => prev + 1
      );

      const likedIds =
        Array.isArray(
          data.likedVideos
        )
          ? data.likedVideos
          : [];

      // ONLY IDs
      localStorage.setItem(
        "likedVideos",
        JSON.stringify(
          likedIds
        )
      );

      window.dispatchEvent(
        new Event(
          "activityUpdated"
        )
      );

      // ==================================================
      // REMOVE DISLIKE
      // ==================================================

      if (disliked) {
        try {
          const dislikedVideos =
            JSON.parse(
              localStorage.getItem(
                "dislikedVideos"
              )
            ) || [];

          const getVideoId =
            (item) =>
              typeof item ===
              "string"
                ? item
                : item?.id;

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

          setDislikeCount(
            (prev) =>
              Math.max(
                0,
                prev - 1
              )
          );
        } catch (error) {
          console.error(
            "Dislike update error:",
            error
          );
        }
      }
    } catch (error) {
      console.error(
        "Like video error:",
        error
      );

      alert(
        error?.message ||
          "Unable to update like."
      );
    }
  };

  // ==================================================
  // DISLIKE
  // ==================================================

  const handleDislike = () => {
    if (!video) {
      return;
    }

    const dislikedVideos =
      JSON.parse(
        localStorage.getItem(
          "dislikedVideos"
        )
      ) || [];

    const getVideoId = (item) => {
      if (
        typeof item ===
        "string"
      ) {
        return item;
      }

      return item?.id;
    };

    if (disliked) {
      const updated =
        dislikedVideos.filter(
          (item) =>
            getVideoId(item) !==
            video.id
        );

      localStorage.setItem(
        "dislikedVideos",
        JSON.stringify(updated)
      );

      setDisliked(false);

      setDislikeCount(
        (prev) =>
          Math.max(
            0,
            prev - 1
          )
      );

      return;
    }

    const alreadyDisliked =
      dislikedVideos.some(
        (item) =>
          getVideoId(item) ===
          video.id
      );

    if (!alreadyDisliked) {
      const updated = [
        ...dislikedVideos,

        {
          ...video,

          image:
            video.thumbnail ||
            video.image,
        },
      ];

      localStorage.setItem(
        "dislikedVideos",
        JSON.stringify(
          updated
        )
      );

      setDislikeCount(
        (prev) => prev + 1
      );
    }

    setDisliked(true);

    // ==================================================
    // REMOVE LIKE FROM BACKEND
    // ==================================================

    const token =
      localStorage.getItem(
        "videoVerseToken"
      );

    if (liked && token) {
      fetch(
        `https://videoverse-content-platform.onrender.com/api/user/liked/${video.id}`,
        {
          method: "DELETE",

          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      )
        .then(
          async (response) => {
            const data =
              await response.json();

            if (!response.ok) {
              throw new Error(
                data.message ||
                  "Unable to remove like"
              );
            }

            const likedIds =
              Array.isArray(
                data.likedVideos
              )
                ? data.likedVideos
                : [];

            localStorage.setItem(
              "likedVideos",
              JSON.stringify(
                likedIds
              )
            );

            window.dispatchEvent(
              new Event(
                "activityUpdated"
              )
            );
          }
        )
        .catch((error) => {
          console.error(
            "Remove like error:",
            error
          );
        });
    }

    setLiked(false);

    setLikeCount(
      (prev) =>
        Math.max(
          0,
          prev - 1
        )
    );
  };

  // ==================================================
  // SUBSCRIBE
  // ==================================================

  const handleSubscribe = () => {
    if (!video) {
      return;
    }

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
          JSON.stringify(
            updated
          )
        );
      }

      setSubscribed(true);
    }
  };

  // ==================================================
  // SHARE
  // ==================================================

  const handleShare =
    async () => {
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
  // DOWNLOAD
  // ==================================================

  const handleDownload =
    () => {
      alert(
        "YouTube videos cannot be directly downloaded from this website."
      );
    };

  

    // ==================================================
    // WATCH LATER
    // ==================================================

    const handleWatchLater = async () => {
      if (!video?.id) {
        return;
      }

      const token = localStorage.getItem(
        "videoVerseToken"
      );

      // ================================================
      // LOGIN REQUIRED
      // ================================================

      if (!token) {
        alert(
          "Please login to use Watch Later."
        );

        return;
      }

      try {
        // ==============================================
        // REMOVE FROM WATCH LATER
        // ==============================================

        if (watchLater) {
          const response = await fetch(
            `https://videoverse-content-platform.onrender.com/api/user/watch-later/${video.id}`,
            {
              method: "DELETE",

              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );

          const data = await response.json();

          if (!response.ok) {
            throw new Error(
              data.message ||
                "Unable to remove video from Watch Later"
            );
          }

          setWatchLater(false);

          const watchLaterIds =
            Array.isArray(data.watchLater)
              ? data.watchLater
              : [];

          localStorage.setItem(
            "watchLater",
            JSON.stringify(watchLaterIds)
          );

          window.dispatchEvent(
            new Event("activityUpdated")
          );

          alert(
            "Removed from Watch Later"
          );

          return;
        }

        // ==============================================
        // ADD TO WATCH LATER
        // ==============================================

        const response = await fetch(
          "https://videoverse-content-platform.onrender.com/api/user/watch-later",
          {
            method: "POST",

            headers: {
              "Content-Type":
                "application/json",

              Authorization: `Bearer ${token}`,
            },

            body: JSON.stringify({
              videoId: video.id,
            }),
          }
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data.message ||
              "Unable to add video to Watch Later"
          );
        }

        setWatchLater(true);

        const watchLaterIds =
          Array.isArray(data.watchLater)
            ? data.watchLater
            : [];

        localStorage.setItem(
          "watchLater",
          JSON.stringify(watchLaterIds)
        );

        window.dispatchEvent(
          new Event("activityUpdated")
        );

        alert(
          "Added to Watch Later"
        );
      } catch (error) {
        console.error(
          "Watch Later error:",
          error
        );

        alert(
          error?.message ||
            "Unable to update Watch Later."
        );
      }
    };
  // ==================================================
  // SAVE PLAYLISTS
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

  // ==================================================
  // ADD TO PLAYLIST
  // ==================================================

  const handleAddToPlaylist = (
    playlistIdToAdd
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
            playlistIdToAdd
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

    setShowPlaylistModal(
      false
    );

    const selectedPlaylist =
      updatedPlaylists.find(
        (playlist) =>
          playlist.id ===
          playlistIdToAdd
      );

    const wasAlreadyAdded =
      currentPlaylists
        .find(
          (playlist) =>
            playlist.id ===
            playlistIdToAdd
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

  // ==================================================
  // CREATE PLAYLIST
  // ==================================================

  const handleCreatePlaylist =
    () => {
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
            playlist.name
              ?.toLowerCase() ===
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

      const updatedPlaylists =
        [
          newPlaylist,

          ...currentPlaylists,
        ];

      savePlaylists(
        updatedPlaylists
      );

      setNewPlaylistName("");

      setNewPlaylistDescription(
        ""
      );

      setShowPlaylistModal(
        false
      );

      alert(
        `Playlist "${name}" created and video added.`
      );
    };

  // ==================================================
  // ADD COMMENT
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
  // EDIT COMMENT
  // ==================================================

  const handleEditComment = (
    commentId
  ) => {
    const comment =
      comments.find(
        (item) =>
          item.id === commentId
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

  // ==================================================
  // SAVE EDITED COMMENT
  // ==================================================

  const handleSaveEditedComment =
    (commentId) => {
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

      setEditingCommentId(
        null
      );

      setEditingCommentText(
        ""
      );
    };

  // ==================================================
  // CANCEL EDIT
  // ==================================================

  const handleCancelEditComment =
    () => {
      setEditingCommentId(
        null
      );

      setEditingCommentText(
        ""
      );
    };

  // ==================================================
  // LIKE COMMENT
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
  // REPLY
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

  // ==================================================
  // DELETE REPLY
  // ==================================================

  const handleDeleteReply =
    (
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
  // DELETE COMMENT
  // ==================================================

  const handleDeleteComment =
    (commentId) => {
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
        setEditingCommentId(
          null
        );

        setEditingCommentText(
          ""
        );
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
  // LOADING
  // ==================================================

  if (loading) {
    return (
      <div className="watch-page">
        <Navbar />

        <Sidebar />

        <main className="main-content">
          <p className="page-message">
            Loading video...
          </p>
        </main>
      </div>
    );
  }

  // ==================================================
  // ERROR
  // ==================================================

  if (error) {
    return (
      <div className="watch-page">
        <Navbar />

        <Sidebar />

        <main className="main-content">
          <div className="page-message">
            <h2>
              Something went wrong
            </h2>

            <p>{error}</p>

            <button
              onClick={loadVideo}
              style={{
                marginTop:
                  "15px",
                padding:
                  "10px 18px",
                border: "none",
                borderRadius:
                  "8px",
                cursor:
                  "pointer",
                fontWeight:
                  "600",
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
  // VIDEO NOT FOUND
  // ==================================================

  if (!video) {
    return (
      <div className="watch-page">
        <Navbar />

        <Sidebar />

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
  // WATCH PAGE
  // ==================================================

  return (
    <div className="watch-page">
      <Navbar />

      <Sidebar />

      <main className="watch-content">
        <div className="watch-main-layout">

          {/* ==================================================
              LEFT
          ================================================== */}

          <div className="watch-left">

            {/* ==================================================
                VIDEO PLAYER
            ================================================== */}

            <div className="video-player-wrapper">
              <div className="video-player">

                <iframe
                  ref={iframeRef}
                  id="youtube-player"
                  title={video.title}
                  src={`https://www.youtube.com/embed/${video.id}?enablejsapi=1&origin=${encodeURIComponent(
                    window.location.origin
                  )}&rel=0&modestbranding=1&playsinline=1`}
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                />

              </div>
            </div>

            {/* ==================================================
                TITLE
            ================================================== */}

            <h1 className="watch-title">
              {video.title}
            </h1>

            {/* ==================================================
                CHANNEL + ACTIONS
            ================================================== */}

            <div className="watch-info">

              {/* CHANNEL */}

              <div className="watch-channel">

                <Link
                  to={`/channel/${video.channelId}`}
                  className="watch-channel-link"
                >

                  <div className="watch-channel-avatar">

                    {video.channelImage ? (
                      <img
                        src={
                          video.channelImage
                        }
                        alt={
                          video.channel
                        }
                        onError={(
                          e
                        ) => {
                          e.currentTarget.style.display =
                            "none";
                        }}
                      />
                    ) : (
                      <div className="channel-avatar-fallback">
                        {video.channel
                          ?.charAt(
                            0
                          )
                          .toUpperCase() ||
                          "C"}
                      </div>
                    )}

                  </div>

                  <div className="watch-channel-details">

                    <h3>
                      {
                        video.channel
                      }
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

              {/* ACTIONS */}

              <div className="watch-actions">

                {/* LIKE */}

                <button
                  onClick={
                    handleLike
                  }
                  className={
                    liked
                      ? "action-btn active"
                      : "action-btn"
                  }
                >
                  <ThumbsUp
                    size={22}
                  />

                  <span>
                    {formatNumber(
                      likeCount
                    )}
                  </span>
                </button>

                {/* DISLIKE */}

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
                  <ThumbsDown
                    size={22}
                  />

                  <span>
                    {formatNumber(
                      dislikeCount
                    )}
                  </span>
                </button>

                {/* SHARE */}

                <button
                  onClick={
                    handleShare
                  }
                  className="action-btn"
                >
                  <Share2
                    size={22}
                  />

                  <span>
                    Share
                  </span>
                </button>

                {/* DOWNLOAD */}

                <button
                  onClick={
                    handleDownload
                  }
                  className="action-btn"
                >
                  <Download
                    size={22}
                  />

                  <span>
                    Download
                  </span>
                </button>

                {/* PLAYLIST */}

                <button
                  onClick={() =>
                    setShowPlaylistModal(
                      true
                    )
                  }
                  className="action-btn"
                >
                  <ListPlus
                    size={22}
                  />

                  <span>
                    Save to playlist
                  </span>
                </button>

                {/* WATCH LATER */}

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
                  <Clock
                    size={22}
                  />

                  <span>
                    {watchLater
                      ? "Saved"
                      : "Watch later"}
                  </span>
                </button>

                {/* PREVIOUS */}

                {playlistId &&
                  playlistVideosRef
                    .current
                    .length >
                    0 && (
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

                {/* NEXT */}

                {((playlistId &&
                  playlistVideosRef
                    .current
                    .length >
                    0) ||
                  recommendedVideos.length >
                    0) && (
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
                )}

              </div>

            </div>

            {/* ==================================================
                PLAYLIST MODAL
            ================================================== */}

            {showPlaylistModal && (
              <div className="playlist-modal-overlay">

                <div className="playlist-modal">

                  <div className="playlist-modal-header">

                    <div>
                      <h2>
                        Save to playlist
                      </h2>

                      <p>
                        Choose a playlist
                        for this video.
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
                      <X
                        size={20}
                      />
                    </button>

                  </div>

                  <div className="playlist-list">

                    {playlists.length ===
                    0 ? (
                      <p className="playlist-empty-message">
                        No playlists yet.
                        Create your
                        first playlist
                        below.
                      </p>
                    ) : (
                      playlists.map(
                        (
                          playlist
                        ) => {
                          const alreadyAdded =
                            playlist.videos?.some(
                              (
                                item
                              ) =>
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
                                  {(
                                    playlist
                                      .videos
                                      ?.length ||
                                    0
                                  ) ===
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
                      Create new
                      playlist
                    </h3>

                    <input
                      type="text"
                      placeholder="Playlist name"
                      value={
                        newPlaylistName
                      }
                      onChange={(
                        e
                      ) =>
                        setNewPlaylistName(
                          e.target
                            .value
                        )
                      }
                    />

                    <textarea
                      placeholder="Description (optional)"
                      value={
                        newPlaylistDescription
                      }
                      onChange={(
                        e
                      ) =>
                        setNewPlaylistDescription(
                          e.target
                            .value
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

            {/* ==================================================
                DESCRIPTION
            ================================================== */}

            <div className="video-description">

              <strong>
                {formatNumber(
                  video.views
                )}{" "}
                views
              </strong>

              <p>
                Watch this video and
                learn something new.
              </p>

            </div>

            {/* ==================================================
                COMMENTS
            ================================================== */}

            <div className="comments-section">

              <div className="comments-title-row">

                <h2>
                  Comments
                </h2>

                <span className="comment-count-badge">
                  {
                    totalCommentCount
                  }{" "}
                  {totalCommentCount ===
                  1
                    ? "comment"
                    : "comments"}
                </span>

              </div>

              {/* ADD COMMENT */}

              <div className="comment-input">

                <input
                  type="text"
                  placeholder="Add a comment..."
                  value={
                    commentText
                  }
                  onChange={(
                    e
                  ) =>
                    setCommentText(
                      e.target
                        .value
                    )
                  }
                  onKeyDown={(
                    e
                  ) => {
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

              {/* COMMENT LIST */}

              <div className="comment-list">

                {comments.length ===
                0 ? (
                  <p className="page-message">
                    No comments yet.
                  </p>
                ) : (
                  comments.map(
                    (
                      comment
                    ) => (
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

                          {/* EDIT */}

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
                                    e
                                      .target
                                      .value
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

                          {/* COMMENT ACTIONS */}

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
                              <ThumbsUp
                                size={15}
                              />

                              <span>
                                {Number(
                                  comment.likes
                                ) ||
                                  0}
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
                              <Trash2
                                size={16}
                              />

                              Delete
                            </button>

                          </div>

                          {/* REPLY INPUT */}

                          {replyingToCommentId ===
                            comment.id && (
                            <div className="reply-input-box">

                              <input
                                type="text"
                                placeholder="Write a reply..."
                                value={
                                  replyText
                                }
                                onChange={(
                                  e
                                ) =>
                                  setReplyText(
                                    e
                                      .target
                                      .value
                                  )
                                }
                                onKeyDown={(
                                  e
                                ) => {
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

                          {/* REPLIES */}

                          {(comment.replies ||
                            [])
                            .length >
                            0 && (
                            <div className="comment-replies">

                              {comment.replies.map(
                                (
                                  reply
                                ) => (
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
                                        <Trash2
                                          size={
                                            14
                                          }
                                        />

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

          {/* ==================================================
              RIGHT SIDE
          ================================================== */}

          <aside className="watch-recommended">

            <h2>
              Recommended Videos
            </h2>

            {recommendedError ? (
              <div className="page-message">
                <p>
                  {
                    recommendedError
                  }
                </p>
              </div>
            ) : recommendedVideos.length ===
              0 ? (
              <p className="page-message">
                No recommended
                videos available.
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