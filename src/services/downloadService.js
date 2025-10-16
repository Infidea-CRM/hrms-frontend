import axios from "axios";
import Cookies from "js-cookie";

const downloadUsers = async () => {
  const response = await axios.get(
    `${import.meta.env.VITE_APP_API_BASE_URL}/admin/download-users`,
    {
      headers: {
        Authorization: `Bearer ${
          Cookies.get("adminInfo")
            ? JSON.parse(Cookies.get("adminInfo")).token
            : null
        }`,
        company: Cookies.get("company") ? Cookies.get("company") : null,
      },
    }
  );

  if (!response.ok) {
    throw new Error("Network response was not ok");
  }

  return response.data;
};

export default { downloadUsers };
