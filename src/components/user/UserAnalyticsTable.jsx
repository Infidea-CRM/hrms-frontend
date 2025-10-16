import { TableBody, TableCell, TableRow } from "@windmill/react-ui";
import React from "react";
import { FiUser, FiZoomIn, FiBriefcase } from "react-icons/fi";
import { Link } from "react-router";
import { useTranslation } from "react-i18next";

//internal import
import MainDrawer from "@/components/drawer/MainDrawer";
import DeleteModal from "@/components/modal/DeleteModal";
import useToggleDrawer from "@/hooks/useToggleDrawer";
import Tooltip from "@/components/tooltip/Tooltip";
import JobSeekerDrawer from "@/components/drawer/JobSeekerDrawer";
import EditDeleteButton from "@/components/table/EditDeleteButton";
import useUtilsFunction from "@/hooks/useUtilsFunction";

const UserAnalyticsTable = ({ jobs }) => {
  const { title, serviceId, handleModalOpen, handleUpdate } = useToggleDrawer();
  const { showDateFormat } = useUtilsFunction();
  const { t } = useTranslation();

  return (
    <>

      <TableBody>
        {jobs?.map((job, i) => (
          <TableRow key={i} className="text-center hover:bg-gray-100 dark:hover:bg-gray-700">
            <TableCell>
              <span className="text-sm">
                {job.jobUniqueId}
              </span>
            </TableCell>
            <TableCell>
              <span className="text-sm">
                {showDateFormat(job.postedAt)}
              </span>
            </TableCell>
            <TableCell>
              <span className="text-sm">{showDateFormat(job.applicants[0].appliedAt)}</span>
            </TableCell>
            <TableCell>
              <span className="text-sm">{job?.title}</span>
            </TableCell>
            <TableCell>
              <span className="text-sm font-medium">{job.companyName}</span>
            </TableCell>
            <TableCell>
              <span className="text-sm">{job.hiringStatus}</span>{" "}
            </TableCell>
            <TableCell>
              <span className="text-sm">{job.applicants[0].status}</span>
            </TableCell>
            <TableCell>
            <div className="flex justify-center text-right">
                <div className="p-2 cursor-pointer text-gray-400 hover:text-emerald-600">
                  <Link to={`/job/${job._id}`}>
                    <Tooltip
                      id="view"
                      Icon={FiBriefcase}
                      title={t("ViewJob")}
                      bgColor="#34D399"
                    />
                  </Link>
                </div>
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </>
  );
};

export default UserAnalyticsTable;
