import Navbar from "@/components/Navbar";
import BackgroundEffects from "@/components/BackgroundEffects";
import Hero from "@/components/Hero";
import ToastNotification from "@/components/ToastNotification";
import TrustedByStrip from "@/components/TrustedByStrip";
import ChatWidget from "@/components/ChatWidget";

export default function Home() {
  return (
    <main className="relative min-h-screen bg-bg-dark">
      <BackgroundEffects />
      <Navbar />
      <Hero />
      <TrustedByStrip />
      <ToastNotification />
      <ChatWidget />
    </main>
  );
}
