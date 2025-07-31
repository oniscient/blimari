import { StackHandler } from "@stackframe/stack";
import { stackServerApp } from "../../../stack";
import Link from "next/link";

export default function Handler(props: unknown) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-orange-50/30 to-white flex flex-col">
      <header className="px-6 py-4">
        <div className="max-w-4xl mx-auto">
          <Link href="/" className="text-xl font-bold text-[#2D3748] hover:text-[#FF6B35] transition-colors">
            Blimari
          </Link>
        </div>
      </header>
      <main className="flex-1 flex items-center justify-center p-4">
        <StackHandler fullPage={false} app={stackServerApp} routeProps={props} />
      </main>
    </div>
  );
}
