import { useState } from "react";
import {
  Settings as SettingsIcon,
  Palette,
  Bell,
  PlayCircle,
  Lock,
  Info,
  UserCircle,
  LogIn,
  LogOut,
  ChevronRight,
  Sun,
  Moon,
  Trash2,
} from "lucide-react";

import { useNavigate } from "react-router-dom";

function Settings() {
  const navigate = useNavigate();

  const [activeSection, setActiveSection] =
    useState("Account");

  /* ==============================
     CURRENT USER
     ============================== */

  const [currentUser, setCurrentUser] = useState(() => {
    try {
      return JSON.parse(
        localStorage.getItem("videoVerseCurrentUser")
      );
    } catch {
      return null;
    }
  });

  /* ==============================
     APPEARANCE
     ============================== */

  const [isLightTheme, setIsLightTheme] = useState(() => {
    return localStorage.getItem("theme") === "light";
  });

  /* ==============================
     NOTIFICATIONS
     ============================== */

  const [notificationsEnabled, setNotificationsEnabled] =
    useState(() => {
      return (
        localStorage.getItem("notificationsEnabled") !==
        "false"
      );
    });

  const [likeNotifications, setLikeNotifications] =
    useState(() => {
      return (
        localStorage.getItem("likeNotifications") !==
        "false"
      );
    });

  const [dislikeNotifications, setDislikeNotifications] =
    useState(() => {
      return (
        localStorage.getItem("dislikeNotifications") !==
        "false"
      );
    });

  const [watchLaterNotifications, setWatchLaterNotifications] =
    useState(() => {
      return (
        localStorage.getItem(
          "watchLaterNotifications"
        ) !== "false"
      );
    });

  /* ==============================
     PRIVACY
     ============================== */

  const [historyEnabled, setHistoryEnabled] =
    useState(() => {
      return (
        localStorage.getItem("historyEnabled") !==
        "false"
      );
    });

  const [savedActivityEnabled, setSavedActivityEnabled] =
    useState(() => {
      return (
        localStorage.getItem(
          "savedActivityEnabled"
        ) !== "false"
      );
    });

  /* ==============================
     SETTINGS SECTIONS
     ============================== */

  const settingsSections = [
    {
      name: "Account",
      icon: UserCircle,
      description: "Manage your VideoVerse account",
    },
    {
      name: "Appearance",
      icon: Palette,
      description: "Customize how VideoVerse looks",
    },
    {
      name: "Notifications",
      icon: Bell,
      description: "Manage your notification preferences",
    },
    {
      name: "Playback",
      icon: PlayCircle,
      description: "Control video playback settings",
    },
    {
      name: "Privacy",
      icon: Lock,
      description: "Manage your privacy settings",
    },
    {
      name: "About",
      icon: Info,
      description: "Information about VideoVerse",
    },
  ];

  /* ==============================
     ACCOUNT
     ============================== */

  const handleSignIn = () => {
    navigate("/login");
  };

  const handleSignOut = () => {
    localStorage.removeItem(
      "videoVerseCurrentUser"
    );

    setCurrentUser(null);

    window.dispatchEvent(
      new Event("authUpdated")
    );

    alert("You have been signed out.");

    setActiveSection("Account");
  };

  /* ==============================
     THEME
     ============================== */

  const toggleTheme = () => {
    const newTheme =
      isLightTheme ? "dark" : "light";

    setIsLightTheme(!isLightTheme);

    localStorage.setItem(
      "theme",
      newTheme
    );

    if (newTheme === "light") {
      document.body.classList.add(
        "light-theme"
      );
    } else {
      document.body.classList.remove(
        "light-theme"
      );
    }
  };

  /* ==============================
     NOTIFICATIONS
     ============================== */

  const toggleNotifications = () => {
    const newValue =
      !notificationsEnabled;

    setNotificationsEnabled(newValue);

    localStorage.setItem(
      "notificationsEnabled",
      String(newValue)
    );
  };

  const toggleLikeNotifications = () => {
    const newValue =
      !likeNotifications;

    setLikeNotifications(newValue);

    localStorage.setItem(
      "likeNotifications",
      String(newValue)
    );
  };

  const toggleDislikeNotifications = () => {
    const newValue =
      !dislikeNotifications;

    setDislikeNotifications(newValue);

    localStorage.setItem(
      "dislikeNotifications",
      String(newValue)
    );
  };

  const toggleWatchLaterNotifications = () => {
    const newValue =
      !watchLaterNotifications;

    setWatchLaterNotifications(
      newValue
    );

    localStorage.setItem(
      "watchLaterNotifications",
      String(newValue)
    );
  };

  /* ==============================
     PRIVACY
     ============================== */

  const toggleHistory = () => {
    const newValue =
      !historyEnabled;

    setHistoryEnabled(newValue);

    localStorage.setItem(
      "historyEnabled",
      String(newValue)
    );
  };

  const toggleSavedActivity = () => {
    const newValue =
      !savedActivityEnabled;

    setSavedActivityEnabled(
      newValue
    );

    localStorage.setItem(
      "savedActivityEnabled",
      String(newValue)
    );
  };

  /* ==============================
     CLEAR ACTIVITY
     ============================== */

  const clearHistory = () => {
    const confirmed = window.confirm(
      "Are you sure you want to clear your watch history?"
    );

    if (!confirmed) {
      return;
    }

    localStorage.removeItem("history");

    alert("Watch history cleared.");
  };

  const clearWatchLater = () => {
    const confirmed = window.confirm(
      "Are you sure you want to clear Watch Later?"
    );

    if (!confirmed) {
      return;
    }

    localStorage.removeItem(
      "watchLater"
    );

    alert("Watch Later cleared.");
  };

  const clearLikedVideos = () => {
    const confirmed = window.confirm(
      "Are you sure you want to clear all liked videos?"
    );

    if (!confirmed) {
      return;
    }

    localStorage.removeItem(
      "likedVideos"
    );

    alert("Liked videos cleared.");
  };

  return (
    <div className="settings-page">

      {/* ==============================
          HEADER
          ============================== */}

      <div className="settings-header">

        <SettingsIcon size={30} />

        <div>
          <h1>Settings</h1>

          <p>
            Manage your VideoVerse preferences
          </p>
        </div>

      </div>

      <div className="settings-layout">

        {/* ==============================
            SIDEBAR
            ============================== */}

        <div className="settings-sidebar">

          {settingsSections.map(
            (section) => {
              const Icon = section.icon;

              return (
                <button
                  key={section.name}
                  className={
                    activeSection ===
                    section.name
                      ? "settings-nav-item active"
                      : "settings-nav-item"
                  }
                  onClick={() =>
                    setActiveSection(
                      section.name
                    )
                  }
                >

                  <Icon size={20} />

                  <div>
                    <strong>
                      {section.name}
                    </strong>

                    <span>
                      {section.description}
                    </span>
                  </div>

                  <ChevronRight
                    size={18}
                  />

                </button>
              );
            }
          )}

        </div>

        {/* ==============================
            CONTENT
            ============================== */}

        <div className="settings-content">

          {/* ==============================
              ACCOUNT
              ============================== */}

          {activeSection === "Account" && (
            <div className="settings-section">

              <h2>Account</h2>

              <p>
                Manage your VideoVerse account
                and sign-in status.
              </p>

              <div className="settings-card">

                {currentUser ? (
                  <>
                    <div className="settings-account-header">

                      <div className="settings-account-avatar">
                        <UserCircle
                          size={58}
                        />
                      </div>

                      <div>
                        <h3>
                          {currentUser.name}
                        </h3>

                        <p>
                          {currentUser.email}
                        </p>
                      </div>

                    </div>

                    <div className="settings-account-status">
                      <span className="settings-status-dot"></span>

                      <span>
                        You are currently
                        signed in.
                      </span>
                    </div>

                    <button
                      className="settings-signout-button"
                      onClick={
                        handleSignOut
                      }
                    >
                      <LogOut
                        size={18}
                      />

                      Sign out
                    </button>
                  </>
                ) : (
                  <>
                    <div className="settings-account-header">

                      <div className="settings-account-avatar guest">
                        <UserCircle
                          size={58}
                        />
                      </div>

                      <div>
                        <h3>
                          Guest User
                        </h3>

                        <p>
                          You are not signed in.
                        </p>
                      </div>

                    </div>

                    <div className="settings-account-info">
                      <p>
                        Sign in to personalize
                        your VideoVerse
                        experience and access
                        your account.
                      </p>
                    </div>

                    <button
                      className="settings-signin-button"
                      onClick={
                        handleSignIn
                      }
                    >
                      <LogIn
                        size={18}
                      />

                      Sign in to VideoVerse
                    </button>
                  </>
                )}

              </div>

            </div>
          )}

          {/* ==============================
              APPEARANCE
              ============================== */}

          {activeSection === "Appearance" && (
            <div className="settings-section">

              <h2>Appearance</h2>

              <p>
                Customize the appearance of
                VideoVerse.
              </p>

              <div className="settings-card">

                <div className="settings-option-row">

                  <div className="settings-option-info">

                    {isLightTheme ? (
                      <Sun size={22} />
                    ) : (
                      <Moon size={22} />
                    )}

                    <div>
                      <h3>Theme</h3>

                      <p>
                        Currently using{" "}
                        {isLightTheme
                          ? "Light"
                          : "Dark"}{" "}
                        mode.
                      </p>
                    </div>

                  </div>

                  <button
                    className="settings-theme-button"
                    onClick={
                      toggleTheme
                    }
                  >
                    {isLightTheme
                      ? "Switch to Dark"
                      : "Switch to Light"}
                  </button>

                </div>

              </div>

            </div>
          )}

          {/* ==============================
              NOTIFICATIONS
              ============================== */}

          {activeSection ===
            "Notifications" && (
            <div className="settings-section">

              <h2>Notifications</h2>

              <p>
                Manage your VideoVerse
                notifications.
              </p>

              <div className="settings-card">

                <div className="settings-setting-row">

                  <div>
                    <h3>
                      Enable notifications
                    </h3>

                    <p>
                      Turn all VideoVerse
                      notifications on or
                      off.
                    </p>
                  </div>

                  <button
                    className={
                      notificationsEnabled
                        ? "settings-toggle active"
                        : "settings-toggle"
                    }
                    onClick={
                      toggleNotifications
                    }
                  >
                    <span />
                  </button>

                </div>

              </div>

              <div className="settings-card">

                <div className="settings-setting-row">

                  <div>
                    <h3>
                      Like notifications
                    </h3>

                    <p>
                      Show notifications
                      when a video is liked.
                    </p>
                  </div>

                  <button
                    disabled={
                      !notificationsEnabled
                    }
                    className={
                      likeNotifications &&
                      notificationsEnabled
                        ? "settings-toggle active"
                        : "settings-toggle"
                    }
                    onClick={
                      toggleLikeNotifications
                    }
                  >
                    <span />
                  </button>

                </div>

              </div>

              <div className="settings-card">

                <div className="settings-setting-row">

                  <div>
                    <h3>
                      Dislike notifications
                    </h3>

                    <p>
                      Show notifications
                      when a video is
                      disliked.
                    </p>
                  </div>

                  <button
                    disabled={
                      !notificationsEnabled
                    }
                    className={
                      dislikeNotifications &&
                      notificationsEnabled
                        ? "settings-toggle active"
                        : "settings-toggle"
                    }
                    onClick={
                      toggleDislikeNotifications
                    }
                  >
                    <span />
                  </button>

                </div>

              </div>

              <div className="settings-card">

                <div className="settings-setting-row">

                  <div>
                    <h3>
                      Watch Later
                      notifications
                    </h3>

                    <p>
                      Show notifications
                      when a video is
                      saved to Watch Later.
                    </p>
                  </div>

                  <button
                    disabled={
                      !notificationsEnabled
                    }
                    className={
                      watchLaterNotifications &&
                      notificationsEnabled
                        ? "settings-toggle active"
                        : "settings-toggle"
                    }
                    onClick={
                      toggleWatchLaterNotifications
                    }
                  >
                    <span />
                  </button>

                </div>

              </div>

            </div>
          )}

          {/* ==============================
              PLAYBACK
              ============================== */}

          {activeSection === "Playback" && (
            <div className="settings-section">

              <h2>Playback</h2>

              <p>
                Manage your video playback
                preferences.
              </p>

              <div className="settings-card">

                <div className="settings-setting-row">

                  <div>
                    <h3>Autoplay</h3>

                    <p>
                      Automatically play the
                      next video when the
                      current video ends.
                    </p>
                  </div>

                  <button
                    className={
                      localStorage.getItem(
                        "autoplay"
                      ) !== "false"
                        ? "settings-toggle active"
                        : "settings-toggle"
                    }
                    onClick={() => {
                      const current =
                        localStorage.getItem(
                          "autoplay"
                        ) !== "false";

                      localStorage.setItem(
                        "autoplay",
                        String(!current)
                      );

                      window.location.reload();
                    }}
                  >
                    <span />
                  </button>

                </div>

              </div>

              <div className="settings-card">

                <div className="settings-setting-row">

                  <div>
                    <h3>Default mute</h3>

                    <p>
                      Start videos with the
                      sound muted.
                    </p>
                  </div>

                  <button
                    className={
                      localStorage.getItem(
                        "defaultMute"
                      ) === "true"
                        ? "settings-toggle active"
                        : "settings-toggle"
                    }
                    onClick={() => {
                      const current =
                        localStorage.getItem(
                          "defaultMute"
                        ) === "true";

                      localStorage.setItem(
                        "defaultMute",
                        String(!current)
                      );

                      window.location.reload();
                    }}
                  >
                    <span />
                  </button>

                </div>

              </div>

              <div className="settings-card">

                <div className="settings-setting-row">

                  <div>
                    <h3>
                      Video quality
                    </h3>

                    <p>
                      Choose your preferred
                      video quality.
                    </p>
                  </div>

                  <select
                    className="settings-quality-select"
                    value={
                      localStorage.getItem(
                        "videoQuality"
                      ) || "Auto"
                    }
                    onChange={(e) => {
                      localStorage.setItem(
                        "videoQuality",
                        e.target.value
                      );

                      window.location.reload();
                    }}
                  >
                    <option value="Auto">
                      Auto
                    </option>
                    <option value="1080p">
                      1080p
                    </option>
                    <option value="720p">
                      720p
                    </option>
                    <option value="480p">
                      480p
                    </option>
                    <option value="360p">
                      360p
                    </option>
                  </select>

                </div>

              </div>

            </div>
          )}

          {/* ==============================
              PRIVACY
              ============================== */}

          {activeSection === "Privacy" && (
            <div className="settings-section">

              <h2>Privacy</h2>

              <p>
                Manage your VideoVerse
                privacy and activity.
              </p>

              <div className="settings-card">

                <div className="settings-setting-row">

                  <div>
                    <h3>
                      Watch history
                    </h3>

                    <p>
                      Allow VideoVerse to
                      save the videos you
                      watch.
                    </p>
                  </div>

                  <button
                    className={
                      historyEnabled
                        ? "settings-toggle active"
                        : "settings-toggle"
                    }
                    onClick={
                      toggleHistory
                    }
                  >
                    <span />
                  </button>

                </div>

              </div>

              <div className="settings-card">

                <div className="settings-setting-row">

                  <div>
                    <h3>
                      Saved activity
                    </h3>

                    <p>
                      Allow liked and Watch
                      Later activity to be
                      stored.
                    </p>
                  </div>

                  <button
                    className={
                      savedActivityEnabled
                        ? "settings-toggle active"
                        : "settings-toggle"
                    }
                    onClick={
                      toggleSavedActivity
                    }
                  >
                    <span />
                  </button>

                </div>

              </div>

              <div className="settings-card">

                <h3>
                  Manage your activity
                </h3>

                <p>
                  Permanently remove saved
                  activity from this browser.
                </p>

                <div className="settings-danger-actions">

                  <button
                    className="settings-danger-button"
                    onClick={
                      clearHistory
                    }
                  >
                    <Trash2 size={16} />
                    Clear watch history
                  </button>

                  <button
                    className="settings-danger-button"
                    onClick={
                      clearWatchLater
                    }
                  >
                    <Trash2 size={16} />
                    Clear Watch Later
                  </button>

                  <button
                    className="settings-danger-button"
                    onClick={
                      clearLikedVideos
                    }
                  >
                    <Trash2 size={16} />
                    Clear liked videos
                  </button>

                </div>

              </div>

            </div>
          )}

          {/* ==============================
              ABOUT
              ============================== */}

          {activeSection === "About" && (
            <div className="settings-section">

              <h2>
                About VideoVerse
              </h2>

              <p>
                Information about your
                VideoVerse platform.
              </p>

              <div className="settings-about-card">

                <div className="settings-about-logo">
                  ▶
                </div>

                <div>
                  <h3>
                    VideoVerse –
                    Content Platform
                  </h3>

                  <p>
                    A YouTube-inspired
                    video content platform
                    built with modern web
                    technologies.
                  </p>
                </div>

              </div>

              <div className="settings-card">

                <h3>
                  Technology Stack
                </h3>

                <div className="settings-tech-list">

                  <span>React.js</span>
                  <span>Vite</span>
                  <span>JavaScript</span>
                  <span>React Router</span>
                  <span>Lucide React</span>
                  <span>YouTube Data API</span>
                  <span>CSS</span>
                  <span>LocalStorage</span>

                </div>

              </div>

              <div className="settings-card">

                <h3>
                  Project Features
                </h3>

                <ul className="settings-about-list">

                  <li>
                    Video search using
                    YouTube Data API
                  </li>

                  <li>
                    Video playback
                  </li>

                  <li>
                    Liked and disliked
                    videos
                  </li>

                  <li>
                    Watch Later
                  </li>

                  <li>
                    Watch history
                  </li>

                  <li>
                    Subscriptions
                  </li>

                  <li>
                    Shorts and Music
                    sections
                  </li>

                  <li>
                    Notifications
                  </li>

                  <li>
                    Dark and Light theme
                  </li>

                  <li>
                    Responsive design
                  </li>

                </ul>

              </div>

              <div className="settings-card">

                <h3>
                  Project Information
                </h3>

                <div className="settings-project-info">

                  <div>
                    <span>
                      Project
                    </span>

                    <strong>
                      VideoVerse
                    </strong>
                  </div>

                  <div>
                    <span>
                      Version
                    </span>

                    <strong>
                      1.0.0
                    </strong>
                  </div>

                  <div>
                    <span>
                      Platform
                    </span>

                    <strong>
                      Web Application
                    </strong>
                  </div>

                </div>

              </div>

              <div className="settings-card">

                <h3>
                  Source Code
                </h3>

                <p>
                  The project source code
                  is available on GitHub.
                </p>

                <a
                  href="https://github.com/Ritesh121raj/videoVerse-Content-Platform"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="settings-github-link"
                >
                  View Project on GitHub
                </a>

              </div>

            </div>
          )}

        </div>

      </div>

    </div>
  );
}

export default Settings;