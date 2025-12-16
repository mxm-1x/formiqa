import { useRef } from "react";
import { Link } from "react-router-dom";
import { motion, useScroll } from "framer-motion";

// Placeholder avatars/images - using colors/initials if actual images aren't perfect fits, 
// or reusing the illustrations as "feature cards"
import feedbackImg from "../assets/illustration-feedback.png";
import qaImg from "../assets/illustration-qa.png";
import interactionImg from "../assets/illustration-interaction.png";

function FloatingElement({ children, delay = 0, x = 0, y = 0, rotate = 0, className = "" }: any) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8, x, y, rotate }}
      animate={{
        opacity: 1,
        scale: 1,
        y: [y, y - 15, y],
        rotate: [rotate, rotate - 2, rotate + 2, rotate]
      }}
      transition={{
        opacity: { duration: 0.8, delay },
        scale: { duration: 0.8, delay },
        y: { duration: 4, repeat: Infinity, ease: "easeInOut", repeatType: "reverse", delay: delay + Math.random() },
        rotate: { duration: 6, repeat: Infinity, ease: "easeInOut", repeatType: "reverse", delay: delay + Math.random() }
      }}
      className={`absolute ${className}`}
    >
      {children}
    </motion.div>
  );
}

export default function Landing() {
  const ref = useRef(null);
  useScroll({
    target: ref,
    offset: ["start start", "end start"]
  });

  return (
    <div ref={ref} className="min-h-screen bg-white font-sans text-gray-900 selection:bg-primary/20 selection:text-primary overflow-x-hidden relative">

      {/* Grid Background */}
      <div className="absolute inset-0 z-0 pointer-events-none"
        style={{
          backgroundImage: 'linear-gradient(rgba(0, 0, 0, 0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(0, 0, 0, 0.03) 1px, transparent 1px)',
          backgroundSize: '40px 40px'
        }}
      ></div>

      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 p-6 flex justify-between items-center max-w-7xl mx-auto w-full z-50 bg-white/80 backdrop-blur-md transition-all duration-300">
        <div className="text-2xl font-bold tracking-tighter flex items-center gap-2">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-white font-bold">F</div>
          Formiqa.
        </div>
        <div className="space-x-6 text-sm font-medium flex items-center">
          <Link to="/login" className="hover:text-primary transition-colors">Login</Link>
          <Link to="/signup" className="bg-gray-900 text-white px-6 py-2.5 rounded-full hover:bg-black hover:scale-105 active:scale-95 transition-all duration-300 shadow-lg hover:shadow-xl">
            Get Started
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <header className="relative max-w-7xl mx-auto px-6 pt-40 pb-32 min-h-screen flex flex-col items-center justify-center text-center z-10">

        {/* Floating Elements (Avatars/Cards) */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden max-w-[1400px] mx-auto">
          {/* Top Left */}
          <FloatingElement delay={0.2} x={-350} y={-150} rotate={-5} className="hidden lg:block left-1/2 top-1/2">
            <div className="bg-white p-2 rounded-2xl shadow-xl border border-gray-100 w-32 h-32 flex items-center justify-center transform hover:scale-110 transition-transform duration-300">
              <img src={feedbackImg} alt="Feedback" className="w-full h-full object-contain opacity-90" />
              <div className="absolute -bottom-3 -right-3 bg-green-100 text-green-700 text-xs font-bold px-2 py-1 rounded-full shadow-sm">Feedback</div>
            </div>
          </FloatingElement>

          {/* Top Right */}
          <FloatingElement delay={0.4} x={380} y={-120} rotate={5} className="hidden lg:block left-1/2 top-1/2">
            <div className="bg-white p-2 rounded-2xl shadow-xl border border-gray-100 w-28 h-28 flex items-center justify-center transform hover:scale-110 transition-transform duration-300">
              <img src={qaImg} alt="Q&A" className="w-full h-full object-contain opacity-90" />
              <div className="absolute -top-3 -left-3 bg-blue-100 text-blue-700 text-xs font-bold px-2 py-1 rounded-full shadow-sm">Q&A</div>
            </div>
          </FloatingElement>

          {/* Bottom Left */}
          <FloatingElement delay={0.6} x={-400} y={180} rotate={3} className="hidden lg:block left-1/2 top-1/2">
            <div className="bg-white p-4 rounded-full shadow-xl border border-gray-100 flex items-center gap-3 pr-6 transform hover:scale-105 transition-transform duration-300">
              <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center text-orange-600 font-bold">JD</div>
              <div className="text-left">
                <div className="text-xs font-bold text-gray-900">John Doe</div>
                <div className="text-[10px] text-gray-500">Presenter</div>
              </div>
            </div>
          </FloatingElement>

          {/* Bottom Right */}
          <FloatingElement delay={0.8} x={350} y={200} rotate={-3} className="hidden lg:block left-1/2 top-1/2">
            <div className="bg-white p-4 rounded-2xl shadow-xl border border-gray-100 max-w-[180px] text-left transform hover:scale-105 transition-transform duration-300">
              <div className="flex -space-x-2 mb-2">
                <div className="w-6 h-6 rounded-full bg-red-200 border-2 border-white"></div>
                <div className="w-6 h-6 rounded-full bg-blue-200 border-2 border-white"></div>
                <div className="w-6 h-6 rounded-full bg-green-200 border-2 border-white"></div>
              </div>
              <div className="text-xs font-medium text-gray-600">"Great session!"</div>
            </div>
          </FloatingElement>
        </div>

        {/* Main Content */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="relative z-20 max-w-4xl mx-auto"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-orange-50 text-orange-700 text-sm font-semibold mb-8 border border-orange-100 animate-fade-in-up">
            <span className="w-2 h-2 rounded-full bg-orange-500 animate-pulse"></span>
            New: AI-Powered Summaries
          </div>

          <h1 className="text-6xl sm:text-7xl md:text-8xl font-extrabold tracking-tight leading-[0.9] mb-8 text-gray-900">
            One tool to manage<br />
            <span className="relative inline-block">
              <span className="relative z-10">audience engagement</span>
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: "100%" }}
                transition={{ delay: 0.8, duration: 0.8 }}
                className="absolute bottom-2 left-0 h-4 bg-primary/20 -z-0"
              ></motion.div>
            </span>
          </h1>

          <p className="text-xl sm:text-2xl text-gray-500 max-w-2xl mx-auto leading-relaxed font-medium mb-10">
            Formiqa helps presenters work faster, smarter and more efficiently, delivering the visibility and data-driven insights to mitigate boredom.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to="/signup" className="w-full sm:w-auto px-8 py-4 bg-gray-900 text-white text-lg font-semibold rounded-full hover:bg-black hover:scale-105 active:scale-95 transition-all duration-300 shadow-xl hover:shadow-2xl">
              Start for Free
            </Link>
            <button className="w-full sm:w-auto px-8 py-4 bg-white text-gray-900 border border-gray-200 text-lg font-semibold rounded-full hover:bg-gray-50 hover:border-gray-300 transition-all duration-300 flex items-center justify-center gap-2">
              Get a Demo
            </button>
          </div>
        </motion.div>

        {/* Social Proof */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1, duration: 1 }}
          className="mt-24 pt-12 border-t border-gray-100 w-full max-w-5xl"
        >
          <p className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-8">Trusted by innovative teams at</p>
          <div className="flex flex-wrap justify-center items-center gap-12 opacity-50 grayscale hover:grayscale-0 transition-all duration-500">
            {/* Simple Text Placeholders for Logos */}
            <span className="text-xl font-bold font-serif">Acme Corp</span>
            <span className="text-xl font-bold font-mono">GlobalTech</span>
            <span className="text-xl font-extrabold italic">Nebula</span>
            <span className="text-xl font-bold tracking-widest">VORTEX</span>
            <span className="text-xl font-bold font-sans">Circle.io</span>
          </div>
        </motion.div>

      </header>

      {/* Features Grid Section */}
      <section className="max-w-7xl mx-auto px-6 pb-32">
        <motion.h2
          initial={{ opacity: 0, x: -20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          className="text-5xl sm:text-6xl font-extrabold tracking-tight mb-16 max-w-3xl"
        >
          Here’s what you can expect from us...
        </motion.h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">

          {/* Card 1: Real-time Feedback */}
          <motion.div
            whileHover={{ y: -10 }}
            className="bg-white border-2 border-orange-100 p-8 rounded-[2rem] min-h-[350px] flex flex-col justify-between group hover:border-primary hover:shadow-xl hover:shadow-primary/10 transition-all duration-300 relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-48 h-48 bg-primary/5 rounded-bl-full -mr-8 -mt-8 transition-transform duration-500 group-hover:scale-110"></div>
            <img src={feedbackImg} className="absolute right-[-10px] bottom-[-10px] w-48 h-auto opacity-80 transition-transform duration-500 group-hover:rotate-6 group-hover:scale-105" />
            <h3 className="text-2xl font-bold leading-tight tracking-tight text-gray-900 relative z-10">
              I'll bring colour, big energy and fresh thinking.
              <br /><span className="text-primary/60 text-lg mt-2 block font-normal">— Real-time Feedback</span>
            </h3>
          </motion.div>

          {/* Card 2: Live Q&A */}
          <motion.div
            whileHover={{ y: -10 }}
            className="bg-white border-2 border-orange-100 p-8 rounded-[2rem] min-h-[350px] flex flex-col justify-between group hover:border-primary hover:shadow-xl hover:shadow-primary/10 transition-all duration-300 relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-48 h-48 bg-primary/5 rounded-bl-full -mr-8 -mt-8 transition-transform duration-500 group-hover:scale-110"></div>
            <img src={qaImg} className="absolute right-[-10px] bottom-[-10px] w-48 h-auto opacity-80 transition-transform duration-500 group-hover:rotate-6 group-hover:scale-105" />
            <h3 className="text-2xl font-bold leading-tight tracking-tight text-gray-900 relative z-10">
              Learn, challenge and reconnect the dots.
              <br /><span className="text-primary/60 text-lg mt-2 block font-normal">— Live Q&A</span>
            </h3>
          </motion.div>

          {/* Card 3: Interaction */}
          <motion.div
            whileHover={{ y: -10 }}
            className="bg-white border-2 border-orange-100 p-8 rounded-[2rem] min-h-[350px] flex flex-col justify-between group hover:border-primary hover:shadow-xl hover:shadow-primary/10 transition-all duration-300 relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-48 h-48 bg-primary/5 rounded-bl-full -mr-8 -mt-8 transition-transform duration-500 group-hover:scale-110"></div>
            <img src={interactionImg} className="absolute right-[-10px] bottom-[-10px] w-48 h-auto opacity-80 transition-transform duration-500 group-hover:rotate-6 group-hover:scale-105" />
            <h3 className="text-2xl font-bold leading-tight tracking-tight text-gray-900 relative z-10">
              Recognise potential — pushing people to become better.
              <br /><span className="text-primary/60 text-lg mt-2 block font-normal">— Audience Interaction</span>
            </h3>
          </motion.div>

          {/* Card 4: Integration */}
          <motion.div
            whileHover={{ y: -10 }}
            className="bg-white border-2 border-orange-100 p-8 rounded-[2rem] min-h-[350px] flex flex-col justify-between group hover:border-primary hover:shadow-xl hover:shadow-primary/10 transition-all duration-300 relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-48 h-48 bg-primary/5 rounded-bl-full -mr-8 -mt-8 transition-transform duration-500 group-hover:scale-110"></div>
            <h3 className="text-2xl font-bold leading-tight tracking-tight text-gray-900 relative z-10">
              Teach teams to move at velocity and have a hell of a lot of fun doing it.
              <br /><span className="text-primary/60 text-lg mt-2 block font-normal">— Seamless Integration</span>
            </h3>
          </motion.div>

        </div>
      </section>

      {/* Footer */}
      <footer className="max-w-7xl mx-auto px-6 py-12 border-t border-gray-100 flex flex-col sm:flex-row justify-between items-center text-sm text-gray-500">
        <p>&copy; 2025 Formiqa. All rights reserved.</p>
        <div className="flex space-x-6 mt-4 sm:mt-0">
          <a href="#" className="hover:text-gray-900 transition-colors">Twitter</a>
          <a href="#" className="hover:text-gray-900 transition-colors">LinkedIn</a>
          <a href="#" className="hover:text-gray-900 transition-colors">Instagram</a>
        </div>
      </footer>

    </div>
  );
}
