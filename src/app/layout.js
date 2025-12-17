import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
    variable: "--font-geist-sans",
    subsets: ["latin"],
});

const geistMono = Geist_Mono({
    variable: "--font-geist-mono",
    subsets: ["latin"],
});

export const metadata = {
    title: "Kitnets Search",
    description: "Busca de Kitnets",
};

export default function RootLayout({ children }) {
    return (
        // ADICIONE AQUI: suppressHydrationWarning
        // Isso diz ao React para ignorar atributos injetados por extensões (como LanguageTool, Dark Reader, etc)
        <html lang="en" suppressHydrationWarning>
        <body
            className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        >
        {children}
        </body>
        </html>
    );
}