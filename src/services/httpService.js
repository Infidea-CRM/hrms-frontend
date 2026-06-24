import axios from "axios";
import Cookies from "js-cookie";

// console.log("base url", import.meta.env.VITE_APP_API_BASE_URL);

const instance = axios.create({
  baseURL: `${import.meta.env.VITE_APP_API_BASE_URL}`,
  timeout: 50000,
  headers: {
    Accept: "application/json",
    "Content-Type": "application/json",
  },
});

// Add a request interceptor
instance.interceptors.request.use(function (config) {
  // Do something before request is sent
  let adminInfo;
  if (Cookies.get("adminInfo")) {
    adminInfo = JSON.parse(Cookies.get("adminInfo"));
  }

  let company;

  if (Cookies.get("company")) {
    company = Cookies.get("company");
  }

  // console.log('Admin Http Services Cookie Read : ' + company);
  // let companyName = JSON.stringify(company);

  return {
    ...config,
    headers: {
      authorization: adminInfo ? `Bearer ${adminInfo.token}` : null,
      company: company ? company : null,
    },
  };
});

const AUTH_EXCLUDED_ROUTES = [
  "/auth/employee/login",
  "/auth/employee/verify-login-otp",
  "/auth/employee/resend-login-otp",
  "/auth/employee/forgot-Password",
  "/auth/employee/reset-password",
];

instance.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error?.response?.status;
    const requestUrl = error?.config?.url || "";
    const hasSession = Boolean(Cookies.get("adminInfo"));
    const isExcludedRoute = AUTH_EXCLUDED_ROUTES.some((route) =>
      requestUrl.includes(route)
    );

    if (status === 401 && hasSession && !isExcludedRoute) {
      Cookies.remove("adminInfo", { sameSite: "None", secure: true });
      window.location.href = "/login";
    }

    return Promise.reject(error);
  }
);

const responseBody = (response) => response.data;

const requests = {
  get: (url, body, headers) =>
    instance.get(url, body, headers).then(responseBody),

  post: (url, body) => instance.post(url, body).then(responseBody),

  put: (url, body, headers) =>
    instance.put(url, body, headers).then(responseBody),

  patch: (url, body) => instance.patch(url, body).then(responseBody),

  delete: (url, body) => instance.delete(url, body).then(responseBody),

  getBlob: async (url) => {
    const response = await fetch(import.meta.env.VITE_APP_API_BASE_URL + url, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${Cookies.get("token")}`,
      },
    });

    if (!response.ok) {
      throw new Error("Network response was not ok");
    }

    return response.blob();
  },
};

export default requests;
