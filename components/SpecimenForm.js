"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase, imageUrl, IMAGE_BUCKET } from "@/lib/supabase";
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
  });
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(imageUrl(initial?.image_path));
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

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
