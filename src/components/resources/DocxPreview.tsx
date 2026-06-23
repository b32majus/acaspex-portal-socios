import { useEffect, useRef, useState } from 'react';

type DocxPreviewProps = {
  signedUrl: string;
};

export function DocxPreview({ signedUrl }: DocxPreviewProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function render() {
      setStatus('loading');
      setErrorMessage(null);
      const el = containerRef.current;
      if (!el) return;

      try {
        const response = await fetch(signedUrl);
        if (!response.ok) throw new Error(`Error al descargar: ${response.status}`);
        const blob = await response.blob();
        const arrayBuffer = await blob.arrayBuffer();

        if (cancelled) return;

        const { renderAsync } = await import('docx-preview');

        el.innerHTML = '';

        await renderAsync(arrayBuffer, el, undefined, {
          className: 'docx-preview',
          inWrapper: true,
          ignoreWidth: true,
          ignoreHeight: true,
          ignoreFonts: true,
          breakPages: true,
          ignoreLastRenderedPageBreak: false,
          experimental: false,
          trimXmlDeclaration: true,
          useBase64URL: false,
          renderChanges: false,
          renderHeaders: true,
          renderFooters: true,
          renderFootnotes: true,
          renderEndnotes: true,
        });

        if (!cancelled) setStatus('ready');
      } catch (err) {
        if (!cancelled) {
          setStatus('error');
          setErrorMessage(err instanceof Error ? err.message : 'Error desconocido');
        }
      }
    }

    render();
    return () => { cancelled = true; };
  }, [signedUrl]);

  if (status === 'loading') {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="animate-pulse space-y-4">
          <div className="h-4 w-3/4 rounded bg-slate-100" />
          <div className="h-4 w-full rounded bg-slate-100" />
          <div className="h-4 w-5/6 rounded bg-slate-100" />
          <div className="h-4 w-2/3 rounded bg-slate-100" />
          <div className="h-4 w-full rounded bg-slate-100" />
          <div className="h-4 w-4/5 rounded bg-slate-100" />
        </div>
        <p className="mt-4 text-center text-sm text-slate-500">Cargando vista previa del documento...</p>
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className="rounded-2xl border border-amber-200 bg-amber-50/60 p-6 shadow-sm">
        <div className="text-center space-y-3">
          <p className="text-sm font-medium text-amber-900">No se ha podido generar la vista previa.</p>
          <p className="text-sm text-amber-800/80">
            {errorMessage || 'Puedes descargar el documento para abrirlo.'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="docx-preview-wrapper rounded-2xl border border-slate-200 bg-white p-6 shadow-sm overflow-auto max-h-[80vh]">
      <style>{`
        .docx-preview-wrapper .docx-preview { background: #fff; }
        .docx-preview-wrapper .docx-preview > section { background: #fff; padding: 40px; box-shadow: 0 0 10px rgba(0,0,0,0.05); margin-bottom: 16px; }
        .docx-preview-wrapper .docx-preview table { border-collapse: collapse; width: 100%; }
        .docx-preview-wrapper .docx-preview table td, .docx-preview-wrapper .docx-preview table th { border: 1px solid #ddd; padding: 6px 10px; }
      `}</style>
      <div ref={containerRef} />
    </div>
  );
}
