import { toast } from "react-toastify";
import React from "react";
import "react-toastify/dist/ReactToastify.css";

const notifySuccess = (message) =>
  toast.success(message, {
    position: "top-center",
    autoClose: 3000,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
    progress: undefined,
  });

const notifyError = (message) =>
  toast.error(message, {
    position: "top-center",
    autoClose: 3000,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
    progress: undefined,
  });

// Custom hook to use toast functionality
const useToast = () => {
  const addToast = ({ type, title, message }) => {
    if (type === "success") {
      notifySuccess(message);
    } else if (type === "danger" || type === "error") {
      notifyError(message);
    } else {
      // Default to using success toast
      notifySuccess(message);
    }
  };

  return { addToast };
};

export { notifySuccess, notifyError, useToast };
