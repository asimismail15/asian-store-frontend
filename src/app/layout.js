import "./globals.css";
import StoreShell from "@/components/StoreShell";

export const metadata = {
  title: "ASIAN STORE | Everything you love, all in one place",
  description: "Shop curated deals across electronics, fashion, home, and everyday essentials at ASIAN STORE.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: `try { if (localStorage.getItem("asim-theme") === "dark") document.documentElement.classList.add("dark"); } catch {}` }} />
      </head>
      <body><StoreShell>{children}</StoreShell></body>
    </html>
  );
}
