import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";

import { ToastProvider } from "@/components/common/toast";
import { TooltipProvider } from "@/components/ui/tooltip";
import { APP_NAME, APP_TAGLINE } from "@/lib/constants";
import { LeadsProvider } from "@/store/leads-store";
import { ProfileProvider } from "@/store/profile-store";
import { ProspectingProvider } from "@/store/prospecting-store";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: `${APP_NAME} — ${APP_TAGLINE}`,
    template: `%s · ${APP_NAME}`,
  },
  description:
    "Sistema interno da LLK para encontrar empresas com potencial para contratar serviços digitais.",
  robots: {
    index: false,
    follow: false,
    nocache: true,
  },
};

/**
 * Aplica o tema antes da primeira pintura.
 *
 * Sem isso a página aparece clara e escurece depois que o React hidrata, o que
 * pisca na cara de quem usa o tema escuro. Precisa ser inline e síncrono.
 */
const THEME_SCRIPT = `
(function () {
  try {
    var stored = localStorage.getItem("llk-tema");
    var dark =
      stored === "escuro" ||
      ((!stored || stored === "sistema") &&
        window.matchMedia("(prefers-color-scheme: dark)").matches);
    document.documentElement.classList.toggle("dark", dark);
    document.documentElement.style.colorScheme = dark ? "dark" : "light";
  } catch (error) {}
})();
`;

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="pt-BR"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_SCRIPT }} />
      </head>
      <body className="flex min-h-full flex-col bg-background">
        <ToastProvider>
          <TooltipProvider delayDuration={200}>
            <ProfileProvider>
              <ProspectingProvider>
                <LeadsProvider>{children}</LeadsProvider>
              </ProspectingProvider>
            </ProfileProvider>
          </TooltipProvider>
        </ToastProvider>
      </body>
    </html>
  );
}
