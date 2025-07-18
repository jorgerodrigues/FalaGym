import type { Metadata } from "next";
import { DM_Mono, Lexend } from "next/font/google";
import "./globals.css";
import NavBar from "../components/NavBar";
import { auth } from "../auth";
import { PlayIcon } from "@/icons/Play";
import { ReactQueryProvider } from "@/providers/ReactQueryProvider";
import { FileIcon } from "@/icons/FileIcon";
import { LoggedUserProvider } from "@/providers/LoggedUserProvider";
import { HomeIcon } from "@/icons/Home";
import { PostHogProvider } from "@/providers/PostHogProvider";
import { NextIntlClientProvider } from "next-intl";
import { getLocale } from "next-intl/server";

const lexend = Lexend({
  variable: "--font-lexend",
  subsets: ["latin"],
  weight: ["100", "200", "300", "400", "500"],
});

const dmMono = DM_Mono({
  subsets: ["latin"],
  weight: ["300", "400", "500"],
  variable: "--font-dm-mono",
});

export const metadata: Metadata = {
  title: "FalaGym",
  description: "Do it. Get better. Faster!",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await auth();
  const lang = await getLocale();

  const sideBarItems = [
    {
      icon: <HomeIcon size={20} />,
      label: "Go home - dash",
      id: "dash",
      href: "/dash",
    },
    {
      icon: <PlayIcon size={20} />,
      label: "Sentence review",
      id: "sentence",
      href: "/sentence",
    },
    {
      icon: <FileIcon size={20} />,
      label: "Writing practice",
      id: "practice",
      href: "/practice",
      disabled: true,
    },
  ];

  return (
    <html lang={lang}>
      <body
        className={`${lexend.variable} ${dmMono.variable} relative antialiased font-sans bg-bg-default min-h-[90dvh] `}
      >
        {/* top brand color bar */}
        <div className={"h-[6px] w-full absolute top-0 bg-control-cta"} />
        <div className={"lg:p-large overflow-auto"}>
          <ReactQueryProvider>
            <LoggedUserProvider userId={session?.user?.id ?? ""}>
              <PostHogProvider>
                <NextIntlClientProvider>
                  <div
                    className={
                      "my-xLarge md:my-0 lg:px-xxLarge h-[100%] min-h-[80dvh]"
                    }
                  >
                    {children}
                  </div>
                  {session && (
                    <NavBar
                      position="left"
                      items={sideBarItems}
                      session={session}
                    />
                  )}
                </NextIntlClientProvider>
              </PostHogProvider>
            </LoggedUserProvider>
          </ReactQueryProvider>
        </div>
      </body>
    </html>
  );
}
