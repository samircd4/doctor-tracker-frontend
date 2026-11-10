/**
 * app/(app)/layout.jsx
 * Shell for every logged-in page: sidebar on the left, header on top, page content below.
 * (The "(app)" folder name groups routes without adding to the URL.)
 */
import Sidebar from "@/components/Sidebar";
import AppHeader from "@/components/AppHeader";

export default function AppLayout({ children }) {
  return (
    <div className="flex min-h-screen w-full">
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <AppHeader />
        <main className="mx-auto w-full max-w-7xl flex-1 space-y-6 p-4 md:p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
