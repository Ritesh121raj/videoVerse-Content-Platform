import { useEffect, useRef } from "react";
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
  const sidebarRef = useRef(null);

  const getClassName = ({ isActive }) =>
    isActive
      ? "sidebar-item active"
      : "sidebar-item";

  useEffect(() => {
    const sidebar = sidebarRef.current;

    if (!sidebar) return;

    // Restore previous sidebar scroll position
    const savedScrollPosition =
      sessionStorage.getItem("sidebarScrollTop");

    if (savedScrollPosition !== null) {
      requestAnimationFrame(() => {
        sidebar.scrollTop = Number(savedScrollPosition);
      });
    }

    // Save sidebar scroll position
    const handleScroll = () => {
      sessionStorage.setItem(
        "sidebarScrollTop",
        String(sidebar.scrollTop)
      );
    };

    sidebar.addEventListener(
      "scroll",
      handleScroll
    );

    return () => {
      sidebar.removeEventListener(
        "scroll",
        handleScroll
      );
    };
  }, []);

  return (
    <aside
      className="sidebar"
      ref={sidebarRef}
    >

      <NavLink
        to="/"
        className={getClassName}
        end
      >
        <Home size={22} />
        <span>Home</span>
      </NavLink>

      <NavLink
        to="/trending"
        className={getClassName}
      >
        <Flame size={22} />
        <span>Trending</span>
      </NavLink>

      <NavLink
        to="/subscriptions"
        className={getClassName}
      >
        <PlaySquare size={22} />
        <span>Subscriptions</span>
      </NavLink>

      <hr />

      <NavLink
        to="/history"
        className={getClassName}
      >
        <History size={22} />
        <span>History</span>
      </NavLink>

      <NavLink
        to="/watch-later"
        className={getClassName}
      >
        <Clock size={22} />
        <span>Watch later</span>
      </NavLink>

      <NavLink
        to="/liked"
        className={getClassName}
      >
        <ThumbsUp size={22} />
        <span>Liked videos</span>
      </NavLink>

      <NavLink
        to="/disliked"
        className={getClassName}
      >
        <ThumbsDown size={22} />
        <span>Disliked videos</span>
      </NavLink>

      <hr />

      <h3 className="sidebar-title">
        Explore
      </h3>

      <NavLink
        to="/shorts"
        className={getClassName}
      >
        <Video size={22} />
        <span>Shorts</span>
      </NavLink>

      <NavLink
        to="/music"
        className={getClassName}
      >
        <Music2 size={22} />
        <span>Music</span>
      </NavLink>

      <NavLink
        to="/playlists"
        className={getClassName}
      >
        <PlaySquare size={22} />
        <span>My Playlists</span>
      </NavLink>

    </aside>
  );
}

export default Sidebar;