import { Providers } from "./providers";
import './globals.css';
import { Toaster } from "@/components/ui/sonner";
import Footer from "@/components/Footer";

export const metadata = {
  title: "SMRI - Smart Medical Research Institute",
  description: "SMRI Dashboard application",
  icons: {
    icon: [
      { url: "/favicon.ico" },
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
    ],
    apple: [
      { url: "/apple-touch-icon.png" },
    ],
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <Providers>
          {children}
          <Footer />
          <Toaster />
        </Providers>
      </body>
    </html>
  );
}
