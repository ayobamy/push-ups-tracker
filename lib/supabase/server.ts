import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import {
  authCookieOptions,
  withAuthCookieOptions,
} from "@/lib/supabase/auth-cookie";

export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookieOptions: authCookieOptions(),
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, withAuthCookieOptions(options));
            });
          } catch {
            // Server Components cannot write cookies. Proxy does.
          }
        },
      },
    },
  );
}
