import { createFileRoute, redirect } from "@tanstack/react-router";
import Login from "@/components/login/login";

export const Route = createFileRoute("/login")({
  beforeLoad: ({ context }) => {
    if (context.auth) {
      throw redirect({ to: "/" });
    }
  },
  component: Login,
});
