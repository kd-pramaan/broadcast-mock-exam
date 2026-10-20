import "./globals.css";
import Footer from "../components/Footer.js";
import SiteHeader from "../components/SiteHeader.js";
import { getCurrentUser } from "../lib/auth.js";

export const metadata = { title: "MarQ" };

export default async function RootLayout({ children }) {
  const user = await getCurrentUser();

  return (
    <html lang="en">
      <body suppressHydrationWarning>
        <div className="site-shell">
          <SiteHeader user={user ? { isAdmin: user.isAdmin } : null} />
          <div className="site-content">{children}</div>
          <Footer />
        </div>
      </body>
    </html>
  );
}
