import { useParams } from "react-router-dom";
import { useState } from "react";
import {
  ThumbsUp,
  ThumbsDown,
  Share2,
  Download,
  Bookmark,
} from "lucide-react";

function Watch() {

  const { id } = useParams();

  const videos = {
    cpp: {
      title: "Learn C++ Programming From Scratch",
      channel: "Code Academy",
      views: "1.2M",
      time: "2 weeks ago",
      subscribers: "500K",
      description:
        "Learn C++ programming from scratch. This complete tutorial covers the fundamentals of C++ programming.",
      videoUrl: "https://www.youtube.com/embed/vLnPwxZdW4Y",
    },

    react: {
      title: "Complete React JS Tutorial",
      channel: "Web Dev",
      views: "850K",
      time: "1 month ago",
      subscribers: "320K",
      description:
        "Learn React JS from the basics and build modern web applications.",
      videoUrl: "https://www.youtube.com/embed/SqcY0GlETPk",
    },

    dsa: {
      title: "Master Data Structures & Algorithms",
      channel: "DSA World",
      views: "2.4M",
      time: "3 months ago",
      subscribers: "900K",
      description:
        "Learn important Data Structures and Algorithms concepts and improve your problem-solving skills.",
      videoUrl: "https://www.youtube.com/embed/8hly31xKli0",
    },

    fullstack: {
      title: "Build a Full Stack Website",
      channel: "Programming Hub",
      views: "540K",
      time: "5 days ago",
      subscribers: "250K",
      description:
        "Learn how to build a complete full-stack website using modern technologies.",
      videoUrl: "https://www.youtube.com/embed/nu_pCVPKzTk",
    },

    javascript: {
      title: "JavaScript Projects for Beginners",
      channel: "Code With Me",
      views: "720K",
      time: "2 weeks ago",
      subscribers: "400K",
      description:
        "Build useful JavaScript projects and improve your programming skills.",
      videoUrl: "https://www.youtube.com/embed/PkZNo7MFNFg",
    },

    competitive: {
      title: "How to Get Better at Competitive Programming",
      channel: "CP Master",
      views: "430K",
      time: "1 week ago",
      subscribers: "180K",
      description:
        "Learn strategies and techniques to improve your competitive programming skills.",
      videoUrl: "https://www.youtube.com/embed/m5E9J1qWw1Y",
    },
  };

  const video = videos[id];

    const [liked, setLiked] = useState(() => {
      const likedVideos =
        JSON.parse(localStorage.getItem("likedVideos")) || [];

      return likedVideos.some(
        (item) => item.id === id
      );
    });
        const handleLike = () => {
      const likedVideos =
        JSON.parse(localStorage.getItem("likedVideos")) || [];

      if (liked) {
        const updatedVideos = likedVideos.filter(
          (item) => item.id !== video.id
        );

        localStorage.setItem(
          "likedVideos",
          JSON.stringify(updatedVideos)
        );

        setLiked(false);
      } else {
        likedVideos.unshift(video);

        localStorage.setItem(
          "likedVideos",
          JSON.stringify(likedVideos)
        );

        setLiked(true);
      }
    };
  const saveToWatchLater = () => {

  const saved =
    JSON.parse(localStorage.getItem("watchLater")) || [];

  const alreadySaved = saved.some(
    (item) => item.id === id
  );

  if (alreadySaved) {
    alert("Video is already in Watch Later!");
    return;
  }

  saved.unshift(video);

  localStorage.setItem(
    "watchLater",
    JSON.stringify(saved)
  );

  alert("Video saved to Watch Later!");
};

  // If video doesn't exist
  if (!video) {
    return (
      <div className="watch-page">
        <h1>Video not found</h1>
      </div>
    );
  }

  return (
    <div className="watch-page">

      {/* Video Player */}

      <div className="player">

        <iframe
          width="100%"
          height="100%"
          src={video.videoUrl}
          title={video.title}
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        ></iframe>

      </div>


      {/* Title */}

      <h1>
        {video.title}
      </h1>


      {/* Channel + Buttons */}

      <div className="watch-info">

        <div className="channel-details">

          <div className="channel-logo large">
            {video.channel.charAt(0)}
          </div>

          <div>
            <h3>
              {video.channel}
            </h3>

            <p>
              {video.subscribers} subscribers
            </p>
          </div>

          <button className="subscribe">
            Subscribe
          </button>

        </div>


        <div className="watch-actions">

          <button
            onClick={handleLike}
            className={liked ? "liked-button" : ""}
          >
            <ThumbsUp
              size={20}
              fill={liked ? "currentColor" : "none"}
            />

            {liked ? "Liked" : "Like"}
          </button>

          <button>
            <ThumbsDown size={20} />
            Dislike
          </button>

          <button>
            <Share2 size={20} />
            Share
          </button>

          <button>
            <Download size={20} />
            Download
          </button>

          <button onClick={saveToWatchLater}>
            <Bookmark size={20} />
            Save
          </button>

        </div>

      </div>


      {/* Description */}

      <div className="description">

        <strong>
          {video.views} views • {video.time}
        </strong>

        <p>
          {video.description}
        </p>

      </div>


      {/* Comments */}

      <div className="comments">

        <h2>
          Comments
        </h2>


        <div className="comment">

          <div className="comment-avatar">
            A
          </div>

          <div>
            <strong>
              Alex
            </strong>

            <p>
              Great video! 🔥
            </p>
          </div>

        </div>


        <div className="comment">

          <div className="comment-avatar">
            R
          </div>

          <div>
            <strong>
              Rahul
            </strong>

            <p>
              Very useful video!
            </p>
          </div>

        </div>

      </div>

    </div>
  );
}

export default Watch;