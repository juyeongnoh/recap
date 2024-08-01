import React, { useEffect, useState } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import { auth } from "../firebase";

const MainLayout = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const { currentUser } = auth;
    if (!currentUser) navigate("/");
    setLoading(false);
  }, []);

  return loading ? <div>Loading...</div> : <Outlet />;
};

export default MainLayout;
