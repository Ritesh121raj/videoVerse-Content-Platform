import { useEffect, useState } from "react";
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

  return (
    <div className="page-container">
      <h1>History</h1>

      {loading ? (
        <p className="page-message">
          Loading history...
        </p>
      ) : historyVideos.length === 0 ? (
        <p className="page-message">
          You haven't watched any videos yet.
        </p>
      ) : (
        <VideoGrid videos={historyVideos} />
      )}
    </div>
  );
}

export default History;