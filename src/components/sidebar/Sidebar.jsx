import React, { useContext } from "react";
import DesktopSidebar from "@/components/sidebar/DesktopSidebar";
import MobileSidebar from "@/components/sidebar/MobileSidebar";
import { SidebarContext } from "@/context/SidebarContext";

const Sidebar = () => {
  const { navBar } = useContext(SidebarContext);
  
  if (!navBar) return null;
  
  return (
    <>
      <DesktopSidebar />
      <MobileSidebar />
    </>
  );
};

export default Sidebar;
