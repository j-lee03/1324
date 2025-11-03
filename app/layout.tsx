import "./globals.css";
import Navbar from "@/components/Navbar";

export const metadata = {
  title: "AI Interview Question Generator",
  description: "Gemini 기반 인터뷰 질문 생성기",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko" suppressHydrationWarning={true}>
      <body className="bg-gray-50 min-h-screen">
        <Navbar />
        <main className="pt-20 px-4">{children}</main>
      </body>
    </html>
  );
}