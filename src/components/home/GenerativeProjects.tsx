'use client';

import React, { useRef, useState } from 'react';
import { motion, useInView } from 'framer-motion';
import { FiExternalLink, FiCode, FiCpu, FiLayers } from 'react-icons/fi';
import { BsStars } from 'react-icons/bs';

// Types
export interface ProjectMetric {
  [key: string]: string;
}

export interface Project {
  title: string;
  description: string;
  tech: string[];
  metrics?: ProjectMetric;
  live: string;
  code: string;
}

interface GenerativeProjectsProps {
  projects: Project[];
}

const ProjectCard = ({ project, index }: { project: Project; index: number }) => {
  const [isHovered, setIsHovered] = useState(false);
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1, duration: 0.6 }}
      viewport={{ once: true }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="group relative flex flex-col h-full"
    >
      {/* Card Frame */}
      <div className="absolute inset-0 bg-[#080808] rounded-2xl border border-white/10 transition-colors duration-500 group-hover:border-cyan-500/30" />
      
      {/* Animated Border Gradient (Active on Hover) */}
      <div className={`absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none overflow-hidden`}>
        <div className="absolute inset-[-50%] bg-gradient-to-r from-transparent via-cyan-500/20 to-transparent w-[200%] h-[200%] animate-[spin_4s_linear_infinite]" />
      </div>
      
      {/* Inner Content Frame to mask border */}
      <div className="relative flex flex-col h-full m-[1px] bg-[#0A0A0A] rounded-[15px] overflow-hidden">
        
        {/* "Image Generation" Header Area */}
        <div className="relative h-48 bg-gradient-to-br from-gray-900 to-black border-b border-white/5 p-6 overflow-hidden">
           {/* Abstract "Latent" Visualization */}
           <div className="absolute inset-0 opacity-30">
              <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_0%,rgba(34,211,238,0.1),transparent_70%)]" />
              {/* Tech-specific pattern */}
              {index % 2 === 0 ? (
                 <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_45%,rgba(255,255,255,0.03)_50%,transparent_55%)] bg-[length:10px_10px]" />
              ) : (
                 <div className="absolute inset-0 bg-[radial-gradient(rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[length:16px_16px]" />
              )}
           </div>
           
           {/* Title & Status */}
           <div className="relative z-10 flex flex-col h-full justify-between">
              <div className="flex justify-between items-start">
                 <div className="px-2 py-1 rounded-md bg-white/5 border border-white/10 backdrop-blur-sm">
                    <span className="text-[10px] font-mono text-cyan-400 flex items-center gap-1">
                       <BsStars /> GEN_ID_{index + 1024}
                    </span>
                 </div>
                 <div className="flex gap-1">
                    <div className="w-1.5 h-1.5 rounded-full bg-red-500/50" />
                    <div className="w-1.5 h-1.5 rounded-full bg-yellow-500/50" />
                    <div className="w-1.5 h-1.5 rounded-full bg-green-500/50" />
                 </div>
              </div>
              <h3 className="text-2xl font-bold text-white tracking-tight group-hover:text-cyan-400 transition-colors duration-300">
                 {project.title}
              </h3>
           </div>
        </div>

        {/* "Prompt/Description" Area */}
        <div className="p-6 flex-grow flex flex-col gap-6">
           <div className="space-y-2">
              <div className="flex items-center gap-2 text-[10px] font-mono text-gray-500 uppercase tracking-widest">
                 <span className="w-2 h-[1px] bg-gray-500" />
                 Description
              </div>
              <p className="text-sm text-gray-400 leading-relaxed font-light">
                 {project.description}
              </p>
           </div>

           {/* Metrics Grid */}
           {project.metrics && (
              <div className="grid grid-cols-2 gap-2">
                 {Object.entries(project.metrics).map(([key, value]) => (
                    <div key={key} className="bg-white/[0.02] border border-white/5 rounded p-2 flex flex-col">
                       <span className="text-[9px] text-gray-500 uppercase">{key}</span>
                       <span className="text-xs font-mono text-cyan-300">{value}</span>
                    </div>
                 ))}
              </div>
           )}

           {/* Tags */}
           <div className="flex flex-wrap gap-2 mt-auto">
              {project.tech.map(tech => (
                 <span key={tech} className="px-2 py-1 text-[10px] text-gray-400 bg-white/5 rounded border border-white/5">
                    {tech}
                 </span>
              ))}
           </div>
        </div>

        {/* Action Footer */}
        <div className="p-4 border-t border-white/5 bg-black/20 flex justify-between items-center group-hover:bg-cyan-950/10 transition-colors">
           <a 
             href={project.live} 
             className="text-xs font-mono text-gray-400 hover:text-white flex items-center gap-2 transition-colors"
           >
              <FiExternalLink /> LIVE_DEMO
           </a>
           <a 
             href={project.code} 
             className="text-xs font-mono text-gray-400 hover:text-white flex items-center gap-2 transition-colors"
           >
              <FiCode /> SOURCE_CODE
           </a>
        </div>
      </div>
    </motion.div>
  );
};

const GenerativeProjects: React.FC<GenerativeProjectsProps> = ({ projects }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  
  return (
    <section className="py-32 px-4 bg-[#080808] relative overflow-hidden" id="projects">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-[0.03]" 
           style={{ 
             backgroundImage: 'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)', 
             backgroundSize: '50px 50px' 
           }} 
      />
      
      <div className="max-w-7xl mx-auto relative z-10">
        <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-6">
          <div>
            <span className="text-[10px] font-mono uppercase tracking-widest text-purple-500 mb-2 block">
              // Output_Gallery
            </span>
            <h2 className="text-4xl md:text-5xl font-bold text-white">
              Generated <span className="text-gray-600">Projects</span>
            </h2>
          </div>
          
          <div className="flex items-center gap-4 text-sm text-gray-500 font-mono">
            <div className="flex items-center gap-2">
              <FiLayers className="text-cyan-500" />
              <span>BATCH_SIZE: {projects.length}</span>
            </div>
            <div className="flex items-center gap-2">
              <FiCpu className="text-purple-500" />
              <span>INFERENCE: REALTIME</span>
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {projects.map((project, index) => (
            <ProjectCard key={index} project={project} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default GenerativeProjects;

