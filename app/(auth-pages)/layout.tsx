export default async function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="bg-background text-foreground">
        <div className="max-w-7xl flex flex-col gap-12 items-start">
          {children}
        </div>
      </body>
    </html>
  );
}
