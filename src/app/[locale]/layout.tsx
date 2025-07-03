import type {Metadata} from 'next';
import {NextIntlClientProvider, useMessages} from 'next-intl';
import {getTranslator} from 'next-intl/server';
import '../globals.css';
import { Toaster } from "@/components/ui/toaster";

type Props = {
  children: React.ReactNode;
  params: {locale: string};
};

export async function generateMetadata({params: {locale}}: Props): Promise<Metadata> {
  const t = await getTranslator(locale, 'Metadata');
 
  return {
    title: t('title'),
    description: t('description'),
  };
}

export default function LocaleLayout({
  children,
  params: {locale},
}: Readonly<Props>) {
  const messages = useMessages();

  return (
    <html lang={locale} className="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
      </head>
      <body className="font-body antialiased">
        <NextIntlClientProvider locale={locale} messages={messages}>
          {children}
          <Toaster />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
