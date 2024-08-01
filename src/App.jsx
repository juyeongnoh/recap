import { Route, Routes } from "react-router-dom";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Notes from "./pages/Notes";
import Editor from "./components/Editor";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />

      <Route path="/notes" element={<Notes />}>
        <Route path="/notes" element={<Editor />} />
        <Route path="/notes/:noteId" element={<Editor />} />
      </Route>
    </Routes>
  );
}

export default App;
