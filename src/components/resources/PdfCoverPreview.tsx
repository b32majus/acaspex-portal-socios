import { useEffect, useRef, useState } from 'react';
import { FileText } from 'lucide-react';

function PdfCoverPreview({ signedUrl, className = '' }: { signedUrl: string; className?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading');

  useEffect(() => {
    let cancelled = false;

    async function render() {
      try {
        const pdfjsLib = await import('pdfjs-dist');
        pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
          'pdfjs-dist/build/pdf.worker.mjs',
          import.meta.url,
        ).toString();

        const pdf = await pdfjsLib.getDocument({ url: signedUrl }).promise;
        if (cancelled) return;

        const page = await pdf.getPage(1);
        const viewport = page.getViewport({ scale: 0.5 });

        const canvas = canvasRef.current;
        if (!canvas || cancelled) return;

        canvas.width = viewport.width;
        canvas.height = viewport.height;

        await page.render({ canvas, viewport }).promise;
        if (!cancelled) setStatus('ready');
      } catch {
        if (!cancelled) setStatus('error');
      }
    }

    setStatus('loading');
    render();
    return () => { cancelled = true; };
  }, [signedUrl]);

  return (
    <div className={`relative ${className}`}>
      <canvas
        ref={canvasRef}
        className={`w-full h-full object-contain ${status === 'ready' ? '' : 'hidden'}`}
      />
      {status === 'loading' && (
        <div className="absolute inset-0 flex items-center justify-center bg-slate-100">
          <FileText size={32} className="text-slate-300" />
        </div>
      )}
      {status === 'error' && (
        <div className="absolute inset-0 flex items-center justify-center bg-rose-50">
          <FileText size={32} className="text-rose-300" />
        </div>
      )}
    </div>
  );
}

export default PdfCoverPreview;
