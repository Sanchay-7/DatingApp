// app/layout.jsx (Simple Global Layout)

// Import global styles and font dependencies
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import LocationUpdater from "@/components/LocationUpdater";

const geistSans = Geist({
    variable: "--font-geist-sans",
    subsets: ["latin"],
});

const geistMono = Geist_Mono({
    variable: "--font-geist-mono",
    subsets: ["latin"],
});

export const metadata = {
    title: "DatingApp",
    description: "Dating Web App Dashboard",
};

// This function must be the default export
export default function RootLayout({ children }) {
    return (
        <html lang="en">
            <body
                className={`${geistSans.variable} ${geistMono.variable} antialiased`}
            >
                <LocationUpdater />
                {children}
            </body>
        </html>
    );
}