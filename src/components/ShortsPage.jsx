import { useEffect, useRef, useState } from "react";
import { getShortsVideos } from "../services/videoApi";

function ShortsPage() {
  const [shorts, setShorts] = useState([]);
  const [loading, setLoading] = useState(true);

  const iframeRefs = useRef([]);
  const [activeIndex, setActiveIndex] = useState(0);

  // ======================================================
  // LOAD SHORTS
  // ======================================================

  useEffect(() => {
    const loadShorts = async () => {
      try {
        setLoading(true);

        const data = await getShortsVideos();

        setShorts(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error("Shorts loading error:", error);
        setShorts([]);
      } finally {
        setLoading(false);
      }
    };

    loadShorts();
  }, []);

  // ======================================================
  // SEND COMMAND TO YOUTUBE
  // ======================================================

  const sendYouTubeCommand = (iframe, command) => {
    if (!iframe?.contentWindow) return;

    iframe.contentWindow.postMessage(
      JSON.stringify({
        event: "command",
        func: command,
        args: [],
      }),
      "https://www.youtube.com"
    );
  };

  // ======================================================
  // STOP ALL OTHER VIDEOS
  // ======================================================

  const stopOtherVideos = (currentIndex) => {
    iframeRefs.current.forEach((iframe, index) => {
      if (!iframe || index === currentIndex) return;

      sendYouTubeCommand(
        iframe,
        "pauseVideo"
      );
    });
  };

  // ======================================================
  // PLAY ACTIVE VIDEO
  // ======================================================

  const playActiveVideo = (index) => {
    const iframe = iframeRefs.current[index];

    if (!iframe) return;

    stopOtherVideos(index);

    sendYouTubeCommand(
      iframe,
      "playVideo"
    );
  };

  // ======================================================
  // OBSERVE CURRENT SHORT
  // ======================================================

  useEffect(() => {
    if (shorts.length === 0) return;

    const items =
      document.querySelectorAll(".short-item");

    const observer =
      new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (!entry.isIntersecting) {
              return;
            }

            const index = Number(
              entry.target.dataset.index
            );

            setActiveIndex(index);

            // Stop previous Shorts
            stopOtherVideos(index);

            // Play current Short
            playActiveVideo(index);
          });
        },
        {
          threshold: 0.75,
        }
      );

    items.forEach((item) => {
      observer.observe(item);
    });

    return () => {
      observer.disconnect();
    };
  }, [shorts]);

  // ======================================================
  // STOP VIDEOS WHEN LEAVING PAGE
  // ======================================================

  useEffect(() => {
    return () => {
      iframeRefs.current.forEach(
        (iframe) => {
          sendYouTubeCommand(
            iframe,
            "pauseVideo"
          );
        }
      );
    };
  }, []);

  // ======================================================
  // LOADING
  // ======================================================

  if (loading) {
    return (
      <div className="shorts-page-message">
        Loading Shorts...
      </div>
    );
  }

  // ======================================================
  // EMPTY
  // ======================================================

  if (shorts.length === 0) {
    return (
      <div className="shorts-page-message">
        No Shorts found.
      </div>
    );
  }

  // ======================================================
  // SHORTS
  // ======================================================

  return (
    <div className="shorts-page">

      <div className="shorts-feed">

        {shorts.map((short, index) => (
          <div
            className="short-item"
            data-index={index}
            key={short.id}
          >

            <div className="short-video-wrapper">

              <iframe
                ref={(element) => {
                  iframeRefs.current[index] =
                    element;
                }}
                src={`https://www.youtube.com/embed/${short.id}?enablejsapi=1&rel=0&modestbranding=1&playsinline=1`}
                title={short.title}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
              />

            </div>

            <div className="short-overlay">

              <h2>
                {short.title}
              </h2>

              <p>
                {short.channel}
              </p>

              <p>
                {Number(
                  short.views || 0
                ).toLocaleString()}{" "}
                views
              </p>

            </div>

          </div>
        ))}

      </div>

    </div>
  );
}

export default ShortsPage;