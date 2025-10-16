import React from "react";
import Scrollbars from "react-custom-scrollbars-2";

//internal import

import Title from "@/components/form/others/Title";
import Error from "@/components/form/others/Error";
import InputArea from "@/components/form/input/InputArea";
import LabelArea from "@/components/form/selectOption/LabelArea";
import useJobSeekerSubmit from "@/hooks/useJobSeekerSubmit";
import DrawerButton from "@/components/form/button/DrawerButton";

const JobSeekerDrawer = ({ id }) => {
  const { register, handleSubmit, onSubmit, errors, isSubmitting } =
    useJobSeekerSubmit(id);

  // console.log('##CustomerDrawer',)
  return (
    <>
      <div className="w-full relative p-6 border-b border-gray-100 bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300">
        {id ? (
          <Title
            title={"Update Job Seeker"}
            description={"Update your Job Seeker necessary information from here"}
          />
        ) : (
          <Title
            title={"Add Job Seeker"}
            description={"Add your Job Seeker necessary information from here"}
          />
        )}
      </div>

      <Scrollbars className="w-full md:w-7/12 lg:w-8/12 xl:w-8/12 relative dark:bg-gray-700 dark:text-gray-200">
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="px-6 pt-8 flex-grow scrollbar-hide w-full max-h-full pb-40">
            <div className="grid grid-cols-6 gap-3 md:gap-5 xl:gap-6 lg:gap-6 mb-6">
              <LabelArea label={"First Name"} />
              <div className="col-span-8 sm:col-span-4">
                <InputArea
                  required={true}
                  register={register}
                  label="First Name"
                  name="firstName"
                  type="text"
                  placeholder={"First Name"}
                />
                <Error errorName={errors.firstName} />
              </div>
            </div>

            <div className="grid grid-cols-6 gap-3 md:gap-5 xl:gap-6 lg:gap-6 mb-6">
              <LabelArea label={"Last Name"} />
              <div className="col-span-8 sm:col-span-4">
                <InputArea
                  required={true}
                  register={register}
                  label="Last Name"
                  name="lastName"
                  type="text"
                  placeholder={"Last Name"}
                />
                <Error errorName={errors.lastName} />
              </div>
            </div>

            <div className="grid grid-cols-6 gap-3 md:gap-5 xl:gap-6 lg:gap-6 mb-6">
              <LabelArea label={"Mobile Number"} />
              <div className="col-span-8 sm:col-span-4">
                <InputArea
                  register={register}
                  label="Mobile Number"
                  name="mobile"
                  type="text"
                  placeholder={"Mobile Number"}
                />
                <Error errorName={errors.mobile} />
              </div>
            </div>

            <div className="grid grid-cols-6 gap-3 md:gap-5 xl:gap-6 lg:gap-6 mb-6">
              <LabelArea label={"Email"} />
              <div className="col-span-8 sm:col-span-4">
                <InputArea
                  register={register}
                  label="Email"
                  name="email"
                  type="email"
                  placeholder={"Email"}
                />
                <Error errorName={errors.email} />
              </div>
            </div>
          </div>

          <DrawerButton id={id} title="Job Seeker" isSubmitting={isSubmitting} />
        </form>
      </Scrollbars>
    </>
  );
};

export default JobSeekerDrawer;
