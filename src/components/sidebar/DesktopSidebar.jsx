import React from "react";
import SidebarContent from "@/components/sidebar/SidebarContent";

const DesktopSidebar = () => {
  return (
    <aside className="z-30 flex-shrink-0 hidden shadow-md w-64 overflow-y-auto bg-white dark:bg-gray-800 lg:block ">
      <div className="sticky top-0 h-screen">
        <SidebarContent/>
      </div>
    </aside>
  );
};

export default DesktopSidebar;
