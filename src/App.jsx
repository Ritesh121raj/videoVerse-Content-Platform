import { useEffect, useState } from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  Link,
} from "react-router-dom";

import Navbar from "./components/Navbar";
import Sidebar from "./components/Sidebar";
import Shorts from "./components/Shorts";
import Page from "./components/Page";
import VideoGrid from "./components/VideoGrid";
import History from "./components/History";
import WatchLater from "./components/WatchLater";
import LikedVideos from "./components/LikedVideos";
import Channel from "./pages/Channel";
import Search from "./pages/Search";

import {
  getVideos,
  searchVideos,
  getCategoryVideos,
  getTrendingVideos,
  getChannelVideos,
  getShortsVideos,
  getChannelImages,
} from "./services/videoApi";

import Watch from "./pages/Watch";


// ================= HOME =================

function Home({ videos }) {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");

  const [displayVideos, setDisplayVideos] = useState(videos);
  const [searching, setSearching] = useState(false);

  const categories = [
    "All",
    "Programming",
    "Music",
    "Gaming",
    "Live",
    "News",
    "Sports",
  ];

  const handleCategory = async (item) => {
    setCategory(item);

    // All → show original videos
    if (item === "All") {
      setDisplayVideos(videos);
      return;
    }

    try {
      setSearching(true);

      const results = await getCategoryVideos(item);

      setDisplayVideos(results);
    } catch (error) {
      console.error("Category error:", error);

      setDisplayVideos([]);

      alert("Unable to load category videos.");
    } finally {
      setSearching(false);
    }
  };

  const filteredVideos =
    category === "All"
      ? displayVideos
      : displayVideos;

  return (
    <>
      <Navbar
        search={search}
        setSearch={setSearch}
      />

      <Sidebar />

      <main className="main-content">

        {/* Categories */}
        <div className="categories">

          {categories.map((item) => (
            <button
              key={item}
              className={
                category === item
                  ? "category active"
                  : "category"
              }
              onClick={() => handleCategory(item)}
            >
              {item}
            </button>
          ))}

        </div>

        {/* Category heading */}
        {category !== "All" && (
          <h2 className="category-heading">
            {category}
          </h2>
        )}

        {/* Loading */}
        {searching ? (
          <p className="page-message">
            Loading {category} videos...
          </p>
        ) : filteredVideos.length === 0 ? (
          <p className="page-message">
            No videos found.
          </p>
        ) : (
          <VideoGrid videos={filteredVideos} />
        )}

      </main>
    </>
  );
}


// ================= TRENDING =================

function Trending() {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadTrending = async () => {
      try {
        const data = await getTrendingVideos();
        setVideos(data);
      } catch (error) {
        console.error(
          "Trending error:",
          error
        );
      } finally {
        setLoading(false);
      }
    };

    loadTrending();
  }, []);

  if (loading) {
    return (
      <>
        <Navbar />
        <Sidebar />

        <main className="main-content">
          <p className="page-message">
            Loading trending videos...
          </p>
        </main>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <Sidebar />

      <main className="main-content">
        <h1>🔥 Trending</h1>

        <p className="page-message">
          Popular videos in India
        </p>

        {videos.length === 0 ? (
          <p className="page-message">
            No trending videos found.
          </p>
        ) : (
          <VideoGrid videos={videos} />
        )}
      </main>
    </>
  );
}


// ================= SUBSCRIPTIONS =================

function Subscriptions() {
  const [subscribedChannels, setSubscribedChannels] =
    useState([]);

  const [channelVideos, setChannelVideos] =
    useState({});

  const [loading, setLoading] =
    useState(true);

  const CACHE_TIME =
    10 * 60 * 1000;


  useEffect(() => {
    const loadSubscriptions = async () => {
      try {
        setLoading(true);

        // =========================================
        // GET SAVED SUBSCRIPTIONS
        // =========================================

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
          return;
        }


        // =========================================
        // GET CHANNEL IDS
        // =========================================

        const channelIds =
          storedSubscriptions
            .map(
              (channel) => channel.id
            )
            .filter(Boolean);


        // =========================================
        // GET FRESH PROFILE IMAGES
        // =========================================

        const channelImages =
          await getChannelImages(
            channelIds
          );


        // =========================================
        // UPDATE SUBSCRIPTIONS
        // =========================================

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


        // =========================================
        // SAVE NEW IMAGES
        // =========================================

        localStorage.setItem(
          "subscribedChannels",
          JSON.stringify(
            updatedSubscriptions
          )
        );


        setSubscribedChannels(
          updatedSubscriptions
        );


        // =========================================
        // LOAD VIDEOS
        // =========================================

        const videosByChannel = {};


        for (
          const channel of updatedSubscriptions
        ) {
          try {
            const cacheKey =
              `subscriptionVideos_${channel.id}`;


            const cachedData =
              JSON.parse(
                localStorage.getItem(
                  cacheKey
                )
              );


            const now = Date.now();


            // =====================================
            // USE CACHE
            // =====================================

            if (
              cachedData &&
              cachedData.timestamp &&
              now -
                cachedData.timestamp <
                CACHE_TIME
            ) {
              videosByChannel[
                channel.id
              ] =
                cachedData.videos || [];

              continue;
            }


            // =====================================
            // FETCH VIDEOS
            // =====================================

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
              videos.filter(
                (video, index, array) =>
                  index ===
                  array.findIndex(
                    (item) =>
                      item.id ===
                      video.id
                  )
              );


            videosByChannel[
              channel.id
            ] = uniqueVideos;


            // =====================================
            // SAVE VIDEO CACHE
            // =====================================

            localStorage.setItem(
              cacheKey,
              JSON.stringify({
                timestamp:
                  Date.now(),
                videos:
                  uniqueVideos,
              })
            );

          } catch (error) {
            console.error(
              `Error loading videos for ${channel.name}:`,
              error
            );

            videosByChannel[
              channel.id
            ] = [];
          }
        }


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

      } finally {
        setLoading(false);
      }
    };


    loadSubscriptions();
  }, []);


  // =========================================
  // IMAGE ERROR FALLBACK
  // =========================================

  const handleImageError = (event) => {
    event.currentTarget.style.display =
      "none";

    const parent =
      event.currentTarget.parentElement;

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

        {/* =====================================
            HEADER
        ====================================== */}

        <div className="subscription-header">
          <h1>
            Subscriptions
          </h1>

          <p>
            {subscribedChannels.length}{" "}
            subscribed channels
          </p>
        </div>


        {/* =====================================
            CHANNEL LIST
        ====================================== */}

        {!loading &&
          subscribedChannels.length > 0 && (
            <div className="subscribed-channels">

              {subscribedChannels.map(
                (channel) => {

                  const image =
                    channel.image ||
                    channel.profileImage ||
                    "";

                  return (
                    <Link
                      to={`/channel/${channel.id}`}
                      className="subscribed-channel"
                      key={channel.id}
                    >

                      <div className="profile-image-wrapper">

                        {image && (
                          <img
                            src={image}
                            alt=""
                            onError={
                              handleImageError
                            }
                          />
                        )}

                        <div
                          className="profile-fallback"
                          style={{
                            display:
                              image
                                ? "none"
                                : "flex",
                          }}
                        >
                          {channel.name
                            ?.charAt(0)
                            ?.toUpperCase() ||
                            "C"}
                        </div>

                      </div>

                      <span>
                        {channel.name}
                      </span>

                    </Link>
                  );
                }
              )}

            </div>
          )}


        {/* =====================================
            LOADING
        ====================================== */}

        {loading ? (

          <p className="page-message">
            Loading subscriptions...
          </p>

        ) : subscribedChannels.length === 0 ? (

          <p className="page-message">
            You haven't subscribed to any
            channels yet.
          </p>

        ) : (

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

                    {/* CHANNEL HEADER */}

                    <div className="subscription-section-header">

                      <Link
                        to={`/channel/${channel.id}`}
                        className="subscription-channel-info"
                      >

                        <div className="subscription-section-avatar">

                          {image ? (
                            <img
                              src={image}
                              alt=""
                              onError={
                                handleImageError
                              }
                            />
                          ) : (
                            <div className="profile-fallback">
                              {channel.name
                                ?.charAt(0)
                                ?.toUpperCase() ||
                                "C"}
                            </div>
                          )}

                        </div>


                        <div>
                          <h2>
                            {channel.name}
                          </h2>

                          <span>
                            View channel
                          </span>
                        </div>

                      </Link>

                    </div>


                    {/* VIDEOS */}

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
// ================= SHORTS =================

function ShortsPage() {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadShorts = async () => {
      try {
        const data = await getShortsVideos();
        setVideos(data);
      } catch (error) {
        console.error("Shorts error:", error);
      } finally {
        setLoading(false);
      }
    };

    loadShorts();
  }, []);

  return (
    <>
      <Navbar />
      <Sidebar />

      <main className="main-content">
        <h1>Shorts</h1>

        {loading ? (
          <p className="page-message">
            Loading Shorts...
          </p>
        ) : videos.length === 0 ? (
          <p className="page-message">
            No Shorts available.
          </p>
        ) : (
          <div className="shorts-grid">
            {videos.map((video) => (
              <div className="short-card" key={video.id}>
                <Link
                  to={`/watch/${video.id}`}
                  className="short-link"
                >
                  <div className="short-thumbnail">
                    <img
                      src={video.thumbnail}
                      alt={video.title}
                    />
                  </div>

                  <h3>{video.title}</h3>

                  <p>{video.channel}</p>
                </Link>
              </div>
            ))}
          </div>
        )}
      </main>
    </>
  );
}


// ================= APP =================

function App() {

  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);


  // Load videos from videoApi.js
  useEffect(() => {

    const loadVideos = async () => {

      const data = await getVideos();

      setVideos(data);

      setLoading(false);
    };

    loadVideos();

  }, []);


  // Loading screen
  if (loading) {
    return (
      <div className="page-message">
        Loading videos...
      </div>
    );
  }


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
          element={<Watch />}
        />


        {/* TRENDING */}

        <Route
          path="/trending"
          element={<Trending />}
        />


        {/* SUBSCRIPTIONS */}

        <Route
          path="/subscriptions"
          element={<Subscriptions />}
        />


        {/* HISTORY */}

        <Route
          path="/history"
          element={
            <>
              <Navbar />
              <Sidebar />

              <main className="main-content">
                <History />
              </main>
            </>
          }
        />


        {/* WATCH LATER */}

        <Route
          path="/watch-later"
          element={
            <>
              <Navbar />
              <Sidebar />

              <main className="main-content">
                <WatchLater />
              </main>
            </>
          }
        />


        {/* LIKED */}

        <Route
          path="/liked"
          element={
            <>
              <Navbar />
              <Sidebar />

              <main className="main-content">
                <LikedVideos />
              </main>
            </>
          }
        />


        {/* SHORTS */}

        <Route
          path="/shorts"
          element={<ShortsPage />}
        />


        {/* MUSIC */}

        <Route
          path="/music"
          element={
            <Page
              title="Music"
              message="Music videos will appear here."
            />
          }
        />
        <Route path="/search" element={<Search />} />
        <Route
         path="/channel/:id" 
         element={
         <Channel />} 
         />

      </Routes>

    </BrowserRouter>
  );
}

export default App;