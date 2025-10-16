import React from "react";
import { Briefcase, PhoneCall, Users, CheckCircle, Clock, FileLineChart } from "lucide-react";
import "./flipcard.css";
import { MdArrowDropDownCircle, MdCalculate, MdHolidayVillage, MdJoinInner, MdOutlineHolidayVillage, MdPercent, MdTimeToLeave } from "react-icons/md";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";

const iconMap = {
  "Calls": <PhoneCall size={20} strokeWidth={1.5} />,
  "Lineups": <FileLineChart size={20} strokeWidth={1.5} />,
  "Joinings": <MdJoinInner size={20} />,
  "Selections": <CheckCircle size={20} strokeWidth={1.5} />,
  "Conversion": <MdPercent size={20} strokeWidth={1.5} />,
  "Time Spent": <Clock size={20} strokeWidth={1.5} />,
  "Offer Drops": <MdArrowDropDownCircle size={20} />,
  "Leaves": <MdOutlineHolidayVillage size={20} />,
  "Incentives": <Briefcase size={20} strokeWidth={1.5} />,
};

function FlipCard({ title, data, onTap, loading = false }) {
  if (loading) {
    return (
      <div className="w-full h-28 sm:h-32 bg-white dark:bg-gray-800 shadow-md dark:shadow-gray-900/30 border border-gray-200 dark:border-gray-700 rounded-lg">
        <div className="flex flex-col justify-center items-center p-3 h-full">
          <div className="mb-2">
            <Skeleton circle width={36} height={36} />
          </div>
          <div className="text-center w-full">
            <Skeleton width={60} height={16} className="mb-2 mx-auto" />
            <Skeleton width={40} height={20} className="mx-auto" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div 
      className="flip-card w-full h-28 sm:h-32 cursor-pointer" 
      onClick={onTap}
    >
      <div className="flip-card-inner">
        <div className="flip-card-front bg-white dark:bg-gray-800 text-gray-800 dark:text-white shadow-md dark:shadow-gray-900/30 border border-gray-200 dark:border-gray-700">
          <div className="flex flex-col justify-center items-center p-3 h-full">
            <div className="icon-container mb-2 p-2 rounded-full bg-gray-100 dark:bg-gray-700">
              <div className="text-[#1a5d96] dark:text-[#e2692c]">
                {iconMap[title] || <Briefcase size={20} strokeWidth={1.5} />}
              </div>
            </div>
            <div className="text-center">
              <h2 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">{title}</h2>
              <p className="text-lg font-bold">{data}</p>
            </div>
          </div>
        </div>
        <div className="flip-card-back bg-gradient-to-br from-[#1a5d96] to-[#2980b9] dark:from-[#e2692c] dark:to-[#f39c12] text-white">
          <div className="flex flex-col justify-center items-center p-4 h-full">
            <div className="icon-container mb-3 text-white">
              {iconMap[title] || <Briefcase size={24} strokeWidth={1.5} />}
            </div>
            <h3 className="text-sm font-semibold mb-1">View {title}</h3>
            <p className="text-xs text-center opacity-80">Click to see more details</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default FlipCard;
