"use client";
import Image from "next/image";
import about from "../assets/featured.png";

export default function About() {
  return (
    <section id="about" className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-16 items-center">
        <div>
          <h2 className="text-4xl font-bold mb-6 text-blue-500">
            About King Praise Techz
          </h2>
          <p className="text-lg text-slate-600 mb-4">
            We are a web agency dedicated to helping businesses in Nigeria and beyond grow their online presence with modern websites, branding, and digital marketing.
          </p>
          <p className="text-lg text-slate-600">
            Our team builds solutions that are fast, secure, and scalable, ensuring your business stays competitive in the digital age.
          </p>
        </div>
        <div className="h-64 bg-blue-500/10 rounded-3xl flex items-center justify-center">
          {/* Image */}
          <Image src={about} className="w-full rounded-2xl" alt="featured" />
        </div>
      </div>
    </section>
  );
}