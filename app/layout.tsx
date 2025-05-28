import "./globals.css";
import AuthSessionProvider from "@/components/providers/session-provider";
import { NextIntlClientProvider } from 'next-intl';
import { useMessages, useLocale } from 'next-intl';

// Define supported locales for static generation
export function generateStaticParams() {
  return [{ locale: 'en' }, { locale: 'es' }, { locale: 'de' }];
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const messages = useMessages();
  const locale = useLocale();

  return (
    <html lang={locale}>
      <body className="antialiased font-sans">
        <NextIntlClientProvider locale={locale} messages={messages}>
          <AuthSessionProvider>
            {children}
          </AuthSessionProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
