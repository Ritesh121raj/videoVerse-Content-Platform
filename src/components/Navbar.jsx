import { Menu, Search, Mic, UserCircle } from "lucide-react";
import { useState } from "react";

function Navbar({ search, setSearch }) {

  return (
    <nav className="navbar">

      <div className="nav-left">

        <Menu className="menu-icon" />

        <div className="logo">
          <span className="youtube-icon">▶</span>
          <span>YouTube</span>
        </div>

      </div>


      <div className="search-container">

        <input
          type="text"
          placeholder="Search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <button>
          <Search size={22} />
        </button>

        <Mic className="mic-icon" />

      </div>


      <div className="nav-right">

        <UserCircle size={32} />

      </div>

    </nav>
  );
}

export default Navbar;