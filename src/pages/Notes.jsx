import React, { useEffect, useState } from "react";
import { auth, db } from "../firebase";
import { useNavigate, useParams } from "react-router-dom";
import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  onSnapshot,
  query,
  updateDoc,
} from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { FaRegTrashAlt } from "react-icons/fa";
import { FiPlusSquare } from "react-icons/fi";
import ReactQuill from "react-quill";

const Notes = () => {
  const navigate = useNavigate();

  const [userEmail, setUserEmail] = useState(null);
  const [notes, setNotes] = useState([]);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  const { noteId } = useParams();

  const modules = {
    toolbar: {
      container: [
        ["image"],
        [{ header: [1, 2, 3, false] }],
        ["bold", "underline"],
      ],
    },
  };

  const handleTitleChange = (e) => setTitle(e.target.value);
  const handleContentChange = (value) => setContent(value);

  const fetchNotes = () => {
    const collectionRef = collection(
      db,
      "users",
      auth.currentUser.uid,
      "notes"
    );
    const q = query(collectionRef);
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      setNotes(querySnapshot.docs.map((doc) => [doc.id, doc.data()]));
    });
    return unsubscribe;
  };

  const fetchNote = async () => {
    try {
      const docRef = doc(db, "users", auth.currentUser.uid, "notes", noteId);
      const docSnapshot = await getDoc(docRef);
      const noteData = docSnapshot.data();
      setTitle(noteData.title);
      setContent(noteData.content);
      setIsLoading(false);
    } catch (e) {
      console.log(e);
    }
  };

  const checkAuthState = async () => {
    onAuthStateChanged(auth, (user) => {
      if (user) {
        setUserEmail(user.email);
      } else {
        navigate("/");
      }
    });
  };

  const handleNoteDelete = async (e, id) => {
    e.stopPropagation();
    const prompt = window.confirm("정말로 삭제하시겠습니까?");
    if (!prompt) return;

    try {
      const docRef = doc(db, "users", auth.currentUser.uid, "notes", id);
      await deleteDoc(docRef);
    } catch (e) {
      console.log(e);
    }
  };

  const handleNoteItemClick = async (id) => {
    try {
      const docRef = doc(db, "users", auth.currentUser.uid);
      await updateDoc(docRef, {
        lastVisitedNoteId: id,
      });
    } catch (e) {
      console.log(e);
    }
    navigate(`/notes/${id}`);
  };

  const fetchLastVisitedNote = async () => {
    try {
      const docRef = doc(db, "users", auth.currentUser.uid);
      const docSnap = await getDoc(docRef);
      const { lastVisitedNoteId } = docSnap.data();

      if (lastVisitedNoteId) navigate(`/notes/${lastVisitedNoteId}`);
    } catch (e) {
      console.log(e);
    }
  };

  const updateTitle = async () => {
    const docRef = doc(db, "users", auth.currentUser.uid, "notes", noteId);
    await updateDoc(docRef, {
      title,
    });
  };

  const updateContent = async () => {
    const docRef = doc(db, "users", auth.currentUser.uid, "notes", noteId);
    await updateDoc(docRef, {
      content,
    });
  };

  useEffect(() => {
    checkAuthState();
    if (!noteId) fetchLastVisitedNote();
  }, []);

  useEffect(() => {
    if (userEmail) {
      const unsubscribe = fetchNotes();
      return unsubscribe;
    }
  }, [userEmail]);

  useEffect(() => {
    fetchNote();
  }, [noteId]);

  useEffect(() => {
    if (!isLoading) updateTitle();
  }, [title]);

  useEffect(() => {
    if (!isLoading) updateContent();
  }, [content]);

  return (
    <div>
      <div className="w-full bg-slate-400">
        <div className="flex items-center justify-between max-w-screen-xl mx-auto">
          <div>recap</div>
          <div>
            <span>{userEmail}</span>
            <button
              onClick={() => {
                const confirm = window.confirm("로그아웃 하시겠습니까?.");
                if (!confirm) return;

                auth.signOut();
                navigate("/");
              }}
              className="p-4 rounded-2xl bg-slate-200">
              로그아웃
            </button>
          </div>
        </div>
      </div>
      <div className="flex gap-4">
        <aside className="w-64">
          <div className="flex items-center justify-between p-4">
            <h1 className="text-xl font-bold">Notes</h1>
            <div
              className="p-2 hover:bg-slate-100 rounded-xl"
              onClick={() => navigate("/notes")}>
              <FiPlusSquare />
            </div>
          </div>
          {notes.map((note) => {
            const [id, data] = note;
            return (
              <div
                key={id}
                className="flex items-center justify-between p-4 cursor-pointer hover:bg-slate-300"
                onClick={() => handleNoteItemClick(id)}>
                <div className="flex-grow overflow-hidden text-ellipsis whitespace-nowrap">
                  {data.title ? data.title : "New note"}
                </div>
                <div
                  className="p-2 hover:bg-slate-100 rounded-xl"
                  onClick={(e) => handleNoteDelete(e, id)}>
                  <FaRegTrashAlt />
                </div>
              </div>
            );
          })}
        </aside>
        <main className="grow">
          <div>
            <input
              type="text"
              style={{ width: "100%", fontSize: "24px", fontWeight: 700 }}
              placeholder="Title"
              value={title}
              onChange={handleTitleChange}
            />
            <ReactQuill
              className="w-full"
              modules={modules}
              onChange={handleContentChange}
              value={content}
            />
          </div>
        </main>
      </div>
    </div>
  );
};

export default Notes;
