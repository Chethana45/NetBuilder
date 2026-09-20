import { useState } from "react";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { DribbbleIcon, GithubIcon, TwitchIcon, TwitterIcon } from "lucide-react";

const footerLinks = [
  {
    title: "Home",
    href: "/",
  },
  {
    title: "Simulator",
    href: "/network-simulator",
  },
  {
    title: "Contact",
    href: "/contact",
  },
  {
    title: "GitHub",
    href: "https://github.com/TejasS1233",
  },
];

const Footer = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim()) return;

    setLoading(true);
    try {
      const response = await axios.post(`${import.meta.env.VITE_API_BASE_URL}/email/newsletter`, {
        email,
      });
      setEmail("");
      // You can add a toast here if needed
    } catch (error) {
      // Optionally handle error
    } finally {
      setLoading(false);
    }
  };

  return (
    <footer>
      <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="py-12 flex flex-col sm:flex-row items-start justify-between gap-x-8 gap-y-10 px-6 xl:px-0">
          <div>
            <svg
              id="logo-7"
              width="124"
              height="32"
              viewBox="0 0 124 32"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              {/* SVG PATHS */}
            </svg>

            <ul className="mt-6 flex items-center gap-4 flex-wrap">
              {footerLinks.map(({ title, href }) => (
                <li key={title}>
                  <a href={href} className="text-muted-foreground hover:text-foreground">
                    {title}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div className="max-w-xs w-full">
            <h6 className="font-semibold">Stay up to date</h6>
            <form onSubmit={handleSubmit} className="mt-6 flex items-center gap-2">
              <Input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <Button type="submit" disabled={loading}>
                {loading ? "Sending..." : "Subscribe"}
              </Button>
            </form>
          </div>
        </div>

        <Separator />

        <div className="py-8 flex flex-col-reverse sm:flex-row items-center justify-between gap-x-2 gap-y-5 px-6 xl:px-0">
          <span className="text-muted-foreground">
            &copy; {new Date().getFullYear()}{" "}
            <a
              href="https://github.com/TejasS1233"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-foreground transition-colors"
            >
              TejasS1233
            </a>
            . All rights reserved.
          </span>

          <div className="flex items-center gap-5 text-muted-foreground">
            <a href="#" target="_blank" rel="noopener noreferrer">
              <TwitterIcon className="h-5 w-5" />
            </a>
            <a href="#" target="_blank" rel="noopener noreferrer">
              <DribbbleIcon className="h-5 w-5" />
            </a>
            <a href="#" target="_blank" rel="noopener noreferrer">
              <TwitchIcon className="h-5 w-5" />
            </a>
            <a href="#" target="_blank" rel="noopener noreferrer">
              <GithubIcon className="h-5 w-5" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
