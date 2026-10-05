import Link from "next/link";

export default function Footer() {
  return (
    <footer className="site-footer">
      <span>&copy; {new Date().getFullYear()} MarQ. All rights reserved.</span>
      <Link href="/contact">Contact us</Link>
    </footer>
  );
}
