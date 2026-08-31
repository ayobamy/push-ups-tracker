export type AppReturnPath = "/app" | "/app/settings";

export function appReturnPath(raw: unknown): AppReturnPath {
  return raw === "/app/settings" ? "/app/settings" : "/app";
}
