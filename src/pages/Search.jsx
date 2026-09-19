import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import VideoGrid from "../components/VideoGrid";
import { searchVideos } from "../services/videoApi";

function Search() {
  const [searchParams] = useSearchParams();

  const query = searchParams.get("q") || "";

  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);

  const [error, setError] = useState(null);

  const [activeFilter, setActiveFilter] =
    useState("All");

  const loadSearchResults = async () => {
    if (!query.trim()) {
      setVideos([]);
      setError(null);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const data = await searchVideos(query);

      setVideos(data);
    } catch (error) {
      console.error("Search error:", error);

      setVideos([]);

      setError(
        error?.message ||
          "Unable to search videos. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setActiveFilter("All");
    loadSearchResults();
  }, [query]);

  /*
   * Filter already fetched videos.
   * No additional API request.
   */
  const filteredVideos = videos.filter((video) => {
    if (activeFilter === "All") {
      return true;
    }

    if (activeFilter === "Videos") {
      return !video.isShort;
    }

    if (activeFilter === "Shorts") {
      return video.isShort;
    }

    return true;
  });

  const filters = [
    "All",
    "Videos",
    "Shorts",
  ];

  const getResultText = () => {
    const count = filteredVideos.length;

    if (activeFilter === "Shorts") {
      return `${count} ${
        count === 1 ? "short" : "shorts"
      } found`;
    }

    if (activeFilter === "Videos") {
      return `${count} ${
        count === 1 ? "video" : "videos"
      } found`;
    }

    return `${count} ${
      count === 1 ? "result" : "results"
    } found`;
  };

  return (
    <>
      <Navbar />

      <Sidebar />

      <main className="main-content search-page">

        {/* Search Heading */}

        <div className="search-heading">
          <h1>
            Search results for "{query}"
          </h1>

          {!loading &&
            !error &&
            videos.length > 0 && (
              <p className="search-result-count">
                {getResultText()}
              </p>
            )}
        </div>

        {/* Search Filters */}

        {!loading &&
          !error &&
          videos.length > 0 && (
            <div className="search-filters">

              {filters.map((filter) => (
                <button
                  key={filter}
                  className={
                    activeFilter === filter
                      ? "search-filter active"
                      : "search-filter"
                  }
                  onClick={() =>
                    setActiveFilter(filter)
                  }
                >
                  {filter}
                </button>
              ))}

            </div>
          )}

        {/* Search Results */}

        {loading ? (
          <p className="page-message">
            Searching YouTube...
          </p>
        ) : error ? (
          <div className="page-message">

            <h2>
              Something went wrong
            </h2>

            <p>
              {error}
            </p>

            <button
              onClick={loadSearchResults}
              style={{
                marginTop: "15px",
                padding: "10px 18px",
                border: "none",
                borderRadius: "8px",
                cursor: "pointer",
                fontWeight: "600",
              }}
            >
              Try Again
            </button>

          </div>
        ) : filteredVideos.length === 0 ? (
          <div className="search-empty">

            <h2>
              No results found
            </h2>

            <p>
              Try a different filter or
              different keywords.
            </p>

          </div>
        ) : (
          <VideoGrid
            videos={filteredVideos}
          />
        )}

      </main>
    </>
  );
}

export default Search;