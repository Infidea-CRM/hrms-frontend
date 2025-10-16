import { TableBody, TableCell, TableRow } from "@windmill/react-ui";
import { useTranslation } from "react-i18next";
import { FiDownload, FiUser} from "react-icons/fi";
import { Link } from "react-router";
import Cookies from "js-cookie";
import httpService from "@/services/httpService"; // Import your http service

// Internal imports
import useUtilsFunction from "@/hooks/useUtilsFunction";
import Tooltip from "@/components/tooltip/Tooltip";
import { IoBusinessOutline } from "react-icons/io5";

const RecentCompaniesTable = ({ companies }) => {
  const { t } = useTranslation();
  const { showDateFormat } = useUtilsFunction();
  

  return (
    <>
      <TableBody className="dark:bg-gray-900">
        {companies?.map((company, i) => (
          <TableRow key={i + 1} className="text-center">
            {/* Candidate ID */}
            <TableCell>
              <span className="text-sm">{company?.companyUniqueId}</span>
            </TableCell>

            {/* Added On */}
            <TableCell>
              <span className="text-sm">{showDateFormat(company?.createdAt)}</span>
            </TableCell>

            {/* Company Name */}
            <TableCell>
              <span className="text-sm">{company?.companyName}</span>
            </TableCell>
            

            
            {/* Actions*/}
            <TableCell className="text-right flex justify-center">
            <div className="flex justify-between items-center">
              <Link to={`/company/${company?.companyId}`} className="p-2 text-gray-400 hover:text-emerald-600">
                <Tooltip id="view" Icon={IoBusinessOutline} title={t("ViewCompany")} bgColor="#059669" />
              </Link>
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </>
  );
};

export default RecentCompaniesTable; 