import requests from "./httpService";

const NoteServices = {
  // Create a new note
  createNote: async (noteData) => {
    const { data } = await requests.post("/notes", noteData);
    return data;
  },

  // Get all notes with optional filters
  getNotes: async (filters = {}) => {
    try {
      const response = await requests.get("/notes", {
        params: filters,
      });

      // Ensure we always return an object with a data property that is an array
      if (response && Array.isArray(response)) {
        // If the API returns an array directly, wrap it
        return { data: response };
      } else if (response && response.data && Array.isArray(response.data)) {
        // If the API returns the expected structure
        return response;
      } else if (response && !response.data) {
        // If the API returns an object without a data property
        return { data: [] };
      }

      // Default fallback
      return { data: [] };
    } catch (error) {
      console.error("Error fetching notes:", error);
      return { data: [] };
    }
  },

  // Get a single note by ID
  getNoteById: async (noteId) => {
    const { data } = await requests.get(`/notes/${noteId}`);
    return data;
  },

  // Update a note
  updateNote: async (noteId, noteData) => {
    const { data } = await requests.put(`/notes/${noteId}`, noteData);
    return data;
  },

  // Delete a note
  deleteNote: async (noteId) => {
    const { data } = await requests.delete(`/notes/${noteId}`);
    return data;
  },

  // Toggle archive status of a note
  toggleArchiveNote: async (noteId) => {
    const { data } = await requests.patch(`/notes/${noteId}/archive`);
    return data;
  },
};

export default NoteServices;
