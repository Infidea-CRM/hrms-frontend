import { useState } from "react";
import "chart.js/auto";
import { Line } from "react-chartjs-2";
import { useTranslation } from "react-i18next";

const LineChart = ({ salesReport, weeklyApplicationsData }) => {
  // console.log("saleReport", salesReport);
  // Create a Set to store unique dates
  const uniqueDates = new Set();

  // Use filter to iterate through the array and add unique dates to the Set
  const updatedSalesReport = salesReport?.filter((item) => {
    const isUnique = !uniqueDates.has(item.date);
    uniqueDates.add(item.date);
    return isUnique;
  });

  // console.log("updatedSalesReport", updatedSalesReport);

  const [activeButton, setActiveButton] = useState({
    title: "Hired",
    color: "emerald",
  });

  const handleClick = ({ title, color }) => {
    setActiveButton({ title, color });
  };

  // Prepare weekly applications and hiring data
  const weeklyDates = weeklyApplicationsData?.map(item => item.date) || 
    updatedSalesReport?.sort((a, b) => new Date(a.date) - new Date(b.date))?.map((or) => or.date);
    
  // Create datasets based on button selection
  const getDataset = () => {
    if (!weeklyApplicationsData) {
      // Fallback to sales data if no applications data provided
      return activeButton.title === "Sales" 
        ? {
            label: "Sales",
            data: updatedSalesReport
              ?.sort((a, b) => new Date(a.date) - new Date(b.date))
              ?.map((or) => or.total),
            borderColor: "#10B981",
            backgroundColor: "#10B981",
            borderWidth: 3,
            yAxisID: "y",
          }
        : {
            label: "Orders",
            data: updatedSalesReport
              ?.sort((a, b) => new Date(a.date) - new Date(b.date))
              ?.map((or) => or.order),
            borderColor: "#F97316",
            backgroundColor: "#F97316",
            borderWidth: 3,
            yAxisID: "y",
          };
    }
    
    // Return data based on selected button for applications/hiring data
    switch (activeButton.title) {
      case "Hired":
        return {
          label: "Hired",
          data: weeklyApplicationsData?.map(item => item.hired),
          borderColor: "#10B981",
          backgroundColor: "#10B981",
          borderWidth: 3,
          yAxisID: "y",
        };
      case "Applications":
        return {
          label: "Applications",
          data: weeklyApplicationsData?.map(item => item.applications),
          borderColor: "#F97316",
          backgroundColor: "#F97316",
          borderWidth: 3,
          yAxisID: "y",
        };
      default:
        return {
          label: "Hired",
          data: weeklyApplicationsData?.map(item => item.hired),
          borderColor: "#10B981",
          backgroundColor: "#10B981",
          borderWidth: 3,
          yAxisID: "y",
        };
    }
  };

  const barOptions = {
    data: {
      labels: weeklyDates,
      datasets: [getDataset()],
    },
    options: {
      responsive: true,
    },
    legend: {
      display: false,
    },
  };

  const { t } = useTranslation();

  return (
    <>
      <div className="text-sm font-medium text-center text-gray-500 border-b border-gray-200 dark:text-gray-400 dark:border-gray-700 mb-4">
        <ul className="flex flex-wrap -mb-px">
          <li className="mr-2">
            <button
              onClick={() => handleClick({ title: "Hired", color: "emerald" })}
              type="button"
              className={`inline-block p-2 rounded-t-lg border-b-2 border-transparent ${
                activeButton.title === "Hired"
                  ? "text-emerald-600 border-emerald-600 dark:text-emerald-500 dark:border-emerald-500"
                  : "hover:text-gray-600 hover:border-gray-300 dark:hover:text-gray-300"
              }  focus:outline-none`}
            >
              {weeklyApplicationsData ? t("Hired") : t("Sales")}
            </button>
          </li>

          <li className="mr-2">
            <button
              onClick={() => handleClick({ title: "Applications", color: "orange" })}
              type="button"
              className={`inline-block p-2 rounded-t-lg border-b-2 border-transparent ${
                activeButton.title === "Applications"
                  ? "text-orange-500 border-orange-500 dark:text-orange-500 dark:border-orange-500"
                  : "hover:text-gray-600 hover:border-gray-300 dark:hover:text-gray-300"
              }  focus:outline-none`}
            >
              {weeklyApplicationsData ? t("Applications") : t("Orders")}
            </button>
          </li>
        </ul>
      </div>

      <Line {...barOptions} />
    </>
  );
};

export default LineChart;
