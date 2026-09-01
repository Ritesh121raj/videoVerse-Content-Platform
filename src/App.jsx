import { useState } from "react";
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

import videos from "./data/videos";

import Watch from "./pages/Watch";


// ================= HOME =================

function Home() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");

  const filteredVideos = videos.filter((video) => {
    const text =
      video.title +
      " " +
      video.channel +
      " " +
      video.category;

    const matchesSearch = text
      .toLowerCase()
      .includes(search.toLowerCase());

    const matchesCategory =
      category === "All" ||
      video.category === category;

    return matchesSearch && matchesCategory;
  });

  return (
    <>
      <Navbar
        search={search}
        setSearch={setSearch}
      />

      <Sidebar />

      <main className="main-content">

        {/* CATEGORIES */}

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
              onClick={() => setCategory(item)}
            >
              {item}
            </button>
          ))}

        </div>


        {/* SHORTS */}

        {category === "All" &&
          search === "" && <Shorts />}


        {/* SEARCH MESSAGE */}

        {search !== "" && (
          <h2>
            Search results for "{search}"
          </h2>
        )}


        {/* VIDEOS */}

        {filteredVideos.length === 0 ? (
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


// ================= TRENDING =================

function Trending() {

  const trendingVideos = [...videos].sort(
    (a, b) => {
      const viewsA = parseFloat(a.views);
      const viewsB = parseFloat(b.views);

      return viewsB - viewsA;
    }
  );

  return (
    <>
      <Navbar />
      <Sidebar />

      <main className="main-content">

        <h1>🔥 Trending</h1>

        <p className="page-message">
          Popular videos right now
        </p>

        <VideoGrid
          videos={trendingVideos}
        />

      </main>
    </>
  );
}


// ================= SUBSCRIPTIONS =================

function Subscriptions() {

  const subscribedChannels =
    JSON.parse(
      localStorage.getItem(
        "subscribedChannels"
      )
    ) || [];


  const subscribedVideos = videos.filter(
    (video) =>
      subscribedChannels.includes(
        video.channel
      )
  );


  return (
    <>
      <Navbar />
      <Sidebar />

      <main className="main-content">

        <h1>Subscriptions</h1>


        {subscribedChannels.length === 0 ? (

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


// ================= APP =================

function App() {

  return (
    <BrowserRouter>

      <Routes>

        {/* HOME */}

        <Route
          path="/"
          element={<Home />}
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
          element={
            <Page
              title="Shorts"
              message="Short videos will appear here."
            />
          }
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

      </Routes>

    </BrowserRouter>
  );
}

export default App;