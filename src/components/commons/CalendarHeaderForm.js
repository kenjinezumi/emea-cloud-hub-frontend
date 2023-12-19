import React from "react";
import { useNavigate } from "react-router-dom";
import logo from "../../assets/svg/logo.svg";
import beta from "../../assets/svg/beta.svg";

const NavigationSidebar = () => {
  const navigate = useNavigate();

  const navigateTo = (path) => {
    navigate(path);
  };

  const handleCancel = () => {
    // Navigate to the main calendar view
    navigate("/");
  };

  return (
    <div className="fixed right-0 top-16 h-[calc(100vh-64px)] w-60 bg-white shadow-md p-4">
      {" "}
      <button
        onClick={() => navigateTo("/create-event")}
        className="block w-full text-left p-2 hover:bg-gray-200 rounded"
      >
        About
      </button>
      <button
        onClick={() => navigateTo("/location")}
        className="block w-full text-left p-2 hover:bg-gray-200 rounded"
      >
        Location
      </button>
      <button
        onClick={() => navigateTo("/extra")}
        className="block w-full text-left p-2 hover:bg-gray-200 rounded"
      >
        Extra
      </button>
      <button
        onClick={() => navigateTo("/audience")}
        className="block w-full text-left p-2 hover:bg-gray-200 rounded"
      >
        Audience
      </button>
      <button
        onClick={() => navigateTo("/links")}
        className="block w-full text-left p-2 hover:bg-gray-200 rounded"
      >
        Links
      </button>
      <hr className="my-4" />
      <button
        onClick={handleCancel}
        className="block w-full text-left p-2 hover:bg-gray-200 rounded text-red-500"
      >
        Cancel
      </button>
    </div>
  );
};

export default function CalendarHeaderForm() {
  const navigate = useNavigate();

 

  return (
    <>
      <NavigationSidebar />
      <header className="px-4 py-2 flex items-center justify-between">
        <div className="flex items-center">
          <img src={logo} alt="calendar" className="mr-2 w-12 h-12" />
          <h1 className="mr-10 text-xl text-gray-500 font-bold">
            EMEA Cloud Hub
          </h1>
          <img src={beta} alt="beta" className="mr-2 w-12 h-12" />
        </div>
       
      </header>
    </>
  );
}
