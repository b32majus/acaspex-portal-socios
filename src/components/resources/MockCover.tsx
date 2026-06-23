import { FileText } from 'lucide-react';

type MockCoverResource = {
  coverStyle: string;
  title: string;
  subtitle: string;
};

export function MockCover({ resource }: { resource: MockCoverResource }) {
  const { coverStyle, title, subtitle } = resource;

  if (coverStyle === 'guia') {
    return (
      <div className="relative h-full w-full bg-gradient-to-br from-amber-50 via-orange-50/40 to-amber-50">
        <div className="absolute left-0 top-0 h-full w-1.5 bg-amber-600/80" />
        <div className="absolute left-3 top-4 text-[9px] font-semibold uppercase tracking-[0.2em] text-amber-700/70">
          Guía
        </div>
        <div className="flex h-full flex-col justify-center px-7 py-6">
          <h4 className="font-serif text-sm font-medium leading-snug text-slate-800">
            {title}
          </h4>
          <div className="mt-3 h-px w-10 bg-amber-400/60" />
          <p className="mt-2 text-[10px] leading-relaxed text-slate-500 line-clamp-2">
            {subtitle}
          </p>
        </div>
        <div className="absolute bottom-0 right-0 h-12 w-12 rounded-tl-2xl bg-amber-100/40" />
      </div>
    );
  }

  if (coverStyle === 'plantilla') {
    return (
      <div className="relative h-full w-full bg-white">
        <div className="absolute right-0 top-0 h-full w-[38%] bg-slate-50" />
        <div className="relative z-10 flex h-full flex-col justify-between p-5">
          <div>
            <div className="mb-3 h-1.5 w-14 rounded-full bg-blue-400/70" />
            <div className="space-y-1.5">
              <div className="h-1.5 w-full rounded bg-slate-100" />
              <div className="h-1.5 w-4/5 rounded bg-slate-100" />
              <div className="h-1.5 w-3/5 rounded bg-slate-100" />
            </div>
            <div className="mt-3 flex gap-1.5">
              <div className="h-3.5 w-16 rounded border border-slate-200 bg-white" />
              <div className="h-3.5 w-12 rounded border border-slate-200 bg-white" />
              <div className="h-3.5 w-10 rounded border border-slate-200 bg-white" />
            </div>
            <div className="mt-3 space-y-1.5">
              <div className="h-1.5 w-3/4 rounded bg-slate-100" />
              <div className="h-1.5 w-1/2 rounded bg-slate-100" />
            </div>
          </div>
          <div>
            <p className="mb-2 text-[9px] font-medium uppercase tracking-wider text-blue-500/70">Plantilla</p>
            <p className="text-[10px] leading-tight text-slate-500 line-clamp-2">
              {title}
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (coverStyle === 'video') {
    return (
      <div className="relative h-full w-full bg-gradient-to-br from-violet-900 via-slate-900 to-indigo-950">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute left-1/2 top-1/2 h-48 w-48 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white/20 blur-2xl" />
        </div>
        <div className="absolute left-0 right-0 top-0 h-1 bg-violet-500/40" />
        <div className="flex h-full flex-col items-center justify-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm ring-1 ring-white/10">
            <div className="ml-0.5 h-0 w-0 border-b-[7px] border-l-[12px] border-t-[7px] border-b-transparent border-l-white border-t-transparent" />
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent px-5 pb-4 pt-8">
          <p className="text-[11px] font-medium leading-snug text-white">{title}</p>
          <div className="mt-1.5 flex items-center gap-2 text-[9px] text-white/50">
            <span>HD</span>
            <span className="h-1 w-1 rounded-full bg-white/30" />
            <span>Vídeo</span>
          </div>
        </div>
        <div className="absolute right-3 top-3 rounded bg-black/30 px-1.5 py-0.5 text-[9px] text-white/70">
          ACASPEX
        </div>
      </div>
    );
  }

  if (coverStyle === 'documento') {
    return (
      <div className="relative h-full w-full bg-white">
        <div className="h-6 bg-teal-900 flex items-center px-3">
          <span className="text-[9px] font-medium uppercase tracking-wider text-teal-100/80">PDF</span>
          <span className="ml-auto text-[8px] text-teal-200/60">ACASPEX</span>
        </div>
        <div className="flex flex-col px-5 py-4">
          <h4 className="font-serif text-sm font-medium leading-snug text-slate-800">
            {title}
          </h4>
          <div className="mt-3 space-y-1.5">
            <div className="h-1 w-full rounded bg-slate-100" />
            <div className="h-1 w-full rounded bg-slate-100" />
            <div className="h-1 w-4/5 rounded bg-slate-100" />
            <div className="h-1 w-full rounded bg-slate-100" />
            <div className="h-1 w-3/5 rounded bg-slate-100" />
          </div>
          <div className="mt-3 space-y-1.5">
            <div className="h-1 w-full rounded bg-slate-100" />
            <div className="h-1 w-2/3 rounded bg-slate-100" />
          </div>
        </div>
        <div className="absolute bottom-3 right-4 text-[9px] text-slate-300">
          {subtitle.length > 2 ? subtitle.slice(0, 40) + '…' : subtitle}
        </div>
      </div>
    );
  }

  if (coverStyle === 'corporativo') {
    return (
      <div className="relative h-full w-full bg-teal-900 overflow-hidden">
        <div className="pointer-events-none absolute -top-10 -right-10 h-32 w-32 rounded-full bg-teal-700/30 blur-xl" />
        <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-1/3 bg-gradient-to-t from-teal-950/40 to-transparent" />
        <div className="flex h-full flex-col justify-between p-5">
          <div>
            <p className="text-[10px] font-medium uppercase tracking-[0.25em] text-teal-300/70">
              ACASPEX
            </p>
            <div className="mt-1.5 h-px w-12 bg-teal-400/40" />
          </div>
          <div>
            <h4 className="font-serif text-sm font-medium leading-snug text-white">
              {title}
            </h4>
            <p className="mt-2 text-[10px] leading-relaxed text-teal-200/70 line-clamp-2">
              {subtitle}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-0.5 flex-1 bg-teal-600/50" />
            <span className="text-[9px] text-teal-300/50">Material corporativo</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full w-full items-center justify-center bg-slate-100">
      <FileText size={24} className="text-slate-400" />
    </div>
  );
}
