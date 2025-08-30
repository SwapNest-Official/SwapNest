import { useState, useEffect } from "react";
import Navbar from "./navbar";
import { useTheme } from "./contexts/ThemeContext";

export default function AboutUs() {
  const [loading, setloading] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [loadedSections, setLoadedSections] = useState([]);
  const { isDarkMode } = useTheme();
  const [formData, setformData] = useState({
    name: '',
    email: '',
    subject: '',
    query: '',
  });

  useEffect(() => {
    setIsVisible(true);
    // Staggered loading of sections
    const sections = [0, 1, 2, 3, 4, 5];
    sections.forEach((section, index) => {
      setTimeout(() => {
        setLoadedSections(prev => [...prev, section]);
      }, index * 200);
    });
  }, []);

  function handleChange(e) {
    const { id, value } = e.target;
    setformData((prevData) => ({
      ...prevData,
      [id]: value,
    }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setloading(true);
    try {
      const response = await fetch("https://college-fair.onrender.com/send-query-email", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData)
      });
      const data = await response.json();
      alert(data.message);
    } catch (error) {
      alert("Error Sending mail");
      console.log(error.message);
    } finally {
      setloading(false);
    }
  }

  return (
    <div className={`min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 transition-all duration-500`}>
      <Navbar />
      
      {/* Hero Section */}
      <section className={`relative py-24 overflow-hidden transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 to-purple-600/10 dark:from-blue-600/5 dark:to-purple-600/5"></div>
        <div className="container mx-auto px-6 relative z-10">
          <div className="max-w-5xl mx-auto text-center">
            <div className="inline-flex items-center px-4 py-2 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 text-sm font-medium mb-8">
              <span className="w-2 h-2 bg-blue-600 dark:bg-blue-400 rounded-full mr-2"></span>
              Welcome to SwapNest
            </div>
            <h1 className="text-5xl sm:text-6xl md:text-7xl font-bold text-gray-900 dark:text-white mb-8 leading-tight">
              Redefining College Life through{" "}
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                SwapNest
              </span>
            </h1>
            <p className="text-xl sm:text-2xl text-gray-600 dark:text-gray-300 mb-12 leading-relaxed max-w-4xl mx-auto">
              Connecting students through a safe, intuitive marketplace designed exclusively for university communities.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="/signup"
                className="px-8 py-4 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold hover:from-blue-700 hover:to-purple-700 transition-all shadow-xl hover:shadow-2xl hover:-translate-y-1 inline-block"
              >
                Join Our Community
              </a>
              <a
                href="#how-it-works"
                className="px-8 py-4 rounded-xl border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-semibold hover:border-gray-400 dark:hover:border-gray-500 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all"
              >
                Learn More
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Our Story Section */}
      <section className={`py-24 transition-all duration-1000 ${loadedSections.includes(1) ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
        <div className="container mx-auto px-6">
          <div className="max-w-7xl mx-auto">
            <div className="grid lg:grid-cols-2 gap-16 items-center">
              <div className="space-y-8">
                <div className="inline-flex items-center px-4 py-2 rounded-full bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-200 text-sm font-medium">
                  Our Journey
                </div>
                <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 dark:text-white leading-tight">
                  Building More Than Just a Marketplace
                </h2>
                <div className="space-y-6 text-lg text-gray-600 dark:text-gray-300 leading-relaxed">
                  <p>
                    Started by a group of students who understood the struggles of campus life, we set out to build more than just a marketplace — a platform where college life thrives.
                  </p>
                  <p>
                    Our goal is to make this your all-in-one campus hub: from announcing events and fostering community interactions to sharing study materials and more. It's not just about buying and selling — it's about staying connected and growing together.
                  </p>
                </div>
              </div>
              <div className="relative">
                <div className="w-full h-96 bg-gradient-to-br from-blue-500 to-purple-600 rounded-3xl shadow-2xl transform rotate-3 hover:rotate-0 transition-all duration-500"></div>
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-purple-600 rounded-3xl shadow-2xl transform -rotate-3 hover:rotate-0 transition-all duration-500"></div>
               <img
    src="/src/assets/logo.jpg"
    alt="SwapNest"
    className="absolute inset-0 w-full h-full object-cover rounded-3xl shadow-2xl hover:scale-105 transition-all duration-500"
  />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Co-founders Section */}
      <section className="py-24 bg-white">
        <div className="container mx-auto px-6">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-20">
              <div className="inline-flex items-center px-4 py-2 rounded-full bg-gradient-to-r from-blue-100 to-purple-100 text-blue-800 text-sm font-medium mb-6">
                Meet the Team
              </div>
              <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-6">
                Meet Our Co-founders
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                The brilliant minds behind SwapNest who turned a vision into reality
              </p>
            </div>

            <div className="grid lg:grid-cols-2 gap-12 max-w-5xl mx-auto">
              {/* Anmol Sinha */}
              <div className="group">
                <div className="bg-gradient-to-br from-slate-50 to-blue-50 rounded-3xl p-8 hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 border border-gray-100">
                  <div className="flex items-center space-x-6">
                    <div className="flex-shrink-0">
                      <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-xl">
                        <svg className="w-12 h-12 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-3xl font-bold text-gray-900 mb-3 group-hover:text-blue-600 transition-colors">
                        Anmol Sinha
                      </h3>
                      <p className="text-blue-600 font-semibold text-lg">
                        Upcoming Product Engineer at UnifyApps
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Anmol Gupta */}
              <div className="group">
                <div className="bg-gradient-to-br from-slate-50 to-emerald-50 rounded-3xl p-8 hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 border border-gray-100">
                  <div className="flex items-center space-x-6">
                    <div className="flex-shrink-0">
                      <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-xl">
                        <svg className="w-12 h-12 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-3xl font-bold text-gray-900 mb-3 group-hover:text-emerald-600 transition-colors">
                        Anmol Gupta
                      </h3>
                      <p className="text-emerald-600 font-semibold text-lg">
                        Upcoming Software Engineer at PhonePe
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className={`py-24 bg-gradient-to-br from-slate-50 to-blue-50 dark:from-gray-800 dark:to-gray-900 transition-all duration-500`}>
        <div className="container mx-auto px-6">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-20">
              <div className="inline-flex items-center px-4 py-2 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 text-sm font-medium mb-6">
                How It Works
              </div>
              <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 dark:text-white mb-6">
                Simple Steps to Get Started
              </h2>
              <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
                Get started with UniBay in just three easy steps
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {/* Step 1 */}
              <div className="group">
                <div className="bg-white dark:bg-gray-800 rounded-3xl p-8 shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 border border-gray-100 dark:border-gray-700">
                  <div className="flex flex-col items-center text-center">
                    <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center mb-6 shadow-lg">
                      <span className="text-2xl font-bold text-white">1</span>
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Verify Student Status</h3>
                    <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                      Sign up with your university email to ensure a safe and secure marketplace exclusively for students.
                    </p>
                  </div>
                </div>
              </div>

              {/* Step 2 */}
              <div className="group">
                <div className="bg-white dark:bg-gray-800 rounded-3xl p-8 shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 border border-gray-100 dark:border-gray-700">
                  <div className="flex flex-col items-center text-center">
                    <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center mb-6 shadow-lg">
                      <span className="text-2xl font-bold text-white">2</span>
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Buy & Sell With Ease</h3>
                    <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                      List your items with descriptions, set prices, and connect instantly with interested buyers.
                    </p>
                  </div>
                </div>
              </div>

              {/* Step 3 */}
              <div className="group">
                <div className="bg-white dark:bg-gray-800 rounded-3xl p-8 shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 border border-gray-100 dark:border-gray-700">
                  <div className="flex flex-col items-center text-center">
                    <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center mb-6 shadow-lg">
                      <span className="text-2xl font-bold text-white">3</span>
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Meet On Campus</h3>
                    <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                      Arrange safe, convenient meetups right on campus to complete your transactions hassle-free.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Mission & Values */}
      <section className={`py-24 bg-white dark:bg-gray-800 transition-all duration-500`}>
        <div className="container mx-auto px-6">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-20">
              <div className="inline-flex items-center px-4 py-2 rounded-full bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-200 text-sm font-medium mb-6">
                Our Values
              </div>
              <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 dark:text-white mb-6">
                Our Mission & Values
              </h2>
              <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
                We're building more than a marketplace—we're creating a community where students can connect, trade, and thrive together.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              <div className="group">
                <div className="bg-gradient-to-br from-slate-50 to-purple-50 dark:from-gray-700 dark:to-gray-800 rounded-3xl p-8 shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 border border-gray-100 dark:border-gray-600">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center mb-6 shadow-lg">
                    <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Trust & Safety</h3>
                  <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                    We prioritize creating a secure environment where students can trade with confidence, knowing their transactions are protected.
                  </p>
                </div>
              </div>

              <div className="group">
                <div className="bg-gradient-to-br from-slate-50 to-amber-50 dark:from-gray-700 dark:to-gray-800 rounded-3xl p-8 shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 border border-gray-100 dark:border-gray-600">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-500 to-amber-600 flex items-center justify-center mb-6 shadow-lg">
                    <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Efficiency</h3>
                  <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                    Streamlined processes and instant connections make buying and selling faster and more convenient than ever before.
                  </p>
                </div>
              </div>

              <div className="group">
                <div className="bg-gradient-to-br from-slate-50 to-emerald-50 dark:from-gray-700 dark:to-gray-800 rounded-3xl p-8 shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 border border-gray-100 dark:border-gray-600">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center mb-6 shadow-lg">
                    <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Community</h3>
                  <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                    Building lasting connections between students, fostering a sense of belonging and mutual support.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Tech Team Section */}
      <section className="py-24 bg-gradient-to-br from-slate-50 to-blue-50">
        <div className="container mx-auto px-6">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-20">
              <div className="inline-flex items-center px-4 py-2 rounded-full bg-blue-100 text-blue-800 text-sm font-medium mb-6">
                Get in Touch
              </div>
              <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-6">
                Contact Our Tech Team
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Have a question, feature idea, or need technical help? We're here to support you—just reach out!
              </p>
            </div>

            <div className="bg-white rounded-3xl shadow-2xl overflow-hidden border border-gray-100">
              <div className="grid lg:grid-cols-2">
                <div className="p-8 lg:p-12">
                  <h3 className="text-3xl font-bold text-gray-900 mb-8">Send us a Message</h3>
                  <form className="space-y-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      <div>
                        <label htmlFor="name" className="block text-sm font-semibold text-gray-700 mb-2">
                          Name
                        </label>
                        <input
                          onChange={handleChange}
                          type="text"
                          id="name"
                          className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                          placeholder="Your name"
                        />
                      </div>
                      <div>
                        <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">
                          Email
                        </label>
                        <input
                          onChange={handleChange}
                          type="email"
                          id="email"
                          className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                          placeholder="Your email"
                        />
                      </div>
                    </div>
                    <div>
                      <label htmlFor="subject" className="block text-sm font-semibold text-gray-700 mb-2">
                        Subject
                      </label>
                      <input
                        onChange={handleChange}
                        type="text"
                        id="subject"
                        className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                        placeholder="How can we help?"
                      />
                    </div>
                    <div>
                      <label htmlFor="body" className="block text-sm font-semibold text-gray-700 mb-2">
                        Message
                      </label>
                      <textarea
                        id="body"
                        rows="4"
                        className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
                        placeholder="Describe your issue or question"
                        onChange={handleChange}
                      ></textarea>
                    </div>
                    <div>
                      <button
                        type="submit"
                        onClick={handleSubmit}
                        disabled={loading}
                        className="w-full px-8 py-4 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold hover:from-blue-700 hover:to-purple-700 transition-all shadow-lg hover:shadow-xl disabled:opacity-50"
                      >
                        {loading ? "Sending..." : "Send Message"}
                      </button>
                    </div>
                  </form>
                </div>
                <div className="bg-gradient-to-br from-blue-600 to-purple-600 p-8 lg:p-12 text-white flex flex-col justify-between">
                  <div>
                    <h3 className="text-3xl font-bold mb-8">Contact Information</h3>
                    <div className="space-y-6">
                      <div className="flex items-start">
                        <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center mr-4">
                          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                          </svg>
                        </div>
                        <div>
                          <p className="text-sm text-blue-100 font-medium">Email</p>
                          <p className="font-semibold text-lg">collegefairtech@gmail.com</p>
                        </div>
                      </div>
                      <div className="flex items-start">
                        <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center mr-4">
                          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                          </svg>
                        </div>
                        <div>
                          <p className="text-sm text-blue-100 font-medium">Phone</p>
                          <p className="font-semibold text-lg">+91 - 9872148828</p>
                        </div>
                      </div>
                      <div className="flex items-start">
                        <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center mr-4">
                          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          </svg>
                        </div>
                        <div>
                          <p className="text-sm text-blue-100 font-medium">Office</p>
                          <p className="font-semibold text-lg">We Work Remotely 😊</p>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="mt-12 p-6 rounded-2xl bg-white/10">
                    <h4 className="font-semibold mb-2">Support Hours</h4>
                    <p className="text-blue-100">Always available for you</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="relative py-24 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600"></div>
        <div className="absolute inset-0 opacity-10">
          <div className="absolute -top-40 -right-40 w-80 h-80 rounded-full border-8 border-white opacity-20"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 rounded-full border-8 border-white opacity-20"></div>
        </div>

        <div className="container mx-auto px-6 relative z-10">
          <div className="max-w-5xl mx-auto text-center text-white">
            <h2 className="text-4xl sm:text-5xl font-bold mb-6">Ready to Join Our Community?</h2>
            <p className="text-xl sm:text-2xl mb-12 text-blue-100">
              Experience the future of campus commerce today. Join thousands of students already using our platform.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="/login"
                className="px-8 py-4 rounded-xl bg-white text-blue-600 font-semibold hover:bg-gray-100 transition-all shadow-xl hover:shadow-2xl hover:-translate-y-1 inline-block"
              >
                Sign Up Now
              </a>
              <a
                href="/about"
                className="px-8 py-4 rounded-xl border-2 border-white/30 text-white font-semibold hover:bg-white/10 transition-all"
              >
                Learn More
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
  