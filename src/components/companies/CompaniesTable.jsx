import { TableBody, TableCell, TableRow } from "@windmill/react-ui";
import { useTranslation } from "react-i18next";
import { Link } from "react-router";


// Internal imports
import useUtilsFunction from "@/hooks/useUtilsFunction";
import Tooltip from "@/components/tooltip/Tooltip";
import { IoBusinessOutline } from "react-icons/io5";
import EditDeleteButton from "@/components/table/EditDeleteButton";
import useToggleDrawer from "@/hooks/useToggleDrawer";
import DeleteModal from "../modal/DeleteModal";

const CompaniesTable = ({ companies, selectedCompanies, onSelectCompany }) => {
  const { t } = useTranslation();
  const { showDateFormat } = useUtilsFunction();
  const { title, serviceId, handleModalOpen, handleUpdate} = useToggleDrawer();


  return (
    <>
     
        <DeleteModal
          id={serviceId}
          title={title}
        />
   
      <TableBody className="dark:bg-gray-900">
        {companies?.map((company, i) => (
          <TableRow key={i + 1} className="text-center">
             <TableCell className="text-center">
              <input
                type="checkbox"
                className="form-checkbox h-5 w-5 text-emerald-600 cursor-pointer"
                checked={selectedCompanies.includes(company._id)}
                onChange={() => onSelectCompany(company._id)}
              />
            </TableCell>
            {/* Company Unique ID */}
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
              <Link to={`/company/${company?._id}`} className="p-2 text-gray-400 hover:text-emerald-600">
                <Tooltip id="view" Icon={IoBusinessOutline} title={t("ViewCompany")} bgColor="#059669" />
              </Link>
              <EditDeleteButton
                  title={company.companyName}
                  id={company._id}
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

export default CompaniesTable; 