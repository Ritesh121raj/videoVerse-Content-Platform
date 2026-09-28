import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import {
  Play,
  Trash2,
  ArrowLeft,
  ListVideo,
} from "lucide-react";

import VideoCard from "./VideoCard";

const API_BASE =
  "https://videoverse-content-platform.onrender.com";

function Playlist() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [playlist, setPlaylist] =
    useState(null);

  const [loading, setLoading] =
    useState(true);

  const [deleting, setDeleting] =
    useState(false);

  const [removingVideo, setRemovingVideo] =
    useState(null);

  // ======================================================
  // LOAD PLAYLIST
  // ======================================================

  useEffect(() => {
    const loadPlaylist = async () => {
      try {
        setLoading(true);

        const token =
          localStorage.getItem(
            "videoVerseToken"
          );

        if (!token) {
          setPlaylist(null);
          return;
        }

        const response =
          await fetch(
            `${API_BASE}/api/user/playlists`,
            {
              method: "GET",

              headers: {
                Authorization:
                  `Bearer ${token}`,
              },
            }
          );

        const data =
          await response.json();

        if (!response.ok) {
          throw new Error(
            data.message ||
              "Failed to load playlists"
          );
        }

        const playlists =
          Array.isArray(
            data.playlists
          )
            ? data.playlists
            : [];

        const foundPlaylist =
          playlists.find(
            (item) =>
              String(item.id) ===
              String(id)
          );

        setPlaylist(
          foundPlaylist || null
        );
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
    try {
      const token = localStorage.getItem("videoVerseToken");

      if (!token) {
        alert("Please login first");
        return;
      }

      const updatedVideos = playlist.videos.filter(
        (video) => video.id !== videoId
      );

      const response = await fetch(
  `${API_BASE}/api/user/playlists/${playlist.id}`,
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
          data.message || "Failed to remove video"
        );
      }

      // Update current playlist
      setPlaylist(data.playlist);
    } catch (error) {
      console.error("Remove video error:", error);

      alert("Failed to remove video");
    }
  };

  // ======================================================
  // DELETE PLAYLIST
  // ======================================================

  const deletePlaylist = async () => {
    try {
      const token = localStorage.getItem("videoVerseToken");

      if (!token) {
        alert("Please login first");
        return;
      }

      const confirmed = window.confirm(
        "Are you sure you want to delete this playlist?"
      );

      if (!confirmed) return;

      const response = await fetch(
  `${API_BASE}/api/user/playlists/${playlist.id}`,
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
          data.message || "Failed to delete playlist"
        );
      }

      alert("Playlist deleted successfully ✅");

      // Go back to playlists page
      navigate("/playlists");
    } catch (error) {
      console.error("Delete playlist error:", error);

      alert("Failed to delete playlist");
    }
  };
  // ======================================================
  // PLAY ALL
  // ======================================================

  const playAll = () => {
    const firstVideo =
      playlist?.videos?.[0];

    const firstVideoId =
      typeof firstVideo ===
      "string"
        ? firstVideo
        : firstVideo?.id;

    if (!firstVideoId) {
      return;
    }

    navigate(
      `/watch/${firstVideoId}?playlist=${playlist.id}`
    );
  };

  // ======================================================
  // PLAY SINGLE VIDEO
  // ======================================================

  const playVideo = (
    videoId
  ) => {
    if (!videoId) return;

    navigate(
      `/watch/${videoId}?playlist=${playlist.id}`
    );
  };

  // ======================================================
  // LOADING
  // ======================================================

  if (loading) {
    return (
      <div className="page-message">
        Loading playlist...
      </div>
    );
  }

  // ======================================================
  // NOT FOUND
  // ======================================================

  if (!playlist) {
    return (
      <div className="playlist-not-found">
        <ListVideo size={50} />

        <h2>
          Playlist not found
        </h2>

        <p>
          This playlist may have
          been deleted.
        </p>

        <button
          onClick={() =>
            navigate(
              "/playlists"
            )
          }
          className="playlist-back-btn"
        >
          <ArrowLeft
            size={17}
          />

          Back to playlists
        </button>
      </div>
    );
  }

  // ======================================================
  // VIDEOS
  // ======================================================

  const videos =
    Array.isArray(
      playlist.videos
    )
      ? playlist.videos
      : [];

  // ======================================================
  // UI
  // ======================================================

  return (
    <div className="page-container playlist-detail-page">

      {/* ==================================================
          HEADER
      ================================================== */}

      <div className="playlist-detail-header">

        <button
          className="playlist-back-icon"
          onClick={() =>
            navigate(
              "/playlists"
            )
          }
          title="Back to playlists"
        >
          <ArrowLeft
            size={21}
          />
        </button>

        <div className="playlist-detail-info">

          <div className="playlist-detail-icon">
            <ListVideo
              size={38}
            />
          </div>

          <div>
            <h1>
              {playlist.name}
            </h1>

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

        <div className="playlist-detail-actions">

          {videos.length >
            0 && (
            <button
              className="playlist-play-all-btn"
              onClick={
                playAll
              }
            >
              <Play
                size={17}
                fill="currentColor"
              />

              Play all
            </button>
          )}

          <button
            className="playlist-delete-main-btn"
            onClick={
              deletePlaylist
            }
            disabled={
              deleting
            }
          >
            <Trash2
              size={17}
            />

            {deleting
              ? "Deleting..."
              : "Delete playlist"}
          </button>

        </div>
      </div>

      {/* ==================================================
          EMPTY PLAYLIST
      ================================================== */}

      {videos.length ===
      0 ? (
        <div className="playlist-detail-empty">

          <ListVideo
            size={55}
          />

          <h2>
            This playlist is empty
          </h2>

          <p>
            Add videos using
            the "Save to playlist"
            option.
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
           VIDEO LIST
        ================================================== */

        <div className="playlist-detail-list">

          {videos.map(
            (
              video,
              index
            ) => {

              /*
               * Backward compatibility:
               * old playlists may still contain
               * only video IDs.
               */

              const videoId =
                typeof video ===
                "string"
                  ? video
                  : video?.id;

              if (!videoId) {
                return null;
              }

              /*
               * Old DB video may only contain id.
               * In that case VideoCard will NOT
               * render an empty img because of
               * the VideoCard fix below.
               */

              const videoObject =
                typeof video ===
                "string"
                  ? {
                      id: video,
                      title:
                        "Video",
                      channel:
                        "",
                    }
                  : video;

              return (
                <div
                  className="playlist-detail-video"
                  key={`${videoId}-${index}`}
                >

                  <div className="playlist-number">
                    {index + 1}
                  </div>

                  <div className="playlist-video-content">

                    <div
                      onClick={() =>
                        playVideo(
                          videoId
                        )
                      }
                      style={{
                        cursor:
                          "pointer",
                      }}
                    >

                      <VideoCard
                        id={
                          videoObject.id
                        }

                        image={
                          videoObject.image ||
                          videoObject.thumbnail ||
                          null
                        }

                        thumbnail={
                          videoObject.thumbnail ||
                          videoObject.image ||
                          null
                        }

                        title={
                          videoObject.title ||
                          "Video"
                        }

                        channel={
                          videoObject.channel ||
                          ""
                        }

                        channelImage={
                          videoObject.channelImage ||
                          null
                        }

                        views={
                          videoObject.views ||
                          ""
                        }

                        time={
                          videoObject.time ||
                          videoObject.publishedAt ||
                          ""
                        }

                        publishedAt={
                          videoObject.publishedAt ||
                          videoObject.time ||
                          ""
                        }

                        duration={
                          videoObject.duration ||
                          ""
                        }
                      />

                    </div>

                    <button
                      className="playlist-remove-video-btn"
                      onClick={() =>
                        removeVideo(
                          videoId
                        )
                      }
                      disabled={
                        removingVideo ===
                        videoId
                      }
                    >
                      <Trash2
                        size={15}
                      />

                      {removingVideo ===
                      videoId
                        ? "Removing..."
                        : "Remove from playlist"}
                    </button>

                  </div>
                </div>
              );
            }
          )}

        </div>
      )}

    </div>
  );
}

export default Playlist;