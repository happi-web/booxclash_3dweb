import React, { useState } from "react";
import emailjs from "emailjs-com";
import Navbar from "./Navbar";

const Contact = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    message: "",
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    emailjs
      .send(
        "service_xou28io",       // your EmailJS service ID
        "template_pljub4d",      // your EmailJS template ID
        formData,
        "s6oq3sz3VlQP5LFs7"      // your EmailJS public key
      )
      .then(
        () => {
          alert("Message sent!");
          setFormData({ name: "", email: "", phone: "", message: "" });
        },
        (error) => {
          console.error("Email sending failed:", error);
          alert("Failed to send message.");
        }
      );
  };

  return (
    <div>
      <Navbar />
      <section className="bg-purple-700 py-12 px-6 md:px-16">
        <div className="max-w-3xl mx-auto mt-10">
          <h2 className="text-3xl font-bold text-white text-center mb-8">Contact Us</h2>
          <form
            onSubmit={handleSubmit}
            className="bg-white p-8 shadow-md rounded-lg space-y-6"
          >
            <input
              type="text"
              name="name"
              value={formData.name}
              placeholder="Your Name"
              className="w-full border border-gray-300 px-4 py-2 rounded-md"
              onChange={handleChange}
              required
            />
            <input
              type="email"
              name="email"
              value={formData.email}
              placeholder="Your Email"
              className="w-full border border-gray-300 px-4 py-2 rounded-md"
              onChange={handleChange}
              required
            />
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              placeholder="Your Phone Number"
              className="w-full border border-gray-300 px-4 py-2 rounded-md"
              onChange={handleChange}
            />
            <textarea
              name="message"
              value={formData.message}
              rows={4}
              placeholder="Your Message"
              className="w-full border border-gray-300 px-4 py-2 rounded-md"
              onChange={handleChange}
              required
            />
            <button
              type="submit"
              className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700"
            >
              Send Message
            </button>
          </form>
        </div>
      </section>
    </div>
  );
};

export default Contact;
