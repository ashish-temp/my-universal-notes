import { useEffect, useRef, useState } from "react";
import { db } from "../firebase";
import {
  addDoc,
  collection,
  onSnapshot,
  query,
  serverTimestamp,
  where,
} from "firebase/firestore";

import NoteCard from "./NoteCard";
import EditNoteModal from "./EditNoteModal";

export default function Notes({ user }) {
  const [title, setTitle] = useState("");
  const [text, setText] = useState("");
  const [isExpanded, setIsExpanded] = useState(false);
  const [notes, setNotes] = useState([]);
  const [activeNote, setActiveNote] = useState(null);

  const formRef = useRef(null);

  useEffect(() => {
    const q = query(
      collection(db, "notes"),
      where("uid", "==", user.uid)
    );

    const unsub = onSnapshot(q, (snap) => {
      const list = snap.docs.map((d) => ({
        id: d.id,
        ...d.data(),
      }));

      list.sort((a, b) => {
        if (a.pinned !== b.pinned) return b.pinned - a.pinned;
        if (!a.createdAt || !b.createdAt) return 0;
        return b.createdAt.seconds - a.createdAt.seconds;
      });

      setNotes(list);
    });

    return () => unsub();
  }, [user.uid]);

  useEffect(() => {
    const handleClickOutside = async (e) => {
      if (
        isExpanded &&
        formRef.current &&
        !formRef.current.contains(e.target)
      ) {
        if (!title.trim() && !text.trim()) {
          reset();
          return;
        }

        await addDoc(collection(db, "notes"), {
          title,
          text,
          uid: user.uid,
          pinned: false,
          color: "#ffffff",
          createdAt: serverTimestamp(),
        });

        reset();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () =>
      document.removeEventListener("mousedown", handleClickOutside);
  }, [isExpanded, title, text]);

  const reset = () => {
    setTitle("");
    setText("");
    setIsExpanded(false);
  };

  return (
    <>
      <main className="notes-main">
        <div
          className="note-form"
          ref={formRef}
          onClick={() => setIsExpanded(true)}
        >
          {isExpanded && (
            <input
              placeholder="Title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          )}

          <textarea
            placeholder="Take a note…"
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={isExpanded ? 3 : 1}
          />
        </div>

        <div className="notes-grid">
          {notes.map((note) => (
            <NoteCard
              key={note.id}
              note={note}
              onOpen={() => setActiveNote(note)}
            />
          ))}
        </div>
      </main>

      {activeNote && (
        <EditNoteModal
          note={activeNote}
          onClose={() => setActiveNote(null)}
        />
      )}
    </>
  );
}
