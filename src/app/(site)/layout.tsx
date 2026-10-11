import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import ScrollProgress from "@/components/layout/ScrollProgress";
import PageTracker from "@/components/site/PageTracker";

// The public site shares one chrome: fixed navbar, scroll progress, footer.
export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <ScrollProgress />
      <Navbar />
      <main className="min-h-screen">{children}</main>
      <Footer />
      <PageTracker />
    </>
  );
}
