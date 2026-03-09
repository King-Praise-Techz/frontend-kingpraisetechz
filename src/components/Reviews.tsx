"use client";

import React, { useEffect, useState } from "react";
import { fetchWithAuth } from "@/lib/api";

interface Review {
  _id: string;
  user: { name: string };
  message: string;
  rating: number;
}

export default function ReviewsComponent() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchReviews() {
      try {
        const data = await fetchWithAuth("https://king-praise-techz-backend.onrender.com/api/reviews");
        setReviews(data);
      } catch {
        setError("Failed to fetch reviews");
      } finally {
        setLoading(false);
      }
    }

    fetchReviews();
  }, []);

  if (loading) return <p>Loading reviews...</p>;
  if (error) return <p className="text-red-600">{error}</p>;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {reviews.map((r) => (
        <div key={r._id} className="bg-white p-4 rounded-xl shadow">
          <p className="font-semibold">{r.user.name}</p>
          <p>{r.message}</p>
          <p className="text-sm text-slate-500">Rating: {r.rating}/5</p>
        </div>
      ))}
    </div>
  );
}