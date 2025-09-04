import React, { useState } from 'react';

export default function TemplatesGallery({
  title = "Polished Templates That Parse Perfectly",
  subtitle = "Executive • Legal • Creative • Consulting • Finance",
  templates = [
    { key: "exec", name: "Executive Preview", tag: "Executive", thumb: "https://cdn.dribbble.com/userupload/4236485/file/original-2782a939f5034631243178a99478f24a.png?resize=1024x768", preview: "https://cdn.dribbble.com/userupload/4236485/file/original-2782a939f5034631243178a99478f24a.png?resize=1024x768" },
    { key: "legal", name: "Legal Preview", tag: "Legal", thumb: "https://cdn.dribbble.com/userupload/10101888/file/original-b47d4323861214061841315606132433.png?resize=1024x768", preview: "https://cdn.dribbble.com/userupload/10101888/file/original-b47d4323861214061841315606132433.png?resize=1024x768" },
    { key: "creative", name: "Creative Preview", tag: "Creative", thumb: "https://cdn.dribbble.com/userupload/12479612/file/original-63704288b855de3347b51f9353980998.png?resize=1024x768", preview: "https://cdn.dribbble.com/userupload/12479612/file/original-63704288b855de3347b51f9353980998.png?resize=1024x768" },
    { key: "consulting", name: "Consulting Preview", tag: "Consulting", thumb: "https://cdn.dribbble.com/userupload/4236485/file/original-2782a939f5034631243178a99478f24a.png?resize=1024x768", preview: "https://cdn.dribbble.com/userupload/4236485/file/original-2782a939f5034631243178a99478f24a.png?resize=1024x768" },
    { key: "finance", name: "Finance Preview", tag: "Finance", thumb: "https://cdn.dribbble.com/userupload/10101888/file/original-b47d4323861214061841315606132433.png?resize=1024x768", preview: "https://cdn.dribbble.com/userupload/10101888/file/original-b47d4323861214061841315606132433.png?resize=1024x768" },
  ],
}) {
  const [open, setOpen] = useState(null);

  return (
    <section className="mx-auto max-w-7xl px-6 md:px-8 py-16" aria-label="Templates Gallery">
      <div className="text-center mb-10">
        <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-zinc-100">{title}</h2>
        <p className="mt-2 text-sm md:text-base text-zinc-400">{subtitle}</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {templates.map((t) => (
          <button
            key={t.key}
            onClick={() => setOpen(t)}
            className="group relative overflow-hidden rounded-2xl border border-zinc-800/70 bg-zinc-950/40 hover:bg-zinc-900/40 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
            aria-label={`Open ${t.name}`}
          >
            <img src={t.thumb} alt="" className="h-56 w-full object-cover opacity-90 group-hover:opacity-100 transition" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-4 flex items-center justify-between">
              <div>
                <p className="text-zinc-100 font-semibold">{t.name}</p>
                <span className="text-xs text-zinc-400">{t.tag}</span>
              </div>
              <span className="rounded-md bg-zinc-800/70 px-2 py-1 text-[11px] text-zinc-300 border border-zinc-700">Preview</span>
            </div>
          </button>
        ))}
      </div>

      {/* Modal */}
      {open && (
        <div role="dialog" aria-modal="true" className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/70" onClick={() => setOpen(null)} aria-hidden />
          <div className="relative w-full max-w-4xl rounded-2xl border border-zinc-700 bg-zinc-950 p-4 md:p-6 shadow-xl">
            <div className="flex items-center justify-between gap-3 mb-3">
              <div className="flex items-baseline gap-2">
                <h3 className="text-lg md:text-xl font-semibold text-zinc-100">{open.name}</h3>
                <span className="text-xs text-zinc-400">{open.tag}</span>
              </div>
              <button onClick={() => setOpen(null)} className="rounded-lg border border-zinc-700 px-3 py-1.5 text-sm text-zinc-300 hover:bg-zinc-900">Close</button>
            </div>
            <div className="aspect-[16/10] w-full overflow-hidden rounded-xl bg-zinc-900">
              <img src={open.preview} alt="Template preview" className="h-full w-full object-contain" />
            </div>
          </div>
        </div>
      )}
    </section>
  );
}