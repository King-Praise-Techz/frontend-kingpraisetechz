"use client";

import { useState } from "react";
import { X } from "lucide-react";
import { toast } from "react-hot-toast";

interface Props {
  open: boolean;
  onClose: () => void;
}

export default function GetWebsiteModal({ open, onClose }: Props) {
  const [loading, setLoading] = useState(false);

  if (!open) return null;

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    formData.append("access_key", "406cfcca-db87-4cc9-a650-5c521c56a9d6");

    try {
      const res = await fetch("https://api.web3forms.com/submit", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (data.success) {
        toast.success("🚀 Consultation request sent successfully!");
        e.currentTarget.reset();
        onClose();
      } else {
        toast.error("Something went wrong. Try again.");
      }
    } catch (error) {
      toast.error("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
      <div className="bg-white w-full max-w-lg rounded-3xl p-8 relative shadow-2xl">

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-500 hover:text-red-500"
        >
          <X size={24} />
        </button>

        {/* Heading */}
        <h2 className="text-3xl font-bold mb-2 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 bg-clip-text text-transparent text-center">
          Get Your Website
        </h2>

        <p className="text-slate-500 text-center mb-6">
          Book a free consultation and let’s build your brand online.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">

          <input
            type="text"
            name="name"
            required
            placeholder="Your Name"
            className="w-full border p-3 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none"
          />

          <input
            type="email"
            name="email"
            required
            placeholder="Your Email"
            className="w-full border p-3 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none"
          />

          <input
            type="text"
            name="business"
            placeholder="Business Name"
            className="w-full border p-3 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none"
          />

          <textarea
            name="message"
            required
            placeholder="Tell us about your project..."
            rows={4}
            className="w-full border p-3 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none"
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 rounded-xl font-bold hover:from-pink-500 hover:to-red-500 transition duration-300 shadow-md hover:shadow-lg"
          >
            {loading ? "Sending..." : "Book Free Consultation"}
          </button>

        </form>
      </div>
    </div>
  );
}