"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { supabase } from "@/lib/supabase";
import SpecimenForm from "@/components/SpecimenForm";
import StaffOnly from "@/components/StaffOnly";

export default function EditSpecimenPage() {
  const { id } = useParams();
  const [specimen, setSpecimen] = useState(null);

  useEffect(() => {
    supabase.from("specimens").select("*").eq("id", id).single()
      .then(({ data }) => setSpecimen(data));
  }, [id]);

  return (
    <div className="narrow">
      <h1>Edit specimen</h1>
      <StaffOnly>
        {specimen ? <SpecimenForm initial={specimen} /> : <p className="muted">Loading…</p>}
      </StaffOnly>
    </div>
  );
}
