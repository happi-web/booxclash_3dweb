import { useState } from "react";
import { navLinks } from "../constants/index.ts";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = () => setIsOpen((prevIsOpen) => !prevIsOpen);

  const NavItems = () => (
    <ul className="nav-ul flex flex-col sm:flex-row text-white font-bold gap-4 sm:gap-5">
      {navLinks.map(({ id, href, name }) => (
        <li key={id} className="nav-li border-2 border-white px-4 py-2 rounded">
          <a href={href} className="nav-li_a" onClick={() => setIsOpen(false)}>
            {name}
          </a>
        </li>
      ))}
    </ul>
  );

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-blue-950">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center px-5 py-5">
          {/* Logo */}
          <a href="/" className="text-neutral-400 font-bold text-xl hover:text-white transition-colors">
            <img src="logowhite.png" alt="Logo" className="w-30 h-10" />
          </a>

          {/* Mobile Menu Button - Only visible on small screens */}
          <button
            onClick={toggleMenu}
            className="text-neutral-400 hover:text-white focus:outline-none sm:hidden flex"
            aria-label="Toggle Menu"
          >
            <img src={isOpen ? "assets/close.svg" : "assets/menu.svg"} alt="toggle" className="w-6 h-6" />
          </button>

          {/* Desktop Navbar - Only visible on large screens */}
          <nav className="hidden sm:flex">
            <NavItems />
          </nav>
        </div>
      </div>

      {/* Mobile Sidebar - Only visible on small screens */}
      {isOpen && (
        <div className="absolute top-full left-0 w-full bg-black/90 sm:hidden">
          <nav className="flex flex-col items-center py-5">
            <NavItems />
          </nav>
        </div>
      )}
    </header>
  );
};

export default Navbar;
