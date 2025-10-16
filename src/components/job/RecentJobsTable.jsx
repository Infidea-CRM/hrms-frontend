import { TableBody, TableCell, TableRow } from "@windmill/react-ui";
import { useTranslation } from "react-i18next";
import {FiDownload, FiBriefcase} from "react-icons/fi";
import { Link } from "react-router";

// Internal imports
import Tooltip from "@/components/tooltip/Tooltip";
import useUtilsFunction from "@/hooks/useUtilsFunction";
import DownloadDataModal from "@/components/modal/DownloadDataModal";
import { notifySuccess, notifyError } from "@/utils/toast";
import EmployeeServices from "@/services/EmployeeServices";
import { useState } from "react";
const RecentJobsTable = ({ jobs }) => {
  const { t } = useTranslation();
  const { showDateFormat } = useUtilsFunction();
  const [isDownloadModalOpen, setIsDownloadModalOpen] = useState(false);
  const [jobId, setJobId] = useState(null);

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
    <DownloadDataModal
        isOpen={isDownloadModalOpen}
        onClose={() => setIsDownloadModalOpen(false)}
        title="Download Job Applicants"
        availableColumns={availableColumns}
        selectedItems={[]}
        onDownload={handleDownloadRequest}
        entityName="Job Applicants"
        showSelectedItemsUI={false}
      />

      <TableBody className="dark:bg-gray-900">
        {jobs?.map((job, i) => (
          <TableRow key={i + 1} className="text-center">
            {/* Job ID */}
            <TableCell>
              <span className="text-sm">{job?.jobId}</span>
            </TableCell>

            {/* Posted Date */}
            <TableCell>
              <span className="text-sm">{showDateFormat(job?.createdAt)}</span>
            </TableCell>

            {/* Company Name */}
            <TableCell>
              <span className="text-sm">{job?.companyName}</span>
            </TableCell>

            {/* Job Title */}
            <TableCell>
              <span className="text-sm font-semibold">{job?.title}</span>
            </TableCell>

            {/* Total Applicants */}
            <TableCell>
              <span className="text-sm font-semibold">{job?.totalApplicants || 0}</span>
            </TableCell>

            {/* Actions*/}
            <TableCell className="text-right flex justify-center">
            <div className="flex justify-between items-center">
              <Link to={`/job/${job._id}`} className="p-2 text-gray-400 hover:text-emerald-600">
                <Tooltip id="view" Icon={FiBriefcase} title={t("ViewJob")} bgColor="#059669" />
              </Link>
      
      
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
            
              </div>
            </TableCell>

          </TableRow>
        ))}
      </TableBody>
    </>
  );
};

export default RecentJobsTable;
