import { renderToBuffer, type DocumentProps } from "@react-pdf/renderer";
import { NextResponse, type NextRequest } from "next/server";
import { createElement, type ReactElement } from "react";
import { z } from "zod";

import { siteConfig } from "@/config/site";
import { getCourse } from "@/lib/lms/queries";
import { CertificateDocument } from "@/lib/pdf/CertificateDocument";
import { getUser } from "@/lib/supabase/server";

/** Member's « attestation de suivi » as a PDF (RLS: only their own certificates). */
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const id = z.uuid().safeParse((await params).id);
  if (!id.success) return new NextResponse("Attestation introuvable", { status: 404 });
  const { supabase, user } = await getUser();
  if (!supabase || !user) return NextResponse.redirect(new URL("/compte/connexion", request.url));
  const { data: cert } = await supabase
    .from("certificates")
    .select("serial, holder_name, issued_at, courses(slug)")
    .eq("id", id.data)
    .maybeSingle();
  const slug = (cert?.courses as { slug: string } | null)?.slug;
  const course = slug ? await getCourse(slug) : null;
  if (!cert || !course) return new NextResponse("Attestation introuvable", { status: 404 });

  const doc = createElement(CertificateDocument, {
    holderName: cert.holder_name,
    courseTitle: course.title,
    totalMinutes: course.totalMinutes,
    issuedAt: cert.issued_at,
    serial: cert.serial,
    siteName: siteConfig.name,
    publisher: siteConfig.publisher.legalName,
    nda: siteConfig.training.showNda ? siteConfig.training.ndaNumber : null,
  }) as unknown as ReactElement<DocumentProps>;
  const pdf = await renderToBuffer(doc);
  return new NextResponse(new Uint8Array(pdf), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="attestation-de-suivi-${course.slug}.pdf"`,
      "Cache-Control": "private, no-store",
    },
  });
}
