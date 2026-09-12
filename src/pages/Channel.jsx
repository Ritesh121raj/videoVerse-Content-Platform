import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

import {
  getChannelVideos,
  getChannelDetails,
  getChannelShorts,
} from "../services/videoApi";

import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import VideoGrid from "../components/VideoGrid";

function Channel() {
  const { id } = useParams();

  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("videos");
  const [shorts, setShorts] = useState([]);

  const [channelName, setChannelName] = useState("");
  const [channelImage, setChannelImage] = useState("");
  const [banner, setBanner] = useState("");
  const [description, setDescription] = useState("");
  const [subscribers, setSubscribers] = useState("0");
  const [totalViews, setTotalViews] = useState("0");

  const [subscribed, setSubscribed] = useState(false);

  useEffect(() => {
      const loadChannel = async () => {
        try {
          setLoading(true);

          const [videoData, channelData] = await Promise.all([
            getChannelVideos(id),
            getChannelDetails(id),
          ]);

          setVideos(videoData);

          if (channelData) {
            setChannelName(channelData.name || "Channel");
            setChannelImage(channelData.profileImage || "");
            setBanner(channelData.banner || "");
            setDescription(channelData.description || "");
            setSubscribers(channelData.subscribers || "0");
            setTotalViews(channelData.totalViews || "0");
          }

          const oldSubscriptions =
            JSON.parse(
              localStorage.getItem("subscribedChannels")
            ) || [];

          const alreadySubscribed = oldSubscriptions.some(
            (channel) => channel.id === id
          );

          setSubscribed(alreadySubscribed);
        } catch (error) {
          console.error("Error loading channel:", error);
        } finally {
          setLoading(false);
        }
      };

      loadChannel();
    }, [id]);
    useEffect(() => {
        const loadShorts = async () => {
          try {
            const shortsData = await getChannelShorts(id);
            setShorts(shortsData);
          } catch (error) {
            console.error("Error loading shorts:", error);
          }
        };

        loadShorts();
      }, [id]);

  const handleSubscribe = () => {
    const oldSubscriptions =
      JSON.parse(
        localStorage.getItem(
          "subscribedChannels"
        )
      ) || [];

    let updatedSubscriptions;

    if (subscribed) {
      updatedSubscriptions =
        oldSubscriptions.filter(
          (channel) => channel.id !== id
        );
    } else {
      updatedSubscriptions = [
        ...oldSubscriptions,
        {
          id: id,
          name: channelName,
        },
      ];
    }

    localStorage.setItem(
      "subscribedChannels",
      JSON.stringify(updatedSubscriptions)
    );

    setSubscribed(!subscribed);
  };

  const formatNumber = (value) => {
    const number = Number(value);

    if (number >= 1000000000) {
      return `${(number / 1000000000).toFixed(1)}B`;
    }

    if (number >= 1000000) {
      return `${(number / 1000000).toFixed(1)}M`;
    }

    if (number >= 1000) {
      return `${(number / 1000).toFixed(1)}K`;
    }

    return number.toString();
  };

  const formatSubscribers = (count) => {
    return `${formatNumber(count)} subscribers`;
  };

  return (
    <>
      <Navbar />
      <Sidebar />

      <main className="main-content">

        {/* ================= CHANNEL BANNER ================= */}

        <div className="channel-banner">
          {banner ? (
            <img
              src={banner}
              alt="Channel banner"
            />
          ) : (
            <div className="default-banner"></div>
          )}
        </div>

        {/* ================= CHANNEL INFO ================= */}

        <div className="channel-header">

          {/* PROFILE IMAGE */}

          <div className="channel-avatar">
            {channelImage ? (
              <img
                src={channelImage}
                alt={channelName}
              />
            ) : (
              <div>
                {channelName
                  ? channelName
                      .charAt(0)
                      .toUpperCase()
                  : "C"}
              </div>
            )}
          </div>

          {/* CHANNEL DETAILS */}

          <div className="channel-info">

            <h1>
              {channelName || "Channel"}
            </h1>

            <p>
              {formatSubscribers(
                subscribers
              )}
            </p>

            <p>
              {videos.length} videos
            </p>

            <button
              className={
                subscribed
                  ? "subscribe subscribed"
                  : "subscribe"
              }
              onClick={handleSubscribe}
            >
              {subscribed
                ? "Subscribed"
                : "Subscribe"}
            </button>

          </div>
        </div>

        {/* ================= CHANNEL STATS ================= */}

        <div className="channel-stats">

          <div>
            <strong>
              {formatNumber(subscribers)}
            </strong>
            <span>Subscribers</span>
          </div>

          <div>
            <strong>
              {formatNumber(totalViews)}
            </strong>
            <span>Total Views</span>
          </div>

          <div>
            <strong>
              {videos.length}
            </strong>
            <span>Videos</span>
          </div>

        </div>

        {/* ================= ABOUT ================= */}

        {description && (
          <div className="channel-about">

            <h2>About</h2>

            <p>
              {description}
            </p>

          </div>
        )}

        {/* ================= TABS ================= */}

        <div className="channel-tabs">

          <button
            className={
              activeTab === "videos"
                ? "channel-tab active"
                : "channel-tab"
            }
            onClick={() => setActiveTab("videos")}
          >
            Videos
          </button>

          <button
            className={
              activeTab === "shorts"
                ? "channel-tab active"
                : "channel-tab"
            }
            onClick={() => setActiveTab("shorts")}
          >
            Shorts
          </button>

          <button
            className={
              activeTab === "about"
                ? "channel-tab active"
                : "channel-tab"
            }
            onClick={() => setActiveTab("about")}
          >
            About
          </button>

        </div>

        <hr />

        {/* ================= VIDEOS ================= */}

        {activeTab === "videos" && (
  <>
            <h2 className="channel-videos-title">
              Videos
            </h2>

            {loading ? (
              <p className="page-message">
                Loading channel videos...
              </p>
            ) : videos.length === 0 ? (
              <p className="page-message">
                No videos available from this channel.
              </p>
            ) : (
              <VideoGrid videos={videos} />
            )}
          </>
        )}

        {activeTab === "shorts" && (
          <div className="channel-tab-content">
            <h2>Shorts</h2>

            {shorts.length === 0 ? (
              <p className="page-message">
                No Shorts available from this channel.
              </p>
            ) : (
              <VideoGrid videos={shorts} />
            )}
          </div>
        )}

        {activeTab === "about" && (
          <div className="channel-tab-content">
            <h2>About</h2>

            <p className="channel-description">
              {description ||
                "No channel description available."}
            </p>

            <div className="about-details">

              <p>
                <strong>Subscribers:</strong>{" "}
                {formatNumber(subscribers)}
              </p>

              <p>
                <strong>Total views:</strong>{" "}
                {formatNumber(totalViews)}
              </p>

              <p>
                <strong>Total videos:</strong>{" "}
                {videos.length}
              </p>

            </div>
          </div>
        )}

      </main>
    </>
  );
}

export default Channel;