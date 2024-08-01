import { signInWithEmailAndPassword } from "firebase/auth";
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { auth } from "../firebase";

const Login = () => {
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
      const user = await signInWithEmailAndPassword(
        auth,
        loginCredentials.email,
        loginCredentials.password
      );
      console.log(user);

      // localStorage.setItem("access", user.user.accessToken);
      // localStorage.setItem("refresh", user.user.refreshToken);

      navigate("/");
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
          value={loginCredentials.email}
          onChange={handleChange}
        />
        <br />

        <label>Password</label>
        <input
          type="password"
          name="password"
          value={loginCredentials.password}
          onChange={handleChange}
        />
        <br />

        <input type="submit" />
      </form>

      <button onClick={() => navigate("/")}>Home</button>
      <button onClick={() => navigate("/signup")}>Signup</button>
    </div>
  );
};

export default Login;
