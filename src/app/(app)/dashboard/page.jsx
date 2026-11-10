"use client";

/**
 * app/(app)/dashboard/page.jsx
 * Admin dashboard: 4 KPIs + 3 charts, all from ONE request (GET /api/stats).
 * The numbers are aggregated in MongoDB; the page only displays them.
 */
import dynamic from "next/dynamic";
import { useQuery } from "@tanstack/react-query";
import { Activity, Stethoscope, UserPlus, Users } from "lucide-react";
import { api } from "@/lib/api";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import PageHeader from "@/components/PageHeader";
import StatCard from "@/components/StatCard";
import { ErrorState } from "@/components/ListStates";

// Placeholder shown while the chart code (Recharts) is downloading
function ChartSkeleton({ className = "" }) {
  return (
    <Card className={`gap-4 p-5 ${className}`}>
      <Skeleton className="h-5 w-40" />
      <Skeleton className="h-72 w-full" />
    </Card>
  );
}

// Load the charts lazily: Recharts is only downloaded when the dashboard opens
const AdmissionsChart = dynamic(() => import("@/components/DashboardCharts").then((m) => m.AdmissionsChart), {
  ssr: false,
  loading: () => <ChartSkeleton className="lg:col-span-2" />,
});
const PatientsPerDoctorChart = dynamic(() => import("@/components/DashboardCharts").then((m) => m.PatientsPerDoctorChart), {
  ssr: false,
  loading: () => <ChartSkeleton />,
});
const ConditionChart = dynamic(() => import("@/components/DashboardCharts").then((m) => m.ConditionChart), {
  ssr: false,
  loading: () => <ChartSkeleton />,
});

export default function DashboardPage() {
  // Refreshed automatically when patients/doctors change (mutations invalidate ["stats"])
  const { data: stats, isLoading, isError, error, refetch } = useQuery({
    queryKey: ["stats"],
    queryFn: () => api("/stats").then((res) => res.data),
  });

  if (isError) {
    return (
      <>
        <PageHeader title="Dashboard" description="Overview of doctors, patients and trends." />
        <Card className="p-0">
          <ErrorState message={error.message} onRetry={refetch} />
        </Card>
      </>
    );
  }

  return (
    <>
      <PageHeader title="Dashboard" description="Overview of doctors, patients and trends." />

      {/* KPIs: 2 per row on phones, 4 on large screens */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="Total doctors" value={stats?.totalDoctors} icon={Stethoscope} loading={isLoading} />
        <StatCard label="Total patients" value={stats?.totalPatients} icon={Users} loading={isLoading} />
        <StatCard
          label="New this month"
          value={stats?.newThisMonth}
          icon={UserPlus}
          loading={isLoading}
          hint={stats && `vs ${stats.newLastMonth} last month`}
        />
        <StatCard
          label="Avg. per doctor"
          value={stats?.avgPatientsPerDoctor}
          icon={Activity}
          loading={isLoading}
        />
      </div>

      {/* Charts: admissions full width, then two side by side on large screens */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {isLoading ? (
          <>
            <ChartSkeleton className="lg:col-span-2" />
            <ChartSkeleton />
            <ChartSkeleton />
          </>
        ) : (
          <>
            <AdmissionsChart data={stats.admissionsByMonth} />
            <PatientsPerDoctorChart data={stats.patientsPerDoctor} />
            <ConditionChart data={stats.byCondition} />
          </>
        )}
      </div>
    </>
  );
}
