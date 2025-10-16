import { FileLineChart } from "lucide-react";
import { BsFillBriefcaseFill } from "react-icons/bs";
import {
  FiGrid,
  FiUsers,
  FiUser,
  FiSettings,
  FiGlobe,
  FiBriefcase,
  FiPhoneCall,
  FiActivity,
  FiCalendar,
  FiFileText,
} from "react-icons/fi";
import { IoDocument } from "react-icons/io5";
import {
  MdEditDocument,
  MdDirectionsWalk,
  MdJoinFull,
  MdLocalActivity,
  MdHistory,
} from "react-icons/md";

/**
 * ⚠ These are used just to render the Sidebar!
 * You can include any link here, local or external.
 *
 * If you're looking to actual Router routes, go to
 * `routes/index.js`
 */
const sidebar = [
  {
    path: "/dashboard", // the url
    icon: FiGrid, // icon
    name: "Dashboard", // name that appear in Sidebar
  },
  {
    path: "/call-info",
    icon: FiPhoneCall,
    name: "Try a Call",
  },
  {
    path: "/call-details",
    icon: MdEditDocument,
    name: "Call Details",
  },
  {
    path: "/lineups",
    icon: FileLineChart,
    name: "Lineups",
  },
  {
    path: "/walkins",
    icon: MdDirectionsWalk,
    name: "Walkins",
  },
  {
    path: "/joinings",
    icon: MdJoinFull,
    name: "Joinings",
  },
  {
    path: "/leaves",
    icon: FiCalendar,
    name: "Leaves",
  },
  {
    path: "/activities",
    icon: MdHistory,
    name: "Activities",
  },
  {
    path: "/notes",
    icon: FiFileText,
    name: "Notes",
  },

  // {
  //   path: "/users",
  //   icon: FiUsers,
  //   name: "Users",
  // },

  // {
  //   path: "/jobs",
  //   icon: FiBriefcase,
  //   name: "Jobs",
  // },

  // {
  //   path: "/applicants",
  //   icon: IoDocument,
  //   name: "Applicants",
  // },

  // {
  //   path: "/our-staff",
  //   icon: FiUser,
  //   name: "OurStaff",
  // },

  // {
  //   path: "/companies",
  //   icon: FiBriefcase,
  //   name: "Companies",
  // },

  // {
  //   path: "/manage-companies",
  //   icon: FiBriefcase,
  //   name: "ManageCompanies",
  // },

  // {
  //   path: "/post-job",
  //   icon: BsFillBriefcaseFill,
  //   name: "PostJob",
  // },

  // {
  //   path: "/settings?settingTab=common-settings",
  //   icon: FiSettings,
  //   name: "Settings",
  // },
  // {
  //   icon: FiGlobe,
  //   name: "International",
  //   routes: [
  //     {
  //       path: "/languages",
  //       name: "Languages",
  //     },
  //   ],
  // },
];

export default sidebar;
