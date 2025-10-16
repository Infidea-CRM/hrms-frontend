import requests from "./httpService";

const ThoughtServices = {
  /**
   * Get random thoughts for dashboard display
   */
  getRandomThoughts: async () => {
    return requests.get("/thoughts/random");
  },
};

export default ThoughtServices;
