import { useEffect, useState } from "react";

function YourData() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    try {
      const savedUser = JSON.parse(
        localStorage.getItem("videoVerseCurrentUser")
      );

      setUser(savedUser);
    } catch {
      setUser(null);
    }
  }, []);

  if (!user) {
    return (
      <div className="page-message">
        <h2>Sign in required</h2>
        <p>Please sign in to view your data.</p>
      </div>
    );
  }

  return (
    <div className="page-container">

      <div className="settings-header">
        <h1>Your Data</h1>

        <p>
          View the information associated with
          your VideoVerse account.
        </p>
      </div>

      <div className="settings-section">

        <h2>Account Information</h2>

        <div className="data-row">
          <span>Name</span>
          <strong>{user.name || "Not available"}</strong>
        </div>

        <div className="data-row">
          <span>Email</span>
          <strong>{user.email || "Not available"}</strong>
        </div>

        <div className="data-row">
          <span>User ID</span>
          <strong>{user.id || user._id || "Not available"}</strong>
        </div>

      </div>

      <div className="settings-section">

        <h2>Activity</h2>

        <div className="data-row">
          <span>Watch History</span>
          <strong>
            {JSON.parse(
              localStorage.getItem("history") || "[]"
            ).length}
          </strong>
        </div>

        <div className="data-row">
          <span>Liked Videos</span>
          <strong>
            {JSON.parse(
              localStorage.getItem("likedVideos") || "[]"
            ).length}
          </strong>
        </div>

        <div className="data-row">
          <span>Watch Later</span>
          <strong>
            {JSON.parse(
              localStorage.getItem("watchLater") || "[]"
            ).length}
          </strong>
        </div>

        <div className="data-row">
          <span>Subscriptions</span>
          <strong>
            {JSON.parse(
              localStorage.getItem("subscribedChannels") || "[]"
            ).length}
          </strong>
        </div>

      </div>

    </div>
  );
}

export default YourData;