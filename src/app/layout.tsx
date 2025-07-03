import './globals.css';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // The `<html>` and `<body>` tags are in `[locale]/layout.tsx`.
  return children;
}
