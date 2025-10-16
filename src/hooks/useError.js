import { useContext } from "react";
import { removeCookie } from "@/hooks/useLoginSubmit";

//internal import
import { notifyError } from "@/utils/toast";
import { AdminContext } from "@/context/AdminContext";

const useError = () => {
  const { dispatch } = useContext(AdminContext);

  const handleErrorNotification = async (err, time = 100) => {
    // console.log(`handleErrorNotification, error on ${from}`, err);
    if (err.includes("status code 401")) {
      // console.log("inside", err);
      try {
        dispatch({ type: "USER_LOGOUT" });
        // Remove authentication/session cookies
        removeCookie("adminInfo");
        removeCookie("company");
        removeCookie("token");
      } catch (error) {
        console.error("Logout error", error);
      }
    } else {
      notifyError(err, time);
    }
  };

  return {
    handleErrorNotification,
  };
};

export default useError;
