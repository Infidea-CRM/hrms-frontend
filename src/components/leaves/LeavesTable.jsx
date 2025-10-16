import React from "react";
import { TableCell, TableBody, TableRow, Badge } from "@windmill/react-ui";
import moment from "moment";
import { formatDayNameDate, formatLongDate, formatLongDateAndTime } from "@/utils/dateFormatter";

const LeavesTable = ({ leaves }) => {
  // Function to calculate duration in days
  const calculateDuration = (startDate, endDate) => {
    const start = moment(startDate);
    const end = moment(endDate);
    const duration = moment.duration(end.diff(start));
    const days = duration.asDays() + 1; // +1 to include both start and end dates
    return days;
  };

  // Function to get status badge color
  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case "approved":
        return "success";
      case "pending":
        return "warning";
      case "rejected":
        return "danger";
      case "cancelled":
        return "neutral";
      default:
        return "primary";
    }
  };

  return (
    <TableBody className="w-full dark:bg-gray-900">
      {leaves.map((leave, index) => (
        <TableRow key={leave._id || index} >
          <TableCell className="text-center">
            <span className="text-sm font-semibold">{leave.leaveType}</span>
          </TableCell>
          <TableCell className="text-center">
            <span className="text-sm">
              {formatLongDate(leave.startDate)}
            </span>
          </TableCell>
          <TableCell className="text-center">
            <span className="text-sm">
              {formatLongDate(leave.endDate)}
            </span>
          </TableCell>
          <TableCell className="text-center">
            <span className="text-sm">
              {calculateDuration(leave.startDate, leave.endDate)} day(s)
            </span>
          </TableCell>
          <TableCell className="text-center">
            <span className="text-sm">{leave.leaveReason}</span>
          </TableCell>
          <TableCell className="text-center">
            <Badge type={getStatusColor(leave.status)}>
              {leave.status}
            </Badge>
          </TableCell>
          <TableCell className="text-center">
            <span className="text-sm">
              {leave.approvedBy || "No"}
            </span>
          </TableCell>
          <TableCell className="text-center">
            <span className="text-sm">
              {formatLongDateAndTime(leave.createdAt)}
            </span>
          </TableCell>
        </TableRow>
      ))}
    </TableBody>
  );
};

export default LeavesTable; 