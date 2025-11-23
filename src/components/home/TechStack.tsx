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
    <section className="py-32 px-4 relative bg-[#050505]" id="skills">
       {/* Technical Grid Background */}
       <div className="absolute inset-0 pointer-events-none opacity-[0.02]"
            style={{ backgroundImage: 'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)', backgroundSize: '40px 40px' }}
       />

       <div className="max-w-6xl mx-auto relative z-10">
         <div className="text-center mb-24">
            <span className="text-[10px] font-mono uppercase tracking-[0.4em] text-gray-500 mb-4 block">
               {'// System_Capabilities'}
            </span>
            <h2 className="text-4xl font-bold text-white tracking-tighter uppercase">Technical Stack</h2>
         </div>

         <div className="space-y-20">
            {skills.map((category, catIdx) => (
              <div key={catIdx} className="relative border border-white/5 bg-[#080808] p-8">
                 {/* Category Header - Technical Tab */}
                 <div className="absolute -top-3 left-8 px-4 py-1 bg-[#050505] border border-white/10 text-xs font-mono text-cyan-500 uppercase tracking-widest">
                    {category.category}
                 </div>

                 {/* Skills Grid */}
                 <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-8 pt-4">
                    {category.items.map((skill, idx) => (
                       <motion.div
                         key={idx}
                         initial={{ opacity: 0 }}
                         whileInView={{ opacity: 1 }}
                         transition={{ delay: idx * 0.05 }}
                         className="group flex flex-col items-center gap-4"
                       >
                          {/* Icon Container */}
                          <div className="relative w-16 h-16 flex items-center justify-center border border-white/10 bg-white/[0.02] group-hover:bg-white/[0.05] group-hover:border-white/30 transition-all duration-300">
                             {/* Corner Markers */}
                             <div className="absolute top-0 left-0 w-1 h-1 bg-white/20" />
                             <div className="absolute top-0 right-0 w-1 h-1 bg-white/20" />
                             <div className="absolute bottom-0 left-0 w-1 h-1 bg-white/20" />
                             <div className="absolute bottom-0 right-0 w-1 h-1 bg-white/20" />
                             
                             <skill.icon className="text-2xl text-gray-500 group-hover:text-white transition-colors duration-300" />
                          </div>
                          
                          <span className="text-[10px] font-mono text-gray-500 uppercase tracking-wider group-hover:text-cyan-400 transition-colors">
                             {skill.name}
                          </span>
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
