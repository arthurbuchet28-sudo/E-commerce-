"use client";

import { useActionState } from "react";

import { startCourse } from "@/app/apprendre/actions";
import { Button } from "@/components/ui/Button";

export function StartCourseButton({ courseId, slug }: { courseId: string; slug: string }) {
  const [state, action, pending] = useActionState(startCourse, {});
  return (
    <form action={action} className="flex flex-col gap-2">
      <input type="hidden" name="courseId" value={courseId} />
      <input type="hidden" name="slug" value={slug} />
      <Button type="submit" size="lg" className="w-full" disabled={pending}>
        {pending ? "Ouverture…" : "Commencer gratuitement"}
      </Button>
      {state.error && (
        <p role="alert" className="text-small font-semibold text-danger">
          {state.error}
        </p>
      )}
    </form>
  );
}
