import React, { useState } from "react";
import { NavLink } from "react-router";
import { useTranslation } from "react-i18next";
import {
  IoChevronDownOutline,
  IoChevronForwardOutline,
  IoRemoveSharp,
} from "react-icons/io5";

const SidebarSubMenu = ({ route }) => {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);

  return (
    <li className="relative px-2 mx-4 mb-1" key={route.name}>
      <button
        className={`w-full flex items-center justify-between px-4 py-3 text-sm font-medium transition-colors duration-150 rounded-lg focus:outline-none ${
          open 
            ? 'bg-teal-50 text-teal-600 dark:bg-gray-700 dark:text-teal-400' 
            : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400'
        }`}
        onClick={() => setOpen(!open)}
        aria-haspopup="true"
      >
        <span className="inline-flex items-center">
          <route.icon className={`w-5 h-5 ${open ? 'text-teal-500' : ''}`} />
          <span className="ml-4">{t(`${route.name}`)}</span>
        </span>
        <span className="transition-transform duration-200 ease-in-out transform">
          {open ? 
            <IoChevronDownOutline className={`w-4 h-4 ${open ? 'text-teal-500' : ''}`} /> : 
            <IoChevronForwardOutline className="w-4 h-4" />
          }
        </span>
      </button>
      <div
        className={`overflow-hidden transition-all duration-300 max-h-0 ${open ? 'max-h-[1000px]' : ''}`}
        aria-label="submenu"
      >
        <ul className="mt-2 ml-2 pl-5 py-1 space-y-1 border-l border-gray-200 dark:border-gray-700">
          {route.routes.map((child, i) => (
            <li key={i + 1} className="py-1">
              {child?.outside ? (
                <a
                  href={import.meta.env.VITE_APP_STORE_DOMAIN}
                  target="_blank"
                  className="flex items-center pl-1 text-sm transition-colors duration-150 text-gray-600 hover:text-emerald-600 dark:text-gray-400 dark:hover:text-emerald-400"
                  rel="noreferrer"
                >
                  <span className="w-1 h-1 mr-3 rounded-full bg-gray-400 dark:bg-gray-600"></span>
                  <span>{t(`${child.name}`)}</span>
                </a>
              ) : (
                <NavLink
                  to={child.path}
                  className={({ isActive }) => 
                    `flex items-center pl-1 text-sm transition-colors duration-150 ${
                      isActive 
                        ? 'text-teal-600 dark:text-teal-400 font-medium' 
                        : 'text-gray-600 dark:text-gray-400 hover:text-teal-600 dark:hover:text-teal-400'
                    }`
                  }
                  rel="noreferrer"
                >
                  {({ isActive }) => (
                    <>
                      <div 
                        className={`w-1 h-1 mr-3 rounded-full ${
                          isActive ? 'bg-teal-500' : 'bg-gray-400 dark:bg-gray-600'
                        }`}
                      ></div>
                      <span>{t(`${child.name}`)}</span>
                    </>
                  )}
                </NavLink>
              )}
            </li>
          ))}
        </ul>
      </div>
    </li>
  );
};

export default SidebarSubMenu;
