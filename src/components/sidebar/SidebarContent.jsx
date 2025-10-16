import React, { useContext } from "react";
import { NavLink } from "react-router";
import { useTranslation } from "react-i18next";
import { WindmillContext } from "@windmill/react-ui";
import { IoLogOutOutline, IoSettingsOutline, IoPersonOutline } from "react-icons/io5";

//internal import
import sidebar from "@/routes/sidebar";
import logoDark from "@/assets/img/logo/infidea_icon.png";
import logoLight from "@/assets/img/logo/infidea_icon.png";
import { AdminContext } from "@/context/AdminContext";
import SidebarSubMenu from "@/components/sidebar/SidebarSubMenu";
import useGetCData from "@/hooks/useGetCData";

const SidebarContent = () => {
  const { t } = useTranslation();
  const { mode } = useContext(WindmillContext);
  const { state, dispatch } = useContext(AdminContext);
  const { adminInfo } = state || {};
  const { accessList } = useGetCData();



  const updatedSidebar = sidebar
    .map((route) => {
      // Filter sub-routes if they exist
      if (route.routes) {
        const validSubRoutes = route.routes.filter((subRoute) => {
          const routeKey = subRoute.path.split("?")[0].split("/")[1];
          return accessList.includes(routeKey);
        });

        // Only include the route if it has valid sub-routes
        if (validSubRoutes.length > 0) {
          return { ...route, routes: validSubRoutes };
        }
        return null; // Exclude the main route if no sub-routes are valid
      }
      // Handle top-level route: check root path part
      const routeKey = route.path?.split("?")[0].split("/")[1];
      return routeKey && accessList.includes(routeKey) ? route : null;
    })
    .filter(Boolean);

  return (
    <div className="flex flex-col h-full justify-between py-4 text-gray-500 dark:text-gray-400">
      <div>
        <div className="flex justify-center items-center py-3">
          <a className="text-gray-900 dark:text-gray-200" href="/dashboard">
            {mode === "dark" ? (
              <img src={logoLight} alt="Infidea" width="100" />
            ) : (
              <img src={logoDark} alt="Infidea" width="100" />
            )}
          </a>
        </div>
        
       
        <ul className="mt-6 overflow-y-auto max-h-[calc(100vh-250px)]">
          {updatedSidebar?.map((route) =>
            route.routes ? (
              <SidebarSubMenu route={route} key={route.name} />
            ) : (
              <li className="relative px-2 mx-4" key={route.name}>
                <NavLink
                  to={route.path}
                  target={`${route?.outside ? "_blank" : "_self"}`}
                  className={({ isActive }) => 
                    `flex items-center px-4 py-3 mb-1 text-sm font-medium rounded-lg ${
                      isActive 
                        ? 'bg-emerald-50 text-emerald-600 dark:bg-gray-700 dark:text-emerald-400' 
                        : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400'
                    }`
                  }
                  rel="noreferrer"
                >
                  {({ isActive }) => (
                    <>
                      <route.icon className={`w-5 h-5 ${isActive ? 'text-emerald-500' : ''}`} />
                      <span className="ml-4">{t(`${route.name}`)}</span>
                    </>
                  )}
                </NavLink>
              </li>
            )
          )}
        </ul>
      </div>
      
      {adminInfo && (
        <div className="mt-auto border-t dark:border-gray-700 pt-3 px-6">
          
          <div className="flex items-center justify-between space-x-2 pb-4">
            <NavLink
              to="/edit-profile"
              className="flex-1 flex items-center justify-center p-2 text-sm font-medium rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400"
            >
              <IoSettingsOutline className="w-5 h-5" />
              <span className="ml-2">{t("Edit Profile")}</span>
            </NavLink>
          </div>
        </div>
      )}
    </div>
  );
};

export default SidebarContent;
