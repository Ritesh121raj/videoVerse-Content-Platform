import { useEffect, useState } from "react";
import { Trash2 } from "lucide-react";
import VideoGrid from "./VideoGrid";
import { getVideoById } from "../services/videoApi";

function History() {
  const [historyVideos, setHistoryVideos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadHistory = async () => {
      const historyIds =
        JSON.parse(localStorage.getItem("history")) || [];

      if (historyIds.length === 0) {
        setHistoryVideos([]);
        setLoading(false);
        return;
      }

      try {
        const videos = await Promise.all(
          historyIds.map((id) => getVideoById(id))
        );

        setHistoryVideos(
          videos.filter((video) => video !== null)
        );
      } catch (error) {
        console.error("History error:", error);
      } finally {
        setLoading(false);
      }
    };

    loadHistory();
  }, []);

  const removeFromHistory = (videoId) => {
    const historyIds =
      JSON.parse(localStorage.getItem("history")) || [];

    const updatedIds = historyIds.filter(
      (id) => id !== videoId
    );

    localStorage.setItem(
      "history",
      JSON.stringify(updatedIds)
    );

    setHistoryVideos((prevVideos) =>
      prevVideos.filter(
        (video) => video.id !== videoId
      )
    );
  };

  const clearAllHistory = () => {
    localStorage.removeItem("history");
    setHistoryVideos([]);
  };

  return (
    <div className="page-container">
      <div className="history-header">
        <div>
          <h1>History</h1>

          {!loading && historyVideos.length > 0 && (
            <p className="history-count">
              {historyVideos.length}{" "}
              {historyVideos.length === 1
                ? "video"
                : "videos"}{" "}
              in history
            </p>
          )}
        </div>

        {!loading && historyVideos.length > 0 && (
          <button
            className="clear-history-btn"
            onClick={clearAllHistory}
          >
            <Trash2 size={16} />
            Clear all history
          </button>
        )}
      </div>

      {loading ? (
        <p className="page-message">
          Loading history...
        </p>
      ) : historyVideos.length === 0 ? (
        <div className="history-empty">
          <h2>No watch history</h2>
          <p>
            Videos you watch will appear here.
          </p>
        </div>
      ) : (
        <div className="history-content">
          {historyVideos.map((video) => (
            <div
              className="history-item"
              key={video.id}
            >
              <VideoGrid videos={[video]} />

              <button
                className="history-remove"
                onClick={() =>
                  removeFromHistory(video.id)
                }
              >
                <Trash2 size={16} />
                Remove from History
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default History;