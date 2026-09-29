import type { Route } from "next";
import { notFound, redirect } from "next/navigation";

import { getCourse, getLearnerState } from "@/lib/lms/queries";
import { getUser } from "@/lib/supabase/server";

/** /apprendre/<course>: resumes where the member left off. */
export default async function ResumeCourse({ params }: PageProps<"/apprendre/[formation]">) {
  const { formation } = await params;
  const course = await getCourse(formation);
  if (!course) notFound();
  const { supabase, user } = await getUser();
  if (!supabase || !user)
    redirect(`/compte/connexion?next=${encodeURIComponent(`/apprendre/${formation}`)}` as Route);
  const state = await getLearnerState(supabase, course, user.id);
  if (!state.hasAccess) redirect(`/formations/${formation}` as Route);
  redirect(`/apprendre/${formation}/${state.progress.resumeSlug}` as Route);
}
