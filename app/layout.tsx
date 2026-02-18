export const metadata = {
  title: "GMF Booking",
  description: "GMF Eventmodule – Miet-Buchungssystem",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="de">
      <body style={{ fontFamily: "monospace", padding: "2rem", maxWidth: "960px", margin: "0 auto" }}>
        {children}
      </body>
    </html>
  );
}
