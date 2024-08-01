import { createUserWithEmailAndPassword } from "firebase/auth";
import React, { useState } from "react";
import { auth, db } from "../firebase";
import { useNavigate } from "react-router-dom";
import { doc, setDoc } from "firebase/firestore";

const Signup = () => {
  const navigate = useNavigate();

  const [loginCredentials, setLoginCredentials] = useState({
    email: "",
    password: "",
  });

  const handleChange = (e) => {
    setLoginCredentials({
      ...loginCredentials,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      await createUserWithEmailAndPassword(
        auth,
        loginCredentials.email,
        loginCredentials.password
      );

      const docRef = doc(db, "users", auth.currentUser.uid);
      await setDoc(docRef, {
        email: auth.currentUser.email,
        lastVisitedNoteId: "",
      });

      navigate("/login");
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div>
      <form onSubmit={handleSubmit}>
        <label>Email</label>
        <input
          type="email"
          name="email"
          className="border border-gray-400"
          value={loginCredentials.email}
          onChange={handleChange}
        />
        <br />

        <label>Password</label>
        <input
          type="password"
          name="password"
          className="border border-gray-400"
          value={loginCredentials.password}
          onChange={handleChange}
        />
        <br />

        <input type="submit" />
      </form>

      <button onClick={() => navigate("/")}>Home</button>
      <button onClick={() => navigate("/login")}>Login</button>
    </div>
  );
};

export default Signup;
