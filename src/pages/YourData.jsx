import { useEffect, useState } from "react";

const API_BASE_URL =
  "https://videoverse-content-platform.onrender.com/api";

function YourData() {
  const [user, setUser] = useState(null);

  const [activity, setActivity] = useState({
    history: 0,
    liked: 0,
    disliked: 0,
    watchLater: 0,
    subscriptions: 0,
  });

  const [loading, setLoading] = useState(true);

  // ======================================================
  // GET CURRENT USER
  // ======================================================

  const loadUser = () => {
    try {
      const savedUser = JSON.parse(
        localStorage.getItem(
          "videoVerseCurrentUser"
        )
      );

      setUser(
        savedUser?.user ||
          savedUser ||
          null
      );
    } catch (error) {
      console.error(
        "Error loading current user:",
        error
      );

      setUser(null);
    }
  };

  // ======================================================
  // LOAD ACTIVITY COUNTS FROM BACKEND
  // ======================================================

  const loadActivity = async () => {
    const token =
      localStorage.getItem(
        "videoVerseToken"
      );

    if (!token) {
      setActivity({
        history: 0,
        liked: 0,
        disliked: 0,
        watchLater: 0,
        subscriptions: 0,
      });

      return;
    }

    try {
      const headers = {
        Authorization: `Bearer ${token}`,
      };

      // ==================================================
      // LOAD ALL USER ACTIVITY
      // ==================================================

      const [
        historyResponse,
        likedResponse,
        dislikedResponse,
        watchLaterResponse,
        subscriptionsResponse,
      ] = await Promise.all([
        fetch(
          `${API_BASE_URL}/user/history`,
          {
            method: "GET",
            headers,
          }
        ),

        fetch(
          `${API_BASE_URL}/user/liked`,
          {
            method: "GET",
            headers,
          }
        ),

        fetch(
          `${API_BASE_URL}/user/disliked`,
          {
            method: "GET",
            headers,
          }
        ),

        fetch(
          `${API_BASE_URL}/user/watch-later`,
          {
            method: "GET",
            headers,
          }
        ),

        fetch(
          `${API_BASE_URL}/user/subscriptions`,
          {
            method: "GET",
            headers,
          }
        ),
      ]);

      // ==================================================
      // PARSE RESPONSES
      // ==================================================

      const [
        historyData,
        likedData,
        dislikedData,
        watchLaterData,
        subscriptionsData,
      ] = await Promise.all([
        historyResponse.json(),
        likedResponse.json(),
        dislikedResponse.json(),
        watchLaterResponse.json(),
        subscriptionsResponse.json(),
      ]);

      // ==================================================
      // CHECK RESPONSE STATUS
      // ==================================================

      if (
        !historyResponse.ok ||
        !likedResponse.ok ||
        !dislikedResponse.ok ||
        !watchLaterResponse.ok ||
        !subscriptionsResponse.ok
      ) {
        throw new Error(
          "Unable to load activity data."
        );
      }

      // ==================================================
      // USE BACKEND DATA DIRECTLY
      // ==================================================

      const history =
        Array.isArray(
          historyData.history
        )
          ? historyData.history
          : [];

      const liked =
        Array.isArray(
          likedData.likedVideos
        )
          ? likedData.likedVideos
          : [];

      const disliked =
        Array.isArray(
          dislikedData.dislikedVideos
        )
          ? dislikedData.dislikedVideos
          : [];

      const watchLater =
        Array.isArray(
          watchLaterData.watchLater
        )
          ? watchLaterData.watchLater
          : [];

      const subscriptions =
        Array.isArray(
          subscriptionsData.subscribedChannels
        )
          ? subscriptionsData.subscribedChannels
          : [];

      // ==================================================
      // SET FINAL COUNTS
      // ==================================================

      setActivity({
        history: history.length,
        liked: liked.length,
        disliked: disliked.length,
        watchLater: watchLater.length,
        subscriptions:
          subscriptions.length,
      });

    } catch (error) {
      console.error(
        "Activity loading error:",
        error
      );

      setActivity({
        history: 0,
        liked: 0,
        disliked: 0,
        watchLater: 0,
        subscriptions: 0,
      });
    }
  };

  // ======================================================
  // INITIAL LOAD
  // ======================================================

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);

      loadUser();

      await loadActivity();

      setLoading(false);
    };

    loadData();

    // ====================================================
    // LISTEN FOR ACTIVITY CHANGES
    // ====================================================

    const handleActivityUpdate = () => {
      loadActivity();
    };

    // ====================================================
    // LISTEN FOR SUBSCRIPTION CHANGES
    // ====================================================

    const handleSubscriptionUpdate = () => {
      loadActivity();
    };

    // ====================================================
    // LISTEN FOR AUTH CHANGES
    // ====================================================

    const handleAuthUpdate = () => {
      loadUser();
      loadActivity();
    };

    window.addEventListener(
      "activityUpdated",
      handleActivityUpdate
    );

    window.addEventListener(
      "subscriptionsUpdated",
      handleSubscriptionUpdate
    );

    window.addEventListener(
      "authUpdated",
      handleAuthUpdate
    );

    return () => {
      window.removeEventListener(
        "activityUpdated",
        handleActivityUpdate
      );

      window.removeEventListener(
        "subscriptionsUpdated",
        handleSubscriptionUpdate
      );

      window.removeEventListener(
        "authUpdated",
        handleAuthUpdate
      );
    };
  }, []);

  // ======================================================
  // SIGN IN CHECK
  // ======================================================

  if (!user) {
    return (
      <div className="page-message">
        <h2>Sign in required</h2>

        <p>
          Please sign in to view your data.
        </p>
      </div>
    );
  }

  // ======================================================
  // UI
  // ======================================================

  return (
    <div className="page-container your-data-page">

      <h1>Your Data</h1>

      {/* ==================================================
          ACCOUNT INFORMATION
      ================================================== */}

      <section className="your-data-section">

        <h2>Account Information</h2>

        <div className="your-data-info">

          <div>
            <span>Name</span>

            <strong>
              {user.name ||
                "Not available"}
            </strong>
          </div>

          <div>
            <span>Email</span>

            <strong>
              {user.email ||
                "Not available"}
            </strong>
          </div>

          <div>
            <span>User ID</span>

            <strong>
              {user._id ||
                user.id ||
                "Not available"}
            </strong>
          </div>

        </div>

      </section>

      {/* ==================================================
          ACTIVITY
      ================================================== */}

      <section className="your-data-section">

        <h2>Activity</h2>

        {loading ? (
          <p className="page-message">
            Loading activity...
          </p>
        ) : (
          <div className="your-data-activity">

            <div>
              <span>
                Watch History
              </span>

              <strong>
                {activity.history}
              </strong>
            </div>

            <div>
              <span>
                Liked Videos
              </span>

              <strong>
                {activity.liked}
              </strong>
            </div>

            <div>
              <span>
                Disliked Videos
              </span>

              <strong>
                {activity.disliked}
              </strong>
            </div>

            <div>
              <span>
                Watch Later
              </span>

              <strong>
                {activity.watchLater}
              </strong>
            </div>

            <div>
              <span>
                Subscriptions
              </span>

              <strong>
                {activity.subscriptions}
              </strong>
            </div>

          </div>
        )}

      </section>

    </div>
  );
}

export default YourData;