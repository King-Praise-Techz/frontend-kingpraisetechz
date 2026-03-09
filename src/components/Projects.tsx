"use client";

import React from "react";
interface Project {
  id: string;
  title: string;
  description?: string;
  image?: string;
}

interface Props {
  items: Project[];
}

export default function Portfolio({ items }: Props) {
  if (!items || items.length === 0) {
    return <p>No projects available.</p>;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {items.map((item) => {
        if (!item) return null; // skip undefined items
        return (
          <div key={item.id} className="p-4 bg-white rounded shadow hover:shadow-lg transition">
            <h3 className="font-bold text-lg">{item.title}</h3>
            <p className="text-sm text-gray-500">{item.description}</p>
            {item.image && <img src={item.image} alt={item.title} className="mt-2 w-full rounded" />}
          </div>
        );
      })}
    </div>
  );
}