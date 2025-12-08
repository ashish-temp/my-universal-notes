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
} from "firebase/firestore";

export default function Notes({ user }) {
  const [title, setTitle] = useState("");
  const [text, setText] = useState("");
  const [notes, setNotes] = useState([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  // delete confirmation modal
  const [confirmNote, setConfirmNote] = useState(null);
  const [confirmInput, setConfirmInput] = useState("");

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
      await addDoc(collection(db, "notes"), {
        title: title.trim(),
        text: text.trim(),
        uid: user.uid,
        createdAt: serverTimestamp(),
      });

      setTitle("");
      setText("");
    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      setSaving(false);
    }
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
            {saving ? "Saving..." : "Add note"}
          </button>

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
                <h4 style={{ fontWeight: "600" }}>{note.title}</h4>
                <p className="note-text">{note.text}</p>
                <button
                  className="delete-btn"
                  onClick={() => openConfirm(note)}
                >
                  Delete
                </button>
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
