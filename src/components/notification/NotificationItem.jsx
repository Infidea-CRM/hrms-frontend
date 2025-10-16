import React, { useState } from 'react';
import { Link } from 'react-router';
import { Badge } from '@windmill/react-ui';
import { FiTrash2, FiCheck, FiArrowRight } from 'react-icons/fi';
import useUtilsFunction from '@/hooks/useUtilsFunction';
import useNotification from '@/hooks/useNotification';
import { formatLongDateAndTime} from '@/utils/dateFormatter';

/**
 * NotificationItem component for displaying a single notification
 * @param {Object} props Component props
 * @param {Object} props.notification The notification object
 * @param {Function} props.onMarkAsRead Function to mark notification as read
 * @param {Function} props.onDelete Function to delete the notification
 * @param {Boolean} props.showActions Whether to show action buttons
 * @param {Boolean} props.inDropdown Whether the notification is displayed in dropdown
 */
const NotificationItem = ({ 
  notification, 
  onMarkAsRead, 
  onDelete, 
  showActions = true,
  inDropdown = false
}) => {
  const [isClicked, setIsClicked] = useState(false);
  const { markAsReadViaSocket, fetchUnreadCount } = useNotification();

  // Generate the appropriate badge based on notification type
  const renderBadge = () => {
    switch (notification.type) {
      case 'candidate_duplicity_check':
        return <Badge type="warning">Candidate</Badge>;
      case 'system':
        return <Badge type="info">System</Badge>;
      case 'candidate_marked':
        return <Badge type="warning">Marked</Badge>;
      default:
        return <Badge type="neutral">Other</Badge>;
    }
  };

  // Handle click on notification - mark as read if unread
  const handleClick = () => {
    if (notification.status === 'unread' && onMarkAsRead) {
      setIsClicked(true); // Visual feedback
      // Try to mark as read via socket first, fall back to HTTP API
      const socketWorked = markAsReadViaSocket(notification._id);
      if (!socketWorked) {
        onMarkAsRead(notification._id);
      } else {
        // If socket worked, directly update the unread count
        fetchUnreadCount();
      }
    }
  };

  // Handle mark as read button click
  const handleMarkAsReadClick = (e) => {
    e.stopPropagation();
    if (notification.status === 'unread' && onMarkAsRead) {
      setIsClicked(true); // Visual feedback
      onMarkAsRead(notification._id);
    }
  };

  // Handle delete button click
  const handleDeleteClick = (e) => {
    e.stopPropagation();
    if (onDelete) {
      onDelete(notification._id);
    }
  };

  // Render the content of the notification
  const NotificationContent = () => (
    <>
      <div className="flex items-start justify-between">
        <h6 className="font-medium text-gray-700 dark:text-gray-200 text-xs sm:text-sm mb-1 line-clamp-2">
          {notification.message}
        </h6>
        {notification.status === 'unread' && !showActions && !isClicked && (
          <span className="ml-2 mt-1 flex-shrink-0">
            <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-blue-600 rounded-full"></div>
          </span>
        )}
      </div>

      <div className="flex flex-wrap items-center text-[10px] sm:text-xs text-gray-500 dark:text-gray-400 mt-1">
        {renderBadge()}
        <span className="inline-flex items-center ml-2 text-[10px] sm:text-xs">
          {formatLongDateAndTime(notification.createdAt)}
        </span>
        {notification.metadata?.link && (
          <a 
            href={notification.metadata.link}
            className="ml-2 inline-flex items-center text-blue-600 dark:text-blue-400 hover:underline text-[10px] sm:text-xs"
            onClick={(e) => e.stopPropagation()}
          >
            View <FiArrowRight className="ml-1" size={10} />
          </a>
        )}
      </div>
    </>
  );

  // Apply class conditionally for visual feedback and status
  const getItemClass = () => {
    let baseClass = "flex justify-between items-start py-2 px-2 sm:py-3 sm:px-3 border-b border-gray-100 dark:border-gray-700 transition-colors duration-150 hover:bg-gray-50";
    
    // Unread styling
    if (notification.status === 'unread' && !isClicked) {
      baseClass += " bg-blue-50 dark:bg-blue-900/10";
    }
    
    // Visual feedback when clicked
    if (isClicked) {
      baseClass += " bg-green-50 dark:bg-green-900/10";
    }
    
    // Add specific styling for dropdown items
    if (inDropdown) {
      baseClass += " last:border-b-0"; // Remove border on last item
    }
    
    baseClass += " hover:text-gray-800 dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-gray-100 rounded-md";
    
    return baseClass;
  };

  return (
    <li className={getItemClass()}>
      {inDropdown ? (
        <Link 
          to="/notifications" 
          className="flex items-start flex-1 w-full"
          onClick={handleClick}
        >
          <div className="notification-content flex-1 min-w-0 w-full">
            <NotificationContent />
          </div>
        </Link>
      ) : (
        <div 
          className="flex items-start flex-1 cursor-pointer w-full" 
          onClick={handleClick}
        >
          <div className="notification-content flex-1 min-w-0 w-full">
            <NotificationContent />
          </div>
        </div>
      )}

      {showActions && (
        <div className="flex ml-2 sm:ml-3 mt-1 flex-shrink-0">
          {notification.status === 'unread' && !isClicked && (
            <button
              type="button"
              onClick={handleMarkAsReadClick}
              className="p-0.5 sm:p-1 mr-1 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/20 rounded focus:outline-none"
              title="Mark as read"
            >
              <FiCheck className="w-3 h-3 sm:w-4 sm:h-4" />
            </button>
          )}
          <button
            type="button"
            onClick={handleDeleteClick}
            className="p-0.5 sm:p-1 text-red-500 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/20 rounded focus:outline-none"
            title="Delete notification"
          >
            <FiTrash2 className="w-3 h-3 sm:w-4 sm:h-4" />
          </button>
        </div>
      )}
    </li>
  );
};

export default NotificationItem; 