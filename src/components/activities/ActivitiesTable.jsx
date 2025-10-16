import { TableBody, TableCell, TableRow } from "@windmill/react-ui";
import moment from "moment";

// Internal imports

const ActivitiesTable = ({activities}) => {


    const activityTypeColors = {
        "On Desk": "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-400",
        "Lunch Break": "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-400",
        "Team Meeting": "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-400",
        "Client Meeting": "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-400",
        "Office Celebration": "bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-400",
        "Interview Session": "bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-400",
        "Logout": "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-400",
      };

  return (
    <>
      <TableBody className="dark:bg-gray-900">
        {activities?.map((activity, i) => (
          <TableRow key={i} className="text-center">
            
           {/* Type */}
           <TableCell className="px-4 py-3">
            <span className={`px-2 py-1 text-xs rounded-full ${activityTypeColors[activity.type]}`}>{activity.type}</span>
          </TableCell>

            {/* Start Time */}
            <TableCell className="px-4 py-3 text-sm">
            <span className="text-sm">{moment(activity.startTime).format("MMM DD YYYY, h:mm A")}</span>
          </TableCell>

          {/* End Time */}
          <TableCell className="px-4 py-3 text-sm">
            <span className="text-sm">{activity.endTime
                            ? moment(activity.endTime).format("MMM DD YYYY, h:mm A")
                            : "-"}</span>
          </TableCell>

            {/* Duration */}
            <TableCell className="px-4 py-3 text-sm">
            {activity.endTime
                            ? (() => {
                                const duration = moment.duration(moment(activity.endTime).diff(moment(activity.startTime)));
                                const hours = Math.floor(duration.asHours());
                                const minutes = duration.minutes();
                                return `${hours}h ${minutes}m`;
                              })()
                            : activity.isActive ? "Active" : "-"}
          </TableCell>


          {/* Status */}
          <TableCell className="px-4 py-3 text-sm">
            <span className={`px-2 py-1 text-xs rounded-full ${activity.isActive ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-400' : 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-400'}`}> {activity.isActive ? "Active" : "Completed"}</span>
          </TableCell>
      </TableRow>
    ))}
  </TableBody>
</>
);
};

export default ActivitiesTable; 