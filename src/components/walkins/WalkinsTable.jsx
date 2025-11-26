import { TableBody, TableCell, TableRow } from "@windmill/react-ui";
import { useTranslation } from "react-i18next";

// Internal imports
import {formatLongDateAndTime } from "@/utils/dateFormatter";
import { FaEdit, FaEye } from "react-icons/fa";
import { getStatusColorClass } from "@/utils/optionsData";

const WalkinsTable = ({walkins, onView, onEdit, searchTerm = "", highlightText}) => {

  // Helper function to get status color
  const getStatusColor = (status) => {
    return getStatusColorClass(status);
  };

  return (
    <>
      <TableBody className="dark:bg-gray-900">
        {walkins?.map((walkin, i) => (
          <TableRow key={i} className="text-center" onClick={() => onView(walkin)}>

            {/* Actions*/}
          <TableCell className="flex justify-center items-center">
            <div className="flex space-x-2">
              <button
                onClick={() => onView(walkin)}
                className="p-1 rounded-full bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-900 text-blue-600 hover:text-blue-700 dark:hover:text-blue-500"
                title="View details"
              >
                <FaEye className="w-3.5 h-3.5" />
              </button>
              {walkin?.editable && <button
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit(walkin);
                }}
                className="p-1 rounded-full bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-900 text-green-600 hover:text-green-700 dark:hover:text-green-500"
                title="Edit"
              >
                <FaEdit className="w-3.5 h-3.5" />
              </button>}
            </div>
          </TableCell>

           {/* Entry Date */}
           <TableCell>
            <span className="text-sm">{formatLongDateAndTime(walkin?.createdAt)}</span>
          </TableCell>

            {/* Entry Updated Date */}
            <TableCell>
            <span className="text-sm">{formatLongDateAndTime(walkin?.updatedAt)}</span>
          </TableCell>

          {/* Name */}
          <TableCell>
            <span className="text-sm">
              {searchTerm ? highlightText(walkin?.candidateName, searchTerm) : walkin?.candidateName}
            </span>
          </TableCell>

          {/* Contact Number */}
          <TableCell>
            <span className="text-sm">
              {searchTerm ? highlightText(walkin?.contactNumber, searchTerm) : walkin?.contactNumber}
            </span>
          </TableCell>

        {/* Registered By */}
        <TableCell>
          <span className="text-sm">
            {walkin?.createdBy?.name?.en || walkin?.createdBy?.name || "Unknown"}
          </span>
        </TableCell>

        {/* Walkin Date */}
        <TableCell>
          <span className="text-sm" >
            {formatLongDateAndTime(walkin?.walkinDate)}
          </span>
        </TableCell>

          {/* Status*/}
          <TableCell>
          <span className={`px-1.5 py-0.5 text-xs rounded-full ${getStatusColor(walkin?.status)}`}>
            {searchTerm ? highlightText(walkin?.status, searchTerm) : walkin?.status}
          </span>
          </TableCell>
      
      </TableRow>
    ))}
  </TableBody>
</>
);
};

export default WalkinsTable; 