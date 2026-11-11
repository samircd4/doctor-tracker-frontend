/**
 * components/PatientTable.jsx
 * Patient rows used on both the Patients page and a doctor's detail page.
 * Desktop: table. Mobile: cards. Edit/Delete buttons on every row (only when
 * onEdit/onDelete are passed, i.e. for admins).
 *
 * showDoctor: show the "Doctor" column (not needed on a doctor's own page)
 */
import Link from "next/link";
import { formatDate } from "@/lib/format";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import ConditionBadge from "@/components/ConditionBadge";
import RowActions from "@/components/RowActions";

const capitalize = (text = "") => text.charAt(0).toUpperCase() + text.slice(1);

export default function PatientTable({ patients, showDoctor = true, onEdit, onDelete }) {
  // No handlers (e.g. view-only staff) → no Actions column
  const hasActions = Boolean(onEdit || onDelete);
  const actionsFor = (patient) => (
    <RowActions
      label={patient.name}
      onEdit={onEdit && (() => onEdit(patient))}
      onDelete={onDelete && (() => onDelete(patient))}
    />
  );

  return (
    <>
      {/* Desktop / tablet: table */}
      <Table className="hidden md:table">
        <TableHeader>
          <TableRow className="bg-muted/50">
            <TableHead className="pl-4">Patient</TableHead>
            <TableHead className="hidden lg:table-cell">Age / Gender</TableHead>
            <TableHead>Condition</TableHead>
            {showDoctor && <TableHead>Doctor</TableHead>}
            <TableHead className="hidden lg:table-cell">Admitted</TableHead>
            {hasActions && <TableHead className="pr-4 text-right">Actions</TableHead>}
          </TableRow>
        </TableHeader>
        <TableBody>
          {patients.map((patient) => (
            <TableRow key={patient._id}>
              <TableCell className="pl-4">
                <p className="font-medium">{patient.name}</p>
                <p className="text-xs text-muted-foreground">{patient.email || patient.phone || "—"}</p>
              </TableCell>
              <TableCell className="hidden text-muted-foreground lg:table-cell">
                {patient.age} · {capitalize(patient.gender)}
              </TableCell>
              <TableCell>
                <ConditionBadge condition={patient.condition} />
              </TableCell>
              {showDoctor && (
                <TableCell>
                  {patient.doctor?._id ? (
                    <Link href={`/doctors/${patient.doctor._id}`} className="hover:underline">
                      {patient.doctor.name}
                    </Link>
                  ) : (
                    "—"
                  )}
                  <p className="text-xs text-muted-foreground">{patient.doctor?.specialization}</p>
                </TableCell>
              )}
              <TableCell className="hidden text-muted-foreground lg:table-cell">{formatDate(patient.admittedAt)}</TableCell>
              {hasActions && <TableCell className="pr-4">{actionsFor(patient)}</TableCell>}
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {/* Mobile: cards */}
      <ul className="divide-y md:hidden">
        {patients.map((patient) => (
          <li key={patient._id} className="flex gap-3 p-4">
            <div className="min-w-0 flex-1 space-y-1">
              <div className="flex items-center gap-2">
                <p className="truncate font-medium">{patient.name}</p>
                <ConditionBadge condition={patient.condition} />
              </div>
              <p className="text-xs text-muted-foreground">
                {patient.age} yrs · {capitalize(patient.gender)} · Admitted {formatDate(patient.admittedAt)}
              </p>
              {showDoctor && patient.doctor?.name && (
                <p className="truncate text-xs text-muted-foreground">{patient.doctor.name}</p>
              )}
            </div>
            {hasActions && actionsFor(patient)}
          </li>
        ))}
      </ul>
    </>
  );
}
