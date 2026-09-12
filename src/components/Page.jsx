import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import VideoGrid from "../components/VideoGrid";
import { getTrendingVideos } from "../services/videoApi";

function Trending() {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadTrendingVideos = async () => {
      try {
        const data = await getTrendingVideos();
        setVideos(data);
      } catch (error) {
        console.error("Error loading trending videos:", error);
      } finally {
        setLoading(false);
      }
    };

    loadTrendingVideos();
  }, []);

  return (
    <>
      <Navbar />

      <Sidebar />

      <main className="main-content">
        <h1>Trending</h1>

        {loading ? (
          <p className="page-message">Loading trending videos...</p>
        ) : videos.length === 0 ? (
          <p className="page-message">
            No trending videos available.
          </p>
        ) : (
          <VideoGrid videos={videos} />
        )}
      </main>
    </>
  );
}

export default Trending;