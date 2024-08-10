import { Route, Routes } from "react-router-dom";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Notes from "./pages/Notes";
import MainLayout from "./layouts/MainLayout";
import { useEffect, useState } from "react";
import { auth } from "./firebase";
import Recap from "./pages/Recap";
import { Toaster } from "react-hot-toast";
import { PulseLoader } from "react-spinners";

function App() {
  const [loading, setLoading] = useState(true);

  const checkAuth = async () => {
    await auth.authStateReady();
    setLoading(false);
  };

  useEffect(() => {
    checkAuth();
  }, []);

  return loading ? (
    <div className="relative w-dvw h-dvh">
      <div className="absolute -translate-x-1/2 -translate-y-1/2 top-1/2 left-1/2">
        <PulseLoader color="#3b82f6" />
      </div>
    </div>
  ) : (
    <div>
      <Toaster position="bottom-center" />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />

        <Route element={<MainLayout />}>
          <Route path="/notes/:noteId?" element={<Notes />} />
          <Route path="/recap/:noteId?/:recapId?" element={<Recap />} />
        </Route>
      </Routes>
    </div>
  );
}

export default App;
