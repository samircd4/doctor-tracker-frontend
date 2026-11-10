"use client";

/**
 * app/(app)/patients/page.jsx
 * All patients: search (name/email/phone), filters (condition, doctor, gender,
 * admitted date range), pagination, add (with doctor picker), edit and delete.
 */
import { useState } from "react";
import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Plus } from "lucide-react";
import { api } from "@/lib/api";
import { CONDITIONS, GENDERS, PAGE_SIZE } from "@/lib/constants";
import { useDebounce } from "@/hooks/useDebounce";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import PageHeader from "@/components/PageHeader";
import SearchInput from "@/components/SearchInput";
import FilterSelect from "@/components/FilterSelect";
import DateFilter from "@/components/DateFilter";
import Pagination from "@/components/Pagination";
import PatientTable from "@/components/PatientTable";
import PatientForm from "@/components/PatientForm";
import ConfirmDialog from "@/components/ConfirmDialog";
import { EmptyState, ErrorState, LoadingRows } from "@/components/ListStates";

const NO_FILTERS = { condition: "", doctor: "", gender: "", from: "", to: "" };

export default function PatientsPage() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState(NO_FILTERS);
  const [page, setPage] = useState(1);
  const [form, setForm] = useState(null); // null = closed, {} = add, { patient } = edit
  const [deleting, setDeleting] = useState(null); // patient waiting for delete confirmation

  const debouncedSearch = useDebounce(search);

  // Any filter or search change goes back to page 1
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

  // Patients for the current page (each filter combination is cached separately)
  const params = { q: debouncedSearch, ...filters, page, limit: PAGE_SIZE };
  const { data, isLoading, isFetching, isError, error, refetch } = useQuery({
    queryKey: ["patients", params],
    queryFn: () => api("/patients", { params }),
    placeholderData: keepPreviousData,
  });

  // Doctor names for the "Doctor" filter
  const { data: options } = useQuery({
    queryKey: ["doctor-options"],
    queryFn: () => api("/doctors/options").then((res) => res.data),
    staleTime: 5 * 60 * 1000,
  });
  const doctorOptions = options?.doctors.map((d) => ({ value: d._id, label: d.name })) ?? [];

  const deletePatient = useMutation({
    mutationFn: (patient) => api(`/patients/${patient._id}`, { method: "DELETE" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["patients"] });
      queryClient.invalidateQueries({ queryKey: ["doctors"] }); // patient counts change
      queryClient.invalidateQueries({ queryKey: ["stats"] });
      toast.success("Patient deleted");
      setDeleting(null);
    },
    onError: (err) => toast.error(err.message),
  });

  const patients = data?.data ?? [];

  return (
    <>
      <PageHeader
        title="Patients"
        description="Search, filter and manage every patient."
        action={
          // Same position and style as "Add doctor" on the Doctors page
          <Button onClick={() => setForm({})} className="h-9">
            <Plus /> Add patient
          </Button>
        }
      />

      {/* Filters */}
      <Card className="grid grid-cols-1 gap-3 p-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-[2fr_1fr_1fr_1fr]">
        <SearchInput value={search} onChange={updateSearch} placeholder="Search name, email, phone..." />
        <FilterSelect
          value={filters.condition}
          onChange={(v) => updateFilters({ condition: v })}
          options={CONDITIONS}
          placeholder="All conditions"
          aria-label="Filter by condition"
        />
        <FilterSelect
          value={filters.doctor}
          onChange={(v) => updateFilters({ doctor: v })}
          options={doctorOptions}
          placeholder="All doctors"
          aria-label="Filter by doctor"
        />
        <FilterSelect
          value={filters.gender}
          onChange={(v) => updateFilters({ gender: v })}
          options={GENDERS}
          placeholder="All genders"
          aria-label="Filter by gender"
        />
        <div className="sm:col-span-2 lg:col-span-2 xl:col-span-2">
          <DateFilter from={filters.from} to={filters.to} onChange={updateFilters} label="Admitted" />
        </div>
        {hasFilters && (
          <Button variant="ghost" size="sm" onClick={clearFilters} className="justify-self-start self-center">
            Clear filters
          </Button>
        )}
      </Card>

      {/* Results */}
      <Card className="gap-0 overflow-hidden p-0">
        {/* Thin bar while a new page/filter is loading */}
        <div className={`h-0.5 bg-primary transition-opacity ${isFetching && !isLoading ? "animate-pulse opacity-100" : "opacity-0"}`} />

        {isLoading ? (
          <LoadingRows />
        ) : isError ? (
          <ErrorState message={error.message} onRetry={refetch} />
        ) : patients.length === 0 ? (
          <EmptyState
            title={hasFilters ? "No patients match your filters" : "No patients yet"}
            description={hasFilters ? "Try a different search or clear the filters." : "Use “Add patient” to create the first one."}
            action={hasFilters && <Button variant="outline" size="sm" onClick={clearFilters}>Clear filters</Button>}
          />
        ) : (
          <PatientTable patients={patients} onEdit={(patient) => setForm({ patient })} onDelete={setDeleting} />
        )}
      </Card>

      <Pagination meta={data?.meta} onPageChange={setPage} />

      {/* Add (no patient → the form asks for the doctor) or edit (with patient) */}
      <PatientForm
        open={Boolean(form)}
        onOpenChange={(open) => !open && setForm(null)}
        patient={form?.patient}
      />

      <ConfirmDialog
        open={Boolean(deleting)}
        onOpenChange={(open) => !open && setDeleting(null)}
        title="Delete patient?"
        description={`${deleting?.name ?? "This patient"} will be permanently removed. This can't be undone.`}
        onConfirm={() => deletePatient.mutate(deleting)}
        loading={deletePatient.isPending}
      />
    </>
  );
}
