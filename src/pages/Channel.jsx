import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import VideoGrid from "../components/VideoGrid";

import {
  getChannelVideos,
  getChannelDetails,
  getChannelShorts,
} from "../services/videoApi";


// ======================================================
// FORMAT NUMBERS LIKE YOUTUBE
// ======================================================

function formatNumber(number) {
  const num = Number(number || 0);

  if (num >= 1000000000) {
    return (
      (num / 1000000000)
        .toFixed(1)
        .replace(".0", "") + "B"
    );
  }

  if (num >= 1000000) {
    return (
      (num / 1000000)
        .toFixed(1)
        .replace(".0", "") + "M"
    );
  }

  if (num >= 1000) {
    return (
      (num / 1000)
        .toFixed(1)
        .replace(".0", "") + "K"
    );
  }

  return num.toString();
}


// ======================================================
// GET CURRENT USER
// ======================================================

function getCurrentUser() {
  try {
    const savedUser = JSON.parse(
      localStorage.getItem("videoVerseCurrentUser")
    );

    return savedUser?.user || null;
  } catch {
    return null;
  }
}


// ======================================================
// CHANNEL PAGE
// ======================================================

function Channel() {
  const { id } = useParams();

  const [videos, setVideos] = useState([]);
  const [shorts, setShorts] = useState([]);

  const [channelName, setChannelName] = useState("");
  const [channelImage, setChannelImage] = useState("");
  const [banner, setBanner] = useState("");

  const [description, setDescription] = useState("");

  const [subscribers, setSubscribers] =
    useState("0");

  const [totalViews, setTotalViews] =
    useState("0");

  const [videoCount, setVideoCount] =
    useState("0");

  const [activeTab, setActiveTab] =
    useState("Videos");

  const [loading, setLoading] =
    useState(true);

  const [shortsLoading, setShortsLoading] =
    useState(false);

  const [subscribed, setSubscribed] =
    useState(false);

  const [error, setError] =
    useState(null);

  const [shortsError, setShortsError] =
    useState(null);

  const [bannerError, setBannerError] =
    useState(false);

  const [channelImageError, setChannelImageError] =
    useState(false);


  // ======================================================
  // LOAD CHANNEL DATA
  // ======================================================

  const loadChannel = async () => {
    try {
      setLoading(true);
      setError(null);

      // ------------------------------------------
      // GET CHANNEL DETAILS FIRST
      // ------------------------------------------

      const channelData =
        await getChannelDetails(id);

      if (!channelData) {
        setVideos([]);

        setError(
          "Channel information could not be loaded."
        );

        return;
      }

      console.log(
        "CHANNEL DATA:",
        channelData
      );

      // ------------------------------------------
      // SET CHANNEL INFORMATION
      // ------------------------------------------

      setChannelName(
        channelData.name || "Channel"
      );

      setChannelImage(
        channelData.profileImage || ""
      );

      setBanner(
        channelData.banner || ""
      );

      setDescription(
        channelData.description || ""
      );

      setSubscribers(
        channelData.subscribers || "0"
      );

      setTotalViews(
        channelData.totalViews || "0"
      );

      setVideoCount(
        channelData.videoCount || "0"
      );



      // ------------------------------------------
      // Check Subscription From Backend
      // ------------------------------------------

      const token =
        localStorage.getItem("videoVerseToken");

      if (token) {
        try {
          const response = await fetch(
            "https://videoverse-content-platform.onrender.com/api/user/subscriptions",
            {
              method: "GET",
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );

          const data = await response.json();

          if (response.ok) {
            const subscribedChannels =
              Array.isArray(data.subscribedChannels)
                ? data.subscribedChannels
                : [];

            setSubscribed(
              subscribedChannels.some(
                (channelId) =>
                  String(channelId) === String(id)
              )
            );
          } else {
            setSubscribed(false);
          }
        } catch (subscriptionError) {
          console.error(
            "Subscription loading error:",
            subscriptionError
          );

          setSubscribed(false);
        }
      } else {
        setSubscribed(false);
      }

      // ------------------------------------------
      // GET CHANNEL VIDEOS
      // ------------------------------------------

      const channelVideos =
        await getChannelVideos(
          id,
          channelData.profileImage || ""
        );

      setVideos(
        channelVideos
      );

    } catch (error) {
      console.error(
        "Error loading channel:",
        error
      );

      setVideos([]);

      setError(
        error?.message ||
          "Unable to load channel. Please try again."
      );

    } finally {
      setLoading(false);
    }
  };


  // ======================================================
  // LOAD CHANNEL WHEN ID CHANGES
  // ======================================================

  useEffect(() => {
    if (id) {
      loadChannel();
    }
  }, [id]);


  // ======================================================
  // LOAD SHORTS ONLY WHEN SHORTS TAB OPENS
  // ======================================================

  useEffect(() => {
    if (
      activeTab !== "Shorts" ||
      !id ||
      !channelImage
    ) {
      return;
    }

    const loadShorts = async () => {
      try {
        setShortsLoading(true);
        setShortsError(null);

        const data =
          await getChannelShorts(
            id,
            channelImage
          );

        setShorts(data);

      } catch (error) {
        console.error(
          "Error loading channel shorts:",
          error
        );

        setShorts([]);

        setShortsError(
          error?.message ||
            "Unable to load Shorts. Please try again."
        );

      } finally {
        setShortsLoading(false);
      }
    };

    loadShorts();

  }, [
    activeTab,
    id,
    channelImage,
  ]);




  // ======================================================
  // Subscribe / Unsubscribe
  // ======================================================

  const handleSubscribe = async () => {
    if (!id) {
      return;
    }

    const token =
      localStorage.getItem("videoVerseToken");

    if (!token) {
      alert("Please login to subscribe.");
      return;
    }

    try {
      // ==================================================
      // UNSUBSCRIBE
      // ==================================================

      if (subscribed) {
        const response = await fetch(
          `https://videoverse-content-platform.onrender.com/api/user/subscriptions/${id}`,
          {
            method: "DELETE",
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data.message ||
              "Unable to unsubscribe"
          );
        }

        setSubscribed(false);

        // Keep local cache in sync
        const updatedSubscriptions =
          Array.isArray(data.subscribedChannels)
            ? data.subscribedChannels.map(
                (channelId) => ({
                  id: channelId,
                })
              )
            : [];

        localStorage.setItem(
          "subscribedChannels",
          JSON.stringify(
            updatedSubscriptions
          )
        );

        window.dispatchEvent(
          new Event("subscriptionsUpdated")
        );

        return;
      }

      // ==================================================
      // SUBSCRIBE
      // ==================================================

      const response = await fetch(
        "https://videoverse-content-platform.onrender.com/api/user/subscriptions",
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json",

            Authorization:
              `Bearer ${token}`,
          },

          body: JSON.stringify({
            channelId: id,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Unable to subscribe"
        );
      }

      setSubscribed(true);

      // Keep local cache in sync
      const updatedSubscriptions =
        Array.isArray(data.subscribedChannels)
          ? data.subscribedChannels.map(
              (channelId) => ({
                id: channelId,
              })
            )
          : [];

      localStorage.setItem(
        "subscribedChannels",
        JSON.stringify(
          updatedSubscriptions
        )
      );

      window.dispatchEvent(
        new Event("subscriptionsUpdated")
      );

    } catch (error) {
      console.error(
        "Subscription error:",
        error
      );

      alert(
        error?.message ||
          "Unable to update subscription."
      );
    }
  };

  // ======================================================
  // LOADING
  // ======================================================

  if (loading) {
    return (
      <>
        <Navbar />
        <Sidebar />

        <main className="main-content channel-page">

          <p className="page-message">
            Loading channel...
          </p>

        </main>
      </>
    );
  }


  // ======================================================
  // ERROR
  // ======================================================

  if (error) {
    return (
      <>
        <Navbar />
        <Sidebar />

        <main className="main-content channel-page">

          <div className="page-message">

            <h2>
              Something went wrong
            </h2>

            <p>
              {error}
            </p>

            <button
              onClick={loadChannel}
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

        </main>
      </>
    );
  }


  // ======================================================
  // MAIN UI
  // ======================================================

  return (
    <>
      <Navbar />
      <Sidebar />

      <main className="main-content channel-page">

        {/* ==================================================
            CHANNEL BANNER
        ================================================== */}

        <div className="channel-banner">

          {!bannerError && banner ? (

            <img
              src={banner}
                    loading="lazy"
                    decoding="async"
              alt={`${channelName} banner`}
              onError={() =>
                setBannerError(true)
              }
            />

          ) : (

            <div className="default-banner">

              <span>
                {channelName}
              </span>

            </div>

          )}

        </div>


        {/* ==================================================
            CHANNEL HEADER
        ================================================== */}

        <div className="channel-header">

          {/* PROFILE IMAGE */}

          <div className="channel-avatar">

            {!channelImageError &&
            channelImage ? (

              <img
                src={channelImage}
                    loading="lazy"
                    decoding="async"
                alt={channelName}
                onError={() =>
                  setChannelImageError(true)
                }
              />

            ) : (

              <div className="channel-avatar-fallback">

                {channelName
                  ? channelName
                      .charAt(0)
                      .toUpperCase()
                  : "C"}

              </div>

            )}

          </div>


          {/* CHANNEL INFORMATION */}

          <div className="channel-info">

            <h1>
              {channelName}
            </h1>

            <p className="channel-handle">
              {channelName}
            </p>

            <p className="channel-sub-info">

              {formatNumber(
                subscribers
              )}

              {" "}
              subscribers

              {" • "}

              {formatNumber(
                videoCount
              )}

              {" "}
              videos

            </p>


            {/* SUBSCRIBE BUTTON */}

            <button
              className={
                subscribed
                  ? "subscribe-btn subscribed"
                  : "subscribe-btn"
              }
              onClick={
                handleSubscribe
              }
            >

              {subscribed
                ? "Subscribed"
                : "Subscribe"}

            </button>

          </div>

        </div>


        {/* ==================================================
            CHANNEL STATS
        ================================================== */}

        <div className="channel-stats">

          <div className="stat-item">

            <strong>
              {formatNumber(
                subscribers
              )}
            </strong>

            <span>
              Subscribers
            </span>

          </div>


          <div className="stat-item">

            <strong>
              {formatNumber(
                totalViews
              )}
            </strong>

            <span>
              Total Views
            </span>

          </div>


          <div className="stat-item">

            <strong>
              {formatNumber(
                videoCount
              )}
            </strong>

            <span>
              Videos
            </span>

          </div>

        </div>


        {/* ==================================================
            TABS
        ================================================== */}

        <div className="channel-tabs">

          <button
            className={
              activeTab === "Videos"
                ? "active"
                : ""
            }
            onClick={() =>
              setActiveTab("Videos")
            }
          >
            Videos
          </button>


          <button
            className={
              activeTab === "Shorts"
                ? "active"
                : ""
            }
            onClick={() =>
              setActiveTab("Shorts")
            }
          >
            Shorts
          </button>


          <button
            className={
              activeTab === "About"
                ? "active"
                : ""
            }
            onClick={() =>
              setActiveTab("About")
            }
          >
            About
          </button>

        </div>


        {/* ==================================================
            VIDEOS TAB
        ================================================== */}

        {activeTab === "Videos" && (

          <section className="channel-section">

            {videos.length === 0 ? (

              <p className="page-message">
                No videos available.
              </p>

            ) : (

              <VideoGrid
                videos={videos}
              />

            )}

          </section>

        )}


        {/* ==================================================
            SHORTS TAB
        ================================================== */}

        {activeTab === "Shorts" && (

          <section className="channel-section">

            {shortsLoading ? (

              <p className="page-message">
                Loading Shorts...
              </p>

            ) : shortsError ? (

              <div className="page-message">

                <h2>
                  Something went wrong
                </h2>

                <p>
                  {shortsError}
                </p>

                <button
                  onClick={() => {
                    setActiveTab("Videos");

                    setTimeout(() => {
                      setActiveTab("Shorts");
                    }, 0);
                  }}
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

            ) : shorts.length === 0 ? (

              <p className="page-message">
                No Shorts available.
              </p>

            ) : (

              <div className="channel-shorts-grid">

                {shorts.map(
                  (short) => (

                    <div
                      className="channel-short-card"
                      key={short.id}
                    >

                      <a
                        href={`/watch/${short.id}`}
                        className="channel-short-link"
                      >

                        <div className="channel-short-thumbnail">

                          <img
                            src={
                              short.thumbnail
                            }
                    loading="lazy"
                    decoding="async"
                            alt={
                              short.title
                            }
                          />

                        </div>

                        <h3>
                          {short.title}
                        </h3>

                        <p>
                          {short.channel}
                        </p>

                      </a>

                    </div>

                  )
                )}

              </div>

            )}

          </section>

        )}


        {/* ==================================================
            ABOUT TAB
        ================================================== */}

        {activeTab === "About" && (

          <section className="channel-about">

            <h2>
              About
            </h2>

            <p>
              {description ||
                "No channel description available."}
            </p>


            <div className="about-stats">

              <div>

                <strong>
                  Subscribers
                </strong>

                <span>
                  {formatNumber(
                    subscribers
                  )}
                </span>

              </div>


              <div>

                <strong>
                  Total Views
                </strong>

                <span>
                  {formatNumber(
                    totalViews
                  )}
                </span>

              </div>


              <div>

                <strong>
                  Videos
                </strong>

                <span>
                  {formatNumber(
                    videoCount
                  )}
                </span>

              </div>

            </div>

          </section>

        )}

      </main>
    </>
  );
}

export default Channel;