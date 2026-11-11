/**
 * hooks/useCurrentUser.js
 * The logged-in user (cached, shared by every component) and whether they are an admin.
 * Used to show or hide create/edit/delete buttons. The API also checks the role
 * on every request, so hiding buttons is only for a cleaner UI, not for security.
 */
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";

export function useCurrentUser() {
  const { data: user, isLoading } = useQuery({
    queryKey: ["me"],
    queryFn: () => api("/auth/me").then((res) => res.data),
    staleTime: 5 * 60 * 1000,
  });
  return { user, isLoading, isAdmin: user?.role === "admin" };
}
