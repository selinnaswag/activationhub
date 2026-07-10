import { Roboto } from "next/font/google"
import "./globals.css"

const roboto = Roboto({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  variable: "--font-roboto",
  display: "swap",
})

export const metadata = {
  title: "Ethico | Activation Hub & Resources",
  description:
    "Your central RevOps hub for Ethico marketing assets, team-specific resources, product information, campaigns, internal tools, and tech stack support.",
}

export const viewport = {
  themeColor: "#060913",
}

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${roboto.variable} bg-[#060913]`}>
      <body className="p-4 md:p-8 flex flex-col items-center min-h-screen relative overflow-x-hidden text-slate-200 space-y-16 pb-20">
        {children}
      </body>
    </html>
  )
}
