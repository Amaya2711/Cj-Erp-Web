import { redirect } from "next/navigation";

import { getServerAuthSession } from "@/services/auth/session";

export default async function Home() {
  const user = await getServerAuthSession();

  if (user) {
    redirect("/dashboard");
  }

  redirect("/login");
}
