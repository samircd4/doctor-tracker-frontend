"use client";

/**
 * components/DoctorForm.jsx
 * "Add doctor" dialog. Validation happens on the server (Zod); any field
 * errors it returns are shown under the matching input.
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

const EMPTY = { name: "", specialization: "", hospital: "", phone: "", email: "" };

// Label + input + error message
function Field({ id, label, error, ...inputProps }) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={id}>{label}</Label>
      <Input id={id} name={id} aria-invalid={Boolean(error)} {...inputProps} />
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}

export default function DoctorForm({ open, onOpenChange, specializations = [], hospitals = [] }) {
  const queryClient = useQueryClient();
  const [form, setForm] = useState(EMPTY);
  const [errors, setErrors] = useState({});

  const update = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const createDoctor = useMutation({
    mutationFn: (body) => api("/doctors", { method: "POST", body }),
    onSuccess: () => {
      // Refresh everything that shows doctors
      queryClient.invalidateQueries({ queryKey: ["doctors"] });
      queryClient.invalidateQueries({ queryKey: ["doctor-options"] });
      queryClient.invalidateQueries({ queryKey: ["stats"] });
      toast.success("Doctor added");
      close();
    },
    onError: (err) => {
      // Turn [{ field, message }] from the API into { field: message }
      setErrors(Object.fromEntries(err.details.map((d) => [d.field, d.message])));
      if (!err.details.length) toast.error(err.message);
    },
  });

  function close() {
    setForm(EMPTY);
    setErrors({});
    onOpenChange(false);
  }

  function handleSubmit(e) {
    e.preventDefault();
    setErrors({});
    createDoctor.mutate(form);
  }

  return (
    <Dialog open={open} onOpenChange={(isOpen) => (isOpen ? onOpenChange(true) : close())}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Add doctor</DialogTitle>
          <DialogDescription>Enter the doctor&apos;s details. All fields are required.</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <Field id="name" label="Full name" placeholder="Dr. Jane Smith" value={form.name} onChange={update} error={errors.name} autoFocus />
          </div>
          {/* datalist = free text, with existing values suggested */}
          <Field id="specialization" label="Specialization" list="specialization-list" value={form.specialization} onChange={update} error={errors.specialization} />
          <Field id="hospital" label="Hospital" list="hospital-list" value={form.hospital} onChange={update} error={errors.hospital} />
          <Field id="phone" label="Phone" type="tel" placeholder="01700000000" value={form.phone} onChange={update} error={errors.phone} />
          <Field id="email" label="Email" type="email" placeholder="jane@hospital.com" value={form.email} onChange={update} error={errors.email} />

          <datalist id="specialization-list">
            {specializations.map((s) => <option key={s} value={s} />)}
          </datalist>
          <datalist id="hospital-list">
            {hospitals.map((h) => <option key={h} value={h} />)}
          </datalist>

          <div className="flex justify-end gap-2 sm:col-span-2">
            <Button type="button" variant="outline" onClick={close}>
              Cancel
            </Button>
            <Button type="submit" disabled={createDoctor.isPending}>
              {createDoctor.isPending && <Loader2 className="animate-spin" />}
              Save doctor
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
