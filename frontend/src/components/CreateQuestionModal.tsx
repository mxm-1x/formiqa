import React, { useState } from "react";
import { createQuestion } from "../api/question";
import { useAuth } from "../context/AuthContext";

type Props = {
  sessionId: string;
  onCreated?: (q: any) => void;
  onClose: () => void;
};

export default function CreateQuestionModal({ sessionId, onCreated, onClose }: Props) {
  const [type, setType] = useState<"text" | "mcq">("mcq");
  const [title, setTitle] = useState("");
  const [options, setOptions] = useState<string[]>(["", ""]);
  const [loading, setLoading] = useState(false);
  const { token } = useAuth();

  const updateOption = (i: number, v: string) => {
    const arr = [...options];
    arr[i] = v;
    setOptions(arr);
  };

  const addOption = () => setOptions(prev => [...prev, ""]);

  const handleCreate = async () => {
    setLoading(true);
    try {
      const payload: any = { type, title };
      if (type === "mcq") payload.options = options.filter(o => o.trim());
      const res = await createQuestion(sessionId, payload, token || undefined);
      onCreated?.(res.data.question);
      onClose();
    } catch (e: any) {
      alert(e?.response?.data?.error || "Failed");
    } finally { setLoading(false); }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/40 z-50">
      <div className="bg-white rounded-xl p-6 w-full max-w-xl">
        <h3 className="text-lg font-semibold mb-4">Create Question</h3>
        <div className="mb-3">
          <label className="block text-sm font-medium">Type</label>
          <select value={type} onChange={e => setType(e.target.value as any)} className="input mt-1">
            <option value="mcq">Multiple Choice</option>
            <option value="text">Free Text</option>
          </select>
        </div>

        <div className="mb-3">
          <label className="block text-sm font-medium">Question</label>
          <input value={title} onChange={e => setTitle(e.target.value)} className="input mt-1" />
        </div>

        {type === "mcq" && (
          <>
            <label className="block text-sm font-medium">Options</label>
            <div className="space-y-2 mt-2">
              {options.map((o, i) => (
                <input key={i} value={o} onChange={e => updateOption(i, e.target.value)} className="input" />
              ))}
            </div>
            <button className="mt-3 text-primary font-medium hover:text-primary/80 transition-colors" onClick={addOption}>+ Add option</button>
          </>
        )}

        <div className="mt-6 flex justify-end gap-2">
          <button onClick={onClose} className="px-4 py-2">Cancel</button>
          <button onClick={handleCreate} className="btn" disabled={loading}>{loading ? "Creating..." : "Create"}</button>
        </div>
      </div>
    </div>
  );
}
