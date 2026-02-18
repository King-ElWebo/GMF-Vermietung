"use client";

import { useState } from "react";

interface DeleteConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  isLoading?: boolean;
}

export function DeleteConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  isLoading,
}: DeleteConfirmDialogProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-full items-center justify-center p-4">
        {/* Backdrop */}
        <div
          className="fixed inset-0 bg-black bg-opacity-60 transition-opacity"
          onClick={onClose}
        />

        {/* Dialog */}
        <div className="relative bg-white rounded-2xl shadow-2xl max-w-lg w-full p-8">
          <div className="text-center mb-6">
            <div className="text-6xl mb-4">⚠️</div>
            <h3 className="text-2xl font-bold text-gray-900 mb-3">
              {title}
            </h3>
            <p className="text-lg text-gray-700 leading-relaxed">{message}</p>
          </div>

          <div className="flex justify-center space-x-4">
            <button
              onClick={onClose}
              disabled={isLoading}
              className="px-8 py-3 text-base font-semibold text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 disabled:opacity-50 transition"
            >
              Abbrechen
            </button>
            <button
              onClick={onConfirm}
              disabled={isLoading}
              className="px-8 py-3 text-base font-semibold text-white bg-red-600 rounded-lg hover:bg-red-700 disabled:opacity-50 shadow-md hover:shadow-lg transition-all duration-200"
            >
              {isLoading ? "Löschen..." : "🗑️ Löschen"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
