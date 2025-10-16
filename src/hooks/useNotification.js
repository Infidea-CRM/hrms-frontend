import { useEffect, useState, useRef } from "react";
import { useDispatch } from "react-redux";
import Cookies from "js-cookie";
import NotificationServices from "@/services/NotificationServices";
import { notifyError } from "@/utils/toast";
import { useSocket } from "@/context/SocketContext";

const useNotification = () => {
  const dispatch = useDispatch();
  const [updated, setUpdated] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const { socket, isConnected } = useSocket();
  const audioRef = useRef(null);

  // Initialize audio element
  useEffect(() => {
    // Create audio element for notification sound
    if (typeof Audio !== "undefined") {
      try {
        // Create an audio element
        const audio = new Audio();
        audio.src = "/assets/audio/notification_tone.mp3"; // Direct path to MP3 file
        audio.volume = 0.5; // Set volume to 50%
        audio.preload = "auto"; // Preload the sound

        // Add event listeners for debugging
        audio.addEventListener("canplaythrough", () => {});

        audio.addEventListener("error", (e) => {
          console.error("Error loading notification sound:", e);
        });

        // Save the audio element reference
        audioRef.current = audio;

        // Try to load the sound
        audio.load();
      } catch (error) {
        console.error("Failed to initialize notification sound:", error);
      }
    }
  }, []);

  // Set up socket event listeners for notifications
  useEffect(() => {
    if (!socket || !isConnected) return;

    // Get employee info from cookies
    const adminInfo = Cookies.get("adminInfo")
      ? JSON.parse(Cookies.get("adminInfo"))
      : null;

    if (adminInfo && adminInfo.user && adminInfo.user._id) {
      // Listen for new notifications
      socket.on("new_notification", (data) => {
        setUpdated(true);
        fetchUnreadCount();

        // Play notification sound
        playNotificationSound().catch((error) =>
          console.error(
            "Failed to play notification sound on new notification:",
            error
          )
        );
      });

      // Listen for notification read events
      socket.on("notification_read", () => {
        fetchUnreadCount();
      });

      // Listen for all notifications read events
      socket.on("all_notifications_read", () => {
        fetchUnreadCount();
      });

      // Listen for notification deleted events
      socket.on("notification_deleted", () => {
        fetchUnreadCount();
      });
    }

    return () => {
      if (socket) {
        socket.off("new_notification");
        socket.off("notification_read");
        socket.off("all_notifications_read");
        socket.off("notification_deleted");
      }
    };
  }, [socket, isConnected]);

  // Fetch unread count whenever updated changes
  useEffect(() => {
    if (updated) {
      fetchUnreadCount();
      setUpdated(false); // Reset updated flag after fetching
    }
  }, [updated]);

  // Function to fetch unread notification count
  const fetchUnreadCount = async () => {
    try {
      const response = await NotificationServices.getUnreadCount();
      setUnreadCount(response.count);
    } catch (error) {
      notifyError(error?.response?.data?.message || error?.message);
    }
  };

  // Initialize unread count
  useEffect(() => {
    fetchUnreadCount();

    // Set up periodic polling as a fallback
    const intervalId = setInterval(() => {
      fetchUnreadCount();
    }, 30000); // Poll every 30 seconds as a fallback

    return () => clearInterval(intervalId);
  }, []);

  // Function to play notification sound directly
  const playNotificationSound = () => {
    if (!audioRef.current) {
      console.warn("Audio element not available for notification sound");
      return Promise.reject(new Error("Audio element not available"));
    }

    try {
      // Reset audio element
      audioRef.current.pause();
      audioRef.current.currentTime = 0;

      // Create a new promise to handle the play operation
      return new Promise((resolve, reject) => {
        const playPromise = audioRef.current.play();

        if (playPromise !== undefined) {
          playPromise
            .then(() => {
              resolve();
            })
            .catch((error) => {
              console.error("Error playing notification sound:", error);

              // If autoplay was prevented (common in browsers), try again with user interaction
              const userInteractionHandler = () => {
                audioRef.current.play().then(resolve).catch(reject);

                // Remove the event listeners after attempting to play
                document.removeEventListener("click", userInteractionHandler);
                document.removeEventListener("keydown", userInteractionHandler);
              };

              // Listen for user interaction to try playing the sound again
              document.addEventListener("click", userInteractionHandler, {
                once: true,
              });
              document.addEventListener("keydown", userInteractionHandler, {
                once: true,
              });

              reject(error);
            });
        } else {
          // For older browsers that don't return a promise
          resolve();
        }
      });
    } catch (error) {
      console.error("Error setting up notification sound:", error);
      return Promise.reject(error);
    }
  };

  // Function to mark a notification as read via socket
  const markAsReadViaSocket = (notificationId) => {
    if (!socket || !isConnected) return false;

    const adminInfo = Cookies.get("adminInfo")
      ? JSON.parse(Cookies.get("adminInfo"))
      : null;

    if (adminInfo && adminInfo.user && adminInfo.user._id) {
      socket.emit("read_notification", {
        notificationId,
        employeeId: adminInfo.user._id,
      });
      return true;
    }
    return false;
  };

  // Function to mark all notifications as read via socket
  const markAllAsReadViaSocket = () => {
    if (!socket || !isConnected) return false;

    const adminInfo = Cookies.get("adminInfo")
      ? JSON.parse(Cookies.get("adminInfo"))
      : null;

    if (adminInfo && adminInfo.user && adminInfo.user._id) {
      socket.emit("read_all_notifications", {
        employeeId: adminInfo.user._id,
      });
      return true;
    }
    return false;
  };

  return {
    socket,
    updated,
    setUpdated,
    unreadCount,
    fetchUnreadCount,
    markAsReadViaSocket,
    markAllAsReadViaSocket,
    playNotificationSound,
  };
};

export default useNotification;
