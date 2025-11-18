'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { IconType } from 'react-icons';

export interface SkillItem {
  name: string;
  icon: IconType;
}

export interface SkillCategory {
  category: string;
  items: SkillItem[];
}

interface TechStackProps {
  skills: SkillCategory[];
}

const TechStack: React.FC<TechStackProps> = ({ skills }) => {
  return (
    <section className="py-32 px-4 relative" id="skills">
       {/* Connector Lines Background */}
       <div className="absolute inset-0 pointer-events-none">
          <div className="absolute left-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-white/5 to-transparent" />
       </div>

       <div className="max-w-6xl mx-auto relative z-10">
         <div className="text-center mb-24">
            <span className="text-[10px] font-mono uppercase tracking-widest text-green-500 mb-2 block">
               // System_Capabilities
            </span>
            <h2 className="text-4xl font-bold text-white">Neural Tech Stack</h2>
         </div>

         <div className="space-y-24">
            {skills.map((category, catIdx) => (
              <div key={catIdx} className="relative">
                 {/* Category Header */}
                 <motion.div 
                   initial={{ opacity: 0 }}
                   whileInView={{ opacity: 1 }}
                   className="flex items-center justify-center mb-12 gap-4"
                 >
                    <div className="h-px w-12 bg-gray-800" />
                    <h3 className="text-lg font-mono text-cyan-400 uppercase tracking-widest border border-cyan-500/20 px-4 py-1 rounded-full bg-cyan-500/5">
                       {category.category}
                    </h3>
                    <div className="h-px w-12 bg-gray-800" />
                 </motion.div>

                 {/* Skills Grid */}
                 <div className="flex flex-wrap justify-center gap-x-12 gap-y-12">
                    {category.items.map((skill, idx) => (
                       <motion.div
                         key={idx}
                         initial={{ opacity: 0, scale: 0 }}
                         whileInView={{ opacity: 1, scale: 1 }}
                         transition={{ delay: idx * 0.05, type: 'spring', stiffness: 200 }}
                         className="group relative"
                       >
                          {/* Node Connection Lines */}
                          <div className="absolute -top-6 left-1/2 w-px h-6 bg-gray-800 group-hover:bg-cyan-500/50 transition-colors" />
                          
                          {/* Node */}
                          <div className="w-20 h-20 rounded-full bg-[#0A0A0A] border border-white/10 flex items-center justify-center relative z-10 group-hover:border-cyan-500/50 group-hover:scale-110 transition-all duration-300 shadow-lg shadow-black">
                             <div className="absolute inset-0 rounded-full bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                             <skill.icon className="text-3xl text-gray-500 group-hover:text-white transition-colors duration-300" />
                             
                             {/* Tooltip */}
                             <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap">
                                <span className="text-[10px] font-mono text-cyan-300 bg-black/80 px-2 py-1 rounded border border-white/10">
                                   {skill.name}
                                </span>
                             </div>
                          </div>
                       </motion.div>
                    ))}
                 </div>
              </div>
            ))}
         </div>
       </div>
    </section>
  );
};

export default TechStack;

