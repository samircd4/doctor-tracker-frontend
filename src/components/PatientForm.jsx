"use client";

/**
 * components/PatientForm.jsx
 * One dialog for:
 *  - Add for a known doctor: pass `doctorId` → POST /api/doctors/:doctorId/patients
 *  - Add from the Patients page: no `doctorId` → the user picks the doctor in the form
 *  - Edit: pass `patient` → PUT /api/patients/:id (can also move the patient to another doctor)
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
import FilterSelect from "@/components/FilterSelect";
import DateInput from "@/components/DateInput";

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
  // Show the doctor dropdown when editing, or when adding without a fixed doctor
  const chooseDoctor = isEdit || !doctorId;
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

  // Changing a field also clears that field's error message
  const setField = (name, value) => {
    setForm({ ...form, [name]: value });
    if (errors[name]) setErrors({ ...errors, [name]: undefined });
  };
  const update = (e) => setField(e.target.name, e.target.value); // for text inputs

  // Doctor list for the doctor dropdown (only loaded when the dropdown is shown, cached)
  const { data: options } = useQuery({
    queryKey: ["doctor-options"],
    queryFn: () => api("/doctors/options").then((res) => res.data),
    enabled: chooseDoctor,
    staleTime: 5 * 60 * 1000,
  });

  const save = useMutation({
    mutationFn: (body) =>
      isEdit
        ? api(`/patients/${patient._id}`, { method: "PUT", body })
        : // New patient goes under the fixed doctor, or the one picked in the form
          api(`/doctors/${doctorId || body.doctor}/patients`, { method: "POST", body: { ...body, doctor: undefined } }),
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
    // The doctor is part of the URL, so it must be chosen before we can send anything
    if (!isEdit && !doctorId && !form.doctor) {
      setErrors({ doctor: "Select a doctor" });
      return;
    }
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
          {/* Doctor: required when adding from the Patients page, changeable when editing */}
          {chooseDoctor && (
            <div className="sm:col-span-2">
              <Field id="doctor" label={isEdit ? "Assigned doctor" : "Doctor *"} error={errors.doctor}>
                <FilterSelect
                  id="doctor"
                  value={form.doctor}
                  onChange={(v) => setField("doctor", v)}
                  options={options?.doctors.map((d) => ({ value: d._id, label: `${d.name} · ${d.specialization}` })) ?? []}
                  placeholder="Select doctor"
                  allowEmpty={false}
                  aria-invalid={Boolean(errors.doctor)}
                />
              </Field>
            </div>
          )}

          <div className="sm:col-span-2">
            <Field id="name" label="Full name *" error={errors.name}>
              <Input id="name" name="name" required autoFocus value={form.name} onChange={update} aria-invalid={Boolean(errors.name)} />
            </Field>
          </div>

          <Field id="age" label="Age *" error={errors.age}>
            <Input id="age" name="age" type="number" min="0" max="130" required value={form.age} onChange={update} aria-invalid={Boolean(errors.age)} />
          </Field>

          <Field id="gender" label="Gender *" error={errors.gender}>
            <FilterSelect
              id="gender"
              value={form.gender}
              onChange={(v) => setField("gender", v)}
              options={GENDERS}
              placeholder="Select gender"
              allowEmpty={false}
              aria-invalid={Boolean(errors.gender)}
            />
          </Field>

          <Field id="condition" label="Condition *" error={errors.condition}>
            <FilterSelect
              id="condition"
              value={form.condition}
              onChange={(v) => setField("condition", v)}
              options={CONDITIONS}
              placeholder="Select condition"
              allowEmpty={false}
              aria-invalid={Boolean(errors.condition)}
            />
          </Field>

          <Field id="admittedAt" label="Admitted on" error={errors.admittedAt}>
            <DateInput id="admittedAt" name="admittedAt" value={form.admittedAt} onChange={update} />
          </Field>

          <Field id="phone" label="Phone" error={errors.phone}>
            <Input id="phone" name="phone" type="tel" value={form.phone} onChange={update} aria-invalid={Boolean(errors.phone)} />
          </Field>

          <Field id="email" label="Email" error={errors.email}>
            <Input id="email" name="email" type="email" value={form.email} onChange={update} aria-invalid={Boolean(errors.email)} />
          </Field>

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
