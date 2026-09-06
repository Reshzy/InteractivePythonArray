import Link from "next/link";

import { StatusScreen } from "@/components/layout/StatusScreen";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <StatusScreen
      title="Page not found"
      description="That URL is not part of Python Lists Playground. Head home or open the playground to keep learning list methods."
    >
      <Button
        render={<Link href="/" />}
        nativeButton={false}
        className="min-h-11 px-4"
      >
        Home
      </Button>
      <Button
        render={<Link href="/playground" />}
        nativeButton={false}
        variant="outline"
        className="min-h-11 px-4"
      >
        Open playground
      </Button>
    </StatusScreen>
  );
}
