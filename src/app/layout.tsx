import type { Metadata } from "next";
import { Navbar } from "./components/Navbar";
import ThemeRegistry from "./components/ThemeRegistry/ThemeRegistry";
import "./globals.css";

export const metadata: Metadata = {
    title: "Imersão 14 - Sistema de rastreabilidade de veículos",
    description: "Generated by create next app",
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="en">
            <body>
                <ThemeRegistry>
                    <Navbar />
                    {children}
                </ThemeRegistry>
            </body>
        </html>
    );
}
