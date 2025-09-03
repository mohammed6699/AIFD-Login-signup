"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";

export default function SuccessMessage({ title, message }) {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    // Auto-hide after 5 seconds
    const timer = setTimeout(() => {
      setIsVisible(false);
    }, 5000);

    return () => clearTimeout(timer);
  }, []);

  const handleDismiss = () => {
    setIsVisible(false);
  };

  if (!isVisible) {
    return null;
  }

  return (
    <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
      <div className="flex items-start">
        <div className="flex-shrink-0">
          <div className="text-green-400 text-2xl">✅</div>
        </div>
        <div className="ml-3 flex-1">
          <h3 className="text-sm font-medium text-green-800">
            {title}
          </h3>
          <p className="mt-1 text-sm text-green-700">
            {message}
          </p>
        </div>
        <div className="ml-4 flex-shrink-0">
          <Button
            onClick={handleDismiss}
            variant="ghost"
            size="sm"
            className="text-green-400 hover:text-green-600"
          >
            ✕
          </Button>
        </div>
      </div>
    </div>
  );
}
