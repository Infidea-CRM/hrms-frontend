import React from 'react';

export const RangeField = ({ label, min, max, value, onChange, unit, step }) => {
  const formatValue = (val, unit) => {
    if (unit === "Years") {
      return `${val} Year${val > 1 ? "s" : ""}`;
    }

    if (val >= 100000) {
      return `${(val / 100000).toFixed(1)} Lac`;
    } else if (val >= 1000) {
      return `${(val / 1000).toFixed(0)}k`;
    }
    return val.toString();
  };

  const handleWheel = (e) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? -step : step;
    const newValue = Math.min(Math.max(value + delta, min), max);
    onChange({ target: { value: newValue } });
  };

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
        {label}
      </label>
      <div className="flex items-center gap-4 relative group">
        <div className="relative w-full">
          <input
            type="range"
            min={min}
            max={max}
            step={step}
            value={value}
            onChange={onChange}
            onWheel={handleWheel}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700
                      hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors
                      relative z-10"
            onMouseEnter={(e) => {
              e.currentTarget.focus();
            }}
          />

          <div 
            className="absolute z-20 left-0 w-full pointer-events-none"
            style={{ top: "-2rem" }}
          >
            <div 
              className="absolute bg-gray-900 text-white px-2 py-1 top-[-25px] rounded text-xs whitespace-nowrap shadow-lg"
              style={{
                left: `${((value - min) / (max - min)) * 100}%`,
                transform: "translateX(-50%)"
              }}
            >
              {formatValue(value, unit)}
              <div 
                className="absolute w-2 h-2 bg-gray-900 rotate-45 transform -translate-x-1/2 translate-y-[2px]"
                style={{ 
                  left: "50%", 
                }}
              ></div>
            </div>
          </div>
        </div>

        <span className="text-sm text-gray-600 dark:text-gray-400 min-w-[100px]">
          {formatValue(value, unit)}
        </span>
      </div>
    </div>
  );
}; 