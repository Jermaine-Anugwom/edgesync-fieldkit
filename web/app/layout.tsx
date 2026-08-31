import "./style.css";

export const metadata = {
  title: "EdgeSync FieldKit — Offline Recovery Instrument",
  description: "A deterministic offline-first synchronization laboratory for synthetic field teams.",
};

export default function Layout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>;
}
