import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Pencil, Check, X } from 'lucide-react';
import type { TonePreset } from '@/types/storage';
import { syncStorage } from '@/lib/storage';

export function TonesTab() {
  const [tones, setTones] = useState<TonePreset[]>([]);
  const [activeToneId, setActiveToneId] = useState('professional');
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [newName, setNewName] = useState('');
  const [newPrompt, setNewPrompt] = useState('');

  useEffect(() => {
    const loadAll = () => {
      Promise.all([
        syncStorage.get('tonePresets'),
        syncStorage.get('activeToneId'),
      ]).then(([presets, active]) => {
        setTones(presets);
        setActiveToneId(active);
      });
    };

    loadAll();

    return syncStorage.onChange((changes) => {
      if (changes.tonePresets !== undefined || changes.activeToneId !== undefined) {
        loadAll();
      }
    });
  }, []);

  const saveTones = (updated: TonePreset[]) => {
    setTones(updated);
    syncStorage.set('tonePresets', updated);
  };

  const handleSetActive = (id: string) => {
    setActiveToneId(id);
    syncStorage.set('activeToneId', id);
  };

  const handleAdd = () => {
    if (!newName.trim() || !newPrompt.trim()) return;

    const tone: TonePreset = {
      id: `custom-${Date.now()}`,
      name: newName.trim(),
      prompt: newPrompt.trim(),
      isBuiltIn: false,
    };

    saveTones([...tones, tone]);
    setNewName('');
    setNewPrompt('');
    setIsAdding(false);
  };

  const handleDelete = (id: string) => {
    const updated = tones.filter((t) => t.id !== id);
    saveTones(updated);
    if (activeToneId === id) {
      handleSetActive('professional');
    }
  };

  const handleEdit = (id: string) => {
    const tone = tones.find((t) => t.id === id);
    if (!tone) return;
    setEditingId(id);
    setNewName(tone.name);
    setNewPrompt(tone.prompt);
  };

  const handleSaveEdit = () => {
    if (!editingId || !newName.trim() || !newPrompt.trim()) return;

    const updated = tones.map((t) =>
      t.id === editingId ? { ...t, name: newName.trim(), prompt: newPrompt.trim() } : t,
    );
    saveTones(updated);
    setEditingId(null);
    setNewName('');
    setNewPrompt('');
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setIsAdding(false);
    setNewName('');
    setNewPrompt('');
  };

  const inputStyle = {
    border: '1px solid rgba(0,0,0,0.3)',
    color: 'rgba(0,0,0,0.9)',
    outline: 'none',
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold" style={{ color: 'rgba(0,0,0,0.9)' }}>Tone Presets</h3>
          <p className="text-xs mt-0.5" style={{ color: 'rgba(0,0,0,0.6)' }}>
            Select a default tone or create custom ones.
          </p>
        </div>
        {!isAdding && !editingId && (
          <button
            onClick={() => setIsAdding(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-semibold rounded-full transition-colors"
            style={{ color: '#0a66c2', border: '1px solid #0a66c2' }}
            onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(112,181,249,0.15)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
          >
            <Plus size={14} />
            Add Tone
          </button>
        )}
      </div>

      {/* Tone list */}
      <div className="space-y-2">
        {tones.map((tone) => (
          <div
            key={tone.id}
            className="p-3 rounded-lg transition-colors cursor-pointer"
            style={{
              border: activeToneId === tone.id ? '2px solid #0a66c2' : '1px solid rgba(0,0,0,0.15)',
              background: activeToneId === tone.id ? '#e8f3ff' : 'white',
              padding: activeToneId === tone.id ? '11px' : '12px',
            }}
            onClick={() => handleSetActive(tone.id)}
          >
            {editingId === tone.id ? (
              <div className="space-y-2" onClick={(e) => e.stopPropagation()}>
                <input
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="w-full px-2 py-1 text-sm rounded"
                  style={inputStyle}
                  placeholder="Tone name"
                />
                <textarea
                  value={newPrompt}
                  onChange={(e) => setNewPrompt(e.target.value)}
                  rows={2}
                  className="w-full px-2 py-1 text-sm rounded resize-none"
                  style={inputStyle}
                  placeholder="Describe the tone..."
                />
                <div className="flex gap-2">
                  <button
                    onClick={handleSaveEdit}
                    className="flex items-center gap-1 px-3 py-1 text-xs font-semibold text-white bg-brand-600 rounded-full hover:bg-brand-700"
                  >
                    <Check size={12} /> Save
                  </button>
                  <button
                    onClick={handleCancelEdit}
                    className="flex items-center gap-1 px-3 py-1 text-xs font-semibold rounded-full"
                    style={{ color: 'rgba(0,0,0,0.6)', background: 'rgba(0,0,0,0.08)' }}
                  >
                    <X size={12} /> Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold" style={{ color: 'rgba(0,0,0,0.9)' }}>{tone.name}</span>
                    {tone.isBuiltIn && (
                      <span
                        className="px-1.5 py-0.5 text-[10px] font-semibold rounded"
                        style={{ color: 'rgba(0,0,0,0.6)', background: 'rgba(0,0,0,0.06)' }}
                      >
                        Built-in
                      </span>
                    )}
                    {activeToneId === tone.id && (
                      <span
                        className="px-1.5 py-0.5 text-[10px] font-semibold rounded"
                        style={{ color: '#0a66c2', background: 'rgba(10,102,194,0.15)' }}
                      >
                        Active
                      </span>
                    )}
                  </div>
                  <p className="text-xs mt-1 line-clamp-2" style={{ color: 'rgba(0,0,0,0.6)' }}>{tone.prompt}</p>
                </div>
                {!tone.isBuiltIn && (
                  <div className="flex gap-1 ml-2 shrink-0">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEdit(tone.id);
                      }}
                      className="p-1 rounded-full hover:bg-black/[0.08]"
                      style={{ color: 'rgba(0,0,0,0.4)' }}
                    >
                      <Pencil size={14} />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(tone.id);
                      }}
                      className="p-1 rounded-full hover:bg-red-50"
                      style={{ color: 'rgba(0,0,0,0.4)' }}
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Add new tone form */}
      {isAdding && (
        <div
          className="p-3 rounded-lg space-y-2"
          style={{ background: '#e8f3ff', border: '1px solid rgba(10,102,194,0.2)' }}
        >
          <input
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            className="w-full px-2 py-1 text-sm rounded"
            style={inputStyle}
            placeholder="Tone name (e.g., Sarcastic)"
            autoFocus
          />
          <textarea
            value={newPrompt}
            onChange={(e) => setNewPrompt(e.target.value)}
            rows={2}
            className="w-full px-2 py-1 text-sm rounded resize-none"
            style={inputStyle}
            placeholder="Describe the tone (e.g., Write with dry humor and subtle sarcasm...)"
          />
          <div className="flex gap-2">
            <button
              onClick={handleAdd}
              disabled={!newName.trim() || !newPrompt.trim()}
              className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-white bg-brand-600 rounded-full hover:bg-brand-700 disabled:opacity-50"
            >
              <Plus size={12} /> Add
            </button>
            <button
              onClick={handleCancelEdit}
              className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold rounded-full bg-white"
              style={{ color: 'rgba(0,0,0,0.6)', border: '1px solid rgba(0,0,0,0.15)' }}
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
