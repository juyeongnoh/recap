import React, { useEffect, useState } from "react";
import { auth, db } from "../firebase";
import { Outlet, useNavigate } from "react-router-dom";
import {
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  query,
} from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { FaRegTrashAlt } from "react-icons/fa";
import { FiPlusSquare } from "react-icons/fi";

const Notes = () => {
  const navigate = useNavigate();

  const [userEmail, setUserEmail] = useState(null);
  const [notes, setNotes] = useState([]);

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

  useEffect(() => {
    checkAuthState();
  }, []);

  useEffect(() => {
    if (userEmail) {
      const unsubscribe = fetchNotes();
      return unsubscribe;
    }
  }, [userEmail]);

  return (
    <div>
      <div className="w-full bg-slate-400">
        <div className="flex items-center justify-between max-w-screen-xl mx-auto">
          <div>recap</div>
          <div>
            <span>{userEmail}</span>
            <button
              onClick={() => {
                auth.signOut();
                navigate("/");
              }}
              className="p-4 rounded-2xl bg-slate-200">
              로그아웃
            </button>
          </div>
        </div>
      </div>
      <div style={{ display: "flex", gap: "16px" }}>
        <aside style={{ width: "200px" }}>
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
                onClick={() => navigate(`/notes/${id}`)}>
                <div className="flex-grow overflow-hidden text-ellipsis whitespace-nowrap">
                  {data.title}
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
        <main style={{ flexGrow: 1 }}>
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Notes;
