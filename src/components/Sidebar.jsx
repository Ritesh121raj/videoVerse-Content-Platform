import { NavLink } from "react-router-dom";

import {
  Home,
  Flame,
  PlaySquare,
  History,
  Clock,
  ThumbsUp,
  ThumbsDown,
  Video,
  Music2,
} from "lucide-react";

function Sidebar() {
  const getClassName = ({ isActive }) =>
    isActive
      ? "sidebar-item active"
      : "sidebar-item";

  return (
    <aside className="sidebar">

      {/* HOME */}

      <NavLink
        to="/"
        className={getClassName}
        end
      >
        <Home size={22} />
        <span>Home</span>
      </NavLink>


      {/* TRENDING */}

      <NavLink
        to="/trending"
        className={getClassName}
      >
        <Flame size={22} />
        <span>Trending</span>
      </NavLink>


      {/* SUBSCRIPTIONS */}

      <NavLink
        to="/subscriptions"
        className={getClassName}
      >
        <PlaySquare size={22} />
        <span>Subscriptions</span>
      </NavLink>


      <hr />


      {/* HISTORY */}

      <NavLink
        to="/history"
        className={getClassName}
      >
        <History size={22} />
        <span>History</span>
      </NavLink>


      {/* WATCH LATER */}

      <NavLink
        to="/watch-later"
        className={getClassName}
      >
        <Clock size={22} />
        <span>Watch later</span>
      </NavLink>


      {/* LIKED */}

      <NavLink
        to="/liked"
        className={getClassName}
      >
        <ThumbsUp size={22} />
        <span>Liked videos</span>
      </NavLink>


      {/* DISLIKED */}

      <NavLink
        to="/disliked"
        className={getClassName}
      >
        <ThumbsDown size={22} />
        <span>Disliked videos</span>
      </NavLink>


      <hr />


      {/* EXPLORE */}

      <h3 className="sidebar-title">
        Explore
      </h3>


      {/* SHORTS */}

      <NavLink
        to="/shorts"
        className={getClassName}
      >
        <Video size={22} />
        <span>Shorts</span>
      </NavLink>


      {/* MUSIC */}

      <NavLink
        to="/music"
        className={getClassName}
      >
        <Music2 size={22} />
        <span>Music</span>
      </NavLink>

    </aside>
  );
}

export default Sidebar;