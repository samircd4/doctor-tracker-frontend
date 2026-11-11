"use client";

/**
 * app/(app)/doctors/[id]/page.jsx
 * One doctor: profile card + that doctor's patients
 * (search, condition + admitted-date filters, pagination).
 * Admins can also edit/delete the doctor and add/edit/remove patients.
 */
import { useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Building2, CalendarDays, Mail, Pencil, Phone, Plus, Trash2, Users } from "lucide-react";
import { toast } from "sonner";
import { api } from "@/lib/api";
import { CONDITIONS, PAGE_SIZE } from "@/lib/constants";
import { formatDate, initials } from "@/lib/format";
import { useDebounce } from "@/hooks/useDebounce";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { Button, buttonVariants } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import SearchInput from "@/components/SearchInput";
import FilterSelect from "@/components/FilterSelect";
import DateFilter from "@/components/DateFilter";
import Pagination from "@/components/Pagination";
import PatientTable from "@/components/PatientTable";
import PatientForm from "@/components/PatientForm";
import ConfirmDialog from "@/components/ConfirmDialog";
import DoctorForm from "@/components/DoctorForm";
import DeleteDoctorDialog from "@/components/DeleteDoctorDialog";
import { EmptyState, ErrorState, LoadingRows } from "@/components/ListStates";

const NO_FILTERS = { condition: "", from: "", to: "" };

// One line of contact info in the profile card
function InfoItem({ icon: Icon, children }) {
  return (
    <p className="flex min-w-0 items-center gap-2 text-sm text-muted-foreground">
      <Icon className="size-4 shrink-0" />
      <span className="truncate">{children}</span>
    </p>
  );
}

export default function DoctorDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const { isAdmin } = useCurrentUser();
  const [editingDoctor, setEditingDoctor] = useState(false);
  const [deletingDoctor, setDeletingDoctor] = useState(false);
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState(NO_FILTERS);
  const [page, setPage] = useState(1);
  const [form, setForm] = useState(null); // null = closed, {} = add, { patient } = edit
  const [removing, setRemoving] = useState(null); // patient waiting for remove confirmation

  const debouncedSearch = useDebounce(search);

  const updateFilters = (patch) => {
    setFilters((prev) => ({ ...prev, ...patch }));
    setPage(1);
  };
  const updateSearch = (value) => {
    setSearch(value);
    setPage(1);
  };
  const hasFilters = Boolean(search || Object.values(filters).some(Boolean));
  const clearFilters = () => {
    setSearch("");
    setFilters(NO_FILTERS);
    setPage(1);
  };

  // Doctor profile (key starts with "doctors" so doctor mutations refresh it too)
  const doctorQuery = useQuery({
    queryKey: ["doctors", "detail", id],
    queryFn: () => api(`/doctors/${id}`).then((res) => res.data),
  });
  const doctor = doctorQuery.data;

  // Suggestions for the edit-doctor form (admins only, cached)
  const { data: options } = useQuery({
    queryKey: ["doctor-options"],
    queryFn: () => api("/doctors/options").then((res) => res.data),
    enabled: isAdmin,
    staleTime: 5 * 60 * 1000,
  });

  // This doctor's patients (key starts with "patients" so patient mutations refresh it)
  const params = { q: debouncedSearch, ...filters, page, limit: PAGE_SIZE };
  const patientsQuery = useQuery({
    queryKey: ["patients", "by-doctor", id, params],
    queryFn: () => api(`/doctors/${id}/patients`, { params }),
    placeholderData: keepPreviousData,
    enabled: Boolean(doctor), // don't load patients for a doctor that doesn't exist
  });
  const patients = patientsQuery.data?.data ?? [];

  const removePatient = useMutation({
    mutationFn: (patient) => api(`/doctors/${id}/patients/${patient._id}`, { method: "DELETE" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["patients"] });
      queryClient.invalidateQueries({ queryKey: ["doctors"] });
      queryClient.invalidateQueries({ queryKey: ["stats"] });
      toast.success("Patient removed");
      setRemoving(null);
    },
    onError: (err) => toast.error(err.message),
  });

  // ---------- Doctor not loaded yet / not found ----------
  if (doctorQuery.isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-5 w-32" />
        <Skeleton className="h-40 w-full rounded-xl" />
        <Skeleton className="h-64 w-full rounded-xl" />
      </div>
    );
  }
  if (doctorQuery.isError) {
    const notFound = doctorQuery.error.status === 404 || doctorQuery.error.status === 400;
    return (
      <Card className="p-0">
        {notFound ? (
          <EmptyState
            title="Doctor not found"
            description="This doctor may have been removed or the link is wrong."
            action={
              // A real link styled as a button (keeps correct link semantics)
              <Link href="/doctors" className={buttonVariants({ variant: "outline", size: "sm" })}>
                Back to doctors
              </Link>
            }
          />
        ) : (
          <ErrorState message={doctorQuery.error.message} onRetry={doctorQuery.refetch} />
        )}
      </Card>
    );
  }

  return (
    <>
      {/* Breadcrumb back to the list */}
      <Link href="/doctors" className="inline-flex items-center gap-1.5 py-1.5 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="size-4" /> All doctors
      </Link>

      {/* Doctor profile */}
      <Card className="gap-5 p-5 sm:p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex min-w-0 items-center gap-4">
            <span className="flex size-14 shrink-0 items-center justify-center rounded-full bg-primary text-lg font-semibold text-primary-foreground">
              {initials(doctor.name)}
            </span>
            <div className="min-w-0">
              <h1 className="truncate text-2xl font-semibold tracking-tight">{doctor.name}</h1>
              <Badge variant="secondary" className="mt-1">{doctor.specialization}</Badge>
            </div>
          </div>
          {/* Admin actions (the API enforces the admin role too) */}
          {isAdmin && (
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" onClick={() => setEditingDoctor(true)} className="h-9">
                <Pencil /> Edit
              </Button>
              <Button
                variant="outline"
                onClick={() => setDeletingDoctor(true)}
                className="h-9 text-destructive hover:bg-destructive/10 hover:text-destructive"
              >
                <Trash2 /> Delete
              </Button>
              <Button onClick={() => setForm({})} className="h-9">
                <Plus /> Add patient
              </Button>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 gap-3 border-t pt-5 sm:grid-cols-2 lg:grid-cols-4">
          <InfoItem icon={Building2}>{doctor.hospital}</InfoItem>
          <InfoItem icon={Phone}>{doctor.phone}</InfoItem>
          <InfoItem icon={Mail}>{doctor.email}</InfoItem>
          <InfoItem icon={CalendarDays}>Added {formatDate(doctor.createdAt)}</InfoItem>
        </div>
      </Card>

      {/* Patients section */}
      <div className="flex items-center gap-2">
        <Users className="size-5 text-muted-foreground" />
        <h2 className="text-lg font-semibold">Patients</h2>
        <Badge variant="outline">{doctor.patientCount}</Badge>
      </div>

      <Card className="grid grid-cols-1 gap-3 p-4 sm:grid-cols-2 lg:grid-cols-[2fr_1fr_auto]">
        <SearchInput value={search} onChange={updateSearch} placeholder="Search this doctor's patients..." />
        <FilterSelect
          value={filters.condition}
          onChange={(v) => updateFilters({ condition: v })}
          options={CONDITIONS}
          placeholder="All conditions"
          aria-label="Filter by condition"
        />
        <DateFilter from={filters.from} to={filters.to} onChange={updateFilters} label="Admitted" />
        {hasFilters && (
          <Button variant="ghost" size="sm" onClick={clearFilters} className="justify-self-start sm:col-span-2 lg:col-span-3">
            Clear filters
          </Button>
        )}
      </Card>

      <Card className="gap-0 overflow-hidden p-0">
        <div className={`h-0.5 bg-primary transition-opacity ${patientsQuery.isFetching && !patientsQuery.isLoading ? "animate-pulse opacity-100" : "opacity-0"}`} />

        {patientsQuery.isLoading ? (
          <LoadingRows rows={4} />
        ) : patientsQuery.isError ? (
          <ErrorState message={patientsQuery.error.message} onRetry={patientsQuery.refetch} />
        ) : patients.length === 0 ? (
          <EmptyState
            title={hasFilters ? "No patients match your filters" : "No patients yet"}
            description={hasFilters ? "Try a different search or clear the filters." : "Add the first patient for this doctor."}
            action={
              hasFilters ? (
                <Button variant="outline" size="sm" onClick={clearFilters}>Clear filters</Button>
              ) : (
                isAdmin && <Button size="sm" onClick={() => setForm({})}><Plus /> Add patient</Button>
              )
            }
          />
        ) : (
          <PatientTable
            patients={patients}
            showDoctor={false}
            onEdit={isAdmin ? (patient) => setForm({ patient }) : undefined}
            onDelete={isAdmin ? setRemoving : undefined}
          />
        )}
      </Card>

      <Pagination meta={patientsQuery.data?.meta} onPageChange={setPage} />

      {/* Add (no patient) or edit (with patient) */}
      <PatientForm
        open={Boolean(form)}
        onOpenChange={(open) => !open && setForm(null)}
        doctorId={id}
        patient={form?.patient}
      />

      <ConfirmDialog
        open={Boolean(removing)}
        onOpenChange={(open) => !open && setRemoving(null)}
        title="Remove patient?"
        description={`${removing?.name ?? "This patient"} will be removed from ${doctor.name}'s list and deleted.`}
        confirmLabel="Remove"
        onConfirm={() => removePatient.mutate(removing)}
        loading={removePatient.isPending}
      />

      {/* Admin: edit this doctor */}
      <DoctorForm
        open={editingDoctor}
        onOpenChange={setEditingDoctor}
        doctor={doctor}
        specializations={options?.specializations}
        hospitals={options?.hospitals}
      />

      {/* Admin: delete this doctor (and their patients), then go back to the list */}
      <DeleteDoctorDialog
        doctor={deletingDoctor ? doctor : null}
        onOpenChange={setDeletingDoctor}
        onDeleted={() => router.replace("/doctors")}
      />
    </>
  );
}
