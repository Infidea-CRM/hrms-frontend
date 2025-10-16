import React, { useContext, useRef, forwardRef } from "react";
import { IoClose } from "react-icons/io5";

//internal import
import SidebarContent from "@/components/sidebar/SidebarContent";
import { SidebarContext } from "@/context/SidebarContext";

// Custom Transition component that doesn't use findDOMNode
const CustomTransition = forwardRef(({ show, children, enter, enterFrom, enterTo, leave, leaveFrom, leaveTo, className }, ref) => {
  if (!show) return null;
  
  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
});

// Custom Backdrop component that doesn't use findDOMNode
const CustomBackdrop = forwardRef(({ onClick, className }, ref) => {
  return (
    <div 
      ref={ref}
      onClick={onClick}
      className={`fixed inset-0 z-40 bg-gray-900/50 backdrop-blur-sm ${className || ''}`}
    />
  );
});

function MobileSidebar() {
  const { isSidebarOpen, closeSidebar } = useContext(SidebarContext);
  const backdropRef = useRef(null);
  const sidebarRef = useRef(null);
  const parentRef = useRef(null);

  if (!isSidebarOpen) return null;

  return (
    <div ref={parentRef}>
      <CustomBackdrop 
        onClick={closeSidebar} 
        ref={backdropRef}
        className="backdrop-blur-sm bg-gray-900/50" 
      />

      <aside 
        className="fixed inset-y-0 z-50 flex flex-col w-72 max-w-[85%] mt-0 overflow-hidden bg-white dark:bg-gray-800 shadow-lg lg:hidden transform translate-x-0"
        ref={sidebarRef}
      >
        <div className="flex items-center justify-between px-6 py-3 border-b dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-700 dark:text-gray-200">Menu</h2>
          <button 
            onClick={closeSidebar}
            className="p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-600 hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            <IoClose className="w-5 h-5 text-gray-500 dark:text-gray-400" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto">
          <SidebarContent />
        </div>
      </aside>
    </div>
  );
}

export default MobileSidebar;
