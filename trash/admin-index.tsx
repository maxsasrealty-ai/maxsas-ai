import { router } from "expo-router";
import { useEffect } from "react";

// This file ensures /admin always loads the dashboard by default.
export default function AdminIndexRedirect() {
  useEffect(() => {
    router.replace("/admin/dashboard");
  }, []);
  return null;
}
