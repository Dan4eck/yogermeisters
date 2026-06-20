import { AlertCircle } from "lucide-react";

export default function NotFound() {
  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-[#f7f6f3] px-6 text-[#151515]">
      <div className="w-full max-w-md border border-black/10 bg-white/70 p-8 shadow-[0_24px_70px_rgba(68,59,49,0.1)]">
        <div className="mb-4 flex gap-3">
          <AlertCircle className="h-8 w-8 text-[#ad825e]" />
          <h1 className="text-2xl font-semibold">404 Page Not Found</h1>
        </div>
        <p className="mt-4 text-sm text-black/60">This page does not exist.</p>
      </div>
    </div>
  );
}
