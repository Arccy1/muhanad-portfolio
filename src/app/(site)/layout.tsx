import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import ScrollProgress from "@/components/layout/ScrollProgress";
import PageTracker from "@/components/site/PageTracker";
import { LanguageProvider } from "@/components/site/LanguageProvider";
import { getSiteContent, getSocials } from "@/lib/content";

// The public site shares one chrome: fixed navbar, scroll progress, footer.
export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const content = await getSiteContent();
  const socials = getSocials(content);
  return (
    <LanguageProvider>
      <ScrollProgress />
      <Navbar />
      <main className="min-h-screen">{children}</main>
      <Footer content={content} socials={socials} />
      <PageTracker />
    </LanguageProvider>
  );
}
