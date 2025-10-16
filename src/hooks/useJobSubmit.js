import { useContext, useEffect, useState } from "react";
import { useForm } from "react-hook-form";

// internal import
import { SidebarContext } from "@/context/SidebarContext";
import EmployeeServices from "@/services/EmployeeServices";
import { notifyError, notifySuccess } from "@/utils/toast";

const useJobSubmit = (id) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { closeDrawer, setIsUpdate } = useContext(SidebarContext);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm();

  const watchedValues = watch();

  const onSubmit = async (data) => {
    try {
      setIsSubmitting(true);

      // Format salary range
      const formattedMinSalary = formatSalaryWithType(data.minSalary);
      const formattedMaxSalary = formatSalaryWithType(data.maxSalary);
      const formattedSalaryRange = `${formattedMinSalary} - ${formattedMaxSalary} ${data.salaryType}`;

      const jobData = {
        location: data.location,
        locality: data.locality || "",
        shift: data.shift,
        qualification: data.qualification,
        joining: data.joining,
        experienceRange: `${data.experienceMinYears}-${data.experienceMaxYears} years`,
        title: data.title,
        workmode: data.workmode,
        description: data.description,
        salary: formattedSalaryRange,
        isFeatured: data.isFeatured,
        companyName: data.companyName,
        companyId: data.companyId,
        industry: data.industry,
        department: data.department,
        skills: data.skills,
        experience:
          data.experience === "Both" ? "Fresher/Experienced" : data.experience,
        interview: data.interview,
        process: data.process,
        employment: data.employment,
        workingDays: data.workingDays,
        employeesSize: data.employeeSize,
        maxSalary: data.maxSalary,
        minSalary: data.minSalary,
        salaryType: data.salaryType,
        experienceMinYears: data.experienceMinYears,
        experienceMaxYears: data.experienceMaxYears,
        views: data.views,
        isActive: data.isActive,
        companyLogo: data.companyLogo,
        companyBanner: data.companyBanner,
      };

      if (id) {
        console.log("Editing job with body:", JSON.stringify(jobData));
        const res = await EmployeeServices.editJob(id, jobData);
        setIsUpdate(true);
        notifySuccess(res.message || "Job updated successfully!");
        closeDrawer();
      }
      setIsSubmitting(false);
    } catch (err) {
      notifyError(err?.response?.data?.message || err?.message);
      setIsSubmitting(false);
    }
  };

  // Helper function to format salary
  const formatSalaryWithType = (amount) => {
    let formattedAmount = "";

    if (amount >= 100000) {
      const lacs = amount / 100000;
      if (lacs % 1 === 0) {
        formattedAmount = `₹${lacs} Lac${lacs > 1 ? "s" : ""}`;
      } else {
        formattedAmount = `₹${lacs.toFixed(1)} Lac${lacs > 1 ? "s" : ""}`;
      }
    } else if (amount >= 1000) {
      formattedAmount = `₹${(amount / 1000).toFixed(0)}k`;
    } else {
      formattedAmount = `₹${amount}`;
    }

    return formattedAmount;
  };

  // Parse salary from formatted string to number (for loading existing values)
  const parseSalary = (formattedSalary) => {
    // Remove the ₹ symbol
    let value = formattedSalary.replace("₹", "");

    // Convert lacs to actual number
    if (value.includes("Lac")) {
      value = value.replace(/ Lacs?/g, "");
      return parseFloat(value) * 100000;
    }

    // Convert k to actual number
    if (value.includes("k")) {
      value = value.replace("k", "");
      return parseFloat(value) * 1000;
    }

    return parseFloat(value);
  };

  // Load job data if editing
  useEffect(() => {
    if (id) {
      (async () => {
        try {
          const job = await EmployeeServices.getJobById(id);
          if (job) {
            // Set all form fields from job data
            setValue("title", job.title);
            setValue("specificDegree", job.specificDegree || "");
            setValue("companyName", job.companyName);
            setValue("description", job.description);
            setValue("industry", job.industry);
            setValue("department", job.department);
            setValue("workmode", job.workmode);
            setValue("location", job.location);
            setValue(
              "locality",
              job.location === "Indore" ? job.locality || "" : ""
            );
            setValue("shift", job.shift);
            setValue("workingDays", job.workingDays);
            setValue("employment", job.employment);
            setValue("qualification", job.qualification);
            setValue("joining", job.joining);
            setValue("skills", job.skills || []);
            setValue("interview", job.interview);
            setValue("process", job.process);
            setValue("employeeSize", job.employeesSize);
            setValue("isFeatured", job.isFeatured || false);
            setValue("maxSalary", job.maxSalary);
            setValue("minSalary", job.minSalary);
            setValue("salaryType", job.salaryType);
            setValue("experienceMinYears", job.experienceMinYears);
            setValue("experienceMaxYears", job.experienceMaxYears);
            setValue("views", job.views);
            setValue("isActive", job.isActive || false);
            setValue("companyLogo", job.companyLogo);
            setValue("companyBanner", job.companyBanner);

            // Parse experience range (format: "0-5 years")
            if (job.experienceRange) {
              const range = job.experienceRange.split("-");
              if (range.length === 2) {
                setValue("experienceMinYears", parseInt(range[0]));
                setValue(
                  "experienceMaxYears",
                  parseInt(range[1].split(" ")[0])
                );
              }
            }

            // Set experience level
            if (job.experience === "Fresher/Experienced") {
              setValue("experience", "Both");
            } else {
              setValue("experience", job.experience);
            }

            // Parse salary range (format: "₹10k - ₹50k Per Month")
            if (job.salary) {
              const parts = job.salary.split(" - ");
              if (parts.length === 2) {
                // Extract salary type from the second part
                const typeParts = parts[1].split(" ");
                const salaryType = typeParts.slice(1).join(" "); // "Per Month" or "Per Annum" or "CTC"

                // Extract min and max salary
                const minSalary = parseSalary(parts[0]);
                const maxSalary = parseSalary(typeParts[0]);

                setValue("minSalary", minSalary);
                setValue("maxSalary", maxSalary);
                setValue("salaryType", salaryType);
              }
            }
          }
        } catch (err) {
          notifyError(err?.response?.data?.message || err?.message);
        }
      })();
    }
  }, [id, setValue]);

  // Return the values and methods
  return {
    register,
    handleSubmit,
    onSubmit,
    errors,
    isSubmitting,
    setValue,
    watchedValues,
    reset,
    formatSalaryWithType,
  };
};

export default useJobSubmit;
