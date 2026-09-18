import {
  Menu,
  Search,
  Mic,
  UserCircle,
  Clock,
  X,
} from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

function Navbar({ search, setSearch }) {
  const navigate = useNavigate();

  const [localSearch, setLocalSearch] = useState("");

  const [showRecent, setShowRecent] = useState(false);

  const [recentSearches, setRecentSearches] = useState(() => {
    return JSON.parse(
      localStorage.getItem("recentSearches") || "[]"
    );
  });

  // Use Home's search state if available,
  // otherwise use Navbar's own state.
  const currentSearch =
    typeof search === "string"
      ? search
      : localSearch;

  const updateSearch = (value) => {
    if (setSearch) {
      setSearch(value);
    } else {
      setLocalSearch(value);
    }
  };

  const handleSearch = (value = currentSearch) => {
    const query = value.trim();

    if (!query) {
      return;
    }

    const updatedSearches = [
      query,
      ...recentSearches.filter(
        (item) =>
          item.toLowerCase() !== query.toLowerCase()
      ),
    ].slice(0, 5);

    setRecentSearches(updatedSearches);

    localStorage.setItem(
      "recentSearches",
      JSON.stringify(updatedSearches)
    );

    setShowRecent(false);

    navigate(
      `/search?q=${encodeURIComponent(query)}`
    );
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  const handleRecentClick = (item) => {
    updateSearch(item);
    handleSearch(item);
  };

  const removeRecentSearch = (item) => {
    const updatedSearches =
      recentSearches.filter(
        (searchItem) => searchItem !== item
      );

    setRecentSearches(updatedSearches);

    localStorage.setItem(
      "recentSearches",
      JSON.stringify(updatedSearches)
    );
  };

  const clearRecentSearches = () => {
    setRecentSearches([]);

    localStorage.removeItem("recentSearches");
  };

  return (
    <nav className="navbar">

      {/* LEFT */}
      <div className="nav-left">

        <Menu className="menu-icon" />

        <div className="logo">
          <span className="youtube-icon">
            ▶
          </span>

          <span>YouTube</span>
        </div>

      </div>

      {/* SEARCH */}
      <div className="search-container">

        <input
          type="text"
          placeholder="Search"
          value={currentSearch}
          onChange={(e) =>
            updateSearch(e.target.value)
          }
          onFocus={() => setShowRecent(true)}
          onKeyDown={handleKeyDown}
        />

        <button
          onClick={() => handleSearch()}
        >
          <Search size={22} />
        </button>

        <Mic className="mic-icon" />

        {/* RECENT SEARCHES */}
        {showRecent &&
          recentSearches.length > 0 && (
            <div className="recent-searches">

              <div className="recent-title">

                <span>
                  Recent searches
                </span>

                <button
                  onMouseDown={(e) => {
                    e.preventDefault();
                    clearRecentSearches();
                  }}
                >
                  Clear all
                </button>

              </div>

              {recentSearches.map((item) => (
                <div
                  className="recent-search-item"
                  key={item}
                  onMouseDown={() =>
                    handleRecentClick(item)
                  }
                >

                  <Clock size={18} />

                  <span>{item}</span>

                  <button
                    className="remove-search"
                    onMouseDown={(e) => {
                      e.preventDefault();
                      e.stopPropagation();

                      removeRecentSearch(item);
                    }}
                  >
                    <X size={16} />
                  </button>

                </div>
              ))}

            </div>
          )}

      </div>

      {/* RIGHT */}
      <div className="nav-right">

        <UserCircle size={32} />

      </div>

    </nav>
  );
}

export default Navbar;