import React from "react";
import { PhoneCall, Users, Briefcase, CheckCircle, Clock } from "lucide-react";

const iconMap = {
  Calls: <PhoneCall size={20} className="text-blue-500" />,
  Lineups: <Users size={20} className="text-yellow-500" />,
  "New Joinings": <Briefcase size={20} className="text-green-500" />,
  "New Selections": <CheckCircle size={20} className="text-purple-500" />,
  "Time Spent": <Clock size={20} className="text-pink-500" />,
};

function SmallCard({ label, data }) {
  return (
    <div
      className="w-full h-20 bg-white dark:bg-gray-700 rounded-lg shadow flex items-center justify-start gap-4 px-4 hover:scale-105 hover:border-2 hover:border-[#1a5d96] dark:hover:border-[#e2692c] cursor-pointer"
    >
      {iconMap[label] || <Briefcase size={20} />}
      <div>
        <p className="text-xs text-gray-400 dark:text-gray-300">{label}</p>
        <p className="text-lg font-semibold text-gray-800 dark:text-white">
          {data}
        </p>
      </div>
    </div>
  );
}

export default SmallCard;
