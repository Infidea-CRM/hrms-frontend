import React, { useState, useEffect } from "react";
import { FiEdit, FiTrash2, FiArchive, FiInbox, FiX, FiEye } from "react-icons/fi";
import { MdAdd } from "react-icons/md";
import NoteServices from "@/services/NoteServices";
import { useToast } from "@/utils/toast";
import PageTitle from "@/components/Typography/PageTitle";
import {
  Card,
  CardBody,
  Button,
  Badge,
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Label,
  Input,
  Select,
} from "@windmill/react-ui";
import EmptyState from "@/components/EmptyState";
import { formatDayNameDate } from "@/utils/dateFormatter";

const Notes = () => {
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isContentModalOpen, setIsContentModalOpen] = useState(false);
  const [currentNote, setCurrentNote] = useState(null);
  const [viewingNoteContent, setViewingNoteContent] = useState({ title: "", content: "" });
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    category: "personal",
  });
  const [filter, setFilter] = useState({
    category: "",
    isArchived: false,
  });

  const { addToast } = useToast();

  // Fetch notes on component mount and when filters change
  useEffect(() => {
    fetchNotes();
  }, [filter]);

  const fetchNotes = async () => {
    try {
      setLoading(true);
      const response = await NoteServices.getNotes({
        category: filter.category || undefined,
        isArchived: filter.isArchived,
      });
      // Ensure we always set an array, even if the response structure is unexpected
      setNotes(response?.data || []);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching notes:", error);
      addToast({
        type: "danger",
        title: "Error",
        message: "Failed to fetch notes. Please try again.",
      });
      setNotes([]); // Set to empty array on error
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilter({
      ...filter,
      [name]: value,
    });
  };

  const toggleArchiveFilter = () => {
    setFilter({
      ...filter,
      isArchived: !filter.isArchived,
    });
  };

  const openModal = (note = null) => {
    if (note) {
      setCurrentNote(note);
      setFormData({
        title: note.title,
        content: note.content,
        category: note.category,
      });
    } else {
      setCurrentNote(null);
      setFormData({
        title: "",
        content: "",
        category: "personal",
      });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setCurrentNote(null);
  };

  const openDeleteModal = (note) => {
    setCurrentNote(note);
    setIsDeleteModalOpen(true);
  };

  const closeDeleteModal = () => {
    setIsDeleteModalOpen(false);
    setCurrentNote(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (currentNote) {
        // Update existing note
        await NoteServices.updateNote(currentNote._id, formData);
        addToast({
          type: "success",
          title: "Success",
          message: "Note updated successfully",
        });
      } else {
        // Create new note
        await NoteServices.createNote(formData);
        addToast({
          type: "success",
          title: "Success",
          message: "Note created successfully",
        });
      }
      closeModal();
      fetchNotes();
    } catch (error) {
      console.error("Error saving note:", error);
      addToast({
        type: "danger",
        title: "Error",
        message: error.response?.data?.message || "Failed to save note",
      });
    }
  };

  const handleDelete = async () => {
    try {
      await NoteServices.deleteNote(currentNote._id);
      addToast({
        type: "success",
        title: "Success",
        message: "Note deleted successfully",
      });
      closeDeleteModal();
      fetchNotes();
    } catch (error) {
      console.error("Error deleting note:", error);
      addToast({
        type: "danger",
        title: "Error",
        message: error.response?.data?.message || "Failed to delete note",
      });
    }
  };

  const handleArchiveToggle = async (note) => {
    try {
      await NoteServices.toggleArchiveNote(note._id);
      addToast({
        type: "success",
        title: "Success",
        message: note.isArchived
          ? "Note unarchived successfully"
          : "Note archived successfully",
      });
      fetchNotes();
    } catch (error) {
      console.error("Error toggling archive status:", error);
      addToast({
        type: "danger",
        title: "Error",
        message: error.response?.data?.message || "Failed to update note",
      });
    }
  };

  const getCategoryColor = (category) => {
    switch (category) {
      case "personal":
        return "primary";
      case "work":
        return "success";
      case "meeting":
        return "warning";
      case "reminder":
        return "info";
      default:
        return "neutral";
    }
  };

  // Function to open content modal
  const openContentModal = (note) => {
    setViewingNoteContent({
      title: note.title,
      content: note.content
    });
    setIsContentModalOpen(true);
  };

  // Function to close content modal
  const closeContentModal = () => {
    setIsContentModalOpen(false);
  };

  // Function to truncate text
  const truncateText = (text, maxLength = 150) => {
    if (!text) return "";
    
    // Handle multi-line text by replacing excessive newlines
    const normalizedText = text.replace(/\n{3,}/g, "\n\n");
    
    if (normalizedText.length <= maxLength) return normalizedText;
    
    // Find a good breaking point
    let truncated = normalizedText.substring(0, maxLength);
    const lastSpace = truncated.lastIndexOf(" ");
    
    if (lastSpace > maxLength * 0.8) {
      truncated = truncated.substring(0, lastSpace);
    }
    
    return truncated + "...";
  };

  return (
    <>
      <div className="flex justify-between items-center mb-6">
      <div className="flex justify-between items-center mb-4 mt-4">
          <h1 className="text-2xl font-bold dark:text-[#e2692c] text-[#1a5d96]">
            Notes
          </h1>
        </div>
        <div className="flex space-x-4">
          <Button onClick={() => openModal()} iconLeft={MdAdd}>
            Add Note
          </Button>
        </div>
      </div>

      <div className="mb-6 flex flex-wrap gap-4 items-center">
        <div className="flex items-center">
          <Label className="mr-2">Category:</Label>
          <Select
            name="category"
            value={filter.category}
            onChange={handleFilterChange}
            className=" bg-gray-200 dark:bg-gray-800 text-black dark:text-white rounded-md"
          >
            <option value="">All Categories</option>
            <option value="personal">Personal</option>
            <option value="work">Work</option>
            <option value="meeting">Meeting</option>
            <option value="reminder">Reminder</option>
            <option value="other">Other</option>
          </Select>
        </div>

        <Button
          size="small"
          onClick={toggleArchiveFilter}
          iconLeft={filter.isArchived ? FiInbox : FiArchive}
          className="flex items-center bg-gray-200 text-black dark:text-white dark:bg-gray-800 hover:bg-gray-300 dark:hover:bg-gray-700" 
        >
          {filter.isArchived ? "Show Active" : "Show Archived"}
        </Button>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-700 dark:border-purple-500"></div>
        </div>
      ) : !notes || notes.length === 0 ? (
        <EmptyState
          title={
            filter.isArchived
              ? "No archived notes found"
              : "No notes found"
          }
          description={
            filter.isArchived
              ? "You don't have any archived notes yet."
              : "Create your first note by clicking the 'Add Note' button."
          }
        />
      ) : (
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3 max-h-[calc(100vh-220px)] overflow-y-auto custom-scrollbar pb-4">
          {notes.map((note) => (
            <Card
              key={note._id}
              className={`${
                note.isArchived ? "bg-gray-100 dark:bg-gray-800" : ""
              } hover:shadow-lg transition-shadow duration-300`}
            >
              <CardBody className="flex flex-col h-full">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">{note.title}</h3>
                  <Badge type={getCategoryColor(note.category)}>
                    {note.category}
                  </Badge>
                </div>
                <div className="flex-grow">
                  <p className="text-sm text-gray-600 dark:text-stone-400 mb-1 whitespace-pre-wrap h-20 overflow-hidden custom-scrollbar">
                    {truncateText(note.content)}
                  </p>
                  {note.content.length > 150 && (
                    <button 
                      onClick={() => openContentModal(note)} 
                      className="text-xs text-purple-600 dark:text-purple-400 hover:underline mb-3 flex items-center"
                    >
                      <FiEye className="mr-1" size={12} />
                      See More
                    </button>
                  )}
                </div>
                <div className="flex justify-between items-center mt-auto">
                  <span className="text-xs text-gray-400">
                    {formatDayNameDate(note.updatedAt)}
                  </span>
                  <div className="flex space-x-2">
                    <Button
                      layout="link"
                      size="small"
                      aria-label="Edit"
                      onClick={() => openModal(note)}
                      icon={FiEdit}
                    />
                    <Button
                      layout="link"
                      size="small"
                      aria-label="Archive"
                      onClick={() => handleArchiveToggle(note)}
                      icon={note.isArchived ? FiInbox : FiArchive}
                    />
                    <Button
                      layout="link"
                      size="small"
                      aria-label="Delete"
                      onClick={() => openDeleteModal(note)}
                      icon={FiTrash2}
                    />
                  </div>
                </div>
              </CardBody>
            </Card>
          ))}
        </div>
      )}

      {/* Create/Edit Note Modal */}
      <Modal isOpen={isModalOpen} onClose={closeModal}>
        <ModalHeader>
          {currentNote ? "Edit Note" : "Create New Note"}
        </ModalHeader>
        <form onSubmit={handleSubmit}>
          <ModalBody>
            <div className="mb-4">
              <Label>
                <span>Title</span>
                <Input
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  className="mt-1"
                  placeholder="Note title"
                  required
                />
              </Label>
            </div>
            <div className="mb-4">
              <Label>
                <span>Content</span>
                <textarea
                  name="content"
                  value={formData.content}
                  onChange={handleInputChange}
                  className="mt-1 w-full px-3 py-2 text-sm text-gray-700 dark:text-gray-300 border dark:border-gray-600 rounded-md focus:outline-none focus:ring focus:ring-purple-300 dark:focus:ring-purple-600 bg-white dark:bg-gray-700"
                  rows="5"
                  placeholder="Note content"
                  required
                ></textarea>
              </Label>
            </div>
            <div className="mb-4">
              <Label>
                <span>Category</span>
                <Select
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  className="mt-1"
                >
                  <option value="personal">Personal</option>
                  <option value="work">Work</option>
                  <option value="meeting">Meeting</option>
                  <option value="reminder">Reminder</option>
                  <option value="other">Other</option>
                </Select>
              </Label>
            </div>
          </ModalBody>
          <ModalFooter>
            <div className="flex flex-col sm:flex-row sm:justify-end gap-2">
              <Button layout="outline" onClick={closeModal}>
                Cancel
              </Button>
              <Button type="submit">Save</Button>
            </div>
          </ModalFooter>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal isOpen={isDeleteModalOpen} onClose={closeDeleteModal}>
        <ModalHeader>Delete Note</ModalHeader>
        <ModalBody>
          Are you sure you want to delete this note? This action cannot be
          undone.
        </ModalBody>
        <ModalFooter>
          <div className="flex flex-col sm:flex-row sm:justify-end gap-2">
            <Button layout="outline" onClick={closeDeleteModal} iconLeft={FiX} className="bg-white">
              Cancel 
            </Button>
            <Button onClick={handleDelete} layout="danger" iconLeft={FiTrash2} className="bg-red-500 hover:bg-red-600 text-white">
              Delete
            </Button>
          </div>
        </ModalFooter>
      </Modal>

      {/* Content Modal */}
      <Modal isOpen={isContentModalOpen} onClose={closeContentModal}>
        <ModalHeader>
          <span className="text-gray-800 dark:text-gray-200">{viewingNoteContent.title}</span>
        </ModalHeader>
        <ModalBody>
          <div className="max-h-96 overflow-y-auto custom-scrollbar">
            <p className="whitespace-pre-wrap text-gray-700 dark:text-gray-300">
              {viewingNoteContent.content}
            </p>
          </div>
        </ModalBody>
        <ModalFooter>
          <Button layout="outline" onClick={closeContentModal} iconLeft={FiX} className="bg-white dark:bg-gray-800">
            Close
          </Button>
        </ModalFooter>
      </Modal>
    </>
  );
};

export default Notes; 