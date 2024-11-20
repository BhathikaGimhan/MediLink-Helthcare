import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Star, MapPin, Award, ThumbsUp } from 'lucide-react';
import { Link } from 'react-router-dom';

const mockDoctors = [
  {
    id: 1,
    name: "Dr. Sarah Chen",
    specialty: "Neurology",
    rating: 4.8,
    reviews: 128,
    location: "Neo Tokyo Central",
    image: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=300&h=300"
  },
  {
    id: 2,
    name: "Dr. Alex Rodriguez",
    specialty: "Cybernetic Surgery",
    rating: 4.9,
    reviews: 256,
    location: "Upper Manhattan District",
    image: "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?auto=format&fit=crop&q=80&w=300&h=300"
  },
  {
    id: 3,
    name: "Dr. Maya Patel",
    specialty: "Neural Integration",
    rating: 4.7,
    reviews: 184,
    location: "Silicon Valley Med Center",
    image: "https://images.unsplash.com/photo-1594824476967-48c8b964273f?auto=format&fit=crop&q=80&w=300&h=300"
  }
];

const DoctorRanking = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSpecialty, setSelectedSpecialty] = useState('all');

  return (
    <div className="space-y-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="cyber-card p-6"
      >
        <div className="flex flex-col md:flex-row md:items-center gap-4">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Search doctors..."
              className="w-full px-4 py-2 bg-gray-800 border border-cyan-500/30 rounded-lg focus:outline-none focus:border-cyan-400"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <select
            className="px-4 py-2 bg-gray-800 border border-cyan-500/30 rounded-lg focus:outline-none focus:border-cyan-400"
            value={selectedSpecialty}
            onChange={(e) => setSelectedSpecialty(e.target.value)}
          >
            <option value="all">All Specialties</option>
            <option value="neurology">Neurology</option>
            <option value="cybernetic">Cybernetic Surgery</option>
            <option value="neural">Neural Integration</option>
          </select>
        </div>
      </motion.div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {mockDoctors.map((doctor, index) => (
          <motion.div
            key={doctor.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Link to={`/doctors/${doctor.id}`}>
              <div className="cyber-card hover:scale-105 transition-transform duration-300">
                <div className="relative">
                  <img
                    src={doctor.image}
                    alt={doctor.name}
                    className="w-full h-48 object-cover"
                  />
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-gray-900 to-transparent p-4">
                    <div className="flex items-center space-x-2">
                      <Star className="w-5 h-5 text-yellow-400" />
                      <span className="font-bold">{doctor.rating}</span>
                      <span className="text-sm text-gray-400">({doctor.reviews} reviews)</span>
                    </div>
                  </div>
                </div>
                <div className="p-4 space-y-3">
                  <h3 className="text-xl font-bold">{doctor.name}</h3>
                  <div className="flex items-center space-x-2 text-cyan-400">
                    <Award className="w-4 h-4" />
                    <span>{doctor.specialty}</span>
                  </div>
                  <div className="flex items-center space-x-2 text-gray-400">
                    <MapPin className="w-4 h-4" />
                    <span>{doctor.location}</span>
                  </div>
                  <div className="flex items-center justify-between pt-2">
                    <div className="flex items-center space-x-2">
                      <ThumbsUp className="w-4 h-4 text-green-400" />
                      <span className="text-sm">98% recommendation rate</span>
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

export default DoctorRanking;