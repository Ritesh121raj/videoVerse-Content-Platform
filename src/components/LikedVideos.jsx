import { useEffect, useState } from "react";
import VideoGrid from "./VideoGrid";
import { getVideoById } from "../services/videoApi";

function LikedVideos() {
  const [likedVideos, setLikedVideos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadLikedVideos = async () => {
      const likedIds =
        JSON.parse(localStorage.getItem("likedVideos")) || [];

      if (likedIds.length === 0) {
        setLikedVideos([]);
        setLoading(false);
        return;
      }

      try {
        const videos = await Promise.all(
          likedIds.map((id) => getVideoById(id))
        );

        setLikedVideos(
          videos.filter((video) => video !== null)
        );
      } catch (error) {
        console.error("Liked videos error:", error);
      } finally {
        setLoading(false);
      }
    };

    loadLikedVideos();
  }, []);

  return (
    <div className="page-container">
      <h1>Liked Videos</h1>

      {loading ? (
        <p className="page-message">
          Loading liked videos...
        </p>
      ) : likedVideos.length === 0 ? (
        <p className="page-message">
          You haven't liked any videos yet.
        </p>
      ) : (
        <VideoGrid videos={likedVideos} />
      )}
    </div>
  );
}

export default LikedVideos;