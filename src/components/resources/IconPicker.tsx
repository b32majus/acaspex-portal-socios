import { useId, useState } from 'react';
import { Check, ChevronDown, X } from 'lucide-react';
import {
  getResourceCategoryIconOption,
  resourceCategoryIconOptions,
} from '../../lib/resourceCategories';

type IconPickerProps = {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
};

export function IconPicker({ value, onChange, disabled = false }: IconPickerProps) {
  const [open, setOpen] = useState(false);
  const panelId = useId();
  const selected = getResourceCategoryIconOption(value || 'folder');
  const SelectedIcon = selected.icon;

  function handleSelect(nextValue: string) {
    onChange(nextValue);
    setOpen(false);
  }

  return (
    <div className="relative">
      <button
        type="button"
        disabled={disabled}
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpen((current) => !current)}
        className="mt-1 flex w-full items-center justify-between rounded-lg border border-slate-200 bg-white px-3 py-2 text-left text-sm text-slate-900 transition-colors hover:border-slate-300 disabled:cursor-not-allowed disabled:opacity-60"
      >
        <span className="flex items-center gap-2">
          <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-slate-50 text-slate-600">
            <SelectedIcon size={16} />
          </span>
          <span>
            <span className="block font-medium text-slate-900">{selected.label}</span>
            <span className="block text-xs text-slate-500">{value ? 'Icono seleccionado' : 'Carpeta por defecto'}</span>
          </span>
        </span>
        <ChevronDown size={16} className={`text-slate-400 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div
          id={panelId}
          role="dialog"
          aria-label="Seleccionar icono"
          className="absolute left-0 top-full z-20 mt-2 w-full rounded-xl border border-slate-200 bg-white p-3 shadow-lg"
        >
          <div className="mb-3 flex items-center justify-between gap-3">
            <p className="text-sm font-medium text-slate-900">Selecciona un icono</p>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium text-slate-500 hover:bg-slate-100 hover:text-slate-700"
            >
              <X size={14} />
              Cerrar
            </button>
          </div>

          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            {resourceCategoryIconOptions.map((option) => {
              const Icon = option.icon;
              const isSelected = (value || 'folder') === option.key;
              return (
                <button
                  key={option.key}
                  type="button"
                  onClick={() => handleSelect(option.key)}
                  className={`flex min-h-[5.5rem] flex-col items-center justify-center gap-2 rounded-xl border px-3 py-3 text-center transition-colors ${isSelected ? 'border-teal-600 bg-teal-50 text-teal-800' : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50'}`}
                  aria-pressed={isSelected}
                >
                  <span className={`inline-flex h-9 w-9 items-center justify-center rounded-full ${isSelected ? 'bg-teal-100' : 'bg-slate-100'}`}>
                    <Icon size={18} />
                  </span>
                  <span className="text-xs font-medium leading-tight">{option.label}</span>
                  {isSelected && <Check size={14} className="text-teal-700" />}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
