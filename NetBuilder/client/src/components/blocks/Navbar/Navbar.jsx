import { useEffect, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { ModeToggle } from "@/components/ModeToggle";
import { NAV_LINKS } from "@/config/nav";
import { Button } from "@/components/ui/button";
import { NavigationSheet } from "./navigation-sheet";

export default function Navbar() {
  const navRef = useRef(null);
  const { pathname } = useLocation();
  const [activePath, setActivePath] = useState(pathname);
  const navigate = useNavigate();

  useEffect(() => {
    setActivePath(pathname);
  }, [pathname]);

  useEffect(() => {
    const nav = navRef.current;
    let rafId = null;
    const updateNav = () => {
      if (!nav) return;
      if (window.scrollY > 0) {
        nav.classList.add("scrolled");
      } else {
        nav.classList.remove("scrolled");
      }
      rafId = null;
    };
    const onScroll = () => {
      if (!rafId) {
        rafId = requestAnimationFrame(updateNav);
      }
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, []);

  return (
    <nav
      ref={navRef}
      id="main-nav"
      className="fixed top-0 left-0 right-0 z-[100] bg-background/95 border-b border-border backdrop-blur-xl transition-all duration-300 ease-in-out"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <Link
              to="/"
              className="text-xl font-bold text-primary hover:text-primary/80 transition-colors"
            >
              NetBuilder
            </Link>
          </div>
          <ul className="hidden md:flex gap-8">
            {NAV_LINKS.map((item) => (
              <li key={item.href}>
                <Link
                  to={item.href}
                  className={`transition-colors ${
                    activePath === item.href
                      ? "text-foreground font-medium"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
          <div className="flex items-center gap-3">
            <Button onClick={() => navigate("/network-simulator")}>Try Simulator</Button>
            <ModeToggle className="hidden md:inline-flex" />
            <div className="md:hidden">
              <NavigationSheet />
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
