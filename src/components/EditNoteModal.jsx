import { useEffect, useState } from "react";
import { db } from "../firebase";
import { doc, updateDoc, deleteDoc } from "firebase/firestore";

const COLORS = [
  "#2DAD49",
  "#faafa8",
  "#f39f76",
  "#fff8b8",
  "#e2f6d3",
  "#b4ddd3",
  "#d4e4ed",
  "#aeccdc",
  "#d3bfdb",
  "#f6e2dd",
];

export default function EditNoteModal({ note, onClose }) {
  const [title, setTitle] = useState("");
  const [text, setText] = useState("");
  const [color, setColor] = useState("#ffffff");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
  document.body.style.overflow = "hidden";
  return () => {
    document.body.style.overflow = "auto";
  };
}, []);


  useEffect(() => {
    if (note) {
      setTitle(note.title || "");
      setText(note.text || "");
      setColor(note.color || "#ffffff");
    }
  }, [note]);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const handleClose = () => {
  // close UI instantly
  onClose();

  // save in background (no await)
  updateDoc(doc(db, "notes", note.id), {
    title,
    text,
    color,
  });
};


  const handleDelete = async () => {
    await deleteDoc(doc(db, "notes", note.id));
    onClose();
  };

  return (
    <div className="modal-backdrop" onClick={handleClose}>
      <div
        className="modal-card"
        onClick={(e) => e.stopPropagation()}
        style={{ backgroundColor: color }}
      >
        {/* COPY */}
        <button
          className={`modal-copy-btn ${copied ? "copied" : ""}`}
          onClick={handleCopy}
        >
          {copied ? "✓ Copied" : "Copy"}
        </button>

        <input
          className="modal-input"
          placeholder="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />

        <textarea
          className="modal-textarea"
          placeholder="Take a note..."
          value={text}
          onChange={(e) => setText(e.target.value)}
        />

        {/* 🎨 GOOGLE KEEP PALETTE */}
        <div className="color-row">
          {COLORS.map((c) => (
            <span
              key={c}
              className={`color-dot ${color === c ? "active" : ""}`}
              style={{ backgroundColor: c }}
              onClick={() => setColor(c)}
            />
          ))}
        </div>

        <div className="modal-actions">
          <button className="danger-btn" onClick={handleDelete}>
            Delete
          </button>
          <button className="secondary-btn" onClick={handleClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
