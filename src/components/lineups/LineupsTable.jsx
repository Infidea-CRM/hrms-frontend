import React from "react";
import { Table } from "antd";
import { FaEdit, FaComment, FaCopy } from "react-icons/fa";
import { formatLongDate, format12HourTime } from "@/utils/dateFormatter";
import { lineupStatusOptions, getLineupStatusColorClass } from "@/utils/optionsData";
import { copySingleCandidate } from "@/utils/copyUtils";

const LineupsTable = ({ 
  lineups, 
  onEdit, 
  onRemarks,
  onStatusChange,
  searchTerm = "", 
  highlightText,
  loading = false,
  // Selection props
  selectedLineups = [],
  onLineupSelection,
  selectAll = false,
  onSelectAll
}) => {

  // Helper function to get status color
  const getStatusColor = (status) => {
    return getLineupStatusColorClass(status);
  };

  // Handle individual copy
  const handleCopy = (e, lineup) => {
    copySingleCandidate(lineup, {
      nameField: 'name',
      mobileField: 'contactNumber',
      whatsappField: 'whatsappNo'
    }, e);
  };

  // Define columns for Ant Design Table
  const columns = [
    // Selection checkbox column
    {
      title: (
        <input
          type="checkbox"
          checked={selectAll}
          onChange={() => onSelectAll && onSelectAll()}
          className="w-4 h-4 cursor-pointer accent-blue-600"
        />
      ),
      key: "selection",
      width: 50,
      align: "center",
      render: (_, lineup) => (
        <input
          type="checkbox"
          checked={selectedLineups.includes(lineup._id)}
          onChange={(e) => {
            e.stopPropagation();
            onLineupSelection && onLineupSelection(lineup._id, e.target.checked);
          }}
          onClick={(e) => e.stopPropagation()}
          className="w-4 h-4 cursor-pointer accent-blue-600"
        />
      ),
    },
    {
      title: "Recruiter Name",
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
      title: "Candidate Name",
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
      render: (text, lineup) => (
        <div className="flex items-center justify-center gap-2">
          <span className="text-sm">
            {searchTerm ? highlightText(text, searchTerm) : text}
          </span>
          <button
            onClick={(e) => handleCopy(e, lineup)}
            className="p-1 rounded-full bg-teal-100 dark:bg-teal-900/30 hover:bg-teal-200 dark:hover:bg-teal-900/50 text-teal-600 dark:text-teal-400"
            title="Copy candidate data"
          >
            <FaCopy className="w-3 h-3" />
          </button>
        </div>
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
      title: "Lineup Date",
      dataIndex: "lineupDate",
      key: "lineupDate",
      align: "center",
      render: (date) => (
        <div className="flex flex-col items-center">
          <span className="text-sm font-medium">{formatLongDate(date)}</span>
          <span className="text-xs text-gray-500 dark:text-gray-400">{format12HourTime(date)}</span>
        </div>
      ),
    },
    {
      title: "Interview Date",
      dataIndex: "interviewDate",
      key: "interviewDate",
      align: "center",
      render: (date) => (
        <div className="flex flex-col items-center">
          <span className="text-sm font-medium">{formatLongDate(date)}</span>
          <span className="text-xs text-gray-500 dark:text-gray-400">{format12HourTime(date)}</span>
        </div>
      ),
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      align: "center",
      width: 140,
      render: (status, lineup) => (
        lineup.editable ? (
          <select
            value={status}
            onChange={(e) => {
              e.stopPropagation();
              onStatusChange(lineup, e.target.value);
            }}
            onClick={(e) => e.stopPropagation()}
            className={`px-2 py-1 text-xs rounded-md border-0 cursor-pointer font-medium focus:ring-2 focus:ring-blue-500 ${getStatusColor(status)}`}
          >
            {lineupStatusOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        ) : (
          <span className={`px-2 py-1 text-xs rounded-full font-medium ${getStatusColor(status)}`}>
            {status}
          </span>
        )
      ),
    },
    {
      title: "Remarks",
      dataIndex: "remarks",
      key: "remarks",
      align: "center",
      width: 100,
      render: (remarks, lineup) => (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onRemarks(lineup);
          }}
          className="flex items-center justify-center gap-1 px-2 py-1 rounded-md bg-purple-100 dark:bg-purple-900/30 hover:bg-purple-200 dark:hover:bg-purple-900/50 text-purple-700 dark:text-purple-300 transition-colors"
          title="View/Add Remarks"
        >
          <FaComment className="w-3 h-3" />
          <span className="text-xs font-medium">{remarks?.length || 0}</span>
        </button>
      ),
    },
    {
      title: "Actions",
      key: "actions",
      width: 60,
      align: "center",
      render: (_, lineup) => (
        <div className="flex justify-center items-center">
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
  ];

  return (
    <Table
      columns={columns}
      dataSource={lineups}
      rowKey={(record) => record._id || record.id}
      pagination={false}
      loading={loading}
      scroll={{ x: 1300 }}
      size="middle"
      className="lineups-antd-table"
      rowClassName={() => "text-center"}
    />
  );
};

export default LineupsTable;
