import type { EmailOtpType } from "@supabase/supabase-js";
import { NextResponse, type NextRequest } from "next/server";

import { safeNext } from "@/lib/security/redirect";
import { createClient } from "@/lib/supabase/server";

const TYPES: EmailOtpType[] = [
  "email",
  "signup",
  "magiclink",
  "recovery",
  "email_change",
  "invite",
];

/** Target of the links in auth e-mails: verifies the one-time token and opens the session. */
export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;
  const tokenHash = params.get("token_hash");
  const type = params.get("type") as EmailOtpType | null;
  const next = safeNext(params.get("next"));
  const fail = new URL("/compte/connexion?erreur=lien", request.url);

  const supabase = await createClient();
  if (!supabase || !tokenHash || !type || !TYPES.includes(type)) return NextResponse.redirect(fail);

  const { error } = await supabase.auth.verifyOtp({ type, token_hash: tokenHash });
  if (error) return NextResponse.redirect(fail);
  return NextResponse.redirect(new URL(next, request.url));
}
