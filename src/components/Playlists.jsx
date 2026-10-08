import { useEffect, useState } from "react";
import { Trash2, PlaySquare } from "lucide-react";
import { useNavigate } from "react-router-dom";

function Playlists() {
  const [playlists, setPlaylists] = useState([]);
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();

  // ======================================================
  // LOAD PLAYLISTS FROM BACKEND
  // ======================================================

  useEffect(() => {
    const loadPlaylists = async () => {
      try {
        const token = localStorage.getItem(
          "videoVerseToken"
        );

        if (!token) {
          setPlaylists([]);
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

        setPlaylists(
          Array.isArray(data.playlists)
            ? data.playlists
            : []
        );
      } catch (error) {
        console.error(
          "Load playlists error:",
          error
        );

        setPlaylists([]);
      } finally {
        setLoading(false);
      }
    };

    loadPlaylists();
  }, []);

  // ======================================================
  // DELETE PLAYLIST
  // ======================================================

  const deletePlaylist = async (playlistId) => {
    try {
      const token = localStorage.getItem(
        "videoVerseToken"
      );

      if (!token) {
        alert("Please login.");
        return;
      }

      const response = await fetch(
        `https://videoverse-content-platform.onrender.com/api/user/playlists/${playlistId}`,
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

      setPlaylists(
        Array.isArray(data.playlists)
          ? data.playlists
          : []
      );
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
  // OPEN PLAYLIST
  // ======================================================

  const openPlaylist = (playlistId) => {
    navigate(`/playlist/${playlistId}`);
  };

  // ======================================================
  // LOADING
  // ======================================================

  if (loading) {
    return (
      <div className="page-message">
        Loading playlists...
      </div>
    );
  }

  // ======================================================
  // UI
  // ======================================================

  return (
    <div className="page-container">
      <div className="playlists-header">
        <div>
          <h1>My Playlists</h1>

          <p className="playlists-count">
            {playlists.length}{" "}
            {playlists.length === 1
              ? "playlist"
              : "playlists"}
          </p>
        </div>
      </div>

      {playlists.length === 0 ? (
        <div className="playlists-empty">
          <PlaySquare size={52} />

          <h2>No playlists yet</h2>

          <p>
            Create a playlist from any video using
            "Save to playlist".
          </p>
        </div>
      ) : (
        <div className="playlists-grid">
          {playlists.map((playlist) => (
            <div
              className="playlist-card"
              key={playlist.id}
            >
              {/* ======================================
                  THUMBNAIL
              ====================================== */}

              <div
                className="playlist-thumbnail"
                onClick={() =>
                  openPlaylist(playlist.id)
                }
              >
                {playlist.videos?.length > 0 ? (
                  <img
                    src={
                      playlist.videos[0]?.thumbnail ||
                      playlist.videos[0]?.image ||
                      ""
                    }
                    loading="lazy"
                    decoding="async"
                    alt={playlist.name}
                  />
                ) : (
                  <div className="playlist-no-thumbnail">
                    <PlaySquare size={42} />
                  </div>
                )}

                <div className="playlist-video-count">
                  {playlist.videos?.length || 0}{" "}
                  {playlist.videos?.length === 1
                    ? "video"
                    : "videos"}
                </div>
              </div>

              {/* ======================================
                  CONTENT
              ====================================== */}

              <div className="playlist-card-content">
                <h2>{playlist.name}</h2>

                {playlist.description && (
                  <p>{playlist.description}</p>
                )}

                <div className="playlist-card-actions">
                  <button
                    className="playlist-open-btn"
                    onClick={() =>
                      openPlaylist(playlist.id)
                    }
                  >
                    <PlaySquare size={16} />
                    Open playlist
                  </button>

                  <button
                    className="playlist-delete-btn"
                    onClick={() =>
                      deletePlaylist(playlist.id)
                    }
                    title="Delete playlist"
                  >
                    <Trash2 size={17} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Playlists;