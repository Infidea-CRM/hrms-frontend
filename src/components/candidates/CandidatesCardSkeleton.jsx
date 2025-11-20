import "./CandidatesCard.css";

const CandidatesCardSkeleton = ({ count = 4 }) => {
  return (
    <div className="flex flex-col gap-4 mb-8">
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className="skeleton-card p-4">
          <div className="flex flex-row gap-4">
            {/* Left Side - Profile Avatar and Checkbox */}
            <div className="flex flex-col items-center gap-3 flex-shrink-0">
              <div className="skeleton-line w-5 h-5 rounded"></div>
              <div className="skeleton-avatar"></div>
            </div>

            {/* Middle Section - Main Content */}
            <div className="flex-1 min-w-0">
              {/* Header with Name and Actions */}
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1 min-w-0">
                  <div className="skeleton-line w-32 h-6 mb-2"></div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <div className="skeleton-badge"></div>
                    <div className="skeleton-badge w-16"></div>
                  </div>
                </div>
                <div className="flex gap-2 ml-2">
                  <div className="skeleton-line w-10 h-10 rounded-full"></div>
                  <div className="skeleton-line w-10 h-10 rounded-full"></div>
                </div>
              </div>

              {/* Content Grid */}
              <div className="card-content-grid">
                {/* Phone */}
                <div className="flex items-center gap-2">
                  <div className="skeleton-line-sm w-4 h-4 rounded"></div>
                  <div className="skeleton-line w-24 h-4"></div>
                </div>
                
                {/* WhatsApp */}
                <div className="flex items-center gap-2">
                  <div className="skeleton-line-sm w-4 h-4 rounded"></div>
                  <div className="skeleton-line w-24 h-4"></div>
                </div>
                
                {/* Location */}
                <div className="flex items-start gap-2">
                  <div className="skeleton-line-sm w-4 h-4 rounded mt-0.5"></div>
                  <div className="flex-1">
                    <div className="skeleton-line w-20 h-4 mb-1"></div>
                    <div className="skeleton-line-sm w-16 h-3"></div>
                  </div>
                </div>
                
                {/* Qualification */}
                <div className="flex items-center gap-2">
                  <div className="skeleton-line-sm w-4 h-4 rounded"></div>
                  <div className="skeleton-line w-32 h-4"></div>
                </div>
                
                {/* Experience */}
                <div className="flex items-center gap-2">
                  <div className="skeleton-line-sm w-4 h-4 rounded"></div>
                  <div className="skeleton-line w-20 h-4"></div>
                </div>
                
                {/* Profile */}
                <div className="flex items-start gap-2">
                  <div className="skeleton-line-sm w-4 h-4 rounded mt-0.5"></div>
                  <div className="flex-1">
                    <div className="skeleton-line w-28 h-4 mb-1"></div>
                    <div className="skeleton-line-sm w-24 h-3"></div>
                  </div>
                </div>
                
                {/* Communication */}
                <div>
                  <div className="skeleton-line w-32 h-4"></div>
                </div>
                
                {/* Shift */}
                <div>
                  <div className="skeleton-line w-24 h-4"></div>
                </div>
                
                {/* Notice */}
                <div>
                  <div className="skeleton-line w-28 h-4"></div>
                </div>
                
                {/* Salary */}
                <div>
                  <div className="skeleton-line w-20 h-4"></div>
                </div>
                
                {/* Time Spent */}
                <div className="flex items-center gap-1">
                  <div className="skeleton-line-sm w-3.5 h-3.5 rounded"></div>
                  <div className="skeleton-line w-16 h-3"></div>
                </div>
                
                {/* Last Updated */}
                <div className="skeleton-line w-32 h-3"></div>
                
                {/* Last Registered By */}
                <div className="skeleton-line w-40 h-3"></div>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default CandidatesCardSkeleton;

