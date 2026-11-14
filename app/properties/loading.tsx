/** Shown while the server renders a new search (first load or a hard navigation). */
export default function Loading() {
  return (
    <div className="bg-neutral-50 min-h-screen" aria-busy="true">
      <div className="bg-white border-b border-neutral-200 h-[68px]" />
      <section className="bg-neutral-100">
        <div className="container-mx py-8 flex gap-6">
          <div className="hidden lg:block w-[330px] flex-shrink-0">
            <div className="h-[520px] rounded-xl border border-neutral-200 bg-white animate-pulse" />
          </div>
          <div className="flex-1 grid grid-cols-1 gap-4">
            {[0, 1, 2].map((i) => (
              <div key={i} className="bg-white rounded-xl overflow-hidden shadow-sm border border-neutral-200 animate-pulse">
                <div className="h-56 bg-neutral-200" />
                <div className="p-5 space-y-3">
                  <div className="h-4 bg-neutral-200 rounded w-1/3" />
                  <div className="h-5 bg-neutral-200 rounded w-3/4" />
                  <div className="h-4 bg-neutral-200 rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
