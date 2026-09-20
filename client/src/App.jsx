import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";

// COMPONENTS
import Navbar from "@/components/blocks/Navbar/Navbar";
import Footer from "@/components/Footer";
import ChatBotButton from "@/components/ChatBotButton";
import { Toaster } from "sonner";

// PAGES
import Home from "@/pages/Home";
import ContactPage from "@/pages/ContactUs";
import NetworkSimulator from "@/pages/NetworkSimulator";

const hiddenLayoutRoutes = ["/network-simulator"];

const Layout = ({ children }) => {
  const location = useLocation();
  const hideLayout = hiddenLayoutRoutes.includes(location.pathname);

  const noPaddingRoutes = [];
  const addPadding = !hideLayout && !noPaddingRoutes.includes(location.pathname);

  return (
    <div className="flex flex-col min-h-screen">
      <Toaster position="top-center" richColors />
      {!hideLayout && <Navbar />}
      <main className={`flex-1 ${addPadding ? "pt-16" : ""}`}>{children}</main>
      {!hideLayout && <Footer />}
      {!hideLayout && <ChatBotButton />}
    </div>
  );
};

function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/network-simulator" element={<NetworkSimulator />} />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;
