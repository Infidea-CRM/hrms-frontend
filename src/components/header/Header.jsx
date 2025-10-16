import { Avatar, WindmillContext } from "@windmill/react-ui";
import React, { useContext, useEffect, useRef, useState } from "react";
import { notifyError } from "@/utils/toast";
import { removeCookie } from "@/hooks/useLoginSubmit";

import {
  FiLogOut,
  FiMenu,
  FiSun,
  FiMoon,
  FiClock,
} from "react-icons/fi";
import { Link } from "react-router";
import { useTranslation } from "react-i18next";

//internal import
import { AdminContext } from "@/context/AdminContext";
import { SidebarContext } from "@/context/SidebarContext";
import ActivityDropdown from "@/components/header/ActivityDropdown";
import NotificationDropdown from "@/components/notification/NotificationDropdown";
import EmployeeServices from "@/services/EmployeeServices";
import { formatDayNameDate } from "@/utils/dateFormatter";

const Header = () => {
    const { toggleSidebar, setNavBar, navBar } =
    useContext(SidebarContext);
  const { state, dispatch } = useContext(AdminContext);
  const { adminInfo } = state;
  const { mode, toggleMode } = useContext(WindmillContext);
  const pRef = useRef();
  const nRef = useRef();

  const { t } = useTranslation();

  const [profileOpen, setProfileOpen] = useState(false);
  const [onDeskData, setOnDeskData] = useState({
    date: "",
    firstOnDeskTime: null,
    productiveTimeInMinutes: 0,
    formattedProductiveTime: "0h 0m",
    onDeskActivitiesCount: 0,
  });

  const handleLogOut = async () => {
    try {
      await EmployeeServices.logoutEmployee();
      dispatch({ type: "USER_LOGOUT" });
      removeCookie("adminInfo");
    } catch (err) {
      notifyError(err?.response?.data?.message || err?.message);
    }
  };

  const handleProfileOpen = () => {
    setProfileOpen(!profileOpen);
  };

  // handle fetch on desk data
  const fetchOnDeskData = async () => {
    try {
      const res = await EmployeeServices.getOnDeskData();
      setOnDeskData({
        date: res.date,
        firstOnDeskTime: res.firstActivityTime,
        productiveTimeInMinutes: res.totalTimeInMinutes,
        formattedProductiveTime: res.formattedTotalTime,
        onDeskActivitiesCount: res.activitiesCount,
      });
    } catch (err) {
      notifyError(err?.response?.data?.message || err?.message);
    }
  };

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (!pRef?.current?.contains(e.target)) {
        setProfileOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
  }, [pRef]);

  // fetch on desk data
  useEffect(() => {
    fetchOnDeskData();
    
    // Refresh on-desk data every minute
    const interval = setInterval(() => {
      fetchOnDeskData();
    }, 60000);
    
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      <header className="z-30 py-3 md:py-4 bg-white shadow-sm dark:bg-gray-800">
        <div className="container flex items-center justify-between h-full px-3 md:px-6 mx-auto text-emerald-500 dark:text-emerald-500">
          <button
            type="button"
            onClick={() => setNavBar(!navBar)}
            className="hidden lg:block outline-0 focus:outline-none p-1 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-150"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 18 18"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M4 6h16M4 12h16M4 18h16"
              ></path>
            </svg>
          </button>

          {/* <!-- Mobile hamburger --> */}
          <button
            className="p-1 mr-2 md:mr-5 -ml-1 rounded-md lg:hidden focus:outline-none hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-150"
            onClick={toggleSidebar}
            aria-label="Menu"
          >
            <FiMenu className="w-5 h-5 md:w-6 md:h-6" aria-hidden="true" />
          </button>
          
          <span className="flex-1"></span>

          <div className="items-center mr-2 md:mr-5">
            <div className="flex items-center space-x-2 md:space-x-3">
              <span className="text-stone-600 hidden sm:hidden md:inline text-[10px] sm:text-xs md:text-sm font-semibold font-mono dark:text-stone-300">{formatDayNameDate(onDeskData.date)}</span>
            </div>
          </div>

          <ul className="flex justify-end items-center flex-shrink-0 space-x-1 md:space-x-6">
            {/* <!-- On Desk Information --> */}
            <li className="flex items-center text-[10px] sm:text-xs md:text-sm">
              <div className="flex items-center px-2 py-1 bg-emerald-50 dark:bg-emerald-900/20 rounded-md">
                <div className="flex items-center">
                  <FiClock className="text-emerald-500 dark:text-emerald-300 w-3 h-3 md:w-4 md:h-4 mr-1 md:mr-2" />
                  <Link to="/activities">
                    <span 
                      className="font-medium text-emerald-600 dark:text-emerald-300 cursor-pointer hover:underline" 
                    >
                      {onDeskData.formattedProductiveTime}
                    </span>
                  </Link>
                </div>
              </div>
            </li>

            {/* Activity Dropdown */}
            <li className="flex">
              <ActivityDropdown onDeskCount={onDeskData.onDeskActivitiesCount} />
            </li>

            {/* <!-- Theme toggler --> */}
            <li className="flex">
              <button
                className="rounded-md focus:outline-none p-1 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-150"
                onClick={toggleMode}
                aria-label="Toggle color mode"
              >
                {mode === "dark" ? (
                  <FiSun className="w-4 h-4 md:w-5 md:h-5" aria-hidden="true" />
                ) : (
                  <FiMoon className="w-4 h-4 md:w-5 md:h-5" aria-hidden="true" />
                )}
              </button>
            </li>

            {/* <!-- Notifications menu --> */}
            <li className="flex">
              <NotificationDropdown notificationRef={nRef} />
            </li>

            {/* <!-- Profile menu --> */}
            <li className="relative inline-block text-left" ref={pRef}>
              <button
                className="rounded-full bg-gray-100 dark:bg-gray-600 text-white h-7 w-7 sm:h-8 sm:w-8 md:h-9 md:w-9 font-medium mx-auto focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-emerald-500 dark:focus:ring-offset-gray-800 flex items-center justify-center overflow-hidden"
                onClick={handleProfileOpen}
              >
                {adminInfo?.user.profileImage ? (
                 <img
                 className="h-12 w-12 rounded-full object-contain bg-gray-100"
                 src={`${adminInfo.user.profileImage}`}
                 alt="Profile"
               />
                ) : (
                  <span className="text-xs sm:text-sm md:text-base flex items-center justify-center leading-none text-gray-600 dark:text-gray-200">{adminInfo.user.name.en[0].toUpperCase()}</span>
                )}
              </button>

              {profileOpen && (
                <ul className="origin-top-right absolute right-0 mt-2 w-48 md:w-56 rounded-md shadow-lg bg-white dark:bg-gray-800 ring-1 ring-black ring-opacity-5 divide-y divide-gray-100 dark:divide-gray-700 focus:outline-none">
                  <li className="px-4 py-3">
                    <div className="flex items-center space-x-3">
                      <div className="flex-shrink-0">
                        {adminInfo?.user.profileImage ? (
                          <img
                            className="h-12 w-12 rounded-full object-contain bg-gray-100"
                            src={`${adminInfo.user.profileImage}`}
                            alt="Profile"
                          />
                        ) : (
                          <div className="h-10 w-10 rounded-full bg-emerald-100 dark:bg-emerald-700 flex items-center justify-center">
                            <span className="text-sm font-medium text-emerald-600 dark:text-emerald-200">
                              {adminInfo.user.name.en[0].toUpperCase()}
                            </span>
                          </div>
                        )}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-700 dark:text-gray-200">
                          {adminInfo.user.name.en}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {adminInfo.user.employeeCode}
                        </p>
                      </div>
                    </div>
                  </li>
                  <li className="px-4 py-3">
                    <p className="text-xs italic text-gray-500 dark:text-gray-400 leading-relaxed">
                      "Every logout is a step toward balance. Great work today—let's make tomorrow even better!"
                    </p>
                  </li>
                  <li>
                    <button
                      onClick={handleLogOut}
                      className="w-full flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-150"
                    >
                      <FiLogOut className="w-4 h-4 mr-3 text-gray-500 dark:text-gray-400" aria-hidden="true" />
                      <span>{t("LogOut")}</span>
                    </button>
                  </li>
                </ul>
              )}
            </li>
          </ul>
        </div>
      </header>
    </>
  );
};

export default Header;
