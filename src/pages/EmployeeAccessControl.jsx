import React, { useCallback, useContext, useEffect, useState } from "react";
import {
  Table,
  TableHeader,
  TableContainer,
  TableCell,
  TableBody,
  TableRow,
} from "@windmill/react-ui";
import {
  FaSearch,
  FaTimesCircle,
  FaChevronLeft,
  FaChevronRight,
} from "react-icons/fa";
import AnimatedContent from "@/components/common/AnimatedContent";
import TableLoading from "@/components/preloader/TableLoading";
import NotFound from "@/components/table/NotFound";
import EmployeeServices from "@/services/EmployeeServices";
import { AdminContext } from "@/context/AdminContext";
import { notifyError, notifySuccess } from "@/utils/toast";

const EmployeeAccessControl = () => {
  const { state } = useContext(AdminContext);
  const isAdmin = state?.adminInfo?.isAdmin || false;
  const currentUserId = state?.adminInfo?.user?._id;

  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchInput, setSearchInput] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);
  const [summary, setSummary] = useState({
    totalEmployees: 0,
    enabledEmployees: 0,
    disabledEmployees: 0,
  });
  const [updatingId, setUpdatingId] = useState(null);

  const fetchEmployees = useCallback(async () => {
    if (!isAdmin) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const response = await EmployeeServices.getEmployeeAccessList({
        page: currentPage,
        limit: itemsPerPage,
        search: searchTerm,
        status: statusFilter,
      });
      setEmployees(Array.isArray(response?.employees) ? response.employees : []);
      setTotalRecords(response?.pagination?.totalRecords || 0);
      setTotalPages(response?.pagination?.totalPages || 1);
      setCurrentPage(response?.pagination?.page || 1);
      setSummary(
        response?.summary || {
          totalEmployees: 0,
          enabledEmployees: 0,
          disabledEmployees: 0,
        }
      );
    } catch (error) {
      notifyError(
        error?.response?.data?.message || "Failed to load employee access list"
      );
      setEmployees([]);
      setTotalRecords(0);
      setTotalPages(1);
      setSummary({
        totalEmployees: 0,
        enabledEmployees: 0,
        disabledEmployees: 0,
      });
    } finally {
      setLoading(false);
    }
  }, [isAdmin, currentPage, itemsPerPage, searchTerm, statusFilter]);

  useEffect(() => {
    fetchEmployees();
  }, [fetchEmployees]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setCurrentPage(1);
      setSearchTerm(searchInput.trim());
    }, 350);
    return () => clearTimeout(timer);
  }, [searchInput]);

  const handleStatusToggle = async (employee) => {
    const nextStatus = employee?.status === "Active" ? "Inactive" : "Active";

    try {
      setUpdatingId(employee._id);
      const response = await EmployeeServices.updateEmployeeAccessStatus(
        employee._id,
        nextStatus
      );

      setEmployees((prev) =>
        prev.map((item) =>
          item._id === employee._id
            ? {
                ...item,
                status: response?.employee?.status || nextStatus,
                isEnabled: (response?.employee?.status || nextStatus) === "Active",
              }
            : item
        )
      );

      notifySuccess(response?.message || "Employee status updated");
    } catch (error) {
      notifyError(
        error?.response?.data?.message || "Failed to update employee status"
      );
    } finally {
      setUpdatingId(null);
    }
  };

  const handleSearchReset = () => {
    setSearchInput("");
    setSearchTerm("");
    setStatusFilter("all");
    setCurrentPage(1);
    setItemsPerPage(10);
  };

  const goToPrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage((prev) => prev - 1);
    }
  };

  const goToNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage((prev) => prev + 1);
    }
  };

  if (!isAdmin) {
    return (
      <AnimatedContent>
        <div className="py-6">
          <h1 className="text-2xl font-bold dark:text-[#e2692c] text-[#1a5d96]">
            Employee Access Control
          </h1>
          <p className="mt-4 text-sm text-red-500">Access denied. Admin only.</p>
        </div>
      </AnimatedContent>
    );
  }

  return (
    <AnimatedContent>
      <div className="py-4 w-full overflow-x-hidden">
        <h1 className="text-2xl font-bold dark:text-[#e2692c] text-[#1a5d96]">
          Employee Access Control
        </h1>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-4 mb-4">
          <div className="rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-3">
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Total Employees
            </p>
            <p className="text-xl font-semibold text-gray-800 dark:text-gray-100">
              {summary.totalEmployees}
            </p>
          </div>
          <div className="rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-3">
            <p className="text-xs text-gray-500 dark:text-gray-400">Enabled</p>
            <p className="text-xl font-semibold text-emerald-700 dark:text-emerald-400">
              {summary.enabledEmployees}
            </p>
          </div>
          <div className="rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-3">
            <p className="text-xs text-gray-500 dark:text-gray-400">Disabled</p>
            <p className="text-xl font-semibold text-red-700 dark:text-red-400">
              {summary.disabledEmployees}
            </p>
          </div>
        </div>

        <div className="rounded-lg shadow-md bg-white dark:bg-gray-700 p-3 max-w-full mt-2 mb-4">
          <div className="flex flex-wrap items-end gap-3">
            <div className="w-full sm:w-auto sm:min-w-[280px]">
              <label className="text-[11px] text-gray-500 dark:text-gray-400 mb-1 block">
                Search
              </label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="Name, email, employee code"
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  className="w-full pl-8 pr-8 py-2 text-xs rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
                <FaSearch className="absolute left-2.5 top-2.5 text-gray-400 h-3 w-3" />
                {searchInput && (
                  <button
                    type="button"
                    onClick={() => setSearchInput("")}
                    className="absolute right-2 top-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                  >
                    <FaTimesCircle className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>
            </div>

            <div className="w-full sm:w-auto sm:min-w-[160px]">
              <label className="text-[11px] text-gray-500 dark:text-gray-400 mb-1 block">
                Status
              </label>
              <select
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full px-2.5 py-2 text-xs rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="all">All Status</option>
                <option value="Active">Enabled</option>
                <option value="Inactive">Disabled</option>
              </select>
            </div>

            <div className="w-full sm:w-auto sm:min-w-[130px]">
              <label className="text-[11px] text-gray-500 dark:text-gray-400 mb-1 block">
                Per Page
              </label>
              <select
                value={itemsPerPage}
                onChange={(e) => {
                  setItemsPerPage(parseInt(e.target.value, 10));
                  setCurrentPage(1);
                }}
                className="w-full px-2.5 py-2 text-xs rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
              </select>
            </div>

            <button
              type="button"
              onClick={handleSearchReset}
              className="px-3 py-2 rounded-md text-xs bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500 text-gray-700 dark:text-gray-300"
            >
              Reset
            </button>
          </div>
        </div>

        {loading ? (
          <TableLoading row={8} col={5} width={190} height={20} />
        ) : employees.length === 0 ? (
          <NotFound title="No employees found" />
        ) : (
          <TableContainer className="mb-8 overflow-x-auto w-full">
            <Table className="min-w-[900px]">
              <TableHeader>
                <tr className="h-14 text-xs font-semibold bg-gray-50 dark:bg-gray-800">
                  <TableCell className="text-center">Name</TableCell>
                  <TableCell className="text-center">Code</TableCell>
                  <TableCell className="text-center">Email</TableCell>
                  <TableCell className="text-center">Status</TableCell>
                  <TableCell className="text-center">Action</TableCell>
                </tr>
              </TableHeader>
              <TableBody className="dark:bg-gray-900">
                {employees.map((employee) => {
                  const isEnabled = (employee.status || "Active") === "Active";
                  const isUpdating = updatingId === employee._id;
                  const isSelf = currentUserId === employee._id;

                  return (
                    <TableRow
                      key={employee._id}
                      className="text-center hover:bg-gray-50 dark:hover:bg-gray-800/60"
                    >
                      <TableCell>
                        <p className="font-medium">{employee.name || "-"}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {employee.designation || "-"}
                        </p>
                      </TableCell>
                      <TableCell className="font-mono text-xs">
                        {employee.employeeCode || "-"}
                      </TableCell>
                      <TableCell>{employee.email || "-"}</TableCell>
                      <TableCell>
                        <span
                          className={`px-2 py-1 text-xs rounded-full ${
                            isEnabled
                              ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
                              : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300"
                          }`}
                        >
                          {isEnabled ? "Enabled" : "Disabled"}
                        </span>
                      </TableCell>
                      <TableCell>
                        <button
                          type="button"
                          onClick={() => handleStatusToggle(employee)}
                          disabled={isUpdating || isSelf}
                          className={`px-3 py-1.5 rounded-md text-xs text-white ${
                            isEnabled
                              ? "bg-red-600 hover:bg-red-700"
                              : "bg-emerald-600 hover:bg-emerald-700"
                          } disabled:opacity-50 disabled:cursor-not-allowed`}
                          title={
                            isSelf
                              ? "You cannot change your own status"
                              : isEnabled
                                ? "Disable employee login"
                                : "Enable employee login"
                          }
                        >
                          {isUpdating
                            ? "Updating..."
                            : isEnabled
                              ? "Disable"
                              : "Enable"}
                        </button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
        )}

        <div className="mt-2 mb-6 flex flex-wrap items-center justify-between gap-3">
          <p className="text-xs text-gray-600 dark:text-gray-300">
            Showing{" "}
            <span className="font-semibold">
              {totalRecords === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1}
            </span>{" "}
            to{" "}
            <span className="font-semibold">
              {Math.min(currentPage * itemsPerPage, totalRecords)}
            </span>{" "}
            of <span className="font-semibold">{totalRecords}</span> records
          </p>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={goToPrevPage}
              disabled={currentPage <= 1}
              className="px-3 py-1.5 text-xs rounded-md border border-gray-300 dark:border-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <FaChevronLeft className="inline mr-1" />
              Prev
            </button>
            <span className="text-xs text-gray-600 dark:text-gray-300">
              Page {currentPage} / {totalPages}
            </span>
            <button
              type="button"
              onClick={goToNextPage}
              disabled={currentPage >= totalPages}
              className="px-3 py-1.5 text-xs rounded-md border border-gray-300 dark:border-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
              <FaChevronRight className="inline ml-1" />
            </button>
          </div>
        </div>
      </div>
    </AnimatedContent>
  );
};

export default EmployeeAccessControl;
