import { useEffect, useState } from "react";
import VideoGrid from "./VideoGrid";
import { getCategoryVideos } from "../services/videoApi";

function Page({ title, message }) {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadVideos = async () => {
      try {
        setLoading(true);

        const data = await getCategoryVideos(title);

        setVideos(data);
      } catch (error) {
        console.error(
          `${title} videos error:`,
          error
        );

        setVideos([]);
      } finally {
        setLoading(false);
      }
    };

    if (title) {
      loadVideos();
    }
  }, [title]);

  return (
    <div className="page-container">
      <h1>{title}</h1>

      {loading ? (
        <p className="page-message">
          Loading {title.toLowerCase()} videos...
        </p>
      ) : videos.length === 0 ? (
        <p className="page-message">
          {message || `No ${title.toLowerCase()} videos available.`}
        </p>
      ) : (
        <VideoGrid videos={videos} />
      )}
    </div>
  );
}

export default Page;