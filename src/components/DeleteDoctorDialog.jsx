"use client";

/**
 * components/DeleteDoctorDialog.jsx
 * Confirm + delete a doctor (admins only). The API also deletes the doctor's
 * patients, so the message says how many patients will be removed.
 * Used on the Doctors list and on the doctor's detail page.
 */
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { api } from "@/lib/api";
import ConfirmDialog from "@/components/ConfirmDialog";

export default function DeleteDoctorDialog({ doctor, onOpenChange, onDeleted }) {
  const queryClient = useQueryClient();

  const deleteDoctor = useMutation({
    mutationFn: () => api(`/doctors/${doctor._id}`, { method: "DELETE" }),
    onSuccess: (res) => {
      // The doctor and their patients are gone: refresh every list, dropdown and stat.
      // Skip the deleted doctor's own detail query (it would only refetch a 404).
      queryClient.invalidateQueries({ queryKey: ["doctors"], predicate: (q) => q.queryKey[2] !== doctor._id });
      queryClient.invalidateQueries({ queryKey: ["doctor-options"] });
      queryClient.invalidateQueries({ queryKey: ["patients"] });
      queryClient.invalidateQueries({ queryKey: ["stats"] });
      const removed = res?.data?.deletedPatients ?? 0;
      toast.success(`Doctor deleted${removed ? ` with ${removed} patient${removed === 1 ? "" : "s"}` : ""}`);
      onOpenChange(false);
      onDeleted?.();
    },
    onError: (err) => toast.error(err.message),
  });

  const count = doctor?.patientCount ?? 0;
  return (
    <ConfirmDialog
      open={Boolean(doctor)}
      onOpenChange={onOpenChange}
      title="Delete doctor?"
      description={
        count > 0
          ? `${doctor?.name} and their ${count} patient${count === 1 ? "" : "s"} will be permanently deleted. This can't be undone.`
          : `${doctor?.name ?? "This doctor"} will be permanently deleted. This can't be undone.`
      }
      onConfirm={() => deleteDoctor.mutate()}
      loading={deleteDoctor.isPending}
    />
  );
}
