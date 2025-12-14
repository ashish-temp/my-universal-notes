// src/components/Notes.jsx
import { useEffect, useState } from "react";
import { db } from "../firebase";
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  query,
  serverTimestamp,
  where,
  updateDoc,
} from "firebase/firestore";

export default function Notes({ user }) {
  const [title, setTitle] = useState("");
  const [text, setText] = useState("");
  const [notes, setNotes] = useState([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [editingNoteId, setEditingNoteId] = useState(null);
  const [isEditing, setIsEditing] = useState(false);


  // delete confirmation modal
  const [confirmNote, setConfirmNote] = useState(null);
  const [confirmInput, setConfirmInput] = useState("");
const [copiedNoteId, setCopiedNoteId] = useState(null);
  useEffect(() => {
    const q = query(collection(db, "notes"), where("uid", "==", user.uid));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const list = snapshot.docs
        .map((d) => ({ id: d.id, ...d.data() }))
        .sort((a, b) => {
          if (!a.createdAt || !b.createdAt) return 0;
          return b.createdAt.seconds - a.createdAt.seconds;
        });

      setNotes(list);
    });

    return () => unsubscribe();
  }, [user.uid]);

  // ✅ ADD NOTE WITH TITLE + TEXT
  const handleAddNote = async (e) => {
  e.preventDefault();
  setError("");

  if (!title.trim() || !text.trim()) {
    setError("Both title and note are required.");
    return;
  }

  setSaving(true);
  try {
    if (isEditing && editingNoteId) {
      // ✅ UPDATE NOTE
      await updateDoc(doc(db, "notes", editingNoteId), {
        title: title.trim(),
        text: text.trim(),
      });

      setIsEditing(false);
      setEditingNoteId(null);
    } else {
      // ✅ ADD NEW NOTE
      await addDoc(collection(db, "notes"), {
        title: title.trim(),
        text: text.trim(),
        uid: user.uid,
        createdAt: serverTimestamp(),
      });
    }

    setTitle("");
    setText("");
  } catch (err) {
    console.error(err);
    setError(err.message);
  } finally {
    setSaving(false);
  }
};

const handleEditNote = (note) => {
  setTitle(note.title);
  setText(note.text);
  setEditingNoteId(note.id);
  setIsEditing(true);
};


  // ✅ OPEN DELETE CONFIRM UI
  const openConfirm = (note) => {
    setConfirmNote(note);
    setConfirmInput("");
  };

  const handleConfirmDelete = async () => {
    if (!confirmNote) return;

    try {
      await deleteDoc(doc(db, "notes", confirmNote.id));
      setConfirmNote(null);
      setConfirmInput("");
    } catch (err) {
      console.error(err);
      setError(err.message);
    }
  };

  const handleCancelConfirm = () => {
    setConfirmNote(null);
    setConfirmInput("");
  };

  const deleteDisabled = confirmInput !== "DELETE";

  




const handleCopyNote = async (note) => {
  try {
    await navigator.clipboard.writeText(note.text);
    setCopiedNoteId(note.id);

    setTimeout(() => {
      setCopiedNoteId(null);
    }, 1500);
  } catch (err) {
    console.error(err);
  }
};




  return (
    <>
      <main className="notes-main">
        <form className="note-form" onSubmit={handleAddNote}>
          <input
            type="text"
            placeholder="Add Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            style={{
              padding: "0.7rem",
              borderRadius: "0.6rem",
              border: "1px solid #e5e7eb",
              fontSize: "0.95rem",
            }}
          />

          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Write your note here..."
            rows={3}
          />

          <button type="submit" className="primary-btn" disabled={saving}>
  {saving
    ? "Saving..."
    : isEditing
    ? "Update note"
    : "Add note"}
</button>

{isEditing && (
  <button
    type="button"
    className="secondary-btn"
    onClick={() => {
      setIsEditing(false);
      setEditingNoteId(null);
      setTitle("");
      setText("");
    }}
  >
    Cancel edit
  </button>
)}


          {error && (
            <p style={{ color: "#b91c1c", fontSize: "0.85rem" }}>{error}</p>
          )}
        </form>

        <div className="notes-grid">
          {notes.length === 0 ? (
            <p className="empty-text">No notes yet. Start by adding one!</p>
          ) : (
            notes.map((note) => (
              <div key={note.id} className="note-card">
    <div className="note-header">
  <h4>{note.title}</h4>

  <button
    className={`copy-pill ${
      copiedNoteId === note.id ? "copied" : ""
    }`}
    onClick={() => handleCopyNote(note)}
  >
    {copiedNoteId === note.id ? (
      <>
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <polyline points="20 6 9 17 4 12" />
        </svg>
        Copied
      </>
    ) : (
      <>
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <rect x="9" y="9" width="13" height="13" rx="2" />
          <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
        </svg>
        Copy
      </>
    )}
  </button>
</div>


<p className="note-text">{note.text}</p>


                <div
  style={{
    display: "flex",
    gap: "0.4rem",
    alignItems: "center",
    justifyContent: "flex-end",
  }}
>
  

  <button
    className="secondary-btn"
    onClick={() => handleEditNote(note)}
  >
    Edit
  </button>

  <button
    className="delete-btn"
    onClick={() => openConfirm(note)}
  >
    Delete
  </button>
</div>


              </div>
            ))
          )}
        </div>
      </main>

      {/* ✅ DELETE CONFIRM MODAL */}
      {confirmNote && (
        <div className="modal-backdrop">
          <div className="modal-card">
            <h3 className="modal-title">Delete this note?</h3>
            <p className="modal-warning">
              This action cannot be undone.
            </p>

            <div className="modal-note-preview">
              <strong>{confirmNote.title}</strong>
              <p>{confirmNote.text}</p>
            </div>

            <label className="modal-label">
              Type <b>DELETE</b> to confirm:
            </label>
            <input
              className="modal-input"
              value={confirmInput}
              onChange={(e) => setConfirmInput(e.target.value)}
              placeholder="DELETE"
            />

            <div className="modal-actions">
              <button
                className="secondary-btn"
                onClick={handleCancelConfirm}
              >
                Cancel
              </button>
              <button
                className="danger-btn"
                disabled={deleteDisabled}
                onClick={handleConfirmDelete}
              >
                Delete forever
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
