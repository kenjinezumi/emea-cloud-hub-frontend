import { useContext } from "react";
import GlobalContext from "../context/GlobalContext";

const useSaveFormData = () => {
  const { formData, updateFormData } = useContext(GlobalContext);

  const saveFormData = (currentFormData) => {
    updateFormData({ ...formData, ...currentFormData });
  };

  return saveFormData;
};

export default useSaveFormData;
