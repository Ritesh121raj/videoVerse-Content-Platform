import { useEffect, useState } from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  Link,
  useNavigate,
  useLocation,
} from "react-router-dom";

import Navbar from "./components/Navbar";
import Sidebar from "./components/Sidebar";
import Shorts from "./components/Shorts";
import VideoGrid from "./components/VideoGrid";
import History from "./components/History";
import WatchLater from "./components/WatchLater";
import LikedVideos from "./components/LikedVideos";
import Channel from "./pages/Channel";
import Search from "./pages/Search";
import DislikedVideos from "./components/DislikedVideos";
import Settings from "./components/Settings";
import Playlists from "./components/Playlists";
import Playlist from "./components/Playlist";
import Auth from "./pages/Auth";
import ShortsPage from "./components/ShortsPage";
import YourData from "./pages/YourData";

import {
  getVideos,
  getCategoryVideos,
  getTrendingVideos,
  getChannelVideos,
  getShortsVideos,
  getChannelImages,
} from "./services/videoApi";

import Watch from "./pages/Watch";


// ======================================================
// PROTECTED ROUTE
// ======================================================

function ProtectedRoute({ children }) {
  const navigate = useNavigate();
  const location = useLocation();

  const currentUser = (() => {
    try {
      const savedUser = JSON.parse(
        localStorage.getItem("videoVerseCurrentUser")
      );

      return savedUser?.user || null;
    } catch {
      return null;
    }
  })();

  if (!currentUser) {
    const redirectPath =
      location.pathname +
      location.search;

    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "20px",
          background:
            "var(--background-color, #0f0f0f)",
        }}
      >
        <div
          style={{
            width: "100%",
            maxWidth: "420px",
            padding: "40px 30px",
            textAlign: "center",
            borderRadius: "18px",
            background:
              "var(--card-background, #212121)",
            border: "1px solid #333",
            boxShadow:
              "0 10px 40px rgba(0,0,0,0.25)",
          }}
        >
          <div
            style={{
              fontSize: "48px",
              marginBottom: "18px",
            }}
          >
            🔐
          </div>

          <h2
            style={{
              margin: "0 0 10px",
              color:
                "var(--text-color, #fff)",
            }}
          >
            Sign in required
          </h2>

          <p
            style={{
              margin: "0 0 25px",
              color: "#aaa",
              lineHeight: "1.6",
            }}
          >
            Please sign in to access this
            section of VideoVerse.
          </p>

          <button
            onClick={() =>
              navigate(
                `/login?redirect=${encodeURIComponent(
                  redirectPath
                )}`
              )
            }
            style={{
              border: "none",
              borderRadius: "10px",
              padding: "12px 28px",
              background: "#ff0000",
              color: "#fff",
              fontSize: "15px",
              fontWeight: "600",
              cursor: "pointer",
            }}
          >
            Sign in
          </button>
        </div>
      </div>
    );
  }

  return children;
}


// ======================================================
// HOME
// ======================================================

function Home({ videos }) {
  const [search, setSearch] = useState("");
  const [category, setCategory] =
    useState("All");

  const [displayVideos, setDisplayVideos] =
    useState(videos || []);

  const [searching, setSearching] =
    useState(false);

  const categories = [
    "All",
    "Programming",
    "Music",
    "Gaming",
    "Live",
    "News",
    "Sports",
  ];

  useEffect(() => {
    if (category === "All") {
      setDisplayVideos(videos || []);
    }
  }, [videos, category]);

  const handleCategory = async (item) => {
    setCategory(item);

    if (item === "All") {
      setDisplayVideos(videos || []);
      return;
    }

    try {
      setSearching(true);

      const results =
        await getCategoryVideos(item);

      setDisplayVideos(results || []);
    } catch (error) {
      console.error(
        "Category error:",
        error
      );

      setDisplayVideos([]);

      alert(
        "Unable to load category videos."
      );
    } finally {
      setSearching(false);
    }
  };

  const filteredVideos =
    displayVideos || [];

  return (
    <>
      <Navbar
        search={search}
        setSearch={setSearch}
      />

      <Sidebar />

      <main className="main-content">

        <div className="categories">
          {categories.map((item) => (
            <button
              key={item}
              className={
                category === item
                  ? "category active"
                  : "category"
              }
              onClick={() =>
                handleCategory(item)
              }
            >
              {item}
            </button>
          ))}
        </div>

        {category !== "All" && (
          <h2 className="category-heading">
            {category}
          </h2>
        )}

        {searching ? (
          <p className="page-message">
            Loading {category} videos...
          </p>
        ) : filteredVideos.length === 0 ? (
          <p className="page-message">
            No videos found.
          </p>
        ) : (
          <VideoGrid
            videos={filteredVideos}
          />
        )}

      </main>
    </>
  );
}


// ======================================================
// TRENDING
// ======================================================

function Trending() {
  const [videos, setVideos] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState(null);

  const loadTrending = async () => {
    try {
      setLoading(true);
      setError(null);

      const data =
        await getTrendingVideos();

      setVideos(data);
    } catch (error) {
      console.error(
        "Trending error:",
        error
      );

      setVideos([]);

      setError(
        error?.message ||
          "Unable to load trending videos. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTrending();
  }, []);

  return (
    <>
      <Navbar />
      <Sidebar />

      <main className="main-content">

        {loading ? (
          <p className="page-message">
            Loading trending videos...
          </p>
        ) : error ? (
          <div className="page-message">

            <h2>
              Something went wrong
            </h2>

            <p>{error}</p>

            <button
              onClick={loadTrending}
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
        ) : (
          <>
            <h1>🔥 Trending</h1>

            <p className="page-message">
              Popular videos in India
            </p>

            {videos.length === 0 ? (
              <p className="page-message">
                No trending videos found.
              </p>
            ) : (
              <VideoGrid
                videos={videos}
              />
            )}
          </>
        )}

      </main>
    </>
  );
}


// ======================================================
// SUBSCRIPTIONS
// ======================================================

function Subscriptions() {
  const [subscribedChannels, setSubscribedChannels] =
    useState([]);

  const [channelVideos, setChannelVideos] =
    useState({});

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState(null);

  const CACHE_TIME =
    10 * 60 * 1000;

  const loadSubscriptions =
    async () => {
      try {
        setLoading(true);
        setError(null);

        const storedSubscriptions =
          JSON.parse(
            localStorage.getItem(
              "subscribedChannels"
            )
          ) || [];

        if (
          storedSubscriptions.length === 0
        ) {
          setSubscribedChannels([]);
          setChannelVideos({});
          setLoading(false);
          return;
        }

        const channelIds =
          storedSubscriptions
            .map(
              (channel) => channel.id
            )
            .filter(Boolean);

        if (channelIds.length === 0) {
          setSubscribedChannels(
            storedSubscriptions
          );

          setChannelVideos({});
          setLoading(false);
          return;
        }

        let channelImages = {};

        try {
          channelImages =
            await getChannelImages(
              channelIds
            );
        } catch (imageError) {
          console.error(
            "Channel image error:",
            imageError
          );

          channelImages = {};
        }

        const updatedSubscriptions =
          storedSubscriptions.map(
            (channel) => {
              const freshImage =
                channelImages[
                  channel.id
                ] || "";

              return {
                ...channel,

                image:
                  freshImage ||
                  channel.image ||
                  "",

                profileImage:
                  freshImage ||
                  channel.profileImage ||
                  "",
              };
            }
          );

        localStorage.setItem(
          "subscribedChannels",
          JSON.stringify(
            updatedSubscriptions
          )
        );

        setSubscribedChannels(
          updatedSubscriptions
        );

        const channelResults =
          await Promise.all(
            updatedSubscriptions.map(
              async (channel) => {
                try {
                  const cacheKey =
                    `subscriptionVideos_${channel.id}`;

                  const cachedData =
                    JSON.parse(
                      localStorage.getItem(
                        cacheKey
                      )
                    );

                  const now =
                    Date.now();

                  if (
                    cachedData &&
                    cachedData.timestamp &&
                    now -
                      cachedData.timestamp <
                      CACHE_TIME
                  ) {
                    return {
                      channelId:
                        channel.id,
                      videos:
                        cachedData.videos ||
                        [],
                    };
                  }

                  const image =
                    channelImages[
                      channel.id
                    ] || "";

                  const videos =
                    await getChannelVideos(
                      channel.id,
                      image
                    );

                  const uniqueVideos =
                    (videos || []).filter(
                      (
                        video,
                        index,
                        array
                      ) =>
                        index ===
                        array.findIndex(
                          (item) =>
                            item.id ===
                            video.id
                        )
                    );

                  localStorage.setItem(
                    cacheKey,
                    JSON.stringify({
                      timestamp:
                        Date.now(),
                      videos:
                        uniqueVideos,
                    })
                  );

                  return {
                    channelId:
                      channel.id,
                    videos:
                      uniqueVideos,
                  };
                } catch (
                  channelError
                ) {
                  console.error(
                    `Error loading videos for ${channel.name}:`,
                    channelError
                  );

                  return {
                    channelId:
                      channel.id,
                    videos: [],
                  };
                }
              }
            )
          );

        const videosByChannel = {};

        channelResults.forEach(
          (result) => {
            videosByChannel[
              result.channelId
            ] = result.videos;
          }
        );

        setChannelVideos(
          videosByChannel
        );
      } catch (error) {
        console.error(
          "Subscriptions error:",
          error
        );

        setSubscribedChannels([]);
        setChannelVideos({});

        setError(
          error?.message ||
            "Unable to load subscriptions. Please try again."
        );
      } finally {
        setLoading(false);
      }
    };

  useEffect(() => {
    loadSubscriptions();
  }, []);

  const handleImageError = (
    event
  ) => {
    event.currentTarget.style.display =
      "none";

    const parent =
      event.currentTarget
        .parentElement;

    const fallback =
      parent?.querySelector(
        ".profile-fallback"
      );

    if (fallback) {
      fallback.style.display =
        "flex";
    }
  };

  return (
    <>
      <Navbar />
      <Sidebar />

      <main className="main-content">

        <div className="subscription-header">

          <h1>
            Subscriptions
          </h1>

          <p>
            {subscribedChannels.length}{" "}
            subscribed channels
          </p>

        </div>

        {!loading &&
          !error &&
          subscribedChannels.length >
            0 && (
            <div className="subscribed-channels">

              {subscribedChannels.map(
                (channel) => {
                  const image =
                    channel.image ||
                    channel.profileImage ||
                    "";

                  return (
                    <Link
                      key={channel.id}
                      to={`/channel/${channel.id}`}
                      className="subscribed-channel"
                    >
                      <div className="profile-image-wrapper">

                        {image ? (
                          <img
                            src={image}
                            alt={
                              channel.name ||
                              "Channel"
                            }
                            onError={
                              handleImageError
                            }
                          />
                        ) : (
                          <div className="profile-fallback">
                            {channel.name
                              ?.charAt(
                                0
                              )
                              ?.toUpperCase() ||
                              "C"}
                          </div>
                        )}

                      </div>

                      <span>
                        {channel.name ||
                          "Channel"}
                      </span>
                    </Link>
                  );
                }
              )}

            </div>
          )}

        {loading && (
          <p className="page-message">
            Loading subscriptions...
          </p>
        )}

        {!loading && error && (
          <div className="page-message">

            <h2>
              Something went wrong
            </h2>

            <p>{error}</p>

            <button
              onClick={
                loadSubscriptions
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
        )}

        {!loading &&
          !error &&
          subscribedChannels.length ===
            0 && (
            <p className="page-message">
              You haven't subscribed to
              any channels yet.
            </p>
          )}

        {!loading &&
          !error &&
          subscribedChannels.length >
            0 && (
            <div className="subscription-sections">

              {subscribedChannels.map(
                (channel) => {
                  const videos =
                    channelVideos[
                      channel.id
                    ] || [];

                  if (
                    videos.length === 0
                  ) {
                    return null;
                  }

                  const image =
                    channel.image ||
                    channel.profileImage ||
                    "";

                  return (
                    <section
                      className="subscription-section"
                      key={channel.id}
                    >

                      <div className="subscription-section-header">

                        <Link
                          to={`/channel/${channel.id}`}
                          className="subscription-channel-info"
                        >

                          <div className="subscription-section-avatar">

                            {image ? (
                              <img
                                src={image}
                                alt={
                                  channel.name ||
                                  "Channel"
                                }
                                onError={
                                  handleImageError
                                }
                              />
                            ) : (
                              <div className="profile-fallback">
                                {channel.name
                                  ?.charAt(
                                    0
                                  )
                                  ?.toUpperCase() ||
                                  "C"}
                              </div>
                            )}

                          </div>

                          <div>
                            <h2>
                              {channel.name ||
                                "Channel"}
                            </h2>

                            <span>
                              View channel
                            </span>
                          </div>

                        </Link>

                      </div>

                      <VideoGrid
                        videos={videos}
                      />

                    </section>
                  );
                }
              )}

            </div>
          )}

      </main>
    </>
  );
}


// ======================================================
// MUSIC
// ======================================================

function Music() {
  const [videos, setVideos] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState(null);

  const loadMusicVideos =
    async () => {
      try {
        setLoading(true);
        setError(null);

        const data =
          await getCategoryVideos(
            "Music"
          );

        setVideos(data);
      } catch (error) {
        console.error(
          "Music error:",
          error
        );

        setVideos([]);

        setError(
          error?.message ||
            "Unable to load music videos. Please try again."
        );
      } finally {
        setLoading(false);
      }
    };

  useEffect(() => {
    loadMusicVideos();
  }, []);

  return (
    <>
      <Navbar />
      <Sidebar />

      <main className="main-content">

        {loading ? (
          <p className="page-message">
            Loading music videos...
          </p>
        ) : error ? (
          <div className="page-message">

            <h2>
              Something went wrong
            </h2>

            <p>{error}</p>

            <button
              onClick={
                loadMusicVideos
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
        ) : (
          <>
            <h1>🎵 Music</h1>

            <p className="page-message">
              Latest music videos
            </p>

            {videos.length === 0 ? (
              <p className="page-message">
                No music videos found.
              </p>
            ) : (
              <VideoGrid
                videos={videos}
              />
            )}
          </>
        )}

      </main>
    </>
  );
}

// ======================================================
// APP
// ======================================================

function App() {
  const [videos, setVideos] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState(null);

  // ================================================
  // AUTH STATE
  // ================================================

  const [authChecking, setAuthChecking] =
    useState(true);

  // ================================================
  // VERIFY TOKEN WITH BACKEND
  // ================================================

  useEffect(() => {
    const verifyAuthentication = async () => {
      try {
        const token = localStorage.getItem(
          "videoVerseToken"
        );

        // No token = user is not logged in
        if (!token) {
          setAuthChecking(false);
          return;
        }

        const API_URL =
          "https://videoverse-content-platform.onrender.com/api";

        const response =
          await fetch(
            `${API_URL}/auth/me`,
            {
              method: "GET",
              headers: {
                Authorization:
                  `Bearer ${token}`,
              },
            }
          );

        const data = await response.json();

        // Token invalid / expired
        if (!response.ok) {
          localStorage.removeItem(
            "videoVerseToken"
          );

          localStorage.removeItem(
            "videoVerseCurrentUser"
          );

          window.dispatchEvent(
            new Event("authUpdated")
          );

          setAuthChecking(false);
          return;
        }

        // Token valid
        localStorage.setItem(
          "videoVerseCurrentUser",
          JSON.stringify(data)
        );

        window.dispatchEvent(
          new Event("authUpdated")
        );

      } catch (error) {
        console.error(
          "Authentication verification failed:",
          error
        );

        // Don't delete token if backend is temporarily unavailable
      } finally {
        setAuthChecking(false);
      }
    };

    verifyAuthentication();
  }, []);

  // ================================================
  // LOAD VIDEOS
  // ================================================

  const loadVideos = async () => {
    try {
      setLoading(true);
      setError(null);

      const data =
        await getVideos();

      setVideos(data);
    } catch (error) {
      console.error(
        "Home videos error:",
        error
      );

      setVideos([]);

      setError(
        error?.message ||
          "Unable to load videos. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadVideos();
  }, []);

  // ================================================
  // AUTH CHECK SCREEN
  // ================================================

  if (authChecking) {
    return (
      <div className="page-message">
        Checking authentication...
      </div>
    );
  }

  // ================================================
  // VIDEO LOADING SCREEN
  // ================================================

  if (loading) {
    return (
      <div className="page-message">
        Loading videos...
      </div>
    );
  }

  // ================================================
  // VIDEO API ERROR
  // ================================================

  if (error) {
    return (
      <div className="page-message">

        <h2>
          Something went wrong
        </h2>

        <p>{error}</p>

        <button
          onClick={loadVideos}
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
    );
  }

  // ================================================
  // ROUTES
  // ================================================

  return (
    <BrowserRouter>

      <Routes>

        {/* HOME */}

        <Route
          path="/"
          element={
            <Home videos={videos} />
          }
        />

        {/* WATCH */}

        <Route
          path="/watch/:id"
          element={
            <ProtectedRoute>
              <Watch />
            </ProtectedRoute>
          }
        />

        {/* TRENDING */}

        <Route
          path="/trending"
          element={
            <ProtectedRoute>
              <Trending />
            </ProtectedRoute>
          }
        />

        {/* SUBSCRIPTIONS */}

        <Route
          path="/subscriptions"
          element={
            <ProtectedRoute>
              <Subscriptions />
            </ProtectedRoute>
          }
        />

        {/* HISTORY */}

        <Route
          path="/history"
          element={
            <ProtectedRoute>
              <Navbar />
              <Sidebar />

              <main className="main-content">
                <History />
              </main>
            </ProtectedRoute>
          }
        />

        {/* DISLIKED */}

        <Route
          path="/disliked"
          element={
            <ProtectedRoute>
              <Navbar />
              <Sidebar />

              <main className="main-content">
                <DislikedVideos />
              </main>
            </ProtectedRoute>
          }
        />

        {/* WATCH LATER */}

        <Route
          path="/watch-later"
          element={
            <ProtectedRoute>
              <Navbar />
              <Sidebar />

              <main className="main-content">
                <WatchLater />
              </main>
            </ProtectedRoute>
          }
        />

        {/* LIKED */}

        <Route
          path="/liked"
          element={
            <ProtectedRoute>
              <Navbar />
              <Sidebar />

              <main className="main-content">
                <LikedVideos />
              </main>
            </ProtectedRoute>
          }
        />

        {/* SHORTS */}

        <Route
          path="/shorts"
          element={
            <ShortsPage />
          }
        />

        {/* MUSIC */}

        <Route
          path="/music"
          element={
            <Music />
          }
        />

        {/* SEARCH */}

        <Route
          path="/search"
          element={
            <Search />
          }
        />

        {/* CHANNEL */}

        <Route
          path="/channel/:id"
          element={
            <Channel />
          }
        />

        {/* SETTINGS */}

        <Route
          path="/settings"
          element={
            <Settings />
          }
        />

        {/* PLAYLISTS */}

        <Route
          path="/playlists"
          element={
            <ProtectedRoute>
              <Navbar />
              <Sidebar />

              <main className="main-content">
                <Playlists />
              </main>
            </ProtectedRoute>
          }
        />

        {/* SINGLE PLAYLIST */}

        <Route
          path="/playlist/:id"
          element={
            <>
              <Navbar />
              <Sidebar />

              <main className="main-content">
                <Playlist />
              </main>
            </>
          }
        />

        {/* LOGIN */}

        <Route
          path="/login"
          element={
            <Auth />
          }
        />
        <Route
          path="/your-data"
          element={
            <ProtectedRoute>
              <Navbar />
              <Sidebar />

              <main className="main-content">
                <YourData />
              </main>
            </ProtectedRoute>
          }
        />
        

      </Routes>

    </BrowserRouter>
  );
}

export default App;