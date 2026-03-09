"use client";

import Link from "next/link";
import { Menu, X } from "lucide-react";
import Image from "next/image";
import Logo from "../assets/logo.png";
import { useState } from "react";
import GetWebsiteModal from "@/components/GetWebsiteModal"; // make sure path is correct

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <>
      {/* Navbar */}
      <nav className="fixed w-full bg-black z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 text-2xl font-bold">
            <Image src={Logo} alt="Logo" className="w-20" />
            <span className="bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 bg-clip-text text-transparent">
              King Praise Techz
            </span>
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center gap-8 font-medium text-white">
            <Link href="#features" className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-500 hover:from-purple-500 hover:to-pink-500 transition">
              Services
            </Link>
            <Link href="#about" className="bg-clip-text text-transparent bg-gradient-to-r from-green-400 to-blue-500 hover:from-pink-500 hover:to-yellow-400 transition">
              About
            </Link>
            <Link href="#pricing" className="bg-clip-text text-transparent bg-gradient-to-r from-yellow-400 to-red-500 hover:from-red-500 hover:to-orange-400 transition">
              Pricing
            </Link>
            <Link href="/auth/login" className="bg-clip-text text-transparent bg-gradient-to-r from-pink-400 to-red-500 hover:from-red-500 hover:to-pink-400 transition">
              Login
            </Link>

            {/* CTA Buttons */}
            <Link
              href="/auth/signup"
              className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-2 rounded-full hover:from-pink-500 hover:to-red-500 transition duration-300 shadow-md hover:shadow-lg"
            >
              Get Started
            </Link>

            {/* THIS BUTTON OPENS THE MODAL */}
            <button
              onClick={() => setModalOpen(true)}
              className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-2 rounded-full hover:from-pink-500 hover:to-red-500 transition duration-300 shadow-md hover:shadow-lg"
            >
              Get Your Website
            </button>
          </div>

          {/* Mobile Toggle */}
          <button className="md:hidden text-white" onClick={() => setMenuOpen(!menuOpen)}>
            {menuOpen ? <X size={28} /> : <Menu size={28} />}
          </button>
        </div>

        {/* Mobile Menu */}
        {menuOpen && (
          <div className="md:hidden flex flex-col gap-5 bg-black p-6 font-medium">
            <Link href="#features" className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-500 hover:from-purple-500 hover:to-pink-500 transition">
              Services
            </Link>
            <Link href="#about" className="bg-clip-text text-transparent bg-gradient-to-r from-green-400 to-blue-500 hover:from-pink-500 hover:to-yellow-400 transition">
              About
            </Link>
            <Link href="#pricing" className="bg-clip-text text-transparent bg-gradient-to-r from-yellow-400 to-red-500 hover:from-red-500 hover:to-orange-400 transition">
              Pricing
            </Link>
            <Link href="/auth/login" className="bg-clip-text text-transparent bg-gradient-to-r from-pink-400 to-red-500 hover:from-red-500 hover:to-pink-400 transition">
              Login
            </Link>
            <Link href="/auth/signup" className="bg-gradient-to-r from-blue-600 to-purple-600 text-white text-center px-5 py-2 rounded-full hover:from-pink-500 hover:to-red-500 transition">
              Get Started
            </Link>

            {/* MOBILE MODAL BUTTON */}
            <button
              onClick={() => setModalOpen(true)}
              className="bg-gradient-to-r from-blue-600 to-purple-600 text-white text-center px-5 py-2 rounded-full hover:from-pink-500 hover:to-red-500 transition"
            >
              Get Your Website
            </button>
          </div>
        )}
      </nav>

      {/* MODAL */}
      <GetWebsiteModal open={modalOpen} onClose={() => setModalOpen(false)} />
    </>
  );
}