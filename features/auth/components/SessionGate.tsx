"use client";

import { useEffect, useState, type ReactNode } from "react";

import { useRouter } from "next/navigation";

import { LoadingState } from "@/components/ui/LoadingState";
import { SESSION_EXPIRED_EVENT } from "@/services/api/session-fetch";
import { getCurrentSession, type BrowserSession } from "../service";

export function SessionGate({ children }: { children: (session: BrowserSession) => ReactNode }) {
  const router = useRouter();
  const [session, setSession] = useState<BrowserSession | null>(null);

  useEffect(() => {
    let isMounted = true;
    const redirectToLogin = () => router.replace("/login");

    window.addEventListener(SESSION_EXPIRED_EVENT, redirectToLogin);

    void (async () => {
      try {
        const currentSession = await getCurrentSession();
        if (!currentSession) {
          redirectToLogin();
          return;
        }
        if (isMounted) setSession(currentSession);
      } catch {
        redirectToLogin();
      }
    })();

    return () => {
      isMounted = false;
      window.removeEventListener(SESSION_EXPIRED_EVENT, redirectToLogin);
    };
  }, [router]);

  if (!session) return <LoadingState label="Loading session" />;
  return <>{children(session)}</>;
}
