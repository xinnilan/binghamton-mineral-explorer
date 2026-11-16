"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase, imageUrl, IMAGE_BUCKET } from "@/lib/supabase";
import { CRYSTAL_SYSTEMS, Formula } from "@/lib/mineralogy";
import { LocationPicker } from "./maps";

// Used for both adding (initial = null) and editing a specimen.
export default function SpecimenForm({ initial, defaultCategory = "campus_rock" }) {
  const router = useRouter();
  const [form, setForm] = useState({
    name: initial?.name ?? "",
    catalog_number: initial?.catalog_number ?? "",
    description: initial?.description ?? "",
    category: initial?.category ?? defaultCategory,
    latitude: initial?.latitude ?? null,
    longitude: initial?.longitude ?? null,
    location_note: initial?.location_note ?? "",
    room_number: initial?.room_number ?? "",
    used_for_teaching: initial?.used_for_teaching ?? false,
    formula: initial?.formula ?? "",
    crystal_system: initial?.crystal_system ?? "",
    member_of: initial?.member_of ?? "",
  });
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(imageUrl(initial?.image_path));
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [knownGroups, setKnownGroups] = useState([]);

  // Suggest groups already in use, so "Garnet Group" isn't also entered as "garnet group".
  useEffect(() => {
    supabase.from("specimens").select("member_of").not("member_of", "is", null)
      .then(({ data }) => setKnownGroups([...new Set((data ?? []).map((r) => r.member_of))].sort()));
  }, []);

  function set(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  function chooseFile(e) {
    const chosen = e.target.files?.[0];
    setFile(chosen ?? null);
    if (chosen) setPreview(URL.createObjectURL(chosen));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    setError("");

    try {
      // 1. Upload the image, if a new one was chosen.
      let imagePath = initial?.image_path ?? null;
      if (file) {
        const ext = file.name.split(".").pop().toLowerCase();
        const newPath = `${crypto.randomUUID()}.${ext}`;
        const { error: uploadError } = await supabase.storage.from(IMAGE_BUCKET).upload(newPath, file);
        if (uploadError) throw uploadError;
        if (imagePath) await supabase.storage.from(IMAGE_BUCKET).remove([imagePath]);
        imagePath = newPath;
      }

      // 2. Only keep the fields that belong to the chosen category.
      const isRock = form.category === "campus_rock";
      const record = {
        name: form.name.trim(),
        catalog_number: form.catalog_number.trim() || null,
        description: form.description.trim() || null,
        category: form.category,
        image_path: imagePath,
        latitude: isRock ? form.latitude : null,
        longitude: isRock ? form.longitude : null,
        location_note: isRock ? form.location_note.trim() || null : null,
        room_number: isRock ? null : form.room_number.trim() || null,
        used_for_teaching: isRock ? false : form.used_for_teaching,
        formula: isRock ? null : form.formula.trim() || null,
        crystal_system: isRock ? null : form.crystal_system || null,
        member_of: isRock ? null : form.member_of.trim() || null,
      };

      // 3. Save it.
      let id = initial?.id;
      if (id) {
        const { error: saveError } = await supabase.from("specimens").update(record).eq("id", id);
        if (saveError) throw saveError;
      } else {
        const { data, error: saveError } = await supabase.from("specimens").insert(record).select("id").single();
        if (saveError) throw saveError;
        id = data.id;
      }
      router.push(`/specimens/${id}`);
    } catch (err) {
      setError(
        err.code === "23505"
          ? "Another specimen already uses that ID number."
          : err.message ?? "Something went wrong."
      );
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="form">
      <fieldset className="toggle">
        <legend>Type</legend>
        <label>
          <input type="radio" name="category" checked={form.category === "campus_rock"}
            onChange={() => set("category", "campus_rock")} />
          Campus rock
        </label>
        <label>
          <input type="radio" name="category" checked={form.category === "department_mineral"}
            onChange={() => set("category", "department_mineral")} />
          Department mineral
        </label>
      </fieldset>

      <label>
        Name
        <input value={form.name} onChange={(e) => set("name", e.target.value)} required />
      </label>

      <label>
        ID number <span className="muted">(optional)</span>
        <input value={form.catalog_number} onChange={(e) => set("catalog_number", e.target.value)} />
      </label>

      <label>
        Image
        <input type="file" accept="image/*" onChange={chooseFile} />
      </label>
      {preview && <img src={preview} alt="Preview" className="preview" />}

      <label>
        Description
        <textarea rows={8} value={form.description} onChange={(e) => set("description", e.target.value)}
          placeholder="Type, color, hardness, where it came from, anything else…" />
      </label>

      {form.category === "campus_rock" ? (
        <>
          <div>
            <p className="label">Location on campus <span className="muted">(click the map to drop a pin)</span></p>
            <LocationPicker
              latitude={form.latitude}
              longitude={form.longitude}
              onPick={({ latitude, longitude }) => setForm((f) => ({ ...f, latitude, longitude }))}
            />
            {form.latitude != null && (
              <p className="muted small">
                {form.latitude.toFixed(5)}, {form.longitude.toFixed(5)}{" "}
                <button type="button" className="link-button"
                  onClick={() => setForm((f) => ({ ...f, latitude: null, longitude: null }))}>
                  Remove pin
                </button>
              </p>
            )}
          </div>
          <label>
            Location description <span className="muted">(optional)</span>
            <input value={form.location_note} onChange={(e) => set("location_note", e.target.value)}
              placeholder="e.g. East entrance of the Science Building" />
          </label>
        </>
      ) : (
        <>
          <label>
            Formula <span className="muted">(optional; type numbers normally, e.g. SiO2)</span>
            <input value={form.formula} onChange={(e) => set("formula", e.target.value)} />
          </label>
          {form.formula && <p className="muted small">Shows as: <Formula value={form.formula} /></p>}
          <label>
            Crystal system <span className="muted">(optional)</span>
            <select value={form.crystal_system} onChange={(e) => set("crystal_system", e.target.value)}>
              <option value="">Not specified</option>
              {CRYSTAL_SYSTEMS.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
            </select>
          </label>
          <label>
            Member of <span className="muted">(optional, e.g. Garnet Group)</span>
            <input value={form.member_of} onChange={(e) => set("member_of", e.target.value)} list="known-groups" />
            <datalist id="known-groups">
              {knownGroups.map((g) => <option key={g} value={g} />)}
            </datalist>
          </label>
          <label>
            Room number
            <input value={form.room_number} onChange={(e) => set("room_number", e.target.value)} />
          </label>
          <label className="checkbox">
            <input type="checkbox" checked={form.used_for_teaching}
              onChange={(e) => set("used_for_teaching", e.target.checked)} />
            Used for teaching
          </label>
        </>
      )}

      {error && <p className="error">{error}</p>}
      <div className="row">
        <button type="submit" disabled={saving}>{saving ? "Saving…" : "Save"}</button>
        <button type="button" className="secondary" onClick={() => router.back()}>Cancel</button>
      </div>
    </form>
  );
}
