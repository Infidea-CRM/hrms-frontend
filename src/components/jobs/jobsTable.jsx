import { TableBody, TableCell, TableRow } from "@windmill/react-ui";
import dayjs from "dayjs";
import { t } from "i18next";
import React from "react";
import { FiZoomIn, FiDownload, FiBriefcase } from "react-icons/fi";
import { Link } from "react-router";
import { useState } from "react";

//internal import
import MainDrawer from "@/components/drawer/MainDrawer";
import DeleteModal from "@/components/modal/DeleteModal";
import useToggleDrawer from "@/hooks/useToggleDrawer";
import Tooltip from "@/components/tooltip/Tooltip";
import JobDrawer from "@/components/drawer/JobDrawer";
import EditDeleteButton from "@/components/table/EditDeleteButton";
import useUtilsFunction from "@/hooks/useUtilsFunction";
import DownloadDataModal from "@/components/modal/DownloadDataModal";
import { notifySuccess, notifyError } from "@/utils/toast";
import EmployeeServices from "@/services/EmployeeServices";
// internal imports

const JobsTable = ({ jobs, selectedJobs, onSelectJob }) => {
  const { title, serviceId, handleModalOpen, handleUpdate} = useToggleDrawer();
  const [jobId, setJobId] = useState(null);
  const { showDateFormat } = useUtilsFunction();
  const [isDownloadModalOpen, setIsDownloadModalOpen] = useState(false);

     // All available columns
     const availableColumns = [
      { key: 'jobId', label: 'Job ID' },
      { key: 'jobPostedOn', label: 'Posted On' },
      { key: 'jobAppliedOn', label: 'Applied On' },
      { key: 'jobTitle', label: 'Job Title' },
      { key: 'companyName', label: 'Company Name' },
      { key: 'jobLocation', label: 'Location' },
      { key: 'jobLocality', label: 'Locality' },
      { key: 'jobSalary', label: 'Salary' },
      { key: 'jobExperience', label: 'Experience Level' },
      { key: 'jobExperienceRange', label: 'Experience' },
      { key: 'jobQualification', label: 'Qualification' },
      { key: 'jobSpecificDegree', label: 'Specific Degree' },
      { key: 'jobJoining', label: 'Joining' },
      { key: 'jobInterview', label: 'Interview Mode' },
      { key: 'userId', label: 'Candidate ID' },
      { key: 'fullName', label: 'Full Name' },
      { key: 'fatherName', label: 'Father Name' },
      { key: 'mobile', label: 'Mobile' },
      { key: 'whatsappNo', label: 'WhatsApp Number' },
      { key: 'email', label: 'Email' },
      { key: 'dob', label: 'Date of Birth' },
      { key: 'age', label: 'Age' },
      { key: 'gender', label: 'Gender' },
      { key: 'experiencelevel', label: 'Experience Level' },
      { key: 'highestQualification', label: 'Highest Qualification' },
      { key: 'pursuing', label: 'Currently Studying' },
      { key: 'graduateDegree', label: 'Graduate Degree' },
      { key: 'graduatePassingYear', label: 'Graduate Passing Year' },
      { key: 'postGraduateDegree', label: 'Post Graduate Degree' },
      { key: 'postGraduatePassingYear', label: 'Post Graduate Passing Year' },
      { key: 'state', label: 'State' },
      { key: 'currentCity', label: 'Current City' },
      { key: 'currentLocality', label: 'Current Locality' },
      { key: 'preferredCities', label: 'Preferred Cities' },
      { key: 'totalExperience', label: 'Total Experience' },
      { key: 'currentCompany', label: 'Current Company' },
      { key: 'currentProfile', label: 'Current Profile' },
      { key: 'currentSalary', label: 'Current Salary' },
      { key: 'expectedSalary', label: 'Expected Salary' },
      { key: 'noticePeriod', label: 'Notice Period' },
      { key: 'jobPreference', label: 'Job Preference' },
      { key: 'languagesKnown', label: 'Languages Known' },
      { key: 'maritalStatus', label: 'Marital Status' },
    ];

     // Handle download request from the modal
   const handleDownloadRequest = async (selectedColumnKeys) => {
    try {
      const response = await EmployeeServices.generateTempRoute();
      const baseUrl = `${import.meta.env.VITE_APP_API_BASE_URL}/admin${response.tempRoute}?type=applicants`;
      
      let url = baseUrl;
      
      // Add selected columns to the URL if not all columns are selected
      if (selectedColumnKeys.length > 0 && selectedColumnKeys.length < availableColumns.length) {
        url += `&columns=${selectedColumnKeys.join(',')}`;
      }
      
      // Add selected users if downloading only selected
        url += `&jobId=${jobId}`;
      
      window.open(url, '_blank');
      setIsDownloadModalOpen(false);
      notifySuccess("Job Applicants download initiated successfully");
    } catch (error) {
      notifyError("Something went wrong");
    }
  };

  return (
    <>
      <DeleteModal id={serviceId} title={title} />


      <MainDrawer>
        <JobDrawer id={serviceId} />
      </MainDrawer>

      
<DownloadDataModal
        isOpen={isDownloadModalOpen}
        onClose={() => setIsDownloadModalOpen(false)}
        title="Download Job Applicants"
        availableColumns={availableColumns}
        selectedItems={selectedJobs}
        onDownload={handleDownloadRequest}
        entityName="Job Applicants"
        showSelectedItemsUI={false}
      />

      <TableBody>
        {jobs?.map(( job, i) => (
          <TableRow key={i} className="text-center">
            <TableCell className="text-center">
              <input
                type="checkbox"
                className="form-checkbox h-5 w-5 text-emerald-600 cursor-pointer"
                checked={selectedJobs.includes(job._id)}
                onChange={() => onSelectJob(job._id)}
              />
            </TableCell>
            <TableCell className="text-center">
              <span className="font-semibold uppercase text-xs">
                {" "}
                {job?.jobUniqueId}
              </span>
            </TableCell>
            <TableCell className="text-center">
              <span className="text-sm">
                {showDateFormat(job.createdAt)}
              </span>
            </TableCell>
            <TableCell className="text-center">
              <span className="text-sm font-semibold break-words overflow-x-hidden">{job?.title}</span>
            </TableCell>
            <TableCell className="text-center">
              <span className="text-sm font-medium break-words overflow-x-hidden">{job.companyName}</span>
            </TableCell>
            <TableCell className="text-center">
              <span className="text-sm break-words overflow-x-hidden">{job.location}</span>{" "}
            </TableCell>
            <TableCell className="text-center">
              <div className="flex justify-center text-center">
                <div className="p-2 cursor-pointer text-gray-400 hover:text-emerald-600">
                  {" "}
                  <Link to={`/job/${job._id}`}>
                    <Tooltip
                      id="view"
                      Icon={FiBriefcase}
                      title={t("ViewJob")}
                      bgColor="#34D399"
                    />
                  </Link>
                </div>

                <div className="p-2 cursor-pointer text-gray-400 hover:text-emerald-600" onClick={() => {
                  setJobId(job._id);
                  setIsDownloadModalOpen(true);
                }}>
                    <Tooltip
                      id="download"
                      Icon={FiDownload}
                      title={t("DownloadApplicants")}
                      bgColor="#34D399"
                    />
                </div>

                <EditDeleteButton
                  title={job.title}
                  id={job._id}
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

export default JobsTable;
