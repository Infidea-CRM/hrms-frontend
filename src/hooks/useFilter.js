import dayjs from "dayjs";
import { useEffect, useMemo, useRef, useState } from "react";

//internal import
const useFilter = (data) => {
  const [searchCandidate, setSearchCandidate] = useState("");
  const [searchJoinings, setSearchJoinings] = useState("");
  const [searchLineups, setSearchLineups] = useState("");
  const [searchWalkins, setSearchWalkins] = useState("");
  const [dataTable, setDataTable] = useState([]); //tableTable for showing on table according to filtering
  const [isDisabled, setIsDisable] = useState(false);

  const candidateRef = useRef("");
  const joiningsRef = useRef("");
  const lineupsRef = useRef("");
  const walkinsRef = useRef("");
  const [sortBy, setSortBy] = useState("");
  const [sortOrder, setSortOrder] = useState("asc");
  const [dateRange, setDateRange] = useState({
    startDate: null,
    endDate: null,
  });
  const [dateRangeType, setDateRangeType] = useState("");

  //service data filtering
  const serviceData = useMemo(() => {
    let services = data?.map((el) => {
      const newDate = new Date(el?.createdAt).toLocaleString("en-US", {
        timeZone: "Asia/Kolkata",
      });
      const newObj = {
        ...el,
        updatedDate: newDate === "Invalid Date" ? "" : newDate,
      };
      return newObj;
    });

    //User and Admin filtering
    if (searchCandidate) {
      // Split searchCandidate by comma and get array of search terms
      const searchTerms = searchCandidate
        .split(",")
        .map((term) => term.trim().toLowerCase().replace(/\s+/g, ""))
        .filter((term) => term.length > 0);

      services = services.filter((search) => {
        // For this record to match, ALL search terms must be found in AT LEAST ONE field
        return searchTerms.every((term) => {
          // Function to normalize and check a field
          const fieldContains = (fieldValue) => {
            if (!fieldValue && fieldValue !== 0) return false;
            const normalizedField = String(fieldValue)
              .toLowerCase()
              .replace(/\s+/g, "");
            return normalizedField.includes(term);
          };

          // Check if this term exists in any of the fields
          return (
            fieldContains(search.name) ||
            fieldContains(search.mobileNo) ||
            fieldContains(search.whatsappNo) ||
            fieldContains(search.source) ||
            fieldContains(search.gender) ||
            fieldContains(search.experience) ||
            fieldContains(search.qualification) ||
            fieldContains(search.state) ||
            fieldContains(search.city) ||
            fieldContains(search.locality) ||
            fieldContains(search.salaryExpectation) ||
            fieldContains(search.communication) ||
            fieldContains(search.noticePeriod) ||
            fieldContains(search.shift) ||
            fieldContains(search.relocation) ||
            fieldContains(search.companyProfile) ||
            fieldContains(search.callStatus) ||
            fieldContains(search.callSummary) ||
            fieldContains(search.callDuration) ||
            fieldContains(search.lineupCompany) ||
            fieldContains(search.lineupProcess) ||
            fieldContains(search.lineupDate) ||
            fieldContains(search.interviewDate) ||
            fieldContains(search.walkinDate)
          );
        });
      });
    }

    if (searchLineups) {
      // Split searchLineups by comma and get array of search terms
      const searchTerms = searchLineups
        .split(",")
        .map((term) => term.trim().toLowerCase().replace(/\s+/g, ""))
        .filter((term) => term.length > 0);

      services = services.filter((search) => {
        // For this record to match, ALL search terms must be found in AT LEAST ONE field
        return searchTerms.every((term) => {
          // Function to normalize and check a field
          const fieldContains = (fieldValue) => {
            if (!fieldValue && fieldValue !== 0) return false;
            const normalizedField = String(fieldValue)
              .toLowerCase()
              .replace(/\s+/g, "");
            return normalizedField.includes(term);
          };

          // Check if this term exists in any of the fields
          return (
            fieldContains(search.name) ||
            fieldContains(search.contactNumber) ||
            fieldContains(search.company) ||
            fieldContains(search.process) ||
            fieldContains(search.status)
          );
        });
      });
    }

    if (searchWalkins) {
      services = services.filter((search) => {
        return (
          search.candidateName
            .toLowerCase()
            .includes(searchWalkins.toLowerCase()) ||
          search.contactNumber
            .toLowerCase()
            .includes(searchWalkins.toLowerCase())
        );
      });
    }

    if (searchJoinings) {
      services = services.filter((search) => {
        return (
          search.candidateName
            .toLowerCase()
            .includes(searchJoinings.toLowerCase()) ||
          search.company.toLowerCase().includes(searchJoinings.toLowerCase()) ||
          search.process.toLowerCase().includes(searchJoinings.toLowerCase()) ||
          search.joiningType
            .toLowerCase()
            .includes(searchJoinings.toLowerCase()) ||
          search.contactNumber
            .toString()
            .toLowerCase()
            .includes(searchJoinings.toLowerCase()) ||
          search.incentiveSummary?.incentives.eligible
            .toString()
            .toLowerCase()
            .includes(searchJoinings.toLowerCase())
        );
      });
    }

    // Apply date range filtering
    if (dateRange.startDate && dateRange.endDate) {
      const start = dayjs(dateRange.startDate).startOf(dateRangeType || "day");
      const end = dayjs(dateRange.endDate).endOf(dateRangeType || "day");

      services = services.filter((item) => {
        const createdAt = item.createdAt ? dayjs(item.createdAt) : null;
        const updatedAt = item.updatedAt ? dayjs(item.updatedAt) : null;

        const createdInRange =
          createdAt && createdAt.isAfter(start) && createdAt.isBefore(end);
        const updatedInRange =
          updatedAt && updatedAt.isAfter(start) && updatedAt.isBefore(end);

        return createdInRange || updatedInRange;
      });
    }

    // Apply sorting based on sortBy and sortOrder
    if (sortBy) {
      services = [...services].sort((a, b) => {
        // Handle nested properties with dot notation (e.g., "name.en")
        const getValue = (obj, path) => {
          const keys = path.split(".");
          return keys.reduce(
            (o, key) => (o && o[key] !== undefined ? o[key] : null),
            obj
          );
        };

        let valueA = getValue(a, sortBy);
        let valueB = getValue(b, sortBy);

        // Handle null/undefined values
        if (valueA === null || valueA === undefined)
          return sortOrder === "asc" ? -1 : 1;
        if (valueB === null || valueB === undefined)
          return sortOrder === "asc" ? 1 : -1;

        // Handle date string values (convert to Date objects)
        const isDateString = (val) => {
          if (typeof val !== "string") return false;
          // Check if string looks like a date (YYYY-MM-DD or common date formats)
          return /^\d{4}-\d{1,2}-\d{1,2}|^\d{1,2}[/-]\d{1,2}[/-]\d{2,4}/.test(
            val
          );
        };

        if (isDateString(valueA) && isDateString(valueB)) {
          const dateA = new Date(valueA);
          const dateB = new Date(valueB);

          if (!isNaN(dateA) && !isNaN(dateB)) {
            return sortOrder === "asc"
              ? dateA.getTime() - dateB.getTime()
              : dateB.getTime() - dateA.getTime();
          }
        }

        // Sort dates
        if (valueA instanceof Date && valueB instanceof Date) {
          return sortOrder === "asc"
            ? valueA.getTime() - valueB.getTime()
            : valueB.getTime() - valueA.getTime();
        }

        // Sort numbers
        if (typeof valueA === "number" && typeof valueB === "number") {
          return sortOrder === "asc" ? valueA - valueB : valueB - valueA;
        }

        // Handle potential number strings
        if (typeof valueA === "string" && typeof valueB === "string") {
          // Try to convert to numbers if they look numeric
          const numA = !isNaN(parseFloat(valueA)) ? parseFloat(valueA) : null;
          const numB = !isNaN(parseFloat(valueB)) ? parseFloat(valueB) : null;

          if (numA !== null && numB !== null) {
            return sortOrder === "asc" ? numA - numB : numB - numA;
          }

          // Regular string comparison (case-insensitive)
          valueA = valueA.toLowerCase();
          valueB = valueB.toLowerCase();
        }

        // Regular comparison
        if (valueA < valueB) return sortOrder === "asc" ? -1 : 1;
        if (valueA > valueB) return sortOrder === "asc" ? 1 : -1;
        return 0;
      });
    }

    return services;
  }, [
    data,
    searchCandidate,
    sortBy,
    sortOrder,
    dateRange.startDate,
    dateRange.endDate,
    dateRangeType,
    candidateRef,
    searchLineups,
    lineupsRef,
    searchWalkins,
    walkinsRef,
    searchJoinings,
    joiningsRef,
  ]);

  useEffect(() => {
    setDataTable(serviceData);
  }, [serviceData]);
  //pagination functionality end
  //table form submit function for search start
  const handleSubmitCandidate = (e) => {
    if (e && typeof e.preventDefault === "function") {
      e.preventDefault();
      setSearchCandidate(candidateRef.current.value);
    } else {
      setSearchCandidate(e);
    }
  };

  const handleSubmitLineups = (e) => {
    if (e && typeof e.preventDefault === "function") {
      e.preventDefault();
      setSearchLineups(lineupsRef.current.value);
    } else {
      setSearchLineups(e);
    }
  };

  const handleSubmitWalkins = (e) => {
    if (e && typeof e.preventDefault === "function") {
      e.preventDefault();
      setSearchWalkins(walkinsRef.current.value);
    } else {
      setSearchWalkins(e);
    }
  };

  const handleSubmitJoinings = (e) => {
    if (e && typeof e.preventDefault === "function") {
      e.preventDefault();
      setSearchJoinings(joiningsRef.current.value);
    } else {
      setSearchJoinings(e);
    }
  };

  // Helper functions for date range filtering
  const handleDateRangeChange = (startDate, endDate) => {
    setDateRange({
      startDate,
      endDate,
    });
  };

  // Handle sort change
  const handleSortChange = (field) => {
    // If clicking the same field, toggle sort order
    if (sortBy === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      // If clicking a new field, set it as the sort field and default to ascending
      setSortBy(field);
      setSortOrder("asc");
    }
  };

  // Function to set date range type
  const handleDateRangeTypeChange = (type) => {
    setDateRangeType(type);
  };

  return {
    candidateRef,
    lineupsRef,
    walkinsRef,
    joiningsRef,
    dataTable,
    serviceData,
    isDisabled,
    setDataTable,
    handleSubmitCandidate,
    handleSubmitLineups,
    handleSubmitWalkins,
    handleSubmitJoinings,
    sortBy,
    sortOrder,
    dateRange,
    dateRangeType,
    setSortBy,
    setSortOrder,
    setDateRange,
    setDateRangeType,
    handleSortChange,
    handleDateRangeChange,
    handleDateRangeTypeChange,
    handleSubmitWalkins,
  };
};

export default useFilter;
