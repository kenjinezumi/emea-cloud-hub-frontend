import { useContext } from "react";
import { useNavigate } from "react-router-dom";
import GlobalContext from "../context/GlobalContext";

export const useFormNavigation = () => {
  const { formData, updateFormData } = useContext(GlobalContext);
  const navigate = useNavigate();

  const saveAndNavigate = (currentFormData, nextRoute) => {
    updateFormData({ ...formData, ...currentFormData });
    navigate(nextRoute);
  };

  return saveAndNavigate;
};