import { useContext, useEffect, useState } from "react";
import { SidebarContext } from "@/context/SidebarContext";

const useToggleDrawer = () => {
  const [serviceId, setServiceId] = useState("");
  const [serviceIds, setServiceIds] = useState([]);
  const [allId, setAllId] = useState([]);
  const [title, setTitle] = useState("");
  const {
    toggleDrawer,
    isDrawerOpen,
    toggleModal,
    toggleBulkDrawer,
    toggleMultipleDeleteModal,
  } = useContext(SidebarContext);

  const handleUpdate = (id) => {
    setServiceId(id);
    toggleDrawer();
  };

  const handleMultipleUpdate = (ids) => {
    setServiceIds(ids);
    toggleDrawer();
  };

  const handleUpdateMany = (id) => {
    setAllId(id);
    toggleBulkDrawer();
  };

  const handleModalOpen = (id, title) => {
    toggleModal();
    setServiceId(id);
    setTitle(title);
  };

  const handleMultipleDeleteModalOpen = (ids, title) => {
    toggleMultipleDeleteModal();
    setServiceIds(ids);
    setTitle(title);
  };

  useEffect(() => {
    if (!isDrawerOpen) {
      setServiceId("");
      setServiceIds([]);
      setTitle("");
    }
  }, [isDrawerOpen]);

  const handleDeleteMany = async (id, products) => {
    setAllId(id);
    setTitle("Selected Products");
    toggleModal();
  };

  return {
    title,
    allId,
    serviceId,
    serviceIds,
    handleUpdate,
    setServiceId,
    handleModalOpen,
    handleMultipleDeleteModalOpen,
    handleDeleteMany,
    handleUpdateMany,
    handleMultipleUpdate,
    setServiceIds,
  };
};

export default useToggleDrawer;
