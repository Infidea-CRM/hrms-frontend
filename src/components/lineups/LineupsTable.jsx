import React from "react";
import { Table } from "antd";
import { FaEdit, FaEye } from "react-icons/fa";
import { formatLongDate, formatLongDateAndTime } from "@/utils/dateFormatter";
import { getStatusColorClass } from "@/utils/optionsData";

const LineupsTable = ({ 
  lineups, 
  onView, 
  onEdit, 
  searchTerm = "", 
  highlightText,
  loading = false
}) => {

  // Helper function to get status color
  const getStatusColor = (status) => {
    return getStatusColorClass(status);
  };

  // Define columns for Ant Design Table
  const columns = [
    {
      title: "Actions",
      key: "actions",
      width: 80,
      align: "center",
      fixed: "left",
      render: (_, lineup) => (
        <div className="flex justify-center items-center space-x-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onView(lineup);
            }}
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
      ),
    },
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
      align: "center",
      render: (text, lineup) => (
        <span className="text-sm">
          {searchTerm ? highlightText(lineup?.name || lineup?.candidateName, searchTerm) : (lineup?.name || lineup?.candidateName)}
        </span>
      ),
    },
    {
      title: "Contact Number",
      dataIndex: "contactNumber",
      key: "contactNumber",
      align: "center",
      render: (text) => (
        <span className="text-sm">
          {searchTerm ? highlightText(text, searchTerm) : text}
        </span>
      ),
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      align: "center",
      render: (status) => (
        <span className={`px-1.5 py-0.5 text-xs rounded-full ${getStatusColor(status)}`}>
          {searchTerm ? highlightText(status, searchTerm) : status}
        </span>
      ),
    },
    {
      title: "Company",
      dataIndex: "company",
      key: "company",
      align: "center",
      render: (text) => (
        <span className="text-sm">
          {searchTerm ? highlightText(text, searchTerm) : text}
        </span>
      ),
    },
    {
      title: "Process",
      dataIndex: "process",
      key: "process",
      align: "center",
      render: (text) => (
        <span className="text-sm">
          {searchTerm ? highlightText(text, searchTerm) : text}
        </span>
      ),
    },
    {
      title: "Registered By",
      dataIndex: "createdBy",
      key: "createdBy",
      align: "center",
      render: (createdBy) => (
        <span className="text-sm">
          {createdBy?.name?.en || createdBy?.name || "Unknown"}
        </span>
      ),
    },
    {
      title: "Lineup Date",
      dataIndex: "lineupDate",
      key: "lineupDate",
      align: "center",
      render: (date) => (
        <span className="text-sm">{formatLongDate(date)}</span>
      ),
    },
    {
      title: "Interview Date",
      dataIndex: "interviewDate",
      key: "interviewDate",
      align: "center",
      render: (date) => (
        <span className="text-sm">{formatLongDate(date)}</span>
      ),
    },
    {
      title: "Lineup Counts",
      dataIndex: "candidateLineupCount",
      key: "lineupCounts",
      align: "center",
      render: (count) => (
        <span className="text-sm font-semibold rounded-full bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300 text-xs font-medium px-1.5 py-0.5">
          {count}
        </span>
      ),
    },
    {
      title: "Entry Date",
      dataIndex: "createdAt",
      key: "entrytime",
      align: "center",
      render: (date) => (
        <span className="text-sm">{formatLongDateAndTime(date)}</span>
      ),
    },
    {
      title: "Updated Date",
      dataIndex: "updatedAt",
      key: "updatedate",
      align: "center",
      render: (date) => (
        <span className="text-sm">{formatLongDateAndTime(date)}</span>
      ),
    },
  ];

  return (
    <Table
      columns={columns}
      dataSource={lineups}
      rowKey={(record) => record._id || record.id}
      pagination={false}
      loading={loading}
      scroll={{ x: 1200 }}
      size="middle"
      className="lineups-antd-table"
      onRow={(record) => ({
        onClick: () => onView(record),
        className: "cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-150",
      })}
      rowClassName={() => "text-center"}
    />
  );
};

export default LineupsTable;
