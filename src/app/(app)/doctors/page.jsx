"use client";

/**
 * app/(app)/doctors/page.jsx
 * Doctors list: search, filters (specialization, hospital, date added), pagination,
 * and an "Add doctor" dialog. Clicking a doctor opens its detail page.
 */
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { Building2, Phone, Plus, Users } from "lucide-react";
import { api } from "@/lib/api";
import { PAGE_SIZE } from "@/lib/constants";
import { formatDate, initials } from "@/lib/format";
import { useDebounce } from "@/hooks/useDebounce";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import PageHeader from "@/components/PageHeader";
import SearchInput from "@/components/SearchInput";
import FilterSelect from "@/components/FilterSelect";
import DateFilter from "@/components/DateFilter";
import Pagination from "@/components/Pagination";
import DoctorForm from "@/components/DoctorForm";
import { EmptyState, ErrorState, LoadingRows } from "@/components/ListStates";

const NO_FILTERS = { specialization: "", hospital: "", from: "", to: "" };

export default function DoctorsPage() {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState(NO_FILTERS);
  const [page, setPage] = useState(1);
  const [formOpen, setFormOpen] = useState(false);

  // Wait until the user stops typing before searching
  const debouncedSearch = useDebounce(search);

  // Any filter change goes back to page 1
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

  // Doctors for the current page. The query key includes every filter, so
  // each combination is cached separately. keepPreviousData keeps the old rows
  // on screen while the next page loads (no flicker).
  const params = { q: debouncedSearch, ...filters, page, limit: PAGE_SIZE };
  const { data, isLoading, isFetching, isError, error, refetch } = useQuery({
    queryKey: ["doctors", params],
    queryFn: () => api("/doctors", { params }),
    placeholderData: keepPreviousData,
  });

  // Dropdown values (specializations, hospitals)
  const { data: options } = useQuery({
    queryKey: ["doctor-options"],
    queryFn: () => api("/doctors/options").then((res) => res.data),
    staleTime: 5 * 60 * 1000,
  });

  const doctors = data?.data ?? [];

  return (
    <>
      <PageHeader
        title="Doctors"
        description="Manage doctors and view their patients."
        action={
          <Button onClick={() => setFormOpen(true)} className="h-9">
            <Plus /> Add doctor
          </Button>
        }
      />

      {/* Filters */}
      <Card className="grid grid-cols-1 gap-3 p-4 sm:grid-cols-2 lg:grid-cols-[2fr_1fr_1fr_auto]">
        <SearchInput value={search} onChange={updateSearch} placeholder="Search name, email, hospital..." />
        <FilterSelect
          value={filters.specialization}
          onChange={(v) => updateFilters({ specialization: v })}
          options={options?.specializations}
          placeholder="All specializations"
          aria-label="Filter by specialization"
        />
        <FilterSelect
          value={filters.hospital}
          onChange={(v) => updateFilters({ hospital: v })}
          options={options?.hospitals}
          placeholder="All hospitals"
          aria-label="Filter by hospital"
        />
        <DateFilter from={filters.from} to={filters.to} onChange={updateFilters} label="Date added" />
        {hasFilters && (
          <Button variant="ghost" size="sm" onClick={clearFilters} className="justify-self-start sm:col-span-2 lg:col-span-4">
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
        ) : doctors.length === 0 ? (
          <EmptyState
            title={hasFilters ? "No doctors match your filters" : "No doctors yet"}
            description={hasFilters ? "Try a different search or clear the filters." : "Add your first doctor to get started."}
            action={hasFilters && <Button variant="outline" size="sm" onClick={clearFilters}>Clear filters</Button>}
          />
        ) : (
          <>
            {/* Desktop / tablet: table */}
            <Table className="hidden md:table">
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead className="pl-4">Doctor</TableHead>
                  <TableHead>Specialization</TableHead>
                  <TableHead>Hospital</TableHead>
                  <TableHead className="hidden lg:table-cell">Phone</TableHead>
                  <TableHead className="pr-4 text-right lg:pr-2">Patients</TableHead>
                  <TableHead className="hidden pr-4 lg:table-cell">Added</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {doctors.map((doctor) => (
                  <TableRow
                    key={doctor._id}
                    className="cursor-pointer"
                    onClick={() => router.push(`/doctors/${doctor._id}`)}
                  >
                    <TableCell className="pl-4">
                      <div className="flex items-center gap-3">
                        <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
                          {initials(doctor.name)}
                        </span>
                        <div className="min-w-0">
                          {/* Real link so keyboard users can open the doctor too */}
                          <Link href={`/doctors/${doctor._id}`} className="font-medium hover:underline" onClick={(e) => e.stopPropagation()}>
                            {doctor.name}
                          </Link>
                          <p className="truncate text-xs text-muted-foreground">{doctor.email}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">{doctor.specialization}</Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground">{doctor.hospital}</TableCell>
                    <TableCell className="hidden tabular-nums text-muted-foreground lg:table-cell">{doctor.phone}</TableCell>
                    <TableCell className="pr-4 text-right font-medium tabular-nums lg:pr-2">{doctor.patientCount}</TableCell>
                    <TableCell className="hidden pr-4 text-muted-foreground lg:table-cell">{formatDate(doctor.createdAt)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            {/* Mobile: cards */}
            <ul className="divide-y md:hidden">
              {doctors.map((doctor) => (
                <li key={doctor._id}>
                  <Link href={`/doctors/${doctor._id}`} className="flex gap-3 p-4 hover:bg-muted/50">
                    <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
                      {initials(doctor.name)}
                    </span>
                    <div className="min-w-0 flex-1 space-y-1">
                      <div className="flex items-center justify-between gap-2">
                        <p className="truncate font-medium">{doctor.name}</p>
                        <Badge variant="secondary">{doctor.specialization}</Badge>
                      </div>
                      <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <Building2 className="size-3.5" /> {doctor.hospital}
                      </p>
                      <div className="flex gap-4 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1.5"><Phone className="size-3.5" /> {doctor.phone}</span>
                        <span className="flex items-center gap-1.5"><Users className="size-3.5" /> {doctor.patientCount} patients</span>
                      </div>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          </>
        )}
      </Card>

      <Pagination meta={data?.meta} onPageChange={setPage} />

      <DoctorForm
        open={formOpen}
        onOpenChange={setFormOpen}
        specializations={options?.specializations}
        hospitals={options?.hospitals}
      />
    </>
  );
}
