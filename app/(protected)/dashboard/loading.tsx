export default function DashboardLoading() {
  return (
    <section className="space-y-4">
      <div className="h-8 w-52 animate-pulse rounded bg-slate-200" />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 3 }).map((_, idx) => (
          <div key={idx} className="h-32 animate-pulse rounded-xl bg-slate-200" />
        ))}
      </div>
    </section>
  );
}
