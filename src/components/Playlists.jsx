import { useEffect, useState } from "react";
import { Trash2, PlaySquare } from "lucide-react";
import { useNavigate } from "react-router-dom";

function Playlists() {
  const [playlists, setPlaylists] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    try {
      const savedPlaylists =
        JSON.parse(localStorage.getItem("playlists")) || [];

      setPlaylists(
        Array.isArray(savedPlaylists)
          ? savedPlaylists
          : []
      );
    } catch (error) {
      console.error("Playlists error:", error);
      setPlaylists([]);
    }
  }, []);

  const deletePlaylist = (playlistId) => {
    const updatedPlaylists = playlists.filter(
      (playlist) => playlist.id !== playlistId
    );

    localStorage.setItem(
      "playlists",
      JSON.stringify(updatedPlaylists)
    );

    setPlaylists(updatedPlaylists);
  };

  const openPlaylist = (playlistId) => {
    navigate(`/playlist/${playlistId}`);
  };

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
              <div
                className="playlist-thumbnail"
                onClick={() =>
                  openPlaylist(playlist.id)
                }
              >
                {playlist.videos?.length > 0 ? (
                  <img
                    src={
                      playlist.videos[0].thumbnail ||
                      playlist.videos[0].image
                    }
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