import { useEffect, useState } from "react";
import VideoGrid from "../components/VideoGrid";

function History() {
  const [history, setHistory] = useState([]);

  // ==========================================
  // LOAD HISTORY
  // ==========================================

  const loadHistory = () => {
    try {
      const savedHistory =
        JSON.parse(
          localStorage.getItem("history")
        ) || [];

      const validHistory = Array.isArray(savedHistory)
        ? savedHistory.filter(
            (video) =>
              video &&
              video.id
          )
        : [];

      setHistory(validHistory);

      console.log(
        "History page loaded:",
        validHistory
      );
    } catch (error) {
      console.error(
        "History loading error:",
        error
      );

      setHistory([]);
    }
  };

  // ==========================================
  // INITIAL LOAD + UPDATE LISTENER
  // ==========================================

  useEffect(() => {
    loadHistory();

    const handleHistoryUpdated = () => {
      loadHistory();
    };

    const handleActivityUpdated = () => {
      loadHistory();
    };

    window.addEventListener(
      "historyUpdated",
      handleHistoryUpdated
    );

    window.addEventListener(
      "activityUpdated",
      handleActivityUpdated
    );

    window.addEventListener(
      "storage",
      handleHistoryUpdated
    );

    return () => {
      window.removeEventListener(
        "historyUpdated",
        handleHistoryUpdated
      );

      window.removeEventListener(
        "activityUpdated",
        handleActivityUpdated
      );

      window.removeEventListener(
        "storage",
        handleHistoryUpdated
      );
    };
  }, []);

  // ==========================================
  // CLEAR HISTORY
  // ==========================================

  const clearHistory = () => {
    const confirmed = window.confirm(
      "Are you sure you want to clear your watch history?"
    );

    if (!confirmed) {
      return;
    }

    localStorage.removeItem("history");

    setHistory([]);

    window.dispatchEvent(
      new Event("historyUpdated")
    );

    window.dispatchEvent(
      new Event("activityUpdated")
    );
  };

  // ==========================================
  // REMOVE SINGLE VIDEO
  // ==========================================

  const removeFromHistory = (videoId) => {
    const updatedHistory =
      history.filter(
        (video) =>
          video?.id !== videoId
      );

    localStorage.setItem(
      "history",
      JSON.stringify(updatedHistory)
    );

    setHistory(updatedHistory);

    window.dispatchEvent(
      new Event("historyUpdated")
    );
  };

  // ==========================================
  // EMPTY STATE
  // ==========================================

  if (history.length === 0) {
    return (
      <div className="history-page">

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "25px",
          }}
        >
          <div>
            <h1>Watch History</h1>

            <p
              style={{
                color: "#aaa",
                marginTop: "5px",
              }}
            >
              Videos you have watched
            </p>
          </div>
        </div>

        <div className="page-message">
          <h2>No watch history</h2>

          <p>
            Videos that you watch will
            appear here.
          </p>
        </div>

      </div>
    );
  }

  // ==========================================
  // HISTORY PAGE
  // ==========================================

  return (
    <div className="history-page">

      {/* HEADER */}

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "25px",
        }}
      >

        <div>
          <h1>Watch History</h1>

          <p
            style={{
              color: "#aaa",
              marginTop: "5px",
            }}
          >
            {history.length}{" "}
            {history.length === 1
              ? "video"
              : "videos"}{" "}
            in your history
          </p>
        </div>

        <button
          onClick={clearHistory}
          style={{
            background: "#ff0000",
            color: "white",
            border: "none",
            padding: "10px 16px",
            borderRadius: "8px",
            cursor: "pointer",
            fontWeight: "600",
          }}
        >
          Clear History
        </button>

      </div>

      {/* VIDEO LIST */}

      <VideoGrid
        videos={history}
      />

      {/* REMOVE BUTTONS */}

      <div
        style={{
          marginTop: "30px",
          display: "flex",
          flexWrap: "wrap",
          gap: "10px",
        }}
      >

        {history.map((video) => (
          <button
            key={video.id}
            onClick={() =>
              removeFromHistory(video.id)
            }
            style={{
              display: "none",
            }}
          >
            Remove
          </button>
        ))}

      </div>

    </div>
  );
}

export default History;