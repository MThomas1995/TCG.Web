import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
    subsets: ["latin"],
    weight: ['200', '300', '400', '500', '600', '700', '800']

//   │ Tailwind class  │ Weight │
//   ├─────────────────┼────────┤
//   │ font-extralight │ 200    │
//   ├─────────────────┼────────┤
//   │ font-light      │ 300    │
//   ├─────────────────┼────────┤
//   │ font-normal     │ 400    │
//   ├─────────────────┼────────┤
//   │ font-medium     │ 500    │
//   ├─────────────────┼────────┤
//   │ font-semibold   │ 600    │
//   ├─────────────────┼────────┤
//   │ font-bold       │ 700    │
//   ├─────────────────┼────────┤
//   │ font-extrabold  │ 800    │
})

export const metadata: Metadata = {
  title: "TCG",
  description: "A physical trading card game with a digital ecosystem",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
        <body
            className={`${inter.className} antialiased min-h-screen flex flex-col bg-brand-secondary`}
        >
            {children}
        </body>
    </html>
  );
}
