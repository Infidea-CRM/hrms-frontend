import { TableBody, TableCell, TableRow } from "@windmill/react-ui";
import { useTranslation } from "react-i18next";

// Internal imports
import { formatLongDate, formatLongDateAndTime } from "@/utils/dateFormatter";
import { FaEdit, FaEye } from "react-icons/fa";
import { getStatusColorClass } from "@/utils/optionsData";

const LineupsTable = ({lineups, onView, onEdit, searchTerm = "", highlightText}) => {

  // Helper function to get status color
  const getStatusColor = (status) => {
    return getStatusColorClass(status);
  };

  return (
    <>
      <TableBody className="dark:bg-gray-900">
        {lineups?.map((lineup, i) => (
          <TableRow key={i} className="text-center hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer transition-colors duration-150" onClick={()=>onView(lineup)}>

            {/* Actions*/}
          <TableCell className="flex justify-center items-center">
            <div className="flex space-x-2">
              <button
                onClick={() => onView(lineup)}
                className="p-1 rounded-full bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-900 text-blue-600 hover:text-blue-700 dark:hover:text-blue-500"
                title="View details"
              >
                <FaEye className="w-3.5 h-3.5" />
              </button>
              {lineup.editable && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onEdit(lineup);
                  }}
                  className="p-1 rounded-full bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-900 text-green-600 hover:text-green-700 dark:hover:text-green-500"
                  title="Edit"
              >
                <FaEdit className="w-3.5 h-3.5" />
              </button>
              )}
            </div>
          </TableCell>

          {/* Lineup Counts */}
          <TableCell>
            <span className="text-sm font-semibold rounded-full bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300 text-xs font-medium px-1.5 py-0.5">{lineup?.candidateLineupCount}</span>
          </TableCell>

           {/* Entry Date */}
           <TableCell>
            <span className="text-sm">{formatLongDateAndTime(lineup?.createdAt)}</span>
          </TableCell>

            {/* Entry Updated Date */}
            <TableCell>
            <span className="text-sm">{formatLongDateAndTime(lineup?.updatedAt)}</span>
          </TableCell>

          {/* Name */}
          <TableCell>
            <span className="text-sm">
              {searchTerm ? highlightText(lineup?.name || lineup?.candidateName, searchTerm) : (lineup?.name || lineup?.candidateName)}
            </span>
          </TableCell>

          {/* Contact Number */}
          <TableCell>
            <span className="text-sm">
              {searchTerm ? highlightText(lineup?.contactNumber, searchTerm) : lineup?.contactNumber}
            </span>
          </TableCell>

          
          {/* Status*/}
          <TableCell>
          <span className={`px-1.5 py-0.5 text-xs rounded-full ${getStatusColor(lineup?.status)}`}>
            {searchTerm ? highlightText(lineup?.status, searchTerm) : lineup?.status}
          </span>
          </TableCell>

          {/* Company */}
          <TableCell>
            <span className="text-sm">
              {searchTerm ? highlightText(lineup?.company, searchTerm) : lineup?.company}
            </span>
          </TableCell>
          
          {/* Process */}
          <TableCell>
            <span className="text-sm">
              {searchTerm ? highlightText(lineup?.process, searchTerm) : lineup?.process}
            </span>
          </TableCell>

        {/* Registered By */}
        <TableCell>
          <span className="text-sm">
            {lineup?.createdBy?.name?.en || lineup?.createdBy?.name || "Unknown"}
          </span>
        </TableCell>

        {/* Lineup Date */}
        <TableCell>
          <span className="text-sm" >
            {formatLongDate(lineup?.lineupDate)}
          </span>
        </TableCell>

         {/* Interview Date */}
         <TableCell>
          <span className="text-sm" >
            {formatLongDate(lineup?.interviewDate)}
          </span>
        </TableCell>

      
      </TableRow>
    ))}
  </TableBody>
</>
);
};

export default LineupsTable; 