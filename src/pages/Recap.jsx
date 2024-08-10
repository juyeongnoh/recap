import React, { useEffect, useState } from "react";
import { auth, db, functions } from "../firebase";
import { useNavigate, useParams } from "react-router-dom";
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  onSnapshot,
  query,
  serverTimestamp,
  updateDoc,
  where,
} from "firebase/firestore";
import { FiPlusSquare } from "react-icons/fi";
import { FaRegTrashAlt } from "react-icons/fa";
import { httpsCallable } from "firebase/functions";
import FillBlank from "../components/Recap/FillBlank";
import ShortAnswer from "../components/Recap/ShortAnswer";
import MultipleChoice from "../components/Recap/MultipleChoice";

const Recap = () => {
  const navigate = useNavigate();

  const [notesList, setNotesList] = useState([]);
  const [documentTitle, setDocumentTitle] = useState("");
  const [recapList, setRecapList] = useState([]);
  const [recapData, setRecapData] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [isShowQuestionTypeSelect, setIsShowQuestionTypeSelect] =
    useState(false);

  const { currentUser } = auth;
  const { noteId, recapId } = useParams();

  const fetchNotesList = async () => {
    setIsLoading(true);
    try {
      const q = query(
        collection(db, "notes"),
        where("uid", "==", currentUser.uid)
      );
      const querySnapshot = await getDocs(q);
      const notesList = querySnapshot.docs.map((doc) => [doc.id, doc.data()]);
      setNotesList(notesList);
      setIsLoading(false);
    } catch (e) {
      console.log(e);
    }
  };

  const createNote = async () => {
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
        navigate("/recap");
      }
    } catch (e) {
      console.log(e);
    }
  };

  const handleNotesListItemClick = async (id) => {
    if (noteId === id) return;

    try {
      const docRef = doc(db, "users", currentUser.uid);
      await updateDoc(docRef, {
        lastVisitedNoteId: id,
      });
      navigate(`/recap/${id}`);
      setIsShowQuestionTypeSelect(false);
    } catch (e) {
      console.log(e);
    }
  };

  const fetchLastVisitedNote = async () => {
    try {
      const docRef = doc(db, "users", currentUser.uid);
      const docSnapshot = await getDoc(docRef);
      const { lastVisitedNoteId } = docSnapshot.data();

      if (lastVisitedNoteId) navigate(`/recap/${lastVisitedNoteId}`);
    } catch (e) {
      console.log(e);
    }
  };

  const fetchNote = async () => {
    setIsLoading(true);
    try {
      if (!noteId) return;
      const docRef = doc(db, "notes", noteId);
      const docSnapshot = await getDoc(docRef);
      const noteData = docSnapshot.data();
      console.log(noteData);
      setDocumentTitle(noteData.title);
      setIsLoading(false);
    } catch (e) {
      console.log(e);
    }
  };

  const fetchRecapList = () => {
    const collectionRef = collection(db, "notes", noteId, "recap");
    const unsubscribe = onSnapshot(collectionRef, (snapshot) => {
      const recapData = snapshot.docs.map((doc) => {
        return { id: doc.id, data: doc.data() };
      });
      setRecapList(recapData);
    });

    return unsubscribe;
  };

  const generateRecap = async (questionType) => {
    const generateRecap = httpsCallable(functions, "generateRecap");
    const recapId = await generateRecap({ noteId, questionType });
    console.log(questionType);
    navigate(`/recap/${noteId}/${recapId.data.recapId}`);
  };

  const fetchRecap = async () => {
    const docRef = doc(db, "notes", noteId, "recap", recapId);
    const docSnapshot = await getDoc(docRef);
    const recapData = docSnapshot.data();

    setRecapData(recapData);
  };

  const deleteRecap = async (recapId) => {
    if (!confirm("정말로 삭제하시겠습니까?")) return;
    const docRef = doc(db, "notes", noteId, "recap", recapId);
    await deleteDoc(docRef);
    navigate(`/recap/${noteId}`);
  };

  useEffect(() => {
    fetchNotesList();
    fetchLastVisitedNote();
  }, []);

  useEffect(() => {
    fetchNote();
    if (!noteId) return;

    const unsubscribe = fetchRecapList();
    return () => unsubscribe();
  }, [noteId]);

  useEffect(() => {
    if (!recapId) return;
    fetchRecap();
  }, [recapId]);

  useEffect(() => {
    console.log("recapData", recapData);
  }, [recapData]);

  useEffect(() => {
    console.log("recapList", recapList);
  }, [recapList]);

  return (
    <div>
      <div className="w-full bg-slate-400">
        <div className="flex items-center justify-between max-w-screen-xl mx-auto">
          <div className="flex gap-4">
            <span onClick={() => navigate("/notes")}>notes</span>
            <span>recap</span>
          </div>
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
      <div>
        <div className="flex max-w-screen-xl gap-4 mx-auto">
          <aside className="w-72">
            <div className="flex items-center justify-between p-4">
              <h1 className="text-xl font-bold">Notes</h1>
              <div
                className="p-2 hover:bg-slate-100 rounded-xl"
                onClick={createNote}>
                <FiPlusSquare />
              </div>
            </div>
            {isLoading ? (
              <div>Loading...</div>
            ) : notesList.length ? (
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
          {isLoading ? (
            <div>Loading...</div>
          ) : (
            <main className="grow">
              {recapId ? (
                <>
                  {recapData?.question_format === "multiple_choice" && (
                    <MultipleChoice recapData={recapData} />
                  )}

                  {recapData?.question_format === "short_answer" && (
                    <ShortAnswer recapData={recapData} />
                  )}

                  {recapData?.question_format === "fill_blank" && (
                    <FillBlank recapData={recapData} />
                  )}
                </>
              ) : (
                // <div>
                //   <h2 className="text-2xl font-bold">{recapData?.question}</h2>
                //   <p>{recapData?.answer}</p>
                // </div>
                <div>
                  {isShowQuestionTypeSelect ? (
                    <div>
                      <button
                        className="p-2 ml-4 bg-slate-200 rounded-2xl"
                        onClick={() => setIsShowQuestionTypeSelect(false)}>
                        뒤로 가기
                      </button>
                      <div>어떤 유형의 문제를 만들까요?</div>
                      <button
                        className="p-2 ml-4 bg-slate-200 rounded-2xl"
                        onClick={() => generateRecap("key_terms")}>
                        Key Terms
                      </button>
                      <button
                        className="p-2 ml-4 bg-slate-200 rounded-2xl"
                        onClick={() => generateRecap("key_concepts")}>
                        Key Concepts
                      </button>
                      <button
                        className="p-2 ml-4 bg-slate-200 rounded-2xl"
                        onClick={() => generateRecap("application")}>
                        Application
                      </button>
                    </div>
                  ) : (
                    <div>
                      <div className="flex justify-between mt-2">
                        <h2 className="text-2xl font-bold grow">
                          {documentTitle}
                        </h2>
                        <button
                          className="p-2 ml-4 bg-slate-200 rounded-2xl"
                          onClick={() => setIsShowQuestionTypeSelect(true)}>
                          + Start recap
                        </button>
                      </div>
                      <div className="mt-4">
                        {recapList.length ? (
                          recapList.map((recap, index) => {
                            return (
                              <div
                                key={recap.id}
                                className="p-4 mb-4 bg-sky-100 rounded-xl">
                                <button
                                  className="p-2 ml-4 bg-slate-200 rounded-2xl"
                                  onClick={() => deleteRecap(recap.id)}>
                                  Delete
                                </button>
                                <div>
                                  <span className="p-1 text-sm bg-gray-300 rounded-full">
                                    {recap.data.question_type}
                                  </span>
                                  <span className="p-1 text-sm bg-gray-300 rounded-full">
                                    {recap.data.question_format}
                                  </span>
                                </div>
                                <h2 className="text-lg font-semibold">
                                  Q. {recap.data.question}
                                </h2>
                                <p>
                                  A.{" "}
                                  {Array.isArray(recap.data.answer)
                                    ? recap.data.answer.join(", ")
                                    : recap.data.answer}
                                </p>
                              </div>
                            );
                          })
                        ) : (
                          <div>Start recap! 문제를 생성해서 복습해보세요</div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </main>
          )}
        </div>
      </div>
    </div>
  );
};

export default Recap;
