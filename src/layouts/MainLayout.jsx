import React, { useEffect, useState } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import { auth } from "../firebase";

const MainLayout = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  const checkAuth = async () => {
    await auth.authStateReady();
    const { currentUser } = auth;
    if (!currentUser) navigate("/login");
    setLoading(false);
  };

  useEffect(() => {
    checkAuth();
  }, []);

  return loading ? <div>Loading...</div> : <Outlet />;
};

export default MainLayout;
