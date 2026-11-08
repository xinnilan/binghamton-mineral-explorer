"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import SpecimenForm from "@/components/SpecimenForm";
import StaffOnly from "@/components/StaffOnly";

function NewSpecimen() {
  const category = useSearchParams().get("category");
  return (
    <SpecimenForm defaultCategory={category === "department_mineral" ? "department_mineral" : "campus_rock"} />
  );
}

export default function NewSpecimenPage() {
  return (
    <div className="narrow">
      <h1>Add a specimen</h1>
      <StaffOnly>
        <Suspense>
          <NewSpecimen />
        </Suspense>
      </StaffOnly>
    </div>
  );
}
