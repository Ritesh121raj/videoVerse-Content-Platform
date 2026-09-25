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

  // ==========================================
  // Advanced Search States
  // ==========================================

  const [uploadDate, setUploadDate] =
    useState("any");

  const [duration, setDuration] =
    useState("any");

  const [sortBy, setSortBy] =
    useState("relevance");

  // ==========================================
  // Load Search Results
  // ==========================================

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

      const data = await searchVideos(query, {
        uploadDate,
        duration,
        sortBy,
      });

      setVideos(data);
    } catch (error) {
      console.error(
        "Search error:",
        error
      );

      setVideos([]);

      setError(
        error?.message ||
          "Unable to search videos. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  // ==========================================
  // Search Query Changed
  // ==========================================

  useEffect(() => {
    setActiveFilter("All");

    setUploadDate("any");
    setDuration("any");
    setSortBy("relevance");
  }, [query]);

  // ==========================================
  // Advanced Filter Changed
  // ==========================================

  useEffect(() => {
    if (!query.trim()) {
      return;
    }

    loadSearchResults();
  }, [
    uploadDate,
    duration,
    sortBy,
  ]);

  // ==========================================
  // Basic Filters
  // ==========================================

  const filteredVideos =
    videos.filter((video) => {
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

  // ==========================================
  // Active Advanced Filters
  // ==========================================

  const activeAdvancedFilters = [];

  if (uploadDate !== "any") {
    const uploadDateLabels = {
      today: "Today",
      week: "This week",
      month: "This month",
      year: "This year",
    };

    activeAdvancedFilters.push(
      uploadDateLabels[uploadDate]
    );
  }

  if (duration !== "any") {
    const durationLabels = {
      short: "Short",
      medium: "Medium",
      long: "Long",
    };

    activeAdvancedFilters.push(
      durationLabels[duration]
    );
  }

  if (sortBy !== "relevance") {
    const sortLabels = {
      date: "Upload date",
      viewCount: "View count",
      rating: "Rating",
    };

    activeAdvancedFilters.push(
      sortLabels[sortBy]
    );
  }

  // ==========================================
  // Result Text
  // ==========================================

  const getResultText = () => {
    const count =
      filteredVideos.length;

    if (activeFilter === "Shorts") {
      return `${count} ${
        count === 1
          ? "short"
          : "shorts"
      } found`;
    }

    if (activeFilter === "Videos") {
      return `${count} ${
        count === 1
          ? "video"
          : "videos"
      } found`;
    }

    return `${count} ${
      count === 1
        ? "result"
        : "results"
    } found`;
  };

  // ==========================================
  // Reset Advanced Filters
  // ==========================================

  const resetAdvancedFilters = () => {
    setUploadDate("any");
    setDuration("any");
    setSortBy("relevance");
    setActiveFilter("All");
  };

  return (
    <>
      <Navbar />

      <Sidebar />

      <main className="main-content search-page">

        {/* ======================================
            Search Heading
        ====================================== */}

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

        {/* ======================================
            Basic Search Filters
        ====================================== */}

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

        {/* ======================================
            Advanced Search Controls
        ====================================== */}

        {!error && (
          <div className="advanced-search">

            <div className="advanced-search-header">

              <h3>
                Search Filters
              </h3>

              <button
                className="advanced-reset-btn"
                onClick={
                  resetAdvancedFilters
                }
              >
                Reset
              </button>

            </div>

            <div className="advanced-search-controls">

              {/* Upload Date */}

              <div className="advanced-search-control">

                <label>
                  Upload Date
                </label>

                <select
                  value={uploadDate}
                  onChange={(event) =>
                    setUploadDate(
                      event.target.value
                    )
                  }
                >
                  <option value="any">
                    Any time
                  </option>

                  <option value="today">
                    Today
                  </option>

                  <option value="week">
                    This week
                  </option>

                  <option value="month">
                    This month
                  </option>

                  <option value="year">
                    This year
                  </option>
                </select>

              </div>

              {/* Duration */}

              <div className="advanced-search-control">

                <label>
                  Duration
                </label>

                <select
                  value={duration}
                  onChange={(event) =>
                    setDuration(
                      event.target.value
                    )
                  }
                >
                  <option value="any">
                    Any duration
                  </option>

                  <option value="short">
                    Short (&lt; 4 minutes)
                  </option>

                  <option value="medium">
                    Medium (4–20 minutes)
                  </option>

                  <option value="long">
                    Long (&gt; 20 minutes)
                  </option>

                </select>

              </div>

              {/* Sort By */}

              <div className="advanced-search-control">

                <label>
                  Sort By
                </label>

                <select
                  value={sortBy}
                  onChange={(event) =>
                    setSortBy(
                      event.target.value
                    )
                  }
                >
                  <option value="relevance">
                    Relevance
                  </option>

                  <option value="date">
                    Upload date
                  </option>

                  <option value="viewCount">
                    View count
                  </option>

                  <option value="rating">
                    Rating
                  </option>

                </select>

              </div>

            </div>

            {/* ==================================
                Active Filter Summary
                ================================== */}

            {activeAdvancedFilters.length >
              0 && (
              <div className="active-search-filters">

                <span className="active-search-label">
                  Active filters:
                </span>

                {activeAdvancedFilters.map(
                  (filter) => (
                    <span
                      key={filter}
                      className="active-search-chip"
                    >
                      {filter}
                    </span>
                  )
                )}

              </div>
            )}

          </div>
        )}

        {/* ======================================
            Search Status
        ====================================== */}

        {!loading &&
          !error &&
          videos.length > 0 && (
            <div className="search-status">

              <span>
                Showing {filteredVideos.length}{" "}
                {filteredVideos.length === 1
                  ? "result"
                  : "results"}
              </span>

              {activeAdvancedFilters.length >
                0 && (
                <span>
                  •{" "}
                  {
                    activeAdvancedFilters.length
                  }{" "}
                  advanced filter
                  {activeAdvancedFilters.length ===
                  1
                    ? ""
                    : "s"}{" "}
                  applied
                </span>
              )}

            </div>
          )}

        {/* ======================================
            Search Results
        ====================================== */}

        {loading ? (
          <div className="search-loading">

            <div className="search-loading-spinner"></div>

            <p>
              Searching YouTube...
            </p>

          </div>
        ) : error ? (
          <div className="page-message">

            <h2>
              Something went wrong
            </h2>

            <p>
              {error}
            </p>

            <button
              onClick={
                loadSearchResults
              }
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
        ) : filteredVideos.length ===
          0 ? (
          <div className="search-empty">

            <h2>
              No results found
            </h2>

            <p>
              Try different filters
              or different keywords.
            </p>

            {activeAdvancedFilters.length >
              0 && (
              <button
                className="search-clear-filters"
                onClick={
                  resetAdvancedFilters
                }
              >
                Clear filters
              </button>
            )}

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