import {
  Menu,
  Search,
  Mic,
  UserCircle,
  Clock,
  X,
  Bell,
  Sun,
  Moon,
  LogIn,
} from "lucide-react";

import {
  useEffect,
  useState,
} from "react";

import { useNavigate } from "react-router-dom";

function Navbar({ search, setSearch }) {
  const navigate = useNavigate();

  const [localSearch, setLocalSearch] = useState("");
  const [showRecent, setShowRecent] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfile, setShowProfile] = useState(false);

  /* ==============================
     CURRENT USER
     ============================== */

  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const savedUser = JSON.parse(
        localStorage.getItem("videoVerseCurrentUser")
      );

      return savedUser?.user || null;
    } catch {
      return null;
    }
  });

  /* ==============================
     SIDEBAR TOGGLE
     ============================== */

  const handleMenuClick = () => {
    const isCollapsed =
      document.body.classList.toggle("sidebar-collapsed");

    window.dispatchEvent(
      new CustomEvent("sidebarToggle", {
        detail: {
          collapsed: isCollapsed,
        },
      })
    );
  };

  /* ==============================
     THEME
     ============================== */

  const [isLightTheme, setIsLightTheme] = useState(() => {
    return (
      localStorage.getItem("theme") === "light"
    );
  });

  useEffect(() => {
    if (isLightTheme) {
      document.body.classList.add("light-theme");

      localStorage.setItem("theme", "light");
    } else {
      document.body.classList.remove("light-theme");

      localStorage.setItem("theme", "dark");
    }
  }, [isLightTheme]);

  const toggleTheme = () => {
    setIsLightTheme((prev) => !prev);
    setShowProfile(false);
  };

  /* ==============================
     RECENT SEARCHES
     ============================== */

  const [recentSearches, setRecentSearches] = useState(() => {
    return JSON.parse(
      localStorage.getItem("recentSearches") || "[]"
    );
  });

  /* ==============================
     NOTIFICATIONS
     ============================== */

  const [notifications, setNotifications] = useState(() => {
    return JSON.parse(
      localStorage.getItem("notifications") || "[]"
    );
  });

  useEffect(() => {
      const syncNotifications = () => {
        const savedNotifications = JSON.parse(
          localStorage.getItem("notifications") || "[]"
        );

        setNotifications(savedNotifications);
      };

      window.addEventListener(
        "notificationsUpdated",
        syncNotifications
      );

      window.addEventListener(
        "storage",
        syncNotifications
      );

      return () => {
        window.removeEventListener(
          "notificationsUpdated",
          syncNotifications
        );

        window.removeEventListener(
          "storage",
          syncNotifications
        );
      };
    }, []);

    /* ==============================
      SYNC CURRENT USER
      ============================== */

    useEffect(() => {
    const syncCurrentUser = () => {
      try {
        const savedUser = JSON.parse(
          localStorage.getItem("videoVerseCurrentUser")
        );

        setCurrentUser(savedUser?.user || null);
      } catch {
        setCurrentUser(null);
      }
    };

    window.addEventListener(
      "storage",
      syncCurrentUser
    );

    window.addEventListener(
      "authUpdated",
      syncCurrentUser
    );

    return () => {
      window.removeEventListener(
        "storage",
        syncCurrentUser
      );

      window.removeEventListener(
        "authUpdated",
        syncCurrentUser
      );
    };
  }, []);

  /* ==============================
     SEARCH
     ============================== */

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

  const handleSearch = (
    value = currentSearch
  ) => {
    const query = value.trim();

    if (!query) {
      return;
    }

    const updatedSearches = [
      query,
      ...recentSearches.filter(
        (item) =>
          item.toLowerCase() !==
          query.toLowerCase()
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
        (searchItem) =>
          searchItem !== item
      );

    setRecentSearches(updatedSearches);

    localStorage.setItem(
      "recentSearches",
      JSON.stringify(updatedSearches)
    );
  };

  const clearRecentSearches = () => {
    setRecentSearches([]);

    localStorage.removeItem(
      "recentSearches"
    );
  };

  /* ==============================
     NOTIFICATION ACTIONS
     ============================== */

  const unreadCount =
    notifications.filter(
      (notification) =>
        !notification.read
    ).length;

  const handleNotificationClick = (
    notification
  ) => {
    const updatedNotifications =
      notifications.map(
        (item) =>
          item.id === notification.id
            ? {
                ...item,
                read: true,
              }
            : item
      );

    setNotifications(
      updatedNotifications
    );

    localStorage.setItem(
      "notifications",
      JSON.stringify(updatedNotifications)
    );

    setShowNotifications(false);

    if (notification.videoId) {
      navigate(
        `/watch/${notification.videoId}`
      );
    }
  };

  const markAllNotificationsRead = () => {
    const updatedNotifications =
      notifications.map(
        (notification) => ({
          ...notification,
          read: true,
        })
      );

    setNotifications(
      updatedNotifications
    );

    localStorage.setItem(
      "notifications",
      JSON.stringify(updatedNotifications)
    );
  };

  const clearNotifications = () => {
    setNotifications([]);

    localStorage.removeItem(
      "notifications"
    );
  };

  /* ==============================
     PROFILE
     ============================== */

  const handleProfileClick = () => {
    setShowProfile(
      (prev) => !prev
    );

    setShowNotifications(false);
    setShowRecent(false);
  };

  const handleYourChannel = () => {
    setShowProfile(false);

    navigate("/");
  };

  const handleSettings = () => {
    setShowProfile(false);

    navigate("/settings");
  };

  const handleYourData = () => {
    setShowProfile(false);

    navigate("/your-data");
  };

  /* ==============================
     SIGN IN
     ============================== */

  const handleSignIn = () => {
    setShowProfile(false);

    navigate("/login");
  };

  /* ==============================
     SIGN OUT
     ============================== */

  const handleSignOut = () => {
    // Remove JWT token
    localStorage.removeItem(
      "videoVerseToken"
    );

    // Remove logged-in user
    localStorage.removeItem(
      "videoVerseCurrentUser"
    );

    // Update navbar state
    setCurrentUser(null);
    setShowProfile(false);

    // Tell the rest of the app that auth changed
    window.dispatchEvent(
      new Event("authUpdated")
    );

    // Go to login page
    navigate("/login");
  };

  return (
    <nav className="navbar">

      {/* ==========================
          LEFT
          ========================== */}

      <div className="nav-left">

        <Menu
          className="menu-icon"
          onClick={handleMenuClick}
        />

        <div className="logo">
          <span className="youtube-icon">
            ▶
          </span>

          <span>YouTube</span>
        </div>

      </div>

      {/* ==========================
          SEARCH
          ========================== */}

      <div className="search-container">

        <input
          type="text"
          placeholder="Search"
          value={currentSearch}
          onChange={(e) =>
            updateSearch(
              e.target.value
            )
          }
          onFocus={() =>
            setShowRecent(true)
          }
          onKeyDown={
            handleKeyDown
          }
        />

        <button
          onClick={() =>
            handleSearch()
          }
        >
          <Search size={22} />
        </button>

        <Mic className="mic-icon" />

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

              {recentSearches.map(
                (item) => (
                  <div
                    className="recent-search-item"
                    key={item}
                    onMouseDown={() =>
                      handleRecentClick(
                        item
                      )
                    }
                  >

                    <Clock size={18} />

                    <span>
                      {item}
                    </span>

                    <button
                      className="remove-search"
                      onMouseDown={(
                        e
                      ) => {
                        e.preventDefault();
                        e.stopPropagation();

                        removeRecentSearch(
                          item
                        );
                      }}
                    >
                      <X size={16} />
                    </button>

                  </div>
                )
              )}

            </div>
          )}

      </div>

      {/* ==========================
          RIGHT
          ========================== */}

      <div className="nav-right">

        {/* ==========================
            NOTIFICATIONS
            ========================== */}

        <div className="notification-container">

          <button
            className="notification-button"
            onClick={() => {
              setShowNotifications(
                (prev) => !prev
              );

              setShowProfile(false);
              setShowRecent(false);
            }}
          >
            <Bell size={24} />

            {unreadCount > 0 && (
              <span className="notification-badge">
                {unreadCount > 99
                  ? "99+"
                  : unreadCount}
              </span>
            )}

          </button>

          {showNotifications && (
            <div className="notification-dropdown">

              <div className="notification-header">

                <h3>
                  Notifications
                </h3>

                {notifications.length >
                  0 && (
                  <button
                    onClick={
                      markAllNotificationsRead
                    }
                  >
                    Mark all as read
                  </button>
                )}

              </div>

              {notifications.length ===
              0 ? (
                <div className="notification-empty">

                  <Bell size={30} />

                  <p>
                    No notifications
                  </p>

                </div>
              ) : (
                <div className="notification-list">

                  {notifications.map(
                    (notification) => (
                      <button
                        key={
                          notification.id
                        }
                        className={
                          notification.read
                            ? "notification-item read"
                            : "notification-item"
                        }
                        onClick={() =>
                          handleNotificationClick(
                            notification
                          )
                        }
                      >

                        <Bell size={18} />

                        <div>

                          <strong>
                            {
                              notification.title
                            }
                          </strong>

                          <p>
                            {
                              notification.message
                            }
                          </p>

                          <small>
                            {
                              notification.time
                            }
                          </small>

                        </div>

                      </button>
                    )
                  )}

                </div>
              )}

              {notifications.length >
                0 && (
                <button
                  className="clear-notifications"
                  onClick={
                    clearNotifications
                  }
                >
                  Clear notifications
                </button>
              )}

            </div>
          )}

        </div>

        {/* ==========================
            PROFILE
            ========================== */}

        <div className="profile-container">

          <button
            className="profile-button"
            onClick={
              handleProfileClick
            }
          >
            <UserCircle size={32} />
          </button>

          {showProfile && (
            <div className="profile-dropdown">

              {/* PROFILE HEADER */}

              <div className="profile-dropdown-header">

                <UserCircle size={42} />

                <div>

                  <strong>
                    {currentUser?.name ||
                      "Guest User"}
                  </strong>

                  <span>
                    {currentUser?.email ||
                      "Not signed in"}
                  </span>

                </div>

              </div>

              <hr />

              {/* YOUR CHANNEL */}

              <button
                onClick={
                  handleYourChannel
                }
              >
                <UserCircle size={20} />

                <span>
                  Your channel
                </span>
              </button>

              {/* SETTINGS */}

              <button
                onClick={
                  handleSettings
                }
              >
                <span className="profile-emoji">
                  ⚙️
                </span>

                <span>
                  Settings
                </span>
              </button>

              {/* YOUR DATA */}

              <button
                onClick={
                  handleYourData
                }
              >
                <span className="profile-emoji">
                  📊
                </span>

                <span>
                  Your data
                </span>
              </button>

              <hr />

              {/* APPEARANCE */}

              <button
                onClick={
                  toggleTheme
                }
              >
                {isLightTheme ? (
                  <Sun size={20} />
                ) : (
                  <Moon size={20} />
                )}

                <span>
                  Appearance:{" "}
                  {isLightTheme
                    ? "Light"
                    : "Dark"}
                </span>
              </button>

              {/* AUTH ACTION */}

              {currentUser ? (
                <button
                  onClick={
                    handleSignOut
                  }
                >
                  <span className="profile-emoji">
                    🚪
                  </span>

                  <span>
                    Sign out
                  </span>
                </button>
              ) : (
                <button
                  onClick={
                    handleSignIn
                  }
                >
                  <LogIn size={20} />

                  <span>
                    Sign in
                  </span>
                </button>
              )}

            </div>
          )}

        </div>

      </div>

    </nav>
  );
}

export default Navbar;