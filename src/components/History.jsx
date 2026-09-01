import { useEffect, useState } from "react";
import VideoGrid from "./VideoGrid";
import videos from "../data/videos";

function History() {
  const [historyVideos, setHistoryVideos] = useState([]);

  useEffect(() => {
    const historyIds =
      JSON.parse(localStorage.getItem("history")) || [];

    const list = historyIds
      .map((id) =>
        videos.find((video) => video.id === id)
      )
      .filter(Boolean);

    setHistoryVideos(list);
  }, []);

  return (
    <div className="page-container">
      <h1>History</h1>

      {historyVideos.length === 0 ? (
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