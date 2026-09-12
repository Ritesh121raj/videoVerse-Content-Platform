import { useEffect, useState } from "react";
import {
  BrowserRouter,
  Routes,
  Route,
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

import {
  getVideos,
  searchVideos,
  getCategoryVideos,
  getTrendingVideos,
  getChannelVideos,
  getShortsVideos,
} from "./services/videoApi";

import Watch from "./pages/Watch";


// ================= HOME =================

function Home({ videos }) {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");

  const [displayVideos, setDisplayVideos] = useState(videos);
  const [searching, setSearching] = useState(false);

  const handleCategory = async (item) => {
  setCategory(item);

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
    alert("Unable to load category videos.");
  } finally {
    setSearching(false);
  }
};

  const handleSearch = async () => {
    if (!search.trim()) {
      setDisplayVideos(videos);
      return;
    }

    try {
      setSearching(true);

      const results = await searchVideos(search);

      setDisplayVideos(results);
    } catch (error) {
      console.error("Search error:", error);
      alert("Unable to search YouTube.");
    } finally {
      setSearching(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  const filteredVideos =
    category === "All"
      ? displayVideos
      : displayVideos.filter(
          (video) => video.category === category
        );

  return (
    <>
      <Navbar
        search={search}
        setSearch={setSearch}
        onSearch={handleSearch}
        onKeyDown={handleKeyDown}
      />

      <Sidebar />

      <main className="main-content">

        {/* Categories */}
        <div className="categories">
          {[
            "All",
            "Programming",
            "Music",
            "Gaming",
            "Live",
            "News",
            "Sports",
          ].map((item) => (
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

        {/* Search heading */}
        {search.trim() !== "" && (
          <h2>
            Search results for "{search}"
          </h2>
        )}

        {/* Loading */}
        {searching ? (
          <p className="page-message">
            Searching YouTube...
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
  const [subscribedVideos, setSubscribedVideos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadSubscriptions = async () => {
      try {
        setLoading(true);

        const subscribedChannels =
          JSON.parse(
            localStorage.getItem(
              "subscribedChannels"
            )
          ) || [];

        if (subscribedChannels.length === 0) {
          setSubscribedVideos([]);
          setLoading(false);
          return;
        }

        const channelVideos = await Promise.all(
          subscribedChannels.map((channel) =>
            getChannelVideos(channel.id)
          )
        );

        const allVideos =
          channelVideos.flat();

        setSubscribedVideos(allVideos);
      } catch (error) {
        console.error(
          "Subscriptions error:",
          error
        );
      } finally {
        setLoading(false);
      }
    };

    loadSubscriptions();
  }, []);

  const subscribedChannels =
    JSON.parse(
      localStorage.getItem(
        "subscribedChannels"
      )
    ) || [];

  return (
    <>
      <Navbar />
      <Sidebar />

      <main className="main-content">

        <h1>Subscriptions</h1>

        {loading ? (

          <p className="page-message">
            Loading subscribed videos...
          </p>

        ) : subscribedChannels.length === 0 ? (

          <p className="page-message">
            You haven't subscribed to any
            channels yet.
          </p>

        ) : subscribedVideos.length === 0 ? (

          <p className="page-message">
            No videos available from your
            subscribed channels.
          </p>

        ) : (

          <VideoGrid
            videos={subscribedVideos}
          />

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
                <a
                  href={`/watch/${video.id}`}
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
                </a>
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
        <Route
         path="/channel/:id" 
         element={
         <Channel />} />

      </Routes>

    </BrowserRouter>
  );
}

export default App;