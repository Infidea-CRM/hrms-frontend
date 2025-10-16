import { lazy } from "react";

// use lazy for better code splitting
const Dashboard = lazy(() => import("@/pages/Dashboard"));
const Page404 = lazy(() => import("@/pages/404"));
const EditProfile = lazy(() => import("@/pages/EditProfile"));
const Notifications = lazy(() => import("@/pages/Notifications"));
const CallInfo = lazy(() => import("@/pages/Call_Info"));
const CallDetails = lazy(() => import("@/pages/CallDetails"));
const Joinings = lazy(() => import("@/pages/Joinings"));
const Lineups = lazy(() => import("@/pages/Lineups"));
const Walkins = lazy(() => import("@/pages/Walkins"));
const Activities = lazy(() => import("@/pages/Activities"));
const Leaves = lazy(() => import("@/pages/Leaves"));
const Notes = lazy(() => import("@/pages/Notes"));

/*
//  * ⚠ These are internal routes!
//  * They will be rendered inside the app, using the default `containers/Layout`.
//  * If you want to add a route to, let's say, a landing page, you should add
//  * it to the `App`'s router, exactly like `Login`, `CreateAccount` and other pages
//  * are routed.
//  *
//  * If you're looking for the links rendered in the SidebarContent, go to
//  * `routes/sidebar.js`
 */

const routes = [
  {
    path: "/dashboard",
    component: Dashboard,
  },
  {
    path: "/activities",
    component: Activities,
  },
  {
    path: "/leaves",
    component: Leaves,
  },
  {
    path: "/404",
    component: Page404,
  },
  {
    path: "/edit-profile",
    component: EditProfile,
  },
  {
    path: "/notifications",
    component: Notifications,
  },
  {
    path: "/call-info",
    component: CallInfo,
  },
  {
    path: "/call-details",
    component: CallDetails,
  },
  {
    path: "/joinings",
    component: Joinings,
  },
  {
    path: "/lineups",
    component: Lineups,
  },
  {
    path: "/walkins",
    component: Walkins,
  },
  {
    path: "/notes",
    component: Notes,
  },
];

const routeAccessList = [
  // {
  //   label: "Root",
  //   value: "/",
  // },
  { label: "Dashboard", value: "dashboard" },
  { label: "Notifications", value: "notifications" },
  { label: "Edit Profile", value: "edit-profile" },
  { label: "Notification", value: "notifications" },
  { label: "Call Info", value: "call-info" },
  { label: "Call Details", value: "call-details" },
  { label: "Joinings", value: "joinings" },
  { label: "Lineups", value: "lineups" },
  { label: "Walkins", value: "walkins" },
  { label: "Activities", value: "activities" },
  { label: "Leaves", value: "leaves" },
  { label: "Notes", value: "notes" },
];

export { routeAccessList, routes };
