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

  useEffect(() => {
    const loadPlaylist = () => {
      try {
        const savedPlaylists =
          JSON.parse(localStorage.getItem("playlists")) || [];

        const foundPlaylist = savedPlaylists.find(
          (item) => item.id === id
        );

        setPlaylist(foundPlaylist || null);
      } catch (error) {
        console.error("Playlist loading error:", error);
        setPlaylist(null);
      } finally {
        setLoading(false);
      }
    };

    loadPlaylist();
  }, [id]);

  const removeVideo = (videoId) => {
    if (!playlist) return;

    const updatedVideos = (playlist.videos || []).filter(
      (video) => video?.id !== videoId
    );

    const updatedPlaylist = {
      ...playlist,
      videos: updatedVideos,
    };

    const savedPlaylists =
      JSON.parse(localStorage.getItem("playlists")) || [];

    const updatedPlaylists = savedPlaylists.map((item) =>
      item.id === playlist.id ? updatedPlaylist : item
    );

    localStorage.setItem(
      "playlists",
      JSON.stringify(updatedPlaylists)
    );

    setPlaylist(updatedPlaylist);
  };

  const deletePlaylist = () => {
    if (!playlist) return;

    const confirmDelete = window.confirm(
      `Delete playlist "${playlist.name}"?`
    );

    if (!confirmDelete) return;

    const savedPlaylists =
      JSON.parse(localStorage.getItem("playlists")) || [];

    const updatedPlaylists = savedPlaylists.filter(
      (item) => item.id !== playlist.id
    );

    localStorage.setItem(
      "playlists",
      JSON.stringify(updatedPlaylists)
    );

    navigate("/playlists");
  };

  const playAll = () => {
    const firstVideo = playlist?.videos?.[0];

    if (!firstVideo?.id) return;

    navigate(
      `/watch/${firstVideo.id}?playlist=${playlist.id}`
    );
  };

  const playVideo = (videoId) => {
    navigate(
      `/watch/${videoId}?playlist=${playlist.id}`
    );
  };

  if (loading) {
    return (
      <div className="page-message">
        Loading playlist...
      </div>
    );
  }

  if (!playlist) {
    return (
      <div className="playlist-not-found">
        <ListVideo size={50} />
        <h2>Playlist not found</h2>
        <p>This playlist may have been deleted.</p>
        <button
          onClick={() => navigate("/playlists")}
          className="playlist-back-btn"
        >
          <ArrowLeft size={17} />
          Back to playlists
        </button>
      </div>
    );
  }

  const videos = Array.isArray(playlist.videos)
    ? playlist.videos
    : [];

  return (
    <div className="page-container playlist-detail-page">
      <div className="playlist-detail-header">
        <button
          className="playlist-back-icon"
          onClick={() => navigate("/playlists")}
          title="Back to playlists"
        >
          <ArrowLeft size={21} />
        </button>

        <div className="playlist-detail-info">
          <div className="playlist-detail-icon">
            <ListVideo size={38} />
          </div>

          <div>
            <h1>{playlist.name}</h1>
            <p className="playlist-detail-description">
              {playlist.description || "No description"}
            </p>
            <span className="playlist-detail-count">
              {videos.length} {videos.length === 1 ? "video" : "videos"}
            </span>
          </div>
        </div>

        <div className="playlist-detail-actions">
          {videos.length > 0 && (
            <button
              className="playlist-play-all-btn"
              onClick={playAll}
            >
              <Play size={17} fill="currentColor" />
              Play all
            </button>
          )}

          <button
            className="playlist-delete-main-btn"
            onClick={deletePlaylist}
          >
            <Trash2 size={17} />
            Delete playlist
          </button>
        </div>
      </div>

      {videos.length === 0 ? (
        <div className="playlist-detail-empty">
          <ListVideo size={55} />
          <h2>This playlist is empty</h2>
          <p>Add videos using the "Save to playlist" option.</p>
          <button
            className="playlist-back-btn"
            onClick={() => navigate("/")}
          >
            Browse videos
          </button>
        </div>
      ) : (
        <div className="playlist-detail-list">
          {videos.map((video, index) => (
            <div
              className="playlist-detail-video"
              key={`${video.id}-${index}`}
            >
              <div className="playlist-number">
                {index + 1}
              </div>

              <div className="playlist-video-content">
                <div
                  onClick={() => playVideo(video.id)}
                  style={{ cursor: "pointer" }}
                >
                  <VideoCard
                    id={video.id}
                    image={video.image || video.thumbnail}
                    thumbnail={video.thumbnail || video.image}
                    title={video.title}
                    channel={video.channel}
                    channelImage={video.channelImage}
                    views={video.views}
                    time={video.time || video.publishedAt}
                    publishedAt={video.publishedAt || video.time}
                    duration={video.duration}
                  />
                </div>

                <button
                  className="playlist-remove-video-btn"
                  onClick={() => removeVideo(video.id)}
                >
                  <Trash2 size={15} />
                  Remove from playlist
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Playlist;
