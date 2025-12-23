import React from "react";
import { Table } from "antd";
import { FaEdit, FaCopy } from "react-icons/fa";
import { formatLongDate } from "@/utils/dateFormatter";
import { walkinStatusOptions, getWalkinStatusColorClass } from "@/utils/optionsData";
import { copySingleCandidate } from "@/utils/copyUtils";

const WalkinsTable = ({ 
  walkins, 
  onEdit, 
  onStatusChange,
  searchTerm = "", 
  highlightText,
  loading = false,
  // Selection props
  selectedWalkins = [],
  onWalkinSelection,
  selectAll = false,
  onSelectAll
}) => {

  // Helper function to get status color
  const getStatusColor = (status) => {
    return getWalkinStatusColorClass(status);
  };

  // Handle individual copy
  const handleCopy = (e, walkin) => {
    copySingleCandidate(walkin, {
      nameField: 'candidateName',
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
      render: (_, walkin) => (
        <input
          type="checkbox"
          checked={selectedWalkins.includes(walkin._id)}
          onChange={(e) => {
            e.stopPropagation();
            onWalkinSelection && onWalkinSelection(walkin._id, e.target.checked);
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
      dataIndex: "candidateName",
      key: "candidateName",
      align: "center",
      render: (text) => (
        <span className="text-sm">
          {searchTerm ? highlightText(text, searchTerm) : text}
        </span>
      ),
    },
    {
      title: "Contact Number",
      dataIndex: "contactNumber",
      key: "contactNumber",
      align: "center",
      render: (text, walkin) => (
        <div className="flex items-center justify-center gap-2">
          <span className="text-sm">
            {searchTerm ? highlightText(text, searchTerm) : text}
          </span>
              <button
            onClick={(e) => handleCopy(e, walkin)}
            className="p-1 rounded-full bg-teal-100 dark:bg-teal-900/30 hover:bg-teal-200 dark:hover:bg-teal-900/50 text-teal-600 dark:text-teal-400"
            title="Copy candidate data"
          >
            <FaCopy className="w-3 h-3" />
              </button>
        </div>
      ),
    },
    {
      title: "Walkin Date",
      dataIndex: "walkinDate",
      key: "walkinDate",
      align: "center",
      render: (date) => (
        <span className="text-sm font-medium">{formatLongDate(date)}</span>
      ),
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      align: "center",
      width: 140,
      render: (status, walkin) => (
        walkin.editable ? (
          <select
            value={status || ""}
            onChange={(e) => {
              e.stopPropagation();
              onStatusChange(walkin, e.target.value);
            }}
            onClick={(e) => e.stopPropagation()}
            className={`px-2 py-1 text-xs rounded-md border-0 cursor-pointer font-medium focus:ring-2 focus:ring-blue-500 ${getStatusColor(status)}`}
          >
            <option value="">Select Status</option>
            {walkinStatusOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        ) : (
          <span className={`px-2 py-1 text-xs rounded-full font-medium ${getStatusColor(status)}`}>
            {status || "N/A"}
          </span>
        )
      ),
    },
    {
      title: "Remarks",
      dataIndex: "walkinRemarks",
      key: "walkinRemarks",
      align: "center",
      width: 200,
      render: (remarks) => (
        <span className="text-sm text-gray-600 dark:text-gray-400 truncate max-w-[180px] inline-block" title={remarks}>
          {remarks || "-"}
        </span>
      ),
    },
    {
      title: "Actions",
      key: "actions",
      width: 60,
      align: "center",
      render: (_, walkin) => (
        <div className="flex justify-center items-center">
          {walkin.editable && (
            <button
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit(walkin);
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
      dataSource={walkins}
      rowKey={(record) => record._id || record.id}
      pagination={false}
      loading={loading}
      scroll={{ x: 1100 }}
      size="middle"
      className="walkins-antd-table"
      rowClassName={() => "text-center"}
    />
);
};

export default WalkinsTable; 
