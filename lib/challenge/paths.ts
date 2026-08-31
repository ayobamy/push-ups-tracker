export type AppReturnPath = "/app" | "/app/settings";

export function appReturnPath(raw: unknown): AppReturnPath {
  return raw === "/app/settings" ? "/app/settings" : "/app";
}

export function isAppNavCurrent(pathname: string, href: string): boolean {
  if (href === "/app") {
    return pathname === "/app";
  }
  return pathname.startsWith(href);
}

export function isRecapPath(pathname: string): boolean {
  return pathname.startsWith("/app/you/recap");
}
