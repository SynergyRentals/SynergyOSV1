"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function HomePage() {
  const router = useRouter();

  useEffect(() => {
    router.push("/dashboard");
  }, [router]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <div className="h-8 w-8 rounded-lg synergy-accent-bg flex items-center justify-center mx-auto mb-4">
          <span className="text-white font-bold text-sm">S</span>
        </div>
        <p className="text-slate-600">Redirecting to dashboard...</p>
      </div>
    </div>
  );
}
