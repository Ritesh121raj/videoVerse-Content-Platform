import { useState } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import Navbar from "./components/Navbar";
import Sidebar from "./components/Sidebar";
import VideoCard from "./components/VideoCard";
import Shorts from "./components/Shorts";
import Page from "./components/Page";
import VideoGrid from "./components/VideoGrid";
import History from "./components/History";

import Watch from "./pages/Watch";
const videos = [
  {
    id: "cpp",
    category: "Programming",
    image:
      "https://images.unsplash.com/photo-1515879218367-8466d910aaa4",
    title: "Learn C++ Programming From Scratch",
    channel: "Code Academy",
    views: "1.2M",
    time: "2 weeks ago",
  },

  {
    id: "react",
    category: "Programming",
    image:
      "https://images.unsplash.com/photo-1633356122544-f134324a6cee",
    title: "Complete React JS Tutorial",
    channel: "Web Dev",
    views: "850K",
    time: "1 month ago",
  },

  {
    id: "dsa",
    category: "Programming",
    image:
      "https://images.unsplash.com/photo-1555949963-aa79dcee981c",
    title: "Master Data Structures & Algorithms",
    channel: "DSA World",
    views: "2.4M",
    time: "3 months ago",
  },

  {
    id: "fullstack",
    category: "Programming",
    image: "https://picsum.photos/400/225?random=4",
    title: "Build a Full Stack Website",
    channel: "Programming Hub",
    views: "540K",
    time: "5 days ago",
  },

  {
    id: "javascript",
    category: "Programming",
    image: "https://picsum.photos/400/225?random=5",
    title: "JavaScript Projects for Beginners",
    channel: "Code With Me",
    views: "720K",
    time: "2 weeks ago",
  },

  {
    id: "competitive",
    category: "Programming",
    image: "https://picsum.photos/400/225?random=6",
    title: "How to Get Better at Competitive Programming",
    channel: "CP Master",
    views: "430K",
    time: "1 week ago",
  },

  {
    id: "gaming",
    category: "Gaming",
    image: "https://picsum.photos/400/225?random=7",
    title: "Best Gaming Moments of 2026",
    channel: "Game Zone",
    views: "1.5M",
    time: "3 days ago",
  },

  {
    id: "music",
    category: "Music",
    image: "https://picsum.photos/400/225?random=8",
    title: "Top Music Hits 2026",
    channel: "Music World",
    views: "3.1M",
    time: "1 week ago",
  },

  {
    id: "news",
    category: "News",
    image: "https://picsum.photos/400/225?random=9",
    title: "Latest Technology News",
    channel: "Tech News",
    views: "900K",
    time: "2 hours ago",
  },
];


function Home() {

  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");

  // videos array is above Home()

  const filteredVideos = videos.filter((video) => {

    const text =
      video.title + " " + video.channel;

    const matchesSearch =
      text.toLowerCase().includes(search.toLowerCase());

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

        <div className="categories">

          <button
            onClick={() => setCategory("All")}
            className={category === "All" ? "selected" : ""}
          >
            All
          </button>

          <button
            onClick={() => setCategory("Programming")}
            className={category === "Programming" ? "selected" : ""}
          >
            Programming
          </button>

          <button
            onClick={() => setCategory("Music")}
            className={category === "Music" ? "selected" : ""}
          >
            Music
          </button>

          <button
            onClick={() => setCategory("Gaming")}
            className={category === "Gaming" ? "selected" : ""}
          >
            Gaming
          </button>

          <button
            onClick={() => setCategory("Live")}
            className={category === "Live" ? "selected" : ""}
          >
            Live
          </button>

          <button
            onClick={() => setCategory("News")}
            className={category === "News" ? "selected" : ""}
          >
            News
          </button>

          <button
            onClick={() => setCategory("Sports")}
            className={category === "Sports" ? "selected" : ""}
          >
            Sports
          </button>

        </div>


        {/* SHORTS */}

        {category === "All" && search === "" && (
          <Shorts />
        )}


        {/* VIDEOS */}

        <VideoGrid videos={filteredVideos} />

      </main>
    </>
  );
}

function Trending() {
  const trendingVideos = [...videos].sort((a, b) => {
    const viewsA = parseFloat(a.views);
    const viewsB = parseFloat(b.views);

    return viewsB - viewsA;
  });

  return (
    <>
      <Navbar />

      <Sidebar />

      <main className="main-content">

        <h1>🔥 Trending</h1>

        <p className="page-message">
          Popular videos right now
        </p>

        <VideoGrid videos={trendingVideos} />

      </main>
    </>
  );
}


function App() {

  return (

    <BrowserRouter>

      <Routes>

  <Route
    path="/"
    element={<Home />}
  />

  <Route
    path="/watch/:id"
    element={<Watch />}
  />

  <Route
    path="/trending"
    element={<Trending />}
  />

  <Route
    path="/subscriptions"
    element={
      <Page
        title="Subscriptions"
        message="Your subscribed channels will appear here."
      />
    }
  />

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

  <Route
    path="/watch-later"
    element={
      <Page
        title="Watch Later"
        message="Videos you save for later will appear here."
      />
    }
  />

  <Route
    path="/liked"
    element={
      <Page
        title="Liked Videos"
        message="Your liked videos will appear here."
      />
    }
  />

  <Route
    path="/shorts"
    element={
      <Page
        title="Shorts"
        message="Short videos will appear here."
      />
    }
  />

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