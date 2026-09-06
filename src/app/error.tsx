"use client";

import Link from "next/link";

import { StatusScreen } from "@/components/layout/StatusScreen";
import { Button } from "@/components/ui/button";

export default function Error({
  retry,
}: {
  error: Error & { digest?: string };
  retry: () => void;
}) {
  return (
    <StatusScreen
      title="Something went wrong"
      description="The page hit an unexpected error. Try again, or go home and continue from the playground."
    >
      <Button type="button" className="min-h-11 px-4" onClick={() => retry()}>
        Try again
      </Button>
      <Button
        render={<Link href="/" />}
        nativeButton={false}
        variant="outline"
        className="min-h-11 px-4"
      >
        Home
      </Button>
    </StatusScreen>
  );
}
