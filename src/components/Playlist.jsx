import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Play,
  Trash2,
  ArrowLeft,
  ListVideo,
} from "lucide-react";

import VideoCard from "./VideoCard";

function Playlist() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [playlist, setPlaylist] = useState(null);
  const [loading, setLoading] = useState(true);

  // ======================================================
  // LOAD PLAYLIST FROM BACKEND
  // ======================================================

  useEffect(() => {
    const loadPlaylist = async () => {
      try {
        const token = localStorage.getItem(
          "videoVerseToken"
        );

        if (!token) {
          setPlaylist(null);
          setLoading(false);
          return;
        }

        const response = await fetch(
          "https://videoverse-content-platform.onrender.com/api/user/playlists",
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data.message || "Failed to load playlists"
          );
        }

        const savedPlaylists = Array.isArray(
          data.playlists
        )
          ? data.playlists
          : [];

        const foundPlaylist =
          savedPlaylists.find(
            (item) => item.id === id
          );

        setPlaylist(foundPlaylist || null);
      } catch (error) {
        console.error(
          "Playlist loading error:",
          error
        );

        setPlaylist(null);
      } finally {
        setLoading(false);
      }
    };

    loadPlaylist();
  }, [id]);

  // ======================================================
  // REMOVE VIDEO FROM PLAYLIST
  // ======================================================

  const removeVideo = async (videoId) => {
    if (!playlist) return;

    try {
      const token = localStorage.getItem(
        "videoVerseToken"
      );

      if (!token) {
        alert("Please login.");
        return;
      }

      // Remove selected video
      const updatedVideos =
        (playlist.videos || []).filter(
          (video) => video?.id !== videoId
        );

      const response = await fetch(
        `https://videoverse-content-platform.onrender.com/api/user/playlists/${playlist.id}`,
        {
          method: "PUT",

          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },

          body: JSON.stringify({
            videos: updatedVideos,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Failed to remove video"
        );
      }

      // Update UI from backend response
      setPlaylist(data.playlist);
    } catch (error) {
      console.error(
        "Remove video error:",
        error
      );

      alert(
        error.message ||
          "Unable to remove video from playlist."
      );
    }
  };

  // ======================================================
  // DELETE PLAYLIST
  // ======================================================

  const deletePlaylist = async () => {
    if (!playlist) return;

    const confirmDelete = window.confirm(
      `Delete playlist "${playlist.name}"?`
    );

    if (!confirmDelete) {
      return;
    }

    try {
      const token = localStorage.getItem(
        "videoVerseToken"
      );

      if (!token) {
        alert("Please login.");
        return;
      }

      const response = await fetch(
        `https://videoverse-content-platform.onrender.com/api/user/playlists/${playlist.id}`,
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
            "Failed to delete playlist"
        );
      }

      // Playlist successfully deleted
      navigate("/playlists");
    } catch (error) {
      console.error(
        "Delete playlist error:",
        error
      );

      alert(
        error.message ||
          "Unable to delete playlist."
      );
    }
  };

  // ======================================================
  // PLAY ALL VIDEOS
  // ======================================================

  const playAll = () => {
    const firstVideo =
      playlist?.videos?.[0];

    if (!firstVideo?.id) {
      return;
    }

    navigate(
      `/watch/${firstVideo.id}?playlist=${playlist.id}`
    );
  };

  // ======================================================
  // PLAY SINGLE VIDEO
  // ======================================================

  const playVideo = (videoId) => {
    navigate(
      `/watch/${videoId}?playlist=${playlist.id}`
    );
  };

  // ======================================================
  // LOADING STATE
  // ======================================================

  if (loading) {
    return (
      <div className="page-message">
        Loading playlist...
      </div>
    );
  }

  // ======================================================
  // PLAYLIST NOT FOUND
  // ======================================================

  if (!playlist) {
    return (
      <div className="playlist-not-found">
        <ListVideo size={50} />

        <h2>Playlist not found</h2>

        <p>
          This playlist may have been deleted.
        </p>

        <button
          onClick={() =>
            navigate("/playlists")
          }
          className="playlist-back-btn"
        >
          <ArrowLeft size={17} />
          Back to playlists
        </button>
      </div>
    );
  }

  // ======================================================
  // SAFE VIDEOS ARRAY
  // ======================================================

  const videos = Array.isArray(
    playlist.videos
  )
    ? playlist.videos
    : [];

  // ======================================================
  // MAIN UI
  // ======================================================

  return (
    <div className="page-container playlist-detail-page">

      {/* ==================================================
          PLAYLIST HEADER
      ================================================== */}

      <div className="playlist-detail-header">

        {/* Back button */}

        <button
          className="playlist-back-icon"
          onClick={() =>
            navigate("/playlists")
          }
          title="Back to playlists"
        >
          <ArrowLeft size={21} />
        </button>

        {/* Playlist information */}

        <div className="playlist-detail-info">

          <div className="playlist-detail-icon">
            <ListVideo size={38} />
          </div>

          <div>
            <h1>{playlist.name}</h1>

            <p className="playlist-detail-description">
              {playlist.description ||
                "No description"}
            </p>

            <span className="playlist-detail-count">
              {videos.length}{" "}
              {videos.length === 1
                ? "video"
                : "videos"}
            </span>
          </div>
        </div>

        {/* Playlist actions */}

        <div className="playlist-detail-actions">

          {/* Play all */}

          {videos.length > 0 && (
            <button
              className="playlist-play-all-btn"
              onClick={playAll}
            >
              <Play
                size={17}
                fill="currentColor"
              />

              Play all
            </button>
          )}

          {/* Delete playlist */}

          <button
            className="playlist-delete-main-btn"
            onClick={deletePlaylist}
          >
            <Trash2 size={17} />

            Delete playlist
          </button>

        </div>
      </div>

      {/* ==================================================
          EMPTY PLAYLIST
      ================================================== */}

      {videos.length === 0 ? (
        <div className="playlist-detail-empty">

          <ListVideo size={55} />

          <h2>
            This playlist is empty
          </h2>

          <p>
            Add videos using the
            "Save to playlist" option.
          </p>

          <button
            className="playlist-back-btn"
            onClick={() =>
              navigate("/")
            }
          >
            Browse videos
          </button>

        </div>
      ) : (

        /* ==================================================
           PLAYLIST VIDEOS
        ================================================== */

        <div className="playlist-detail-list">

          {videos.map(
            (video, index) => (

              <div
                className="playlist-detail-video"
                key={`${video.id}-${index}`}
              >

                {/* Video number */}

                <div className="playlist-number">
                  {index + 1}
                </div>

                <div className="playlist-video-content">

                  {/* Video card */}

                  <div
                    onClick={() =>
                      playVideo(video.id)
                    }
                    style={{
                      cursor: "pointer",
                    }}
                  >
                    <VideoCard
                      id={video.id}
                      image={video.image || video.thumbnail || null}
                      thumbnail={video.thumbnail || video.image || null}
                      title={video.title}
                      channel={video.channel}
                      channelImage={video.channelImage || null}
                      views={video.views}
                      time={video.time || video.publishedAt}
                      publishedAt={video.publishedAt || video.time}
                      duration={video.duration}
                    />
                  </div>

                  {/* Remove video */}

                  <button
                    className="playlist-remove-video-btn"
                    onClick={() =>
                      removeVideo(
                        video.id
                      )
                    }
                  >
                    <Trash2 size={15} />

                    Remove from playlist
                  </button>

                </div>
              </div>
            )
          )}

        </div>
      )}
    </div>
  );
}

export default Playlist;