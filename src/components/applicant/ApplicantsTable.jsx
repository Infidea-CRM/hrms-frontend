import { TableBody, TableCell, TableRow } from "@windmill/react-ui";
import { useTranslation } from "react-i18next";
import { FiDownload, FiUser} from "react-icons/fi";
import { Link } from "react-router";

// Internal imports
import useUtilsFunction from "@/hooks/useUtilsFunction";
import Tooltip from "@/components/tooltip/Tooltip";

const RecentApplicantsTable = ({ applicants, selectedApplicants, onSelectApplicant }) => {
  const { t } = useTranslation();
  const { showDateFormat } = useUtilsFunction();

  const handleDownloadResume = async (id, applicant) => {
    try {
      const response = await fetch(applicant?.resume);
      const blob = await response.blob();
  
      // Extract file extension from Content-Type header
      const contentType = response.headers.get("content-type");
      const extensionMap = {
        "application/pdf": "pdf",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document": "docx",
        "image/png": "png",
        "image/jpeg": "jpg",
      };
      
      // Default to 'file' if unknown type
      const extension = extensionMap[contentType] || "file";
  
      // Create a URL for the blob
      const url = window.URL.createObjectURL(blob);
      
      // Create a download link and trigger it
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute(
        "download",
        `Resume-${applicant?.name}.${extension}`
      );
      document.body.appendChild(link);
      link.click();
  
      // Clean up
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error downloading resume:", error);
    }
  };
  
  

  return (
    <>
      <TableBody>
        {applicants?.map((applicant, i) => (
          <TableRow key={i} className="text-center">
            <TableCell>
            <input
                type="checkbox"
                className="form-checkbox h-5 w-5 text-emerald-600 cursor-pointer"
                checked={selectedApplicants.includes(applicant._id)}
                onChange={() => onSelectApplicant(applicant._id)}
              />
              </TableCell>
            {/* Candidate ID */}
            <TableCell>
              <span className="text-sm">{applicant?.candidateId}</span>
            </TableCell>

            {/* Applied On */}
            <TableCell>
              <span className="text-sm">{showDateFormat(applicant?.appliedAt)}</span>
            </TableCell>

            {/* Candidate Name */}
            <TableCell>
              <span className="text-sm">{applicant?.name}</span>
            </TableCell>

            {/* Contact Number */}
            <TableCell>
              <span className="text-sm">{applicant?.mobile}</span>
            </TableCell>


            {/* Company Name */}
            <TableCell>
              <span className="text-sm">{applicant?.companyName}</span>
            </TableCell>

            {/* Job Title */}
            <TableCell>
         
                <span className="text-sm" >
                  {applicant?.jobTitle}
                </span>
            </TableCell>

            {/* Status */}
            <TableCell>
              <span className={`text-sm font-semibold px-2 py-1 rounded-full ${
                applicant?.status === "Not Picked" ? "bg-emerald-100 text-emerald-600" : 
                applicant?.status === "Not Reachable" ? "bg-red-100 text-red-600" : 
                applicant?.status === "Messaged" ? "bg-blue-100 text-blue-600" : 
                applicant?.status === "Called" ? "bg-yellow-100 text-yellow-600" : 
                applicant?.status === "Pending" ? "bg-orange-100 text-orange-600" :
                "bg-gray-100 text-gray-600"
              }`}>
                {applicant?.status?.charAt(0).toUpperCase() + applicant?.status?.slice(1)}
              </span>
            </TableCell>
            

            
            {/* Actions*/}
            <TableCell className="text-right flex justify-center">
            <div className="flex justify-between items-center">
              <Link to={`/jobseeker/${applicant?.applicantId}`} className="p-2 text-gray-400 hover:text-emerald-600">
                <Tooltip id="view" Icon={FiUser} title={t("ViewJobSeeker")} bgColor="#059669" />
              </Link>
              <button  // Changed from Link to button to avoid navigation
                onClick={() => handleDownloadResume(applicant?.applicantId,applicant)}
                className="p-2 text-gray-400 hover:text-emerald-600"
              >
                <Tooltip id="download" Icon={FiDownload} title={t("DownloadResume")} bgColor="#059669" />
              </button>
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </>
  );
};

export default RecentApplicantsTable; 