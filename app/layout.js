import { Providers } from "./providers";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import Footer from "@/components/Footer";

export const metadata = {
  title: "Social Media Research Institute Ltd.",
  description: "SMRI application",
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
