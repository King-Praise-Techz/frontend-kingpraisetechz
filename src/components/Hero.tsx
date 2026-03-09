"use client";
import { motion } from "framer-motion";
import Link from "next/link";
import heroImage from "../assets/hero.png";

export default function Hero() {
  return (
    <section
      className="pt-32 pb-20 lg:pt-48 lg:pb-32 relative bg-cover bg-center"
      style={{ backgroundImage: `url(${heroImage.src})` }}
    >
      <div className="max-w-7xl mx-auto px-6 relative">
        <motion.div
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center lg:text-left"
        >
          <h1 className="text-5xl lg:text-7xl font-extrabold mb-6 text-white">
            Build your digital presence with{" "}
            <span className="text-red-500">King Praise Techz</span>
          </h1>
          <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto lg:mx-0">
            We help businesses grow with modern websites, branding, and digital solutions. Launch fast, scale globally, and stay ahead of competition.
          </p>
          <div className="flex justify-center lg:justify-start gap-4 flex-wrap">
            <Link
              href="/auth/signup"
              className="px-8 py-4 bg-blue-500 text-white rounded-full font-bold hover:bg-blue-600 transition"
            >
              Get Started
            </Link>
            <Link
              href="/auth/login"
              className="px-8 py-4 border border-red-500 text-red-500 rounded-full hover:bg-red-500/10 transition"
            >
              Login
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
}