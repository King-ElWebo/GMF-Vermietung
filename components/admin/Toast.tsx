"use client";

import { useEffect } from "react";

interface ToastProps {
  message: string;
  type?: "success" | "error" | "info";
  onClose: () => void;
  duration?: number;
}

export function Toast({
  message,
  type = "success",
  onClose,
  duration = 4000,
}: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(onClose, duration);
    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const config = {
    success: {
      bg: "bg-green-600",
      icon: "✅",
    },
    error: {
      bg: "bg-red-600",
      icon: "❌",
    },
    info: {
      bg: "bg-blue-600",
      icon: "ℹ️",
    },
  }[type];

  return (
    <div className="fixed bottom-6 right-6 z-50 animate-slide-up">
      <div
        className={`${config.bg} text-white px-8 py-5 rounded-xl shadow-2xl flex items-center space-x-4 min-w-[300px]`}
      >
        <span className="text-3xl">{config.icon}</span>
        <span className="text-lg font-semibold flex-1">{message}</span>
        <button
          onClick={onClose}
          className="text-white hover:text-gray-200 text-2xl font-bold ml-4"
        >
          ✕
        </button>
      </div>
    </div>
  );
}
