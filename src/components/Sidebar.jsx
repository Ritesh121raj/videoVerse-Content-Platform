import { useEffect, useRef } from "react";
import { NavLink, useLocation } from "react-router-dom";

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
  const location = useLocation();

  const getClassName = ({ isActive }) =>
    isActive
      ? "sidebar-item active"
      : "sidebar-item";

  // ======================================================
  // RESTORE + SAVE SIDEBAR SCROLL POSITION
  // ======================================================

  useEffect(() => {
    const sidebar = sidebarRef.current;

    if (!sidebar) return;

    const savedScrollPosition =
      sessionStorage.getItem("sidebarScrollTop");

    if (savedScrollPosition !== null) {
      requestAnimationFrame(() => {
        sidebar.scrollTop =
          Number(savedScrollPosition);
      });
    }

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

  // ======================================================
  // SIDEBAR TOGGLE STATE
  //
  // Navbar already adds/removes:
  // sidebar-collapsed
  //
  // Here we listen to that change so Sidebar can
  // remember whether it is currently visible.
  // ======================================================

  useEffect(() => {
    const handleSidebarToggle = (event) => {
      const collapsed =
        event.detail?.collapsed;

      if (collapsed) {
        document.body.classList.add(
          "sidebar-collapsed"
        );
      } else {
        document.body.classList.remove(
          "sidebar-collapsed"
        );
      }
    };

    window.addEventListener(
      "sidebarToggle",
      handleSidebarToggle
    );

    return () => {
      window.removeEventListener(
        "sidebarToggle",
        handleSidebarToggle
      );
    };
  }, []);

  // ======================================================
  // OUTSIDE CLICK
  //
  // Sidebar ke bahar kahin bhi click:
  // → sidebar hide
  //
  // Sidebar ke andar click:
  // → sidebar open rahega
  //
  // IMPORTANT:
  // Navbar ke menu button ko ignore kar rahe hain,
  // taki ☰ par click karne se toggle properly work kare.
  // ======================================================

  useEffect(() => {
    const handleOutsideClick = (event) => {
      const sidebar =
        sidebarRef.current;

      if (!sidebar) return;

      // --------------------------------------------------
      // Sidebar ke andar click hua
      // --------------------------------------------------

      if (sidebar.contains(event.target)) {
        return;
      }

      // --------------------------------------------------
      // Menu button par click hua
      // Navbar khud sidebar toggle karega.
      // --------------------------------------------------

      if (
        event.target.closest(".menu-icon")
      ) {
        return;
      }

      // --------------------------------------------------
      // Sidebar ke bahar click
      // --------------------------------------------------

      const isSidebarCollapsed =
        document.body.classList.contains(
          "sidebar-collapsed"
        );

      // Agar sidebar already hidden hai,
      // kuch karne ki zarurat nahi.
      if (isSidebarCollapsed) {
        return;
      }

      // Sidebar hide karo
      document.body.classList.add(
        "sidebar-collapsed"
      );

      // Navbar / other components ko notify karo
      window.dispatchEvent(
        new CustomEvent("sidebarToggle", {
          detail: {
            collapsed: true,
          },
        })
      );
    };

    document.addEventListener(
      "click",
      handleOutsideClick
    );

    return () => {
      document.removeEventListener(
        "click",
        handleOutsideClick
      );
    };
  }, [location.pathname]);

  // ======================================================
  // SIDEBAR
  // ======================================================

  return (
    <aside
      className="sidebar"
      ref={sidebarRef}
    >

      {/* ==================================================
          HOME
      ================================================== */}

      <NavLink
        to="/"
        className={getClassName}
        end
      >
        <Home size={22} />
        <span>Home</span>
      </NavLink>

      {/* ==================================================
          TRENDING
      ================================================== */}

      <NavLink
        to="/trending"
        className={getClassName}
      >
        <Flame size={22} />
        <span>Trending</span>
      </NavLink>

      {/* ==================================================
          SUBSCRIPTIONS
      ================================================== */}

      <NavLink
        to="/subscriptions"
        className={getClassName}
      >
        <PlaySquare size={22} />
        <span>Subscriptions</span>
      </NavLink>

      <hr />

      {/* ==================================================
          HISTORY
      ================================================== */}

      <NavLink
        to="/history"
        className={getClassName}
      >
        <History size={22} />
        <span>History</span>
      </NavLink>

      {/* ==================================================
          WATCH LATER
      ================================================== */}

      <NavLink
        to="/watch-later"
        className={getClassName}
      >
        <Clock size={22} />
        <span>Watch later</span>
      </NavLink>

      {/* ==================================================
          LIKED VIDEOS
      ================================================== */}

      <NavLink
        to="/liked"
        className={getClassName}
      >
        <ThumbsUp size={22} />
        <span>Liked videos</span>
      </NavLink>

      {/* ==================================================
          DISLIKED VIDEOS
      ================================================== */}

      <NavLink
        to="/disliked"
        className={getClassName}
      >
        <ThumbsDown size={22} />
        <span>Disliked videos</span>
      </NavLink>

      <hr />

      {/* ==================================================
          EXPLORE
      ================================================== */}

      <h3 className="sidebar-title">
        Explore
      </h3>

      {/* ==================================================
          SHORTS
      ================================================== */}

      <NavLink
        to="/shorts"
        className={getClassName}
      >
        <Video size={22} />
        <span>Shorts</span>
      </NavLink>

      {/* ==================================================
          MUSIC
      ================================================== */}

      <NavLink
        to="/music"
        className={getClassName}
      >
        <Music2 size={22} />
        <span>Music</span>
      </NavLink>

      {/* ==================================================
          PLAYLISTS
      ================================================== */}

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