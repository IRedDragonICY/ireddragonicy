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
    <section className="py-32 px-4 relative bg-background" id="skills">
       {/* Technical Grid Background */}
       <div className="absolute inset-0 pointer-events-none opacity-[0.03] text-foreground"
            style={{ backgroundImage: 'linear-gradient(currentColor 1px, transparent 1px), linear-gradient(90deg, currentColor 1px, transparent 1px)', backgroundSize: '40px 40px' }}
       />

       <div className="max-w-6xl mx-auto relative z-10">
         <div className="text-center mb-24">
            <span className="text-[10px] font-mono uppercase tracking-[0.4em] text-muted-foreground mb-4 block">
               {'// System_Capabilities'}
            </span>
            <h2 className="text-4xl font-bold text-foreground tracking-tighter uppercase">Technical Stack</h2>
         </div>

         <div className="space-y-20">
            {skills.map((category, catIdx) => (
              <div key={catIdx} className="relative border border-card-border bg-card p-8">
                 {/* Category Header - Technical Tab */}
                 <div className="absolute -top-3 left-8 px-4 py-1 bg-background border border-card-border text-xs font-mono text-cyan-500 uppercase tracking-widest">
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
                          <div className="relative w-16 h-16 flex items-center justify-center border border-card-border bg-foreground/[0.02] group-hover:bg-foreground/[0.05] group-hover:border-foreground/30 transition-all duration-300">
                             {/* Corner Markers */}
                             <div className="absolute top-0 left-0 w-1 h-1 bg-foreground/20" />
                             <div className="absolute top-0 right-0 w-1 h-1 bg-foreground/20" />
                             <div className="absolute bottom-0 left-0 w-1 h-1 bg-foreground/20" />
                             <div className="absolute bottom-0 right-0 w-1 h-1 bg-foreground/20" />
                             
                             <skill.icon className="text-2xl text-muted-foreground group-hover:text-foreground transition-colors duration-300" />
                          </div>
                          
                          <span className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider group-hover:text-cyan-500 transition-colors">
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
