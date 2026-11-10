"use client";

/**
 * components/PatientForm.jsx
 * One dialog for both:
 *  - Add:  pass `doctorId`  → POST /api/doctors/:doctorId/patients
 *  - Edit: pass `patient`   → PUT  /api/patients/:id (can also move the patient to another doctor)
 *
 * The component stays mounted (Base UI dialogs must not mount already-open,
 * or the opening click closes them). The form resets whenever `patient` changes.
 */
import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { api } from "@/lib/api";
import { CONDITIONS, GENDERS } from "@/lib/constants";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { selectClass } from "@/components/FilterSelect";

// Turn a patient from the API into form values (dates as YYYY-MM-DD for <input type="date">)
function toFormValues(patient) {
  return {
    name: patient?.name ?? "",
    age: patient?.age ?? "",
    gender: patient?.gender ?? "",
    condition: patient?.condition ?? "",
    phone: patient?.phone ?? "",
    email: patient?.email ?? "",
    // Local date (same as the tables show), not the UTC part of the ISO string
    admittedAt: patient?.admittedAt ? format(new Date(patient.admittedAt), "yyyy-MM-dd") : "",
    doctor: patient?.doctor?._id ?? patient?.doctor ?? "",
  };
}

// Label + control + error message
function Field({ id, label, error, children }) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={id}>{label}</Label>
      {children}
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}

export default function PatientForm({ open, onOpenChange, doctorId, patient }) {
  const queryClient = useQueryClient();
  const isEdit = Boolean(patient);
  const [form, setForm] = useState(() => toFormValues(patient));
  const [errors, setErrors] = useState({});

  // A different patient was opened → load its values into the form.
  // (React's recommended "adjust state when a prop changes" pattern, no effect needed.)
  const [loadedPatient, setLoadedPatient] = useState(patient);
  if (patient !== loadedPatient) {
    setLoadedPatient(patient);
    setForm(toFormValues(patient));
    setErrors({});
  }

  const update = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  // Doctor list for the "Assigned doctor" select (edit mode only, cached)
  const { data: options } = useQuery({
    queryKey: ["doctor-options"],
    queryFn: () => api("/doctors/options").then((res) => res.data),
    enabled: isEdit,
    staleTime: 5 * 60 * 1000,
  });

  const save = useMutation({
    mutationFn: (body) =>
      isEdit
        ? api(`/patients/${patient._id}`, { method: "PUT", body })
        : api(`/doctors/${doctorId}/patients`, { method: "POST", body: { ...body, doctor: undefined } }),
    onSuccess: () => {
      // Refresh every list and number that shows patients
      queryClient.invalidateQueries({ queryKey: ["patients"] });
      queryClient.invalidateQueries({ queryKey: ["doctors"] });
      queryClient.invalidateQueries({ queryKey: ["stats"] });
      toast.success(isEdit ? "Patient updated" : "Patient added");
      close();
    },
    onError: (err) => {
      // [{ field, message }] from the API → { field: message }
      setErrors(Object.fromEntries(err.details.map((d) => [d.field, d.message])));
      if (!err.details.length) toast.error(err.message);
    },
  });

  function close() {
    setForm(toFormValues(patient));
    setErrors({});
    onOpenChange(false);
  }

  function handleSubmit(e) {
    e.preventDefault();
    setErrors({});
    const body = { ...form };
    // Only send the admitted date if the user changed it, so editing other
    // fields never shifts the stored date/time (timezones)
    if (isEdit && body.admittedAt === toFormValues(patient).admittedAt) delete body.admittedAt;
    save.mutate(body);
  }

  return (
    <Dialog open={open} onOpenChange={(isOpen) => (isOpen ? onOpenChange(true) : close())}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit patient" : "Add patient"}</DialogTitle>
          <DialogDescription>
            {isEdit ? "Update the patient's details." : "Fields marked * are required."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <Field id="name" label="Full name *" error={errors.name}>
              <Input id="name" name="name" required autoFocus value={form.name} onChange={update} aria-invalid={Boolean(errors.name)} />
            </Field>
          </div>

          <Field id="age" label="Age *" error={errors.age}>
            <Input id="age" name="age" type="number" min="0" max="130" required value={form.age} onChange={update} aria-invalid={Boolean(errors.age)} />
          </Field>

          <Field id="gender" label="Gender *" error={errors.gender}>
            <select id="gender" name="gender" required value={form.gender} onChange={update} className={selectClass}>
              <option value="">Select gender</option>
              {GENDERS.map((g) => <option key={g.value} value={g.value}>{g.label}</option>)}
            </select>
          </Field>

          <Field id="condition" label="Condition *" error={errors.condition}>
            <select id="condition" name="condition" required value={form.condition} onChange={update} className={selectClass}>
              <option value="">Select condition</option>
              {CONDITIONS.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
            </select>
          </Field>

          <Field id="admittedAt" label="Admitted on" error={errors.admittedAt}>
            <Input id="admittedAt" name="admittedAt" type="date" value={form.admittedAt} onChange={update} />
          </Field>

          <Field id="phone" label="Phone" error={errors.phone}>
            <Input id="phone" name="phone" type="tel" value={form.phone} onChange={update} aria-invalid={Boolean(errors.phone)} />
          </Field>

          <Field id="email" label="Email" error={errors.email}>
            <Input id="email" name="email" type="email" value={form.email} onChange={update} aria-invalid={Boolean(errors.email)} />
          </Field>

          {/* Only when editing: move the patient to a different doctor */}
          {isEdit && (
            <div className="sm:col-span-2">
              <Field id="doctor" label="Assigned doctor" error={errors.doctor}>
                <select id="doctor" name="doctor" value={form.doctor} onChange={update} className={selectClass}>
                  {options?.doctors.map((d) => (
                    <option key={d._id} value={d._id}>{d.name} · {d.specialization}</option>
                  ))}
                </select>
              </Field>
            </div>
          )}

          <div className="flex justify-end gap-2 sm:col-span-2">
            <Button type="button" variant="outline" onClick={close}>
              Cancel
            </Button>
            <Button type="submit" disabled={save.isPending}>
              {save.isPending && <Loader2 className="animate-spin" />}
              {isEdit ? "Save changes" : "Add patient"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
