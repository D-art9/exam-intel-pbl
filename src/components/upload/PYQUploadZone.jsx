import { useState } from 'react';
import { UploadCloud, FileType, X, Files } from 'lucide-react';
import { cn } from '../../lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { NeoCard } from '../neo/NeoComponents';

export default function PYQUploadZone({ 
  files, 
  setFiles, 
  title = "Previous Year Papers", 
  description = "Upload one or more past papers (PDF)",
  maxFiles = null,
  className 
}) {
  const [isDragging, setIsDragging] = useState(false);

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files) {
      const droppedFiles = Array.from(e.dataTransfer.files).filter(f => f.type === 'application/pdf');
      if (maxFiles && files.length + droppedFiles.length > maxFiles) {
        alert(`Maximum ${maxFiles} files allowed.`);
        return;
      }
      setFiles((prev) => [...prev, ...droppedFiles]);
    }
  };

  const handleRemove = (index) => {
    setFiles(files.filter((_, i) => i !== index));
    // Reset input if needed
    const input = document.getElementById(`pyq-upload-${title}`);
    if (input) input.value = '';
  };

  return (
    <div className={cn("space-y-4", className)}>
      <NeoCard 
        className={cn(
          "relative group transition-all duration-300",
          isDragging ? "border-neo-orange ring-4 ring-neo-orange/10 transform scale-[1.01]" : "border-neutral-800"
        )}
      >
        <div
          className="p-8 flex flex-col items-center justify-center text-center cursor-pointer min-h-[220px]"
          onDrop={handleDrop}
          onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
          onDragLeave={() => setIsDragging(false)}
          onClick={() => document.getElementById(`pyq-upload-${title}`).click()}
        >
          <div className={cn(
            "w-16 h-16 rounded-xl flex items-center justify-center mb-4 transition-all duration-300",
            isDragging ? "bg-neo-orange text-black scale-110 rotate-3" : "bg-neutral-900 text-neo-orange group-hover:bg-neo-orange/10"
          )}>
            <Files className="w-8 h-8" />
          </div>

          <div className="space-y-1">
            <h3 className="text-lg font-bold text-white uppercase tracking-tight">
              {title}
            </h3>
            <p className="text-neutral-500 font-mono text-[10px] uppercase tracking-widest leading-relaxed">
              {description}
            </p>
          </div>

          <input
            type="file"
            id={`pyq-upload-${title}`}
            className="hidden"
            accept=".pdf"
            multiple={!maxFiles || maxFiles > 1}
            onChange={(e) => {
              if (e.target.files) {
                const selectedFiles = Array.from(e.target.files);
                setFiles([...files, ...selectedFiles]);
              }
            }}
          />
        </div>

        {/* Pulse Overlay when Dragging */}
        <AnimatePresence>
          {isDragging && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-neo-orange/5 backdrop-blur-[1px] flex items-center justify-center pointer-events-none"
            >
              <div className="text-neo-orange font-black uppercase text-xl tracking-tighter animate-pulse">
                RELEASE TO LOAD
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </NeoCard>

      {/* File Chips Display */}
      <AnimatePresence>
        {files.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {files.map((file, i) => (
              <motion.div
                key={`${file.name}-${i}`}
                initial={{ opacity: 0, scale: 0.8, x: -10 }}
                animate={{ opacity: 1, scale: 1, x: 0 }}
                exit={{ opacity: 0, scale: 0.8, x: 10 }}
                className="flex items-center gap-2 px-3 py-1.5 bg-neutral-900 border border-neutral-800 rounded-lg group"
              >
                <FileType className="w-3.5 h-3.5 text-neo-orange" />
                <span className="text-xs font-mono text-neutral-300 truncate max-w-[120px]">
                  {file.name}
                </span>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRemove(i);
                  }}
                  className="p-1 hover:text-red-500 transition-colors"
                >
                  <X className="w-3 h-3" />
                </button>
              </motion.div>
            ))}
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
