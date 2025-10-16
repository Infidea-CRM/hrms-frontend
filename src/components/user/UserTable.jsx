import { TableBody, TableCell, TableRow } from "@windmill/react-ui";
import React from "react";
import { FiUser, FiZoomIn } from "react-icons/fi";
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

const UserTable = ({ customers, selectedUsers, onSelectUser }) => {
  const { title, serviceId,handleModalOpen, handleUpdate } = useToggleDrawer();
  const { showDateFormat } = useUtilsFunction();
  const { t } = useTranslation();

  return (
    <>
      <DeleteModal id={serviceId} title={title} />

      <MainDrawer>
        <JobSeekerDrawer id={serviceId} />
      </MainDrawer>

      <TableBody>
        {customers?.map((user, i) => (
          <TableRow key={i} className="text-center">
            <TableCell>
              <input
                type="checkbox"
                className="form-checkbox h-5 w-5 text-emerald-600 cursor-pointer"
                checked={selectedUsers?.includes(user._id || user.id)}
                onChange={() => onSelectUser(user._id || user.id)}
              />
            </TableCell>
            <TableCell>
              <span className="text-sm">
                {user.uniqueId}
              </span>
            </TableCell>
            <TableCell>
              <span className="text-sm">
                {showDateFormat(user.createdAt)}
              </span>
            </TableCell>
            <TableCell>
              <span className="text-sm">{user?.firstName&&user?.lastName?user.firstName+" "+user.lastName:"New User"}</span>
            </TableCell>
            <TableCell>
              <span className="text-sm font-medium">{user.mobile}</span>
            </TableCell>
            <TableCell>
              <span className="text-sm">{user.email}</span>{" "}
            </TableCell>
            <TableCell>
              <div className="flex justify-center text-center">
                <div className="p-2 cursor-pointer text-gray-400 hover:text-emerald-600">
                  {" "}
                  <Link to={`/jobseeker/${user._id}`}>
                    <Tooltip
                      id="view"
                      Icon={FiUser}
                      title={t("ViewJobSeeker")}
                      bgColor="#34D399"
                    />
                  </Link>
                </div>

                <EditDeleteButton
                  title={user.firstName+" "+user.lastName}
                  id={user._id}
                  handleUpdate={handleUpdate}
                  handleModalOpen={handleModalOpen}
                />
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </>
  );
};

export default UserTable;
