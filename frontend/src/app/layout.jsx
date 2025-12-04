// app/layout.jsx (Simple Global Layout)

// Import global styles
import "./globals.css";
import LocationUpdater from "@/components/LocationUpdater";

export const metadata = {
    title: "DatingApp",
    description: "Dating Web App Dashboard",
};

// This function must be the default export
export default function RootLayout({ children }) {
    return (
        <html lang="en">
            <body className="antialiased">
                <LocationUpdater />
                {children}
            </body>
        </html>
    );
}