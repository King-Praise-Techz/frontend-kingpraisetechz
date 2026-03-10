"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/lib/store/authStore";

import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import Features from "@/components/Features";
import About from "@/components/About";
import Pricing from "@/components/Pricing";
import Projects from "@/components/Projects";
import Reviews from "@/components/Reviews";
import Footer from "@/components/Footer";

export default function HomePage() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuthStore();

  useEffect(() => {
    if (isAuthenticated && user?.role) {
      // Navigate after hydration to avoid build errors
      const timeout = setTimeout(() => {
        router.push(`/dashboard/${user.role}`);
      }, 0);
      return () => clearTimeout(timeout);
    }
  }, [isAuthenticated, user, router]);

  // Show loading spinner while redirecting
  if (isAuthenticated && user?.role) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0a0a0f]">
        <div className="w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // Public landing page
  return (
    <>
      <Navbar />
      <Hero />
      <Features />
      <About />
      <Pricing />
      <Projects />
      <Reviews />
      <Footer />
    </>
  );
}