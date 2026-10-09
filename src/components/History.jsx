import { useCallback, useEffect, useState } from "react";
import VideoCard from "./VideoCard";

const API_BASE_URL =
  "https://videoverse-content-platform.onrender.com/api";

function getLocalHistory() {
  try {
    const parsed = JSON.parse(localStorage.getItem("history") || "[]");
    return Array.isArray(parsed)
      ? parsed.filter((video) => video && video.id)
      : [];
  } catch (error) {
    console.error("Unable to read local watch history:", error);
    return [];
  }
}

function History() {
  const [history, setHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isClearing, setIsClearing] = useState(false);
  const [removingIds, setRemovingIds] = useState([]);

  const loadHistory = useCallback(async () => {
    const token = localStorage.getItem("videoVerseToken");

    if (!token) {
      const localHistory = getLocalHistory();
      setHistory(localHistory);
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/user/history`, {
        method: "GET",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(data.message || "Unable to load watch history.");
      }

      const validHistory = Array.isArray(data.history)
        ? data.history.filter((video) => video && video.id)
        : [];

      setHistory(validHistory);
      localStorage.setItem("history", JSON.stringify(validHistory));
    } catch (error) {
      console.error("Backend history loading error:", error);
      // Keep the current local cache visible if the API is temporarily unavailable.
      setHistory(getLocalHistory());
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadHistory();

    const handleHistoryUpdated = () => loadHistory();
    window.addEventListener("historyUpdated", handleHistoryUpdated);
    window.addEventListener("activityUpdated", handleHistoryUpdated);

    return () => {
      window.removeEventListener("historyUpdated", handleHistoryUpdated);
      window.removeEventListener("activityUpdated", handleHistoryUpdated);
    };
  }, [loadHistory]);

  const clearHistory = async () => {
    if (isClearing || history.length === 0) return;

    const confirmed = window.confirm(
      "Are you sure you want to clear your watch history?"
    );
    if (!confirmed) return;

    setIsClearing(true);
    const token = localStorage.getItem("videoVerseToken");

    try {
      if (token) {
        const response = await fetch(`${API_BASE_URL}/user/history`, {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await response.json().catch(() => ({}));
        if (!response.ok) {
          throw new Error(data.message || "The server could not clear your history.");
        }
      }

      localStorage.setItem("history", "[]");
      setHistory([]);
      window.dispatchEvent(new Event("historyUpdated"));
      window.dispatchEvent(new Event("activityUpdated"));
    } catch (error) {
      console.error("Clear history error:", error);
      alert(error.message || "Unable to clear watch history. Please try again.");
    } finally {
      setIsClearing(false);
    }
  };

  const removeFromHistory = async (videoId) => {
    if (!videoId || removingIds.includes(videoId)) return;

    const token = localStorage.getItem("videoVerseToken");
    setRemovingIds((current) => [...current, videoId]);

    try {
      if (token) {
        const response = await fetch(
          `${API_BASE_URL}/user/history/${encodeURIComponent(videoId)}`,
          {
            method: "DELETE",
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        const data = await response.json().catch(() => ({}));
        if (!response.ok) {
          throw new Error(data.message || "Could not remove this video from history.");
        }
      }

      setHistory((current) => {
        const updated = current.filter((video) => video?.id !== videoId);
        localStorage.setItem("history", JSON.stringify(updated));
        return updated;
      });
      window.dispatchEvent(new Event("historyUpdated"));
      window.dispatchEvent(new Event("activityUpdated"));
    } catch (error) {
      console.error("Remove history item error:", error);
      alert(error.message || "Unable to remove this video. Please try again.");
    } finally {
      setRemovingIds((current) => current.filter((id) => id !== videoId));
    }
  };

  return (
    <div className="history-page">
      <div className="history-header">
        <div>
          <h1>Watch History</h1>
          <p className="history-count">
            {history.length} {history.length === 1 ? "video" : "videos"} in your history
          </p>
        </div>
        <button
          type="button"
          onClick={clearHistory}
          disabled={isClearing || isLoading || history.length === 0}
          style={{
            background: history.length ? "#ff0000" : "#555",
            color: "white",
            border: "none",
            padding: "10px 16px",
            borderRadius: "8px",
            cursor: isClearing || history.length === 0 ? "not-allowed" : "pointer",
            fontWeight: "600",
            opacity: isClearing ? 0.7 : 1,
          }}
        >
          {isClearing ? "Clearing..." : "Clear History"}
        </button>
      </div>

      {isLoading ? (
        <div className="page-message"><p>Loading watch history...</p></div>
      ) : history.length === 0 ? (
        <div className="page-message history-empty">
          <h2>No watch history</h2>
          <p>Videos that you watch will appear here.</p>
        </div>
      ) : (
        <div className="history-content">
          {history.map((video) => (
            <div className="history-item" key={video.id}>
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
              <button
                type="button"
                className="history-remove"
                onClick={() => removeFromHistory(video.id)}
                disabled={removingIds.includes(video.id)}
              >
                {removingIds.includes(video.id) ? "Removing..." : "Remove from history"}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default History;
