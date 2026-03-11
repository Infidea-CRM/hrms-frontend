import React, { useContext } from "react";
import useGetCData from "@/hooks/useGetCData";
import NotFoundPage from "@/components/common/NotFoundPage";
import { AdminContext } from "@/context/AdminContext";

const Main = ({ children }) => {
  const { path, accessList } = useGetCData();
  const { state } = useContext(AdminContext);
  const isAdmin = state?.adminInfo?.isAdmin || false;

  const isAdminOnlyRoute = path === "employee-signin-signout-details";
  const hasAccess = isAdminOnlyRoute
    ? isAdmin
    : path === "dashboard" || accessList?.includes(path);

  if (path && !hasAccess) {
    return <NotFoundPage />;
  }
  return (
    <main className="h-full overflow-y-auto">
      <div className="sm:container grid lg:px-6 sm:px-4 px-2 mx-auto">
        {children}
      </div>
    </main>
  );
};

export default Main;
