import React, { useEffect, useState } from "react";
import { auth, db } from "../firebase";
import { useNavigate, useParams } from "react-router-dom";
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  onSnapshot,
  query,
  serverTimestamp,
  updateDoc,
} from "firebase/firestore";
import { FaRegTrashAlt } from "react-icons/fa";
import { FiPlusSquare } from "react-icons/fi";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";

const Notes = () => {
  const navigate = useNavigate();

  const [notesList, setNotesList] = useState([]);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  const { noteId } = useParams();
  const { currentUser } = auth;

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

  const fetchNotesList = () => {
    const collectionRef = collection(db, "users", currentUser.uid, "notes");
    const q = query(collectionRef);
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      setNotesList(querySnapshot.docs.map((doc) => [doc.id, doc.data()]));
    });
    return unsubscribe;
  };

  const fetchNote = async () => {
    try {
      if (!noteId) return;
      const docRef = doc(db, "users", currentUser.uid, "notes", noteId);
      const docSnapshot = await getDoc(docRef);
      const noteData = docSnapshot.data();
      setTitle(noteData.title);
      setContent(noteData.content);
      setIsLoading(false);
    } catch (e) {
      console.log(e);
    }
  };

  const deleteNote = async (e, id) => {
    e.stopPropagation();
    const prompt = window.confirm("정말로 삭제하시겠습니까?");
    if (!prompt) return;

    try {
      let docRef = doc(db, "users", currentUser.uid, "notes", id);
      await deleteDoc(docRef);

      if (noteId === id) {
        docRef = doc(db, "users", currentUser.uid);
        await updateDoc(docRef, {
          lastVisitedNoteId: "",
        });
        navigate("/notes");
      }
    } catch (e) {
      console.log(e);
    }
  };

  const handleNotesListItemClick = async (id) => {
    try {
      const docRef = doc(db, "users", currentUser.uid);
      await updateDoc(docRef, {
        lastVisitedNoteId: id,
      });
      navigate(`/notes/${id}`);
    } catch (e) {
      console.log(e);
    }
  };

  const fetchLastVisitedNote = async () => {
    try {
      const docRef = doc(db, "users", currentUser.uid);
      const docSnapshot = await getDoc(docRef);
      const { lastVisitedNoteId } = docSnapshot.data();

      if (lastVisitedNoteId) navigate(`/notes/${lastVisitedNoteId}`);
    } catch (e) {
      console.log(e);
    }
  };

  const updateTitle = async () => {
    const docRef = doc(db, "users", currentUser.uid, "notes", noteId);
    await updateDoc(docRef, {
      title,
      modifiedAt: serverTimestamp(),
    });
  };

  const updateContent = async () => {
    const docRef = doc(db, "users", currentUser.uid, "notes", noteId);
    await updateDoc(docRef, {
      content,
      modifiedAt: serverTimestamp(),
    });
  };

  const createNote = async () => {
    const collectionRef = collection(db, "users", currentUser.uid, "notes");
    const docRef = await addDoc(collectionRef, {
      title: "",
      content: "",
      createdAt: serverTimestamp(),
      modifiedAt: serverTimestamp(),
    });
    navigate(`/notes/${docRef.id}`);
  };

  useEffect(() => {
    fetchLastVisitedNote();
    const unsubscribe = fetchNotesList();
    return unsubscribe;
  }, []);

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
            <span>{currentUser.email}</span>
            <button
              onClick={async () => {
                const confirm = window.confirm("로그아웃 하시겠습니까?");
                if (!confirm) return;

                try {
                  await auth.signOut(); // 로그아웃 후 navigate 호출
                  navigate("/");
                } catch (error) {
                  console.error("Error signing out: ", error);
                }
              }}
              className="p-2 rounded-2xl bg-slate-200">
              Logout
            </button>
          </div>
        </div>
      </div>
      <div className="w-full">
        <div className="flex max-w-screen-xl gap-4 mx-auto">
          <aside className="w-64">
            <div className="flex items-center justify-between p-4">
              <h1 className="text-xl font-bold">Notes</h1>
              <div
                className="p-2 hover:bg-slate-100 rounded-xl"
                onClick={createNote}>
                <FiPlusSquare />
              </div>
            </div>
            {notesList.length ? (
              notesList.map((note) => {
                const [id, data] = note;
                return (
                  <div
                    key={id}
                    className={`flex items-center justify-between p-4 cursor-pointer hover:bg-slate-300 ${
                      id === noteId && "bg-slate-300"
                    }`}
                    onClick={() => handleNotesListItemClick(id)}>
                    <div className="flex-grow overflow-hidden text-ellipsis whitespace-nowrap">
                      {data.title ? data.title : "New note"}
                    </div>
                    <div
                      className="p-2 hover:bg-slate-100 rounded-xl"
                      onClick={(e) => deleteNote(e, id)}>
                      <FaRegTrashAlt />
                    </div>
                  </div>
                );
              })
            ) : (
              <div>Start writing!</div>
            )}
          </aside>
          <main className="grow">
            {noteId ? (
              <div>
                <input
                  type="text"
                  style={{ width: "100%", fontSize: "24px", fontWeight: 700 }}
                  placeholder="New note"
                  value={title}
                  onChange={handleTitleChange}
                />
                <ReactQuill
                  theme="snow"
                  className="w-full"
                  placeholder="Start writing..."
                  modules={modules}
                  onChange={handleContentChange}
                  value={content}
                />
              </div>
            ) : (
              <div>Select a note!</div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
};

export default Notes;
