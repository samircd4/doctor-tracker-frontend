/**
 * app/page.jsx
 * The root URL has no content of its own — send users to the dashboard.
 * (proxy.js redirects to /login first if they are not logged in.)
 */
import { redirect } from "next/navigation";

export default function Home() {
  redirect("/dashboard");
}
