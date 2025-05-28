import "./globals.css";
import AuthSessionProvider from "@/components/providers/session-provider";
import { NextIntlClientProvider } from 'next-intl';
import { getMessages, getLocale } from 'next-intl/server';

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const messages = await getMessages();
  const locale = await getLocale();

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
