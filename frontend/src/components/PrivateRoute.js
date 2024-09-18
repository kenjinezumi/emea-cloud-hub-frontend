import React, { useContext } from "react";
import { Navigate } from "react-router-dom";
import GlobalContext from "../context/GlobalContext";

const PrivateRoute = ({ element: Component, ...rest }) => {
  const { user } = useContext(GlobalContext);

  return user ? (
    <Component {...rest} />
  ) : (
    <Navigate to="/login" />
  );
};

export default PrivateRoute;
