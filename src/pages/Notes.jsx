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
  where,
} from "firebase/firestore";
import {
  FaAngleDoubleLeft,
  FaAngleDoubleRight,
  FaRegSave,
  FaRegTrashAlt,
} from "react-icons/fa";
import { FiPlusSquare } from "react-icons/fi";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import AISidebar from "../components/AISidebar";
import { PulseLoader } from "react-spinners";
import toast from "react-hot-toast";

const Notes = () => {
  const navigate = useNavigate();

  const [noteList, setNoteList] = useState([]);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [isLoadingNote, setIsLoadingNote] = useState(true);
  const [isLoadingList, setIsLoadingList] = useState(true);

  const [isAISidebarOpen, setIsAISidebarOpen] = useState(false);

  const { noteId } = useParams();
  const { currentUser } = auth;

  const modules = {
    toolbar: [
      [{ header: [1, 2, 3, false] }],
      ["bold", "italic", "underline", "strike"], // toggled buttons
      ["blockquote", "code-block"],

      [{ list: "ordered" }, { list: "bullet" }, { list: "check" }],
      [{ script: "sub" }, { script: "super" }], // superscript/subscript
      [{ indent: "-1" }, { indent: "+1" }], // outdent/indent

      [{ color: [] }, { background: [] }], // dropdown with defaults from theme

      [{ align: [] }],
    ],
  };

  const handleTitleChange = (e) => setTitle(e.target.value);
  const handleContentChange = (value) => setContent(value);

  const fetchNotesList = () => {
    setIsLoadingList(true);

    const q = query(
      collection(db, "notes"),
      where("uid", "==", currentUser.uid)
    );

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const notesList = querySnapshot.docs.map((doc) => [doc.id, doc.data()]);
      setNoteList(notesList);
      setIsLoadingList(false);
    });

    return unsubscribe;
  };

  const fetchNote = async () => {
    setIsLoadingNote(true);
    try {
      if (!noteId) return;
      const docRef = doc(db, "notes", noteId);
      const docSnapshot = await getDoc(docRef);
      const noteData = docSnapshot.data();
      setTitle(noteData.title);
      setContent(noteData.content);
      setIsLoadingNote(false);
    } catch (e) {
      console.log(e);
    }
  };

  const deleteNote = async (e, id) => {
    e.stopPropagation();
    const prompt = window.confirm("정말로 삭제하시겠습니까?");
    if (!prompt) return;

    try {
      let docRef = doc(db, "notes", id);
      await deleteDoc(docRef);

      if (noteId === id) {
        const docRef = doc(db, "users", currentUser.uid);
        await updateDoc(docRef, {
          lastVisitedNoteId: "",
        });
        navigate("/notes");
        toast.success("Note deleted!", {
          id: "note-deleted",
        });
      }
    } catch (e) {
      console.log(e);
    }
  };

  const handleNotesListItemClick = async (id) => {
    if (noteId === id) return;

    try {
      // 페이지 이동 전에 현재 노트 저장
      if (noteId) updateNote();

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

  const updateNote = async () => {
    const docRef = doc(db, "notes", noteId);
    await updateDoc(docRef, {
      title,
      content,
      modifiedAt: serverTimestamp(),
    });
    toast.success("Note saved!", {
      id: "note-saved",
    });
  };

  const createNote = async () => {
    if (noteId) updateNote();

    const collectionRef = collection(db, "notes");
    const docRef = await addDoc(collectionRef, {
      uid: currentUser.uid,
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
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const handleBeforeUnload = (e) => e.preventDefault();
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, []);

  useEffect(() => {
    fetchNote();
  }, [noteId]);

  useEffect(() => {
    setNoteList((prev) => {
      const updatedNotesList = prev.map((note) => {
        if (note[0] === noteId) {
          return [noteId, { ...note[1], title }];
        }
        return note;
      });
      return updatedNotesList;
    });
  }, [title]);

  return (
    <div className="flex gap-4 h-dvh">
      <aside className="flex flex-col border-r border-r-slate-200 w-72">
        <div className="flex items-center justify-between p-4">
          <h1 className="text-xl font-bold">{auth.currentUser.email}</h1>
          <div
            className="p-2 hover:bg-slate-100 rounded-xl"
            onClick={createNote}>
            <FiPlusSquare />
          </div>
        </div>

        <div className="overflow-scroll grow">
          {isLoadingList ? (
            <div className="relative w-full h-full">
              <div className="absolute -translate-x-1/2 -translate-y-1/2 top-1/2 left-1/2">
                <PulseLoader color="#3b82f6" />
              </div>
            </div>
          ) : noteList.length ? (
            noteList.map((note) => {
              const [id, data] = note;
              return (
                <div
                  key={id}
                  className={`flex items-center justify-between px-4 py-2 cursor-pointer hover:bg-blue-100 ${
                    id === noteId && "bg-blue-300 font-bold"
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
        </div>
      </aside>

      <main className="relative h-dvh grow">
        <div className="h-full max-w-screen-xl mx-auto">
          {isLoadingNote ? (
            <div className="absolute -translate-x-1/2 -translate-y-1/2 top-1/2 left-1/2">
              <PulseLoader color="#3b82f6" />
            </div>
          ) : (
            <div className="h-full">
              {noteId ? (
                <div className="flex flex-col h-full grow">
                  <div className="flex gap-2 mb-4">
                    <input
                      type="text"
                      className="w-full text-2xl font-bold"
                      placeholder="New note"
                      value={title}
                      onChange={handleTitleChange}
                    />

                    <button
                      className="p-2 hover:bg-blue-100 rounded-xl"
                      onClick={updateNote}>
                      <div className="flex items-center gap-2">
                        <FaRegSave />
                        <div>Save</div>
                      </div>
                    </button>

                    <button
                      className="p-2 hover:bg-blue-100 rounded-xl"
                      onClick={() => setIsAISidebarOpen(!isAISidebarOpen)}>
                      {isAISidebarOpen ? (
                        <FaAngleDoubleRight />
                      ) : (
                        <FaAngleDoubleLeft />
                      )}
                    </button>
                  </div>
                  <ReactQuill
                    theme="snow"
                    style={{
                      flexGrow: 1,
                      overflowY: "auto",
                    }}
                    placeholder="Start writing..."
                    modules={modules}
                    onChange={handleContentChange}
                    value={content}
                  />
                </div>
              ) : (
                <div className="absolute -translate-x-1/2 -translate-y-1/2 top-1/2 left-1/2">
                  <div>Select a note!</div>
                </div>
              )}
            </div>
          )}
        </div>
      </main>

      {isAISidebarOpen && <AISidebar />}
    </div>
  );
};

export default Notes;
