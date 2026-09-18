import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Play } from "lucide-react";
import { getShortsVideos } from "../services/videoApi";

function Shorts() {
  const [shorts, setShorts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadShorts = async () => {
      try {
        setLoading(true);

        const data = await getShortsVideos();

        setShorts(data);
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

  return (
    <section className="shorts-section">

      {/* Heading */}
      <div className="shorts-heading">
        <Play
          size={24}
          fill="currentColor"
        />

        <h2>Shorts</h2>
      </div>

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
        <div className="shorts-container">

          {shorts.map((short) => (
            <Link
              to={`/watch/${short.id}`}
              className="short-card-link"
              key={short.id}
            >

              <div className="short-card">

                {/* Thumbnail */}
                <div className="short-thumbnail">

                  <img
                    src={short.thumbnail}
                    alt={short.title}
                  />

                  <div className="short-play">
                    <Play
                      size={28}
                      fill="white"
                    />
                  </div>

                </div>

                {/* Information */}
                <div className="short-info">

                  <h3>
                    {short.title}
                  </h3>

                  <p>
                    {short.channel}
                  </p>

                  <p>
                    {Number(
                      short.views
                    ).toLocaleString()}{" "}
                    views
                  </p>

                </div>

              </div>

            </Link>
          ))}

        </div>
      )}

    </section>
  );
}

export default Shorts;