import {
  Button,
  Card,
  CardBody,
  Badge,
  Dropdown,
  DropdownItem,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHeader,
  TableRow,
  Pagination,
} from "@windmill/react-ui";
import { useEffect, useState } from "react";
import Scrollbars from "react-custom-scrollbars-2";
import { FiTrash2, FiMail, FiFilter, FiCheck, FiRefreshCw, FiBell } from "react-icons/fi";

//internal import
import CheckBox from "@/components/form/input/CheckBox";
import PageTitle from "@/components/Typography/PageTitle";
import { notifyError, notifySuccess } from "@/utils/toast";
import NotificationServices from "@/services/NotificationServices";
import NotificationItem from "@/components/notification/NotificationItem";
import useNotification from "@/hooks/useNotification";
import EmptyState from "@/components/EmptyState";

const Notifications = () => {
  // react hook
  const [data, setData] = useState([]);
  const [isCheck, setIsCheck] = useState([]);
  const [isCheckAll, setIsCheckAll] = useState(false);
  const [loading, setLoading] = useState(false);
  const [filterOpen, setFilterOpen] = useState(false);
  const [filterStatus, setFilterStatus] = useState("all"); // "all", "read", "unread"
  const [currentPage, setCurrentPage] = useState(1);
  const [resultsPerPage, setResultsPerPage] = useState(10);
  const { setUpdated, markAllAsReadViaSocket, markAsReadViaSocket, socket, updated, fetchUnreadCount } = useNotification();

  // Calculate pagination
  const totalResults = data.length;
  const dataTable = data.slice(
    (currentPage - 1) * resultsPerPage,
    currentPage * resultsPerPage
  );

  // handle pagination change
  const onPageChange = (p) => {
    setCurrentPage(p);
  };

  // handle notification status change
  const handleNotificationStatusChange = async (id) => {
    try {
      // Try to mark as read via socket first, fall back to HTTP API
      const socketWorked = markAsReadViaSocket(id);
      if (!socketWorked) {
        await NotificationServices.markAsRead(id);
      }
      // Refresh notifications
      fetchNotifications();
      setUpdated(true);
    } catch (err) {
      notifyError(err?.response?.data?.message || err?.message);
    }
  };

  // handle notification delete
  const handleNotificationDelete = async (id) => {
    try {
      await NotificationServices.deleteNotification(id);
      // Refresh notifications
      fetchNotifications();
      setUpdated(true);
    } catch (err) {
      notifyError(err?.response?.data?.message || err?.message);
    }
  };

  // handle mark all as read
  const handleMarkAllAsRead = async () => {
    try {
      setLoading(true);
      
      if (isCheck.length > 0) {
        // Mark selected notifications as read
        for (const id of isCheck) {
          // Try to mark as read via socket first, fall back to HTTP API
          const socketWorked = markAsReadViaSocket(id);
          if (!socketWorked) {
            await NotificationServices.markAsRead(id);
          }
        }
        notifySuccess("Selected notifications marked as read");
      } else {
        // Try to mark all as read via socket first, fall back to HTTP API
        const socketWorked = markAllAsReadViaSocket();
        if (!socketWorked) {
          // Mark all notifications as read using HTTP API
          await NotificationServices.markAllAsRead();
        }
        notifySuccess("All notifications marked as read");
      }
      setIsCheck([]);
      setIsCheckAll(false);
      fetchNotifications();
      setUpdated(true);
    } catch (err) {
      notifyError(err?.response?.data?.message || err?.message);
    } finally {
      setLoading(false);
    }
  };

  // handle delete many
  const handleDeleteMany = async () => {
    try {
      setLoading(true);
      if (isCheck.length === 0) {
        notifyError("Please select at least one notification to delete");
        return;
      }
      
      // Delete selected notifications
      for (const id of isCheck) {
        await NotificationServices.deleteNotification(id);
      }
      
      notifySuccess("Selected notifications deleted successfully");
      setIsCheck([]);
      setIsCheckAll(false);
      fetchNotifications();
      setUpdated(true);
    } catch (err) {
      notifyError(err?.response?.data?.message || err?.message);
    } finally {
      setLoading(false);
    }
  };

  // handle select all
  const handleSelectAll = () => {
    setIsCheckAll(!isCheckAll);
    setIsCheck(dataTable?.map((li) => li._id));
    if (isCheckAll) {
      setIsCheck([]);
    }
  };

  // handle single click
  const handleClick = (e) => {
    const { id, checked } = e.target;
    setIsCheck([...isCheck, id]);
    if (!checked) {
      setIsCheck(isCheck.filter((item) => item !== id));
    }
  };

  // Fetch notifications
  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const res = await NotificationServices.getMyNotifications();
      let filteredData = res.notifications;
      
      // Apply filtering
      if (filterStatus === "read") {
        filteredData = filteredData.filter(item => item.status === "read");
      } else if (filterStatus === "unread") {
        filteredData = filteredData.filter(item => item.status === "unread");
      }
      
      setData(filteredData);
    } catch (err) {
      notifyError(err?.response?.data?.message || err?.message);
    } finally {
      setLoading(false);
    }
  };

  // Handle filter change
  const handleFilterChange = (status) => {
    setFilterStatus(status);
    setFilterOpen(false);
    setCurrentPage(1);
  };

  // Update notifications when updated state changes
  useEffect(() => {
    if (updated) {
      fetchNotifications();
      setUpdated(false);
    }
  }, [updated]);

  // Set up socket event listeners for real-time updates
  useEffect(() => {
    if (!socket) return;

    // Listen for new notification
    socket.on('new_notification', () => {
      fetchNotifications();
      fetchUnreadCount();
    });

    // Listen for notification read
    socket.on('notification_read', () => {
      fetchNotifications();
      fetchUnreadCount();
    });

    // Listen for all notifications read
    socket.on('all_notifications_read', () => {
      fetchNotifications();
      fetchUnreadCount();
    });

    // Listen for notification delete - fix event name to match backend
    socket.on('notification_deleted', () => {
      fetchNotifications();
      fetchUnreadCount();
    });

    return () => {
      socket.off('new_notification');
      socket.off('notification_read');
      socket.off('all_notifications_read');
      socket.off('notification_deleted');
    };
  }, [socket, fetchNotifications, fetchUnreadCount]);

  useEffect(() => {
    fetchNotifications();
  }, [filterStatus]);

  return (
    <>
      <PageTitle>Notifications</PageTitle>

      <Card className="shadow-md rounded-lg overflow-hidden bg-white dark:bg-gray-800 mb-5">
        <CardBody>
          <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
            <div className="flex items-center gap-2">
              <Button
                disabled={loading}
                onClick={handleMarkAllAsRead}
                className="rounded-lg px-4 h-10 flex items-center justify-center bg-blue-600 text-white hover:bg-blue-700 transition-colors"
              >
                <FiMail className="mr-2" />
                Mark as Read
              </Button>
              <Button
                disabled={isCheck?.length < 1 || loading}
                onClick={handleDeleteMany}
                className="rounded-lg px-4 h-10 flex items-center justify-center bg-red-600 text-white hover:bg-red-700 transition-colors"
              >
                <FiTrash2 className="mr-2" />
                Delete Selected
              </Button>
              <Button
                disabled={loading}
                onClick={fetchNotifications}
                className="rounded-lg px-3 h-10 flex items-center justify-center bg-gray-200 text-gray-700 hover:bg-gray-300 transition-colors dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
                aria-label="Refresh"
                title="Refresh"
              >
                <FiRefreshCw className={loading ? "animate-spin" : ""} />
              </Button>
            </div>

            <div className="relative">
              <Button
                onClick={() => setFilterOpen(!filterOpen)}
                className="rounded-lg px-4 h-10 flex items-center justify-center bg-gray-200 text-gray-700 hover:bg-gray-300 transition-colors dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
              >
                <FiFilter className="mr-2" />
                {filterStatus === "all" ? "All" : filterStatus === "read" ? "Read" : "Unread"}
              </Button>
              
              {filterOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg overflow-hidden z-20 dark:bg-gray-800">
                  <div className="py-1">
                    <button
                      onClick={() => handleFilterChange("all")}
                      className={`w-full text-left px-4 py-2 text-sm ${
                        filterStatus === "all" 
                          ? "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200" 
                          : "text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
                      }`}
                    >
                      <div className="flex items-center">
                        {filterStatus === "all" && <FiCheck className="mr-2" />}
                        <span className={filterStatus === "all" ? "ml-2" : "ml-6"}>All</span>
                      </div>
                    </button>
                    <button
                      onClick={() => handleFilterChange("read")}
                      className={`w-full text-left px-4 py-2 text-sm ${
                        filterStatus === "read" 
                          ? "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200" 
                          : "text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
                      }`}
                    >
                      <div className="flex items-center">
                        {filterStatus === "read" && <FiCheck className="mr-2" />}
                        <span className={filterStatus === "read" ? "ml-2" : "ml-6"}>Read</span>
                      </div>
                    </button>
                    <button
                      onClick={() => handleFilterChange("unread")}
                      className={`w-full text-left px-4 py-2 text-sm ${
                        filterStatus === "unread" 
                          ? "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200" 
                          : "text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
                      }`}
                    >
                      <div className="flex items-center">
                        {filterStatus === "unread" && <FiCheck className="mr-2" />}
                        <span className={filterStatus === "unread" ? "ml-2" : "ml-6"}>Unread</span>
                      </div>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="border rounded-lg overflow-hidden">
            <TableContainer className="min-h-[400px]">
              <Table>
                <TableHeader>
                  <tr>
                    <TableCell className="w-12">
                      <CheckBox
                        type="checkbox"
                        name="selectAll"
                        id="selectAll"
                        handleClick={handleSelectAll}
                        isChecked={isCheckAll}
                      />
                    </TableCell>
                    <TableCell>Notification</TableCell>
                    <TableCell className="w-32 text-right">Actions</TableCell>
                  </tr>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={3} className="text-center">
                        <div className="py-8">
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">Loading notifications...</p>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : dataTable.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={3} className="text-center">
                        <EmptyState 
                          message="No notifications found" 
                          icon={<FiBell className="h-12 w-12 text-gray-400" />}
                          className="py-16"
                        />
                      </TableCell>
                    </TableRow>
                  ) : (
                    dataTable.map((notification, index) => (
                      <TableRow 
                        key={index + 1}
                        className={notification.status === 'unread' ? 'bg-blue-50 dark:bg-blue-900/10' : ''}
                      >
                        <TableCell className="align-top pt-4">
                          <CheckBox
                            type="checkbox"
                            name={notification?._id}
                            id={notification._id}
                            handleClick={handleClick}
                            isChecked={isCheck?.includes(notification._id)}
                          />
                        </TableCell>
                        <TableCell className="p-0">
                          <NotificationItem 
                            notification={notification}
                            onMarkAsRead={handleNotificationStatusChange}
                            onDelete={handleNotificationDelete}
                            showActions={false}
                          />
                        </TableCell>
                        <TableCell className="text-right align-top pt-4">
                          <div className="flex justify-end">
                            {notification.status === 'unread' && (
                              <Button
                                layout="link"
                                size="icon"
                                aria-label="Mark as Read"
                                onClick={() => handleNotificationStatusChange(notification._id)}
                                className="text-blue-500 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 mr-1"
                                title="Mark as Read"
                              >
                                <FiMail className="h-4 w-4" />
                              </Button>
                            )}
                            <Button
                              layout="link"
                              size="icon"
                              aria-label="Delete"
                              onClick={() => handleNotificationDelete(notification._id)}
                              className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                              title="Delete"
                            >
                              <FiTrash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </div>

          {!loading && data.length > 0 && (
            <div className="mt-4">
              <Pagination
                totalResults={totalResults}
                resultsPerPage={resultsPerPage}
                onChange={onPageChange}
                label="Notification Navigation"
              />
            </div>
          )}
        </CardBody>
      </Card>
    </>
  );
};

export default Notifications;
