import React, { useRef, useState, useEffect } from 'react';
import { Trash2, X, Undo, PenTool } from 'lucide-react';
import { playClick } from '../utils/soundEffects';
import { useLanguage } from '../i18n/LanguageContext';

interface ScratchpadModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ScratchpadModal: React.FC<ScratchpadModalProps> = ({ isOpen, onClose }) => {
  const { t } = useLanguage();
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [color, setColor] = useState('#0284c7');
  const [brushSize, setBrushSize] = useState(4);
  const [history, setHistory] = useState<ImageData[]>([]);

  const colors = ['#0284c7', '#ea580c', '#16a34a', '#dc2626', '#7c3aed', '#0f172a'];

  useEffect(() => {
    if (!isOpen) return;

    const handleResize = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const parent = canvas.parentElement;
      if (!parent) return;
      
      const width = parent.clientWidth;
      const height = Math.min(360, Math.max(220, window.innerHeight * 0.38));

      // Create temporary canvas to preserve contents during resize
      if (canvas.width > 0 && canvas.height > 0) {
        const tempCanvas = document.createElement('canvas');
        tempCanvas.width = canvas.width;
        tempCanvas.height = canvas.height;
        const tempCtx = tempCanvas.getContext('2d');
        if (tempCtx) tempCtx.drawImage(canvas, 0, 0);

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.lineCap = 'round';
          ctx.lineJoin = 'round';
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(0, 0, canvas.width, canvas.height);
          ctx.drawImage(tempCanvas, 0, 0);
        }
      } else {
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.lineCap = 'round';
          ctx.lineJoin = 'round';
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(0, 0, canvas.width, canvas.height);
        }
      }
    };

    const timer = setTimeout(handleResize, 60);

    const ro = new ResizeObserver(() => {
      handleResize();
    });

    const canvas = canvasRef.current;
    if (canvas && canvas.parentElement) {
      ro.observe(canvas.parentElement);
    }

    return () => {
      clearTimeout(timer);
      ro.disconnect();
    };
  }, [isOpen]);

  const getCoordinates = (e: React.MouseEvent | React.TouchEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    if ('touches' in e) {
      return {
        x: e.touches[0].clientX - rect.left,
        y: e.touches[0].clientY - rect.top,
      };
    }
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };
  };

  const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Save snapshot for undo
    setHistory((prev) => [...prev.slice(-10), ctx.getImageData(0, 0, canvas.width, canvas.height)]);

    setIsDrawing(true);
    const { x, y } = getCoordinates(e);
    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const { x, y } = getCoordinates(e);
    ctx.strokeStyle = color;
    ctx.lineWidth = brushSize;
    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearCanvas = () => {
    playClick();
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  };

  const handleUndo = () => {
    playClick();
    if (history.length === 0) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const last = history[history.length - 1];
    ctx.putImageData(last, 0, 0);
    setHistory((prev) => prev.slice(0, -1));
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-slate-900/50 backdrop-blur-xs animate-fade-in cursor-pointer"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          playClick();
          onClose();
        }
      }}
    >
      <div 
        id="scratchpad-modal-content" 
        className="bg-white rounded-3xl p-5 w-full max-w-lg shadow-2xl border border-slate-200 overflow-hidden cursor-default"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center font-bold border border-sky-100">
              <PenTool size={16} />
            </div>
            <span className="font-black text-slate-800 text-base">{t.scratchpadModalTitle}</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              id="scratchpad-undo-btn"
              type="button"
              onClick={handleUndo}
              disabled={history.length === 0}
              title={t.undoBtn}
              className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 disabled:opacity-30 border border-slate-200"
            >
              <Undo size={16} />
            </button>
            <button
              id="scratchpad-clear-btn"
              type="button"
              onClick={clearCanvas}
              title={t.clearAllBtn}
              className="px-3 py-1.5 rounded-xl bg-rose-50 text-rose-700 border border-rose-200 text-xs font-black flex items-center gap-1 hover:bg-rose-100"
            >
              <Trash2 size={14} />
              <span>{t.clearBtn}</span>
            </button>
            <button
              id="scratchpad-close-btn"
              type="button"
              onClick={() => {
                playClick();
                onClose();
              }}
              className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center border border-slate-200"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Tools Palette */}
        <div className="flex items-center justify-between gap-2 mb-3 bg-slate-50 border border-slate-200 p-2.5 rounded-2xl">
          {/* Colors */}
          <div className="flex items-center gap-2">
            {colors.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => {
                  playClick();
                  setColor(c);
                }}
                className={`w-6 h-6 rounded-full transition-transform ${
                  color === c ? 'scale-125 ring-2 ring-sky-500 shadow-xs' : 'hover:scale-110'
                }`}
                style={{ backgroundColor: c }}
              />
            ))}
          </div>

          {/* Brush Size Slider */}
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold text-slate-600">{t.brushSize}:</span>
            <input
              type="range"
              min="2"
              max="16"
              value={brushSize}
              onChange={(e) => setBrushSize(parseInt(e.target.value))}
              className="w-20 accent-sky-600"
            />
          </div>
        </div>

        {/* Canvas */}
        <div className="border border-slate-200 rounded-2xl overflow-hidden bg-white shadow-inner touch-none">
          <canvas
            ref={canvasRef}
            onMouseDown={startDrawing}
            onMouseMove={draw}
            onMouseUp={stopDrawing}
            onMouseLeave={stopDrawing}
            onTouchStart={startDrawing}
            onTouchMove={draw}
            onTouchEnd={stopDrawing}
            className="w-full cursor-crosshair block"
          />
        </div>
      </div>
    </div>
  );
};
