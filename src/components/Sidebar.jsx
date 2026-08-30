import { Link } from "react-router-dom";
import {
  Home,
  Flame,
  PlaySquare,
  History,
  Clock,
  ThumbsUp,
  Video,
  Music2,
} from "lucide-react";

function Sidebar() {
  return (
    <aside className="sidebar">

      <Link to="/" className="sidebar-item">
        <Home size={22} />
        <span>Home</span>
      </Link>

      <Link to="/trending" className="sidebar-item">
        <Flame size={22} />
        <span>Trending</span>
      </Link>

      <Link to="/subscriptions" className="sidebar-item">
        <PlaySquare size={22} />
        <span>Subscriptions</span>
      </Link>

      <hr />

      <Link to="/history" className="sidebar-item">
        <History size={22} />
        <span>History</span>
      </Link>

      <Link to="/watch-later" className="sidebar-item">
        <Clock size={22} />
        <span>Watch later</span>
      </Link>

      <Link to="/liked" className="sidebar-item">
        <ThumbsUp size={22} />
        <span>Liked videos</span>
      </Link>

      <hr />

      <h3 className="sidebar-title">
        Explore
      </h3>

      <Link to="/shorts" className="sidebar-item">
        <Video size={22} />
        <span>Shorts</span>
      </Link>

      <Link to="/music" className="sidebar-item">
        <Music2 size={22} />
        <span>Music</span>
      </Link>

    </aside>
  );
}

export default Sidebar;