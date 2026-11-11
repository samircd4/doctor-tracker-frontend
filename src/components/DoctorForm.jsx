"use client";

/**
 * components/DoctorForm.jsx
 * One dialog for both:
 *  - Add:  no `doctor` prop → POST /api/doctors
 *  - Edit: pass `doctor`    → PUT  /api/doctors/:id
 * Validation happens on the server (Zod); any field errors it returns are
 * shown under the matching input.
 *
 * The component stays mounted (Base UI dialogs must not mount already-open);
 * the form resets whenever `doctor` changes.
 */
import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import SuggestInput from "@/components/SuggestInput";

// Turn a doctor from the API (or nothing) into form values
function toFormValues(doctor) {
  return {
    name: doctor?.name ?? "",
    specialization: doctor?.specialization ?? "",
    hospital: doctor?.hospital ?? "",
    phone: doctor?.phone ?? "",
    email: doctor?.email ?? "",
  };
}

// Label + input + error message. Pass `children` to use a custom control instead of <Input>.
function Field({ id, label, error, children, ...inputProps }) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={id}>{label}</Label>
      {children ?? <Input id={id} name={id} aria-invalid={Boolean(error)} {...inputProps} />}
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}

export default function DoctorForm({ open, onOpenChange, doctor, specializations = [], hospitals = [] }) {
  const queryClient = useQueryClient();
  const isEdit = Boolean(doctor);
  const [form, setForm] = useState(() => toFormValues(doctor));
  const [errors, setErrors] = useState({});

  // A different doctor was opened → load its values into the form
  // (React's recommended "adjust state when a prop changes" pattern, no effect needed)
  const [loadedDoctor, setLoadedDoctor] = useState(doctor);
  if (doctor !== loadedDoctor) {
    setLoadedDoctor(doctor);
    setForm(toFormValues(doctor));
    setErrors({});
  }

  // Changing a field also clears that field's error message
  const setField = (name, value) => {
    setForm((f) => ({ ...f, [name]: value }));
    if (errors[name]) setErrors((e) => ({ ...e, [name]: undefined }));
  };
  const update = (e) => setField(e.target.name, e.target.value);

  const save = useMutation({
    mutationFn: (body) =>
      isEdit ? api(`/doctors/${doctor._id}`, { method: "PUT", body }) : api("/doctors", { method: "POST", body }),
    onSuccess: () => {
      // Refresh everything that shows doctors (lists, detail page, dropdowns, dashboard,
      // and patient lists, which show the doctor's name)
      queryClient.invalidateQueries({ queryKey: ["doctors"] });
      queryClient.invalidateQueries({ queryKey: ["doctor-options"] });
      queryClient.invalidateQueries({ queryKey: ["patients"] });
      queryClient.invalidateQueries({ queryKey: ["stats"] });
      toast.success(isEdit ? "Doctor updated" : "Doctor added");
      close();
    },
    onError: (err) => {
      // Turn [{ field, message }] from the API into { field: message }
      setErrors(Object.fromEntries(err.details.map((d) => [d.field, d.message])));
      if (!err.details.length) toast.error(err.message);
    },
  });

  function close() {
    setForm(toFormValues(doctor));
    setErrors({});
    onOpenChange(false);
  }

  function handleSubmit(e) {
    e.preventDefault();
    setErrors({});
    save.mutate(form);
  }

  return (
    <Dialog open={open} onOpenChange={(isOpen) => (isOpen ? onOpenChange(true) : close())}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit doctor" : "Add doctor"}</DialogTitle>
          <DialogDescription>
            {isEdit ? "Update the doctor's details." : "Enter the doctor's details. All fields are required."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <Field id="name" label="Full name" placeholder="Dr. Jane Smith" value={form.name} onChange={update} error={errors.name} autoFocus />
          </div>
          {/* Free text, with existing values suggested in a dropdown */}
          <Field id="specialization" label="Specialization" error={errors.specialization}>
            <SuggestInput
              id="specialization"
              value={form.specialization}
              onChange={(v) => setField("specialization", v)}
              suggestions={specializations}
              placeholder="e.g. Cardiology"
              aria-invalid={Boolean(errors.specialization)}
            />
          </Field>
          <Field id="hospital" label="Hospital" error={errors.hospital}>
            <SuggestInput
              id="hospital"
              value={form.hospital}
              onChange={(v) => setField("hospital", v)}
              suggestions={hospitals}
              placeholder="e.g. City General Hospital"
              aria-invalid={Boolean(errors.hospital)}
            />
          </Field>
          <Field id="phone" label="Phone" type="tel" placeholder="01700000000" value={form.phone} onChange={update} error={errors.phone} />
          <Field id="email" label="Email" type="email" placeholder="jane@hospital.com" value={form.email} onChange={update} error={errors.email} />

          <div className="flex justify-end gap-2 sm:col-span-2">
            <Button type="button" variant="outline" onClick={close}>
              Cancel
            </Button>
            <Button type="submit" disabled={save.isPending}>
              {save.isPending && <Loader2 className="animate-spin" />}
              {isEdit ? "Save changes" : "Save doctor"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
