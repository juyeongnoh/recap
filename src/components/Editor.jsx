import { addDoc, collection, doc, getDoc, updateDoc } from "firebase/firestore";
import React, { useEffect, useState } from "react";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import { useNavigate, useParams } from "react-router-dom";
import { auth, db } from "../firebase";
import { onAuthStateChanged } from "firebase/auth";

const Editor = () => {
  const navigate = useNavigate();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState(null);

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

  const init = async (user) => {
    if (!noteId) {
      const collectionRef = collection(db, "users", user.uid, "notes");
      const docRef = await addDoc(collectionRef, {
        title: "Untitled",
        content: "",
      });
      navigate(`/notes/${docRef.id}`);
    } else {
      const docRef = doc(db, "users", user.uid, "notes", noteId);
      const docSnapshot = await getDoc(docRef);
      const noteData = docSnapshot.data();
      setTitle(noteData.title);
      setContent(noteData.content);
      setIsLoading(false);
    }
  };

  const updateTitle = async () => {
    const docRef = doc(db, "users", user.uid, "notes", noteId);
    await updateDoc(docRef, {
      title,
      content,
    });
  };

  const updateContent = async () => {
    const docRef = doc(db, "users", user.uid, "notes", noteId);
    await updateDoc(docRef, {
      title,
      content,
    });
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        init(currentUser); // 유저 정보를 사용해 초기화 실행
      } else {
        navigate("/"); // 인증되지 않은 경우 로그인 페이지로 리다이렉트
      }
    });

    return () => unsubscribe(); // 컴포넌트 언마운트 시 구독 해제
  }, [noteId]);

  useEffect(() => {
    if (!isLoading && user) updateTitle();
  }, [title]);

  useEffect(() => {
    if (!isLoading && user) updateContent();
  }, [content]);

  return (
    <div>
      <input
        type="text"
        style={{ width: "100%", fontSize: "24px", fontWeight: 700 }}
        placeholder="Title"
        value={title}
        onChange={handleTitleChange}
      />
      <ReactQuill
        theme="snow"
        style={{ width: "100%", height: "100dvh" }}
        modules={modules}
        onChange={handleContentChange}
        value={content}
      />
    </div>
  );
};

export default Editor;
