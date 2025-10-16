import React, { useState, useEffect, useRef } from "react";
import { Button, Input } from "@windmill/react-ui";
import { Link } from "react-router";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";

// Internal imports
import Error from "@/components/form/others/Error";
import ImageLight from "@/assets/img/create-account-office.jpeg";
import ImageDark from "@/assets/img/create-account-office-dark.jpeg";
import Loader from "@/components/sprinkleLoader/Loader";
import useLoginSubmit from "@/hooks/useLoginSubmit";
import { FiMail } from "react-icons/fi";
import ThemeToggle from "@/components/theme/ThemeToggle";

const SignUp = () => {
  const { onSubmit, loading } = useLoginSubmit();
  const { register, handleSubmit, watch, formState: { errors } } = useForm();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  // Add a password ref to track the password value
  const password = useRef("");
  const passwordValue = watch("password");
  
  // Update the ref whenever password changes
  useEffect(() => {
    password.current = passwordValue;
  }, [passwordValue]);
  
  // Toggle password visibility
  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  // Toggle confirm password visibility
  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  useEffect(() => {
    document.title = "Infidea CRM | Sign Up";
  }, []);

  return (
    <div className="flex items-center min-h-screen p-2 sm:p-6 bg-gradient-to-br from-indigo-50 to-blue-100 dark:from-gray-900 dark:to-gray-800">
      <div className="flex-1 w-full max-w-5xl mx-auto overflow-hidden rounded-xl shadow-lg bg-white dark:bg-gray-800">
        <div className="flex flex-col md:flex-row">
          <div className="relative h-32 md:h-auto md:w-5/12">
            <img
              aria-hidden="true"
              className="object-cover w-full h-full dark:hidden"
              src={ImageLight}
              alt="Office"
            />
            <img
              aria-hidden="true"
              className="hidden object-cover w-full h-full dark:block"
              src={ImageDark}
              alt="Office"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/70 to-indigo-700/70 flex items-center justify-center">
              <div className="px-4 py-2 text-center">
                <h1 className="text-xl sm:text-2xl font-bold text-white mb-1">Infidea CRM</h1>
                <p className="text-white text-xs sm:text-sm opacity-90">
                  Your all-in-one customer relationship solution
                </p>
                <div className="mt-2 hidden sm:flex flex-col space-y-0.5">
                  <div className="flex items-center text-white text-xs">
                    <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span>Seamless collaboration</span>
                  </div>
                  <div className="flex items-center text-white text-xs">
                    <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span>Advanced analytics</span>
                  </div>
                  <div className="flex items-center text-white text-xs">
                    <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span>Enterprise security</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <main className="flex items-center justify-center p-4 sm:p-6 md:p-8 md:w-7/12 relative">
            <div className="absolute top-2 right-2 sm:top-4 sm:right-4 z-10">
              <ThemeToggle />
            </div>

            <div className="w-full max-w-xs mx-auto">
              <h1 className="mb-2 text-xl font-semibold text-gray-700 dark:text-gray-200">
                Create Account
              </h1>
              <p className="text-xs text-gray-600 dark:text-gray-400 mb-3">
                Join Infidea CRM to manage your business effectively
              </p>

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
                {/* Company Name Field */}
                <div>
                  <label className="block text-xs font-medium text-gray-700 dark:text-gray-400 mb-0.5">
                    Employee Name
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-2 flex items-center pointer-events-none">
                      <svg className="h-3 w-3 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                      </svg>
                    </div>
                    <Input
                      {...register("name", {
                        required: "Employee name is required!",
                        minLength: {
                          value: 2,
                          message: "Name must be at least 2 characters",
                        },
                        maxLength: {
                          value: 50,
                          message: "Name cannot exceed 50 characters",
                        },
                        pattern: {
                          value: /^[A-Za-z\s.'-]+$/,
                          message: "Name can only contain letters and spaces",
                        }
                      })}
                      type="text"
                      placeholder="Employee Name"
                      className="pl-7 py-2 h-9 sm:h-8 text-sm w-full"
                    />
                  </div>
                  <Error errorName={errors.name} />
                </div>
                
                {/* Employee Code Field */}
                <div>
                  <label className="block text-xs font-medium text-gray-700 dark:text-gray-400 mb-0.5">
                    Employee Code
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-2 flex items-center pointer-events-none">
                      <svg className="h-3 w-3 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2" />
                      </svg>
                    </div>
                    <Input
                      {...register("employeeCode", {
                        required: "Employee code is required!",
                        pattern: {
                          value: /^[a-zA-Z01-9]{10}$/,
                          message: "Employee code must be exactly 10 digits",
                        }
                      })}
                      type="text"
                      placeholder="Employee Code"
                      className="pl-7 py-2 h-9 sm:h-8 text-sm w-full"
                      maxLength={10}
                    />
                  </div>
                  <Error errorName={errors.employeeCode} />
                </div>
                
                {/* Email Field */}
                <div>
                  <label className="block text-xs font-medium text-gray-700 dark:text-gray-400 mb-0.5">
                    Email
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-2 flex items-center pointer-events-none">
                     <FiMail className="h-3 w-3 text-gray-400" />
                    </div>
                    <Input
                      {...register("email", {
                        required: "Email is required!",
                        pattern: {
                          value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                          message: "Invalid email address!",
                        },
                        maxLength: {
                          value: 100,
                          message: "Email cannot exceed 100 characters",
                        }
                      })}
                      type="email"
                      placeholder="your@email.com"
                      className="pl-7 py-2 h-9 sm:h-8 text-sm w-full"
                    />
                  </div>
                  <Error errorName={errors.email} />
                </div>
                
                {/* Phone Field */}
                <div>
                  <label className="block text-xs font-medium text-gray-700 dark:text-gray-400 mb-0.5">
                    Mobile Number
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-2 flex items-center pointer-events-none">
                      <svg className="h-3 w-3 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                      </svg>
                    </div>
                    <Input
                      {...register("mobile", {
                        required: "Mobile Number is required!",
                        pattern: {
                          value: /^[0-9]{10}$/,
                          message: "Please enter a valid 10-digit mobile number",
                        }
                      })}
                      type="text"
                      placeholder="Mobile Number"
                      className="pl-7 py-2 h-9 sm:h-8 text-sm w-full"
                      maxLength={10}
                      onKeyPress={(e) => {
                        const keyCode = e.which || e.keyCode;
                        const keyValue = String.fromCharCode(keyCode);
                        const isValid = /^[0-9]+$/.test(keyValue);
                        if (!isValid) {
                          e.preventDefault();
                        }
                      }}
                    />
                  </div>
                  <Error errorName={errors.mobile} />
                </div>
                
                {/* Password Field */}
                <div>
                  <label className="block text-xs font-medium text-gray-700 dark:text-gray-400 mb-0.5">
                    Password
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-2 flex items-center pointer-events-none">
                      <svg className="h-3 w-3 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                      </svg>
                    </div>
                    <Input
                      {...register("password", {
                        required: "Password is required!",
                        minLength: {
                          value: 8,
                          message: "Password must be at least 8 characters",
                        },
                        maxLength: {
                          value: 50,
                          message: "Password cannot exceed 50 characters",
                        },
                        pattern: {
                          value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#^()_\-+=[\]{}|\\:;"'<>,.?/])[A-Za-z\d@$!%*?&#^()_\-+=[\]{}|\\:;"'<>,.?/]{8,}$/,
                          message: "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character",
                        }
                      })}
                      type={showPassword ? "text" : "password"}
                      placeholder="********"
                      className="pl-7 pr-7 py-2 h-9 sm:h-8 text-sm w-full"
                    />
                    <button 
                      type="button"
                      className="absolute inset-y-0 right-0 pr-2 flex items-center text-gray-500 hover:text-indigo-600 transition-colors"
                      onClick={togglePasswordVisibility}
                    >
                      {showPassword ? (
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"></path>
                        </svg>
                      ) : (
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
                        </svg>
                      )}
                    </button>
                  </div>
                  <Error errorName={errors.password} />
                </div>
                
                {/* Confirm Password Field */}
                <div>
                  <label className="block text-xs font-medium text-gray-700 dark:text-gray-400 mb-0.5">
                    Confirm Password
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-2 flex items-center pointer-events-none">
                      <svg className="h-3 w-3 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                      </svg>
                    </div>
                    <Input
                      {...register("confirmPassword", {
                        required: "Confirm password is required!",
                        validate: (value) =>
                          value === password.current || "Passwords do not match",
                      })}
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="********"
                      className="pl-7 pr-7 py-2 h-9 sm:h-8 text-sm w-full"
                    />
                    <button 
                      type="button"
                      className="absolute inset-y-0 right-0 pr-2 flex items-center text-gray-500 hover:text-indigo-600 transition-colors"
                      onClick={toggleConfirmPasswordVisibility}
                    >
                      {showConfirmPassword ? (
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"></path>
                        </svg>
                      ) : (
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
                        </svg>
                      )}
                    </button>
                  </div>
                  <Error errorName={errors.confirmPassword} />
                </div>
                <div className="mt-1">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      className="h-3 w-3 text-indigo-600 focus:ring-indigo-500"
                      {...register("acceptTerms", {
                        required: "You must accept the terms and conditions",
                      })}
                    />
                    <span className="ml-1 text-xs text-gray-700 dark:text-gray-400">
                      I accept the Terms and Privacy Policy
                    </span>
                  </label>
                  <Error errorName={errors.acceptTerms} />
                </div>
                
                {loading ? (
                  <div className="flex justify-center my-1">
                    <Loader size="20" />
                  </div>
                ) : (
                  <Button
                    type="submit"
                    className="w-full my-1 bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 text-white font-medium py-2 px-3 rounded-md transition-all duration-200 shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 text-sm h-9 sm:h-8"
                  >
                    Sign Up
                  </Button>
                )}
              </form>

              <div className="flex justify-center mt-3 text-xs">
                <p className="text-gray-600 dark:text-gray-400">
                  Already have an account?{" "}
                  <Link
                    className="font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 transition-colors"
                    to="/login"
                  >
                    Login
                  </Link>
                </p>
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
};

export default SignUp;