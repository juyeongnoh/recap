import React, { useEffect, useRef, useState } from "react";
import { auth, db, functions } from "../firebase";
import { useNavigate, useParams } from "react-router-dom";
import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  onSnapshot,
  query,
  updateDoc,
  where,
} from "firebase/firestore";
import {
  FaAngleLeft,
  FaCheck,
  FaPowerOff,
  FaRegFilePdf,
  FaRegFileWord,
  FaRegLightbulb,
  FaRegStickyNote,
  FaRegTrashAlt,
  FaSearch,
} from "react-icons/fa";
import { httpsCallable } from "firebase/functions";
import FillBlank from "../components/Recap/FillBlank";
import ShortAnswer from "../components/Recap/ShortAnswer";
import MultipleChoice from "../components/Recap/MultipleChoice";
import { PulseLoader } from "react-spinners";
import Badge from "../components/Badge";
import toast from "react-hot-toast";
import { exportPDF } from "../utils/exportPDF";
import Checkbox from "../components/Checkbox";

const Recap = () => {
  const navigate = useNavigate();

  const [noteList, setNoteList] = useState([]);
  const [documentTitle, setDocumentTitle] = useState("");
  const [recapList, setRecapList] = useState([]);
  const [recapData, setRecapData] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingList, setIsLoadingList] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [checkboxState, setCheckboxState] = useState({
    key_terms: false,
    key_concepts: false,
    application: false,
    multiple_choice: false,
    short_answer: false,
    fill_blank: false,
  });

  const [recapToExport, setRecapToExport] = useState([]);

  const [isShowQuestionTypeSelect, setIsShowQuestionTypeSelect] =
    useState(false);

  const { currentUser } = auth;
  const { noteId, recapId } = useParams();

  const modalRef = useRef(null);

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

  const deleteNote = async (e, id) => {
    e.stopPropagation();
    const prompt = window.confirm("Are you sure you want to delete this?");
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
    setIsGenerating(true);

    try {
      const generateRecap = httpsCallable(functions, "generateRecap");
      const recapId = await generateRecap({ noteId, questionType });

      setIsGenerating(false);
      navigate(`/recap/${noteId}/${recapId.data.recapId}`);
    } catch (e) {
      console.log(e);

      setIsGenerating(false);
      toast.error("Failed to generate question. Please try again.", {
        id: "failed-to-generate-question",
      });
      navigate(`/recap/${noteId}`);
    }
  };

  const fetchRecap = async () => {
    const docRef = doc(db, "notes", noteId, "recap", recapId);
    const docSnapshot = await getDoc(docRef);
    const recapData = docSnapshot.data();

    setRecapData(recapData);
  };

  const deleteRecap = async (recapId) => {
    if (!confirm("Are you sure you want to delete this?")) return;
    const docRef = doc(db, "notes", noteId, "recap", recapId);
    await deleteDoc(docRef);
    navigate(`/recap/${noteId}`);
  };

  const handleCheckboxChange = (e) => {
    const { name, checked } = e.target;
    setCheckboxState({ ...checkboxState, [name]: checked });
  };

  const filterRecapList = () => {
    return recapList.filter((recap) => {
      const { question_type, question_format } = recap.data;

      // 체크박스 상태에 따라 필터링
      if (
        (checkboxState.key_terms && question_type === "key_terms") ||
        (checkboxState.key_concepts && question_type === "key_concepts") ||
        (checkboxState.application && question_type === "application") ||
        (checkboxState.multiple_choice &&
          question_format === "multiple_choice") ||
        (checkboxState.short_answer && question_format === "short_answer") ||
        (checkboxState.fill_blank && question_format === "fill_blank")
      ) {
        return true;
      }

      return false;
    });
  };

  useEffect(() => {
    fetchLastVisitedNote();
    const unsubscribe = fetchNotesList();
    return () => unsubscribe();
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
    setRecapToExport(filterRecapList());
  }, [checkboxState, recapList]);

  return (
    <div className="flex gap-4 h-dvh">
      <aside className="flex flex-col border-r border-r-slate-200 w-72 shrink-0 bg-slate-50">
        <div className="flex justify-between border-b border-b-slate-200">
          <button className="w-full p-2 hover:bg-blue-100">
            <div
              className="flex flex-col items-center gap-2"
              onClick={() => navigate("/notes")}>
              <FaRegStickyNote className="text-2xl" />
              <div className="text-xs">Notes</div>
            </div>
          </button>
          <button className="w-full p-2 bg-blue-300 hover:bg-blue-100">
            <div className="flex flex-col items-center gap-2">
              <FaRegLightbulb className="text-2xl" />
              <div className="text-xs">Recap</div>
            </div>
          </button>
        </div>

        <div className="flex flex-col gap-4 p-2 overflow-auto grow">
          <div className="flex flex-col gap-2 overflow-scroll grow">
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
                    className={`flex items-center justify-between px-4 py-2 cursor-pointer hover:bg-blue-100 rounded-xl ${
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

          <div
            className="p-4 hover:bg-blue-100 rounded-xl"
            onClick={async () => {
              const confirm = window.confirm(
                "Are you sure you want to log out?"
              );
              if (!confirm) return;

              try {
                await auth.signOut();
                navigate("/");
              } catch (error) {
                console.error("Error signing out: ", error);
              }
            }}>
            <div className="flex items-center gap-2">
              <FaPowerOff />
              <div>Logout</div>
            </div>
            <div className="text-sm font-bold">{auth.currentUser.email}</div>
          </div>
        </div>
      </aside>

      <main className="relative h-dvh grow">
        <div className="h-full max-w-screen-xl mx-auto">
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
            <div className="h-full">
              {isShowQuestionTypeSelect ? (
                <div className="relative h-full">
                  <button
                    onClick={() => setIsShowQuestionTypeSelect(false)}
                    className="absolute p-2 text-2xl top-4 hover:bg-blue-100 rounded-xl">
                    <FaAngleLeft />
                  </button>
                  <div className="absolute flex flex-col gap-24 pb-32 -translate-x-1/2 -translate-y-1/2 top-1/2 left-1/2">
                    <div className="text-4xl font-light text-center whitespace-nowrap">
                      What type of questions would you like to create?
                    </div>
                    <div className="relative h-72">
                      {isGenerating ? (
                        <div className="absolute -translate-x-1/2 -translate-y-1/2 top-1/2 left-1/2">
                          <PulseLoader color="#3b82f6" />
                        </div>
                      ) : (
                        <div className="flex gap-8">
                          <button
                            className="p-4 text-left transition-colors duration-300 ease-in-out bg-blue-100 h-72 w-72 rounded-2xl hover:bg-blue-500 hover:text-white"
                            onClick={() => generateRecap("key_terms")}>
                            <FaRegFileWord className="mb-8 text-6xl" />
                            <div className="text-3xl font-bold">Key Terms</div>
                            <p className="mt-2 text-sm">
                              Focus on defining and recalling important terms
                              from the document.
                            </p>
                          </button>
                          <button
                            className="p-4 text-left transition-colors duration-300 ease-in-out bg-blue-100 h-72 w-72 rounded-2xl hover:bg-blue-500 hover:text-white"
                            onClick={() => generateRecap("key_concepts")}>
                            <FaSearch className="mb-8 text-6xl" />
                            <div className="text-3xl font-bold">
                              Key Concepts
                            </div>
                            <p className="mt-2 text-sm">
                              Test your understanding of the main ideas and
                              principles discussed.
                            </p>
                          </button>
                          <button
                            className="p-4 text-left transition-colors duration-300 ease-in-out bg-blue-100 h-72 w-72 rounded-2xl hover:bg-blue-500 hover:text-white"
                            onClick={() => generateRecap("application")}>
                            <FaCheck className="mb-8 text-6xl" />
                            <div className="text-3xl font-bold">
                              Application
                            </div>
                            <p className="mt-2 text-sm">
                              Apply the knowledge to solve problems or answer
                              scenario-based questions.
                            </p>
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col h-full">
                  <div className="flex items-center justify-between gap-2 mt-2">
                    <h2
                      className={`text-2xl font-bold grow ${
                        !documentTitle && "text-gray-400"
                      }`}>
                      {documentTitle ? documentTitle : "New note"}
                    </h2>
                    <button
                      onClick={() => {
                        modalRef.current.showModal();
                      }}
                      className="px-4 py-2 font-bold text-blue-500 border border-blue-500 hover:text-white hover:bg-blue-500 rounded-xl">
                      <div className="flex items-center gap-2">
                        <FaRegFilePdf />
                        <span>PDF</span>
                      </div>
                    </button>
                    <button
                      onClick={() => setIsShowQuestionTypeSelect(true)}
                      className="px-4 py-2 font-bold text-white bg-blue-500 hover:bg-blue-400 rounded-xl">
                      + Start recap
                    </button>
                  </div>
                  <div className="mt-4 overflow-scroll grow">
                    {recapList.length ? (
                      recapList.map((recap, index) => {
                        return (
                          <div
                            key={recap.id}
                            className="p-4 mb-4 hover:bg-blue-100 rounded-xl ">
                            <div className="flex justify-between">
                              <div className="flex items-center gap-2">
                                <Badge
                                  questionType={recap.data.question_type}
                                />
                                <Badge
                                  questionType={recap.data.question_format}
                                />
                              </div>
                              <div
                                className="p-2 hover:bg-slate-100 rounded-xl"
                                onClick={() => deleteRecap(recap.id)}>
                                <FaRegTrashAlt />
                              </div>
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
        </div>
      </main>

      <dialog
        ref={modalRef}
        className="relative w-3/4 max-w-screen-xl outline-none h-3/4 backdrop:bg-black backdrop:opacity-50 rounded-xl">
        <button
          onClick={() => {
            setCheckboxState({
              key_terms: false,
              key_concepts: false,
              application: false,
              multiple_choice: false,
              short_answer: false,
              fill_blank: false,
            });
            modalRef.current.close();
          }}
          className="absolute p-2 text-2xl hover:bg-blue-100 rounded-xl top-4 left-4">
          <FaAngleLeft />
        </button>
        <div className="absolute flex flex-col w-5/6 gap-4 -translate-x-1/2 -translate-y-1/2 h-5/6 top-1/2 left-1/2">
          <h2 className="text-3xl font-light text-center">Export PDF</h2>

          <div className="flex justify-center gap-2">
            <Checkbox
              label="Key Terms"
              name="key_terms"
              checked={checkboxState.key_terms}
              onChange={handleCheckboxChange}
            />
            <Checkbox
              label="Key Concepts"
              name="key_concepts"
              checked={checkboxState.key_concepts}
              onChange={handleCheckboxChange}
            />
            <Checkbox
              label="Application"
              name="application"
              checked={checkboxState.application}
              onChange={handleCheckboxChange}
            />
            <Checkbox
              label="Multiple Choice"
              name="multiple_choice"
              checked={checkboxState.multiple_choice}
              onChange={handleCheckboxChange}
            />
            <Checkbox
              label="Short Answer"
              name="short_answer"
              checked={checkboxState.short_answer}
              onChange={handleCheckboxChange}
            />
            <Checkbox
              label="Fill Blank"
              name="fill_blank"
              checked={checkboxState.fill_blank}
              onChange={handleCheckboxChange}
            />
          </div>

          <div className="overflow-scroll grow">
            {recapToExport.length ? (
              recapToExport?.map((recap, index) => {
                return (
                  <div key={recap.id} className="p-4 rounded-xl">
                    <div className="flex justify-between">
                      <div className="flex items-center gap-2">
                        <Badge questionType={recap.data.question_type} />
                        <Badge questionType={recap.data.question_format} />
                      </div>
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
              <div className="flex items-center justify-center h-full text-gray-500">
                No questions to export
              </div>
            )}
          </div>

          <div className="flex justify-center">
            <button
              onClick={() => {
                exportPDF(recapToExport, documentTitle);
                setCheckboxState({
                  key_terms: false,
                  key_concepts: false,
                  application: false,
                  multiple_choice: false,
                  short_answer: false,
                  fill_blank: false,
                });
                modalRef.current.close();
              }}
              className="px-16 py-4 font-bold text-white bg-blue-500 hover:bg-blue-400 rounded-xl">
              <div className="flex items-center gap-2">
                <FaRegFilePdf />
                <span>Export</span>
              </div>
            </button>
          </div>
        </div>
      </dialog>
    </div>
  );
};

export default Recap;
