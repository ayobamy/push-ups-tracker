import { AppNav } from "@/app/app/nav";

export default function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto flex min-h-full w-full max-w-md flex-col pb-24">
      {children}
      <AppNav />
    </div>
  );
}
