import { useState, type FormEvent } from "react";

interface Props {
  onClose: () => void;
  onSave: (entry: {
    date: string;
    title: string;
    buyin: number;
    rebuy: number;
    win: number;
  }) => Promise<void>;
}

export function AddEntryModal({ onClose, onSave }: Props) {
  const [date, setDate] = useState("");
  const [title, setTitle] = useState("");
  const [buyin, setBuyin] = useState("");
  const [rebuy, setRebuy] = useState("");
  const [win, setWin] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (!date) return setError("Select a date.");
    if (!title.trim()) return setError("Enter a name.");
    const buyinNum = Number(buyin);
    const winNum = Number(win);
    const rebuyNum = rebuy ? Number(rebuy) : 0;
    if (!buyin || Number.isNaN(buyinNum) || buyinNum < 0) {
      return setError("Enter a valid buy-in.");
    }
    if (!win || Number.isNaN(winNum) || winNum < 0) {
      return setError("Enter a valid winnings amount.");
    }
    if (rebuy && (Number.isNaN(rebuyNum) || rebuyNum < 0)) {
      return setError("Enter a valid rebuy amount.");
    }
    setError(null);
    setSaving(true);
    try {
      await onSave({ date, title: title.trim(), buyin: buyinNum, rebuy: rebuyNum, win: winNum });
      onClose();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <h3>New Tournament Entry</h3>
        {error && <div className="modal-error">{error}</div>}
        <form onSubmit={submit} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div className="modal-field">
            <label htmlFor="entry-date">Date</label>
            <input
              id="entry-date"
              type="date"
              value={date}
              max={new Date().toISOString().slice(0, 10)}
              onChange={(e) => setDate(e.target.value)}
            />
          </div>
          <div className="modal-field">
            <label htmlFor="entry-title">Tournament Name</label>
            <input id="entry-title" value={title} onChange={(e) => setTitle(e.target.value)} />
          </div>
          <div className="modal-field">
            <label htmlFor="entry-buyin">Buy-in</label>
            <input
              id="entry-buyin"
              type="number"
              min="0"
              step="0.01"
              value={buyin}
              onChange={(e) => setBuyin(e.target.value)}
            />
          </div>
          <div className="modal-field">
            <label htmlFor="entry-rebuy">Rebuys (optional)</label>
            <input
              id="entry-rebuy"
              type="number"
              min="0"
              step="0.01"
              value={rebuy}
              onChange={(e) => setRebuy(e.target.value)}
            />
          </div>
          <div className="modal-field">
            <label htmlFor="entry-win">Winnings</label>
            <input
              id="entry-win"
              type="number"
              min="0"
              step="0.01"
              value={win}
              onChange={(e) => setWin(e.target.value)}
            />
          </div>
          <div className="modal-actions">
            <button type="button" className="cancel" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="save" disabled={saving}>
              {saving ? "Saving…" : "Save"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
