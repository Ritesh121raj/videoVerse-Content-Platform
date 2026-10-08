import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Play,
  Heart,
  MessageCircle,
  Share2,
  Repeat2,
} from "lucide-react";
import { getShortsVideos } from "../services/videoApi";

function Shorts() {
  const [shorts, setShorts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadShorts = async () => {
      try {
        setLoading(true);

        const data = await getShortsVideos();

        setShorts(data || []);
      } catch (error) {
        console.error(
          "Shorts loading error:",
          error
        );

        setShorts([]);
      } finally {
        setLoading(false);
      }
    };

    loadShorts();
  }, []);

  const handleShare = async (short) => {
    try {
      const url =
        `${window.location.origin}/watch/${short.id}`;

      await navigator.clipboard.writeText(url);

      alert("Short link copied!");
    } catch (error) {
      console.error(
        "Share error:",
        error
      );
    }
  };

  return (
    <section className="shorts-page">

      {/* Loading */}
      {loading ? (
        <p className="page-message">
          Loading Shorts...
        </p>
      ) : shorts.length === 0 ? (
        <p className="page-message">
          No Shorts found.
        </p>
      ) : (
        <div className="shorts-feed">

          {shorts.map((short) => (
            <div
              className="short-feed-item"
              key={short.id}
            >

              {/* SHORT VIDEO AREA */}
              <div className="short-video-box">

                <Link
                  to={`/watch/${short.id}`}
                  className="short-video-link"
                >

                  <img
                    src={short.thumbnail}
                    loading="lazy"
                    decoding="async"
                    alt={short.title}
                    className="short-video-image"
                  />

                  {/* Play */}
                  <div className="short-center-play">
                    <Play
                      size={34}
                      fill="white"
                    />
                  </div>

                </Link>

                {/* Top YouTube-like controls */}
                <div className="short-top-controls">

                  <span className="short-control-icon">
                    ▶
                  </span>

                  <span className="short-control-icon">
                    🔊
                  </span>

                  <span className="short-control-icon">
                    ⋮
                  </span>

                </div>

                {/* Bottom information */}
                <div className="short-bottom-info">

                  <div className="short-channel-row">

                    <div className="short-channel-avatar">
                      {short.channel
                        ?.charAt(0)
                        .toUpperCase() || "C"}
                    </div>

                    <strong>
                      @{short.channel || "Channel"}
                    </strong>

                    <button
                      className="short-subscribe-btn"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        alert(
                          "Please use the Subscribe button on the Watch page."
                        );
                      }}
                    >
                      Subscribe
                    </button>

                  </div>

                  <h3>
                    {short.title}
                  </h3>

                  <p>
                    {Number(
                      short.views || 0
                    ).toLocaleString()}{" "}
                    views
                  </p>

                </div>

                {/* Progress bar */}
                <div className="short-progress">
                  <span />
                </div>

              </div>

              {/* RIGHT ACTIONS */}
              <div className="short-actions">

                <button
                  className="short-action-btn"
                  onClick={() =>
                    alert(
                      "Like this Short from the Watch page."
                    )
                  }
                >
                  <Heart size={30} />

                  <span>Like</span>
                </button>

                <button
                  className="short-action-btn"
                  onClick={() =>
                    alert(
                      "Comments are available on the Watch page."
                    )
                  }
                >
                  <MessageCircle size={30} />

                  <span>
                    {short.comments || 0}
                  </span>
                </button>

                <button
                  className="short-action-btn"
                  onClick={() =>
                    handleShare(short)
                  }
                >
                  <Share2 size={30} />

                  <span>Share</span>
                </button>

                <button
                  className="short-action-btn"
                  onClick={() =>
                    alert(
                      "Remix is not available yet."
                    )
                  }
                >
                  <Repeat2 size={30} />

                  <span>Remix</span>
                </button>

              </div>

            </div>
          ))}

        </div>
      )}

    </section>
  );
}

export default Shorts;