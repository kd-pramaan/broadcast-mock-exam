import "./globals.css";
import Footer from "../components/Footer.js";

export const metadata = { title: "MarQ" };

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <div className="site-shell">
          <div className="site-content">{children}</div>
          <Footer />
        </div>
      </body>
    </html>
  );
}
