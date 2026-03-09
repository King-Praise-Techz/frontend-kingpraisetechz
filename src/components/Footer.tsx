"use client";

import React from "react";
import Link from "next/link";
import { Instagram, Facebook, Mail, MessageCircle } from "lucide-react";

export default function Footer() {
  const socials = [
    {
      icon: <Instagram size={18} className="text-blue-500" />,
      link: "https://www.instagram.com/kingpraisetechz/",
    },
    {
      icon: <Facebook size={18} className="text-red-500" />,
      link: "https://web.facebook.com/profile.php?id=61583921042736",
    },
    {
      icon: <Mail size={18} className="text-blue-500" />,
      link: "mailto:chibuksai@gmail.com",
    },
    {
      icon: <MessageCircle size={18} className="text-red-500" />,
      link: "https://wa.me/+2349056921491",
    },
  ];

  return (
    <footer className="w-full bg-slate-100 border-t">
      <div className="max-w-7xl mx-auto px-6 py-14 grid md:grid-cols-3 gap-10 text-sm text-gray-600">
        
        {/* Brand Section */}
        <div>
          <h2 className="text-xl font-bold text-red-500 mb-3">
            King Praise Techz
          </h2>
          <p className="mb-4 leading-relaxed text-gray-700">
            Building modern and scalable digital solutions with creativity and precision.
          </p>

          <div className="flex gap-3">
            {socials.map((item, index) => (
              <a
                key={index}
                href={item.link}
                target="_blank"
                className="w-9 h-9 flex items-center justify-center rounded-full bg-white shadow hover:shadow-md transition"
              >
                {item.icon}
              </a>
            ))}
          </div>
        </div>

        {/* Quick Links */}
        <div>
          <h3 className="font-semibold text-red-500 mb-4">Quick Links</h3>
          <ul className="space-y-2">
            <li><Link href="/" className="hover:text-blue-500 transition">Home</Link></li>
            <li><Link href="#about" className="hover:text-blue-500 transition">About</Link></li>
            <li><Link href="#features" className="hover:text-blue-500 transition">Services</Link></li>
            <li><Link href="#pricing" className="hover:text-blue-500 transition">Pricing</Link></li>
          </ul>
        </div>

        {/* Contact Section */}
        <div>
          <h3 className="font-semibold text-red-500 mb-4">Contact</h3>
          <p className="text-gray-700 mb-2">📍 Lagos, Nigeria</p>
          <p className="text-gray-700 mb-2">📞 +234 905 692 1491</p>
          <p className="text-gray-700">✉️ chibuksai@gmail.com</p>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t py-4 text-center text-xs text-gray-500">
        © 2026 King Praise Techz. All rights reserved.
      </div>
    </footer>
  );
}