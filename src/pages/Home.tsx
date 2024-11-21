import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Star, Users, Bot } from "lucide-react";
import ExamplePage from "./ExamplePage";

const features = [
  {
    icon: Star,
    title: "Doctor Rankings",
    description:
      "Rate and review healthcare professionals based on your experience.",
    link: "/doctors",
  },
  {
    icon: Users,
    title: "Community",
    description:
      "Join discussions and share your healthcare journey with others.",
    link: "/community",
  },
  {
    icon: Bot,
    title: "AI Assistant",
    description: "Get instant help with finding the right healthcare provider.",
    link: "/chat-history",
  },
];

const Home = () => {
  return (
    <div className="space-y-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center space-y-4"
      >
        <ExamplePage />
        <h1 className="text-5xl font-bold neon-text">Welcome to CyberDoc</h1>
        <p className="text-xl text-gray-400 max-w-2xl mx-auto">
          The future of healthcare ratings is here. Connect with top medical
          professionals and make informed decisions about your health.
        </p>
      </motion.div>
      <div className="grid md:grid-cols-3 gap-8 mt-12">
        {features.map((feature, index) => (
          <motion.div
            key={feature.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.2 }}
          >
            <Link to={feature.link}>
              <div className="cyber-card p-6 h-full hover:scale-105 transition-transform duration-300">
                <feature.icon className="w-12 h-12 text-cyan-400 mb-4" />
                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-gray-400">{feature.description}</p>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
        className="cyber-card p-8 mt-12"
      >
        <h2 className="text-2xl font-bold mb-4">Why Choose CyberDoc?</h2>
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-xl font-semibold mb-2 text-cyan-400">
              Transparent Ratings
            </h3>
            <p className="text-gray-400">
              Our platform ensures authentic reviews from verified patients.
            </p>
          </div>
          <div>
            <h3 className="text-xl font-semibold mb-2 text-cyan-400">
              AI-Powered Matching
            </h3>
            <p className="text-gray-400">
              Let our AI help you find the perfect healthcare provider.
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Home;
