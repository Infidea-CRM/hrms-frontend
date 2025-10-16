import { useContext, useEffect, useState } from "react";
import { useForm } from "react-hook-form";

//internal import
import { SidebarContext } from "@/context/SidebarContext";
import EmployeeServices from "@/services/EmployeeServices";
import { notifyError, notifySuccess } from "@/utils/toast";

const useJobSeekerSubmit = (id) => {
  const [imageUrl, setImageUrl] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { closeDrawer, setIsUpdate } = useContext(SidebarContext);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm();

  const onSubmit = async (data) => {
    try {
      setIsSubmitting(true);
      const jobSeekerData = {
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        mobile: data.mobile,
      };

      if (id) {
        const res = await EmployeeServices.updateJobSeeker(id, {
          jobSeekerData: jobSeekerData,
        });
        setIsUpdate(true);
        notifySuccess(res.message);
        closeDrawer();
      }
      setIsSubmitting(false);
    } catch (err) {
      notifyError(err?.response?.data?.message || err?.message);
      closeDrawer();
    }
  };

  useEffect(() => {
    if (id) {
      (async () => {
        try {
          const res = await EmployeeServices.getUserById(id);
          if (res) {
            setValue("firstName", res.firstName);
            setValue("lastName", res.lastName);
            setValue("mobile", res.mobile);
            setValue("email", res.email);
          }
        } catch (err) {
          notifyError(err?.response?.data?.message || err?.message);
        }
      })();
    }
  }, [id, setValue]);

  return {
    register,
    handleSubmit,
    onSubmit,
    errors,
    setImageUrl,
    imageUrl,
    isSubmitting,
  };
};

export default useJobSeekerSubmit;
