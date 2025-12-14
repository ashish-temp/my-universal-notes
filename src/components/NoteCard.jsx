import { db } from "../firebase";
import { doc, updateDoc } from "firebase/firestore";

export default function NoteCard({ note, onOpen }) {
  const togglePin = async (e) => {
    e.stopPropagation();
    await updateDoc(doc(db, "notes", note.id), {
      pinned: !note.pinned,
    });
  };

  return (
    <div
      className="note-card"
      onClick={onOpen}
      style={{
        backgroundColor: note.color || "var(--card)",
      }}
    >
      <div className="note-header">
        <h4 className="note-title">{note.title}</h4>

        <button
          className={`pin-btn ${note.pinned ? "pinned" : ""}`}
          onClick={togglePin}
        >
          📌
        </button>
      </div>

      <p className="note-text">{note.text}</p>
    </div>
  );
}
