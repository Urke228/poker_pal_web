import { useEffect, useState, type FormEvent } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import { TopBar } from "../components/TopBar";
import { errorMessage } from "../api/client";
import { createTournament, getTournament, updateTournament } from "../api/tournaments";
import {
  PAYOUT_LABELS,
  PAYOUT_STRUCTURES,
  type PayoutStructure,
  type TournamentInput,
} from "../api/types";
import "./TournamentFormPage.css";

/** `datetime-local` wants `yyyy-MM-ddTHH:mm` in local time, not an ISO string. */
function toLocalInput(iso: string | null): string {
  const d = iso ? new Date(iso) : new Date();
  if (Number.isNaN(d.getTime())) return "";
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

interface FormState {
  name: string;
  dateTime: string;
  buyIn: string;
  playerLimit: string;
  payoutStructure: PayoutStructure;
  manualPayouts: string;
  isPublic: boolean;
  inviteCode: string;
  description: string;
  rules: string;
  allowRebuys: boolean;
  allowAddons: boolean;
  lateRegistration: boolean;
}

const EMPTY: FormState = {
  name: "",
  dateTime: toLocalInput(null),
  buyIn: "20",
  playerLimit: "8",
  payoutStructure: "standard",
  manualPayouts: "",
  isPublic: true,
  inviteCode: "",
  description: "",
  rules: "",
  allowRebuys: false,
  allowAddons: false,
  lateRegistration: false,
};

/**
 * Client-side validation mirrors the server's rules so obvious mistakes are
 * caught before a round trip. The server remains authoritative — anything it
 * rejects is surfaced verbatim above the form.
 */
function validate(f: FormState): string | null {
  if (!f.name.trim()) return "Give the tournament a name.";
  if (!f.dateTime || Number.isNaN(new Date(f.dateTime).getTime())) {
    return "Pick a valid date and time.";
  }
  const buyIn = Number(f.buyIn);
  if (!Number.isFinite(buyIn) || buyIn < 0) return "Buy-in must be zero or more.";
  const limit = Number(f.playerLimit);
  if (!Number.isInteger(limit) || limit < 2 || limit > 100) {
    return "Player limit must be a whole number between 2 and 100.";
  }
  if (f.payoutStructure === "manual") {
    const pcts = parsePayouts(f.manualPayouts);
    if (pcts.length === 0) return "Enter at least one payout percentage.";
    if (pcts.some((p) => Number.isNaN(p) || p < 0 || p > 100)) {
      return "Payout percentages must each be between 0 and 100.";
    }
  }
  return null;
}

function parsePayouts(raw: string): number[] {
  return raw
    .split(/[,\s]+/)
    .map((s) => s.trim())
    .filter(Boolean)
    .map(Number);
}

export function TournamentFormPage() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const { user } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState<FormState>(EMPTY);
  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isEdit || !user) return;
    (async () => {
      try {
        const { tournament: t } = await getTournament(id as string);
        setForm({
          name: t.name,
          dateTime: toLocalInput(t.dateTime),
          buyIn: String(t.buyIn),
          playerLimit: String(t.playerLimit || 8),
          payoutStructure: t.payoutStructure,
          manualPayouts: (t.manualPayouts ?? []).join(", "),
          isPublic: t.isPublic,
          inviteCode: t.inviteCode ?? "",
          description: t.description,
          rules: t.rules,
          allowRebuys: t.allowRebuys,
          allowAddons: t.allowAddons,
          lateRegistration: t.lateRegistration,
        });
      } catch (e) {
        setError(errorMessage(e));
      } finally {
        setLoading(false);
      }
    })();
  }, [id, isEdit, user]);

  const set = <K extends keyof FormState>(key: K, value: FormState[K]) =>
    setForm((f) => ({ ...f, [key]: value }));

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (saving) return;

    const problem = validate(form);
    if (problem) {
      setError(problem);
      return;
    }
    setError(null);
    setSaving(true);

    const payload: TournamentInput = {
      name: form.name.trim(),
      dateTime: new Date(form.dateTime).toISOString(),
      buyIn: Number(form.buyIn),
      playerLimit: Number(form.playerLimit),
      payoutStructure: form.payoutStructure,
      isPublic: form.isPublic,
      description: form.description.trim(),
      rules: form.rules.trim(),
      allowRebuys: form.allowRebuys,
      allowAddons: form.allowAddons,
      lateRegistration: form.lateRegistration,
    };
    // Omitted rather than nulled: the API deletes these fields when absent,
    // matching how the documents have always been stored.
    if (form.payoutStructure === "manual") {
      payload.manualPayouts = parsePayouts(form.manualPayouts);
    }
    if (!form.isPublic && form.inviteCode.trim()) {
      payload.inviteCode = form.inviteCode.trim().toUpperCase();
    }

    try {
      const saved = isEdit
        ? await updateTournament(id as string, payload)
        : await createTournament(payload);
      navigate(`/tournaments/${saved.id}`, { replace: true });
    } catch (err) {
      setError(errorMessage(err));
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div>
        <TopBar />
        <main className="form-main">
          <p className="form-muted">Loading…</p>
        </main>
      </div>
    );
  }

  return (
    <div>
      <TopBar />
      <main className="form-main">
        <Link className="form-back" to={isEdit ? `/tournaments/${id}` : "/tournaments"}>
          ← Cancel
        </Link>
        <h1>{isEdit ? "Edit tournament" : "New tournament"}</h1>

        {error && <p className="form-error">{error}</p>}

        <form className="form-body" onSubmit={submit}>
          <label className="form-field">
            <span>Name</span>
            <input
              value={form.name}
              maxLength={120}
              onChange={(e) => set("name", e.target.value)}
            />
          </label>

          <label className="form-field">
            <span>Date and time</span>
            <input
              type="datetime-local"
              value={form.dateTime}
              onChange={(e) => set("dateTime", e.target.value)}
            />
          </label>

          <div className="form-row">
            <label className="form-field">
              <span>Buy-in</span>
              <input
                type="number"
                min="0"
                step="0.01"
                value={form.buyIn}
                onChange={(e) => set("buyIn", e.target.value)}
              />
            </label>
            <label className="form-field">
              <span>Player limit</span>
              <input
                type="number"
                min="2"
                max="100"
                step="1"
                value={form.playerLimit}
                onChange={(e) => set("playerLimit", e.target.value)}
              />
            </label>
          </div>

          <label className="form-field">
            <span>Payout structure</span>
            <select
              value={form.payoutStructure}
              onChange={(e) => set("payoutStructure", e.target.value as PayoutStructure)}
            >
              {PAYOUT_STRUCTURES.map((s) => (
                <option key={s} value={s}>
                  {PAYOUT_LABELS[s]}
                </option>
              ))}
            </select>
          </label>

          {form.payoutStructure === "manual" && (
            <label className="form-field">
              <span>Payout percentages</span>
              <input
                placeholder="e.g. 50, 30, 20"
                value={form.manualPayouts}
                onChange={(e) => set("manualPayouts", e.target.value)}
              />
              <small>Comma separated, each between 0 and 100.</small>
            </label>
          )}

          <label className="form-check">
            <input
              type="checkbox"
              checked={form.isPublic}
              onChange={(e) => set("isPublic", e.target.checked)}
            />
            Public — anyone can find and join this tournament
          </label>

          {!form.isPublic && (
            <label className="form-field">
              <span>Invite code</span>
              <input
                placeholder="Leave blank to generate one"
                value={form.inviteCode}
                maxLength={32}
                onChange={(e) => set("inviteCode", e.target.value.toUpperCase())}
              />
            </label>
          )}

          <label className="form-check">
            <input
              type="checkbox"
              checked={form.allowRebuys}
              onChange={(e) => set("allowRebuys", e.target.checked)}
            />
            Allow rebuys
          </label>
          <label className="form-check">
            <input
              type="checkbox"
              checked={form.allowAddons}
              onChange={(e) => set("allowAddons", e.target.checked)}
            />
            Allow add-ons
          </label>
          <label className="form-check">
            <input
              type="checkbox"
              checked={form.lateRegistration}
              onChange={(e) => set("lateRegistration", e.target.checked)}
            />
            Allow late registration
          </label>

          <label className="form-field">
            <span>Description</span>
            <textarea
              rows={3}
              value={form.description}
              onChange={(e) => set("description", e.target.value)}
            />
          </label>

          <label className="form-field">
            <span>Rules</span>
            <textarea
              rows={3}
              value={form.rules}
              onChange={(e) => set("rules", e.target.value)}
            />
          </label>

          <button type="submit" className="form-submit" disabled={saving}>
            {saving ? "Saving…" : isEdit ? "Save changes" : "Create tournament"}
          </button>
        </form>
      </main>
    </div>
  );
}
