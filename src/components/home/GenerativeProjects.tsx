'use client';

import React, { useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { FiExternalLink, FiCode, FiCpu, FiLayers, FiDatabase } from 'react-icons/fi';
import { BsTerminal } from 'react-icons/bs';

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
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1, duration: 0.6 }}
      viewport={{ once: true }}
      className="group relative flex flex-col h-full"
    >
      {/* Card Frame - Technical Border */}
      <div className="absolute inset-0 bg-[#080808] border border-white/10 transition-colors duration-300 group-hover:border-white/30" />
      
      {/* Corner Accents */}
      <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-white/20 group-hover:border-white/50 transition-colors" />
      <div className="absolute top-0 right-0 w-2 h-2 border-t border-r border-white/20 group-hover:border-white/50 transition-colors" />
      <div className="absolute bottom-0 left-0 w-2 h-2 border-b border-l border-white/20 group-hover:border-white/50 transition-colors" />
      <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-white/20 group-hover:border-white/50 transition-colors" />

      {/* Inner Content */}
      <div className="relative flex flex-col h-full p-1">
        
        {/* Header Area */}
        <div className="relative h-48 bg-[#0A0A0A] border-b border-white/5 p-6 overflow-hidden group-hover:bg-[#0F0F0F] transition-colors">
           {/* Technical Grid Background */}
           <div className="absolute inset-0 opacity-10 bg-[linear-gradient(rgba(255,255,255,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.1)_1px,transparent_1px)] bg-[size:20px_20px]" />
           
           <div className="relative z-10 flex flex-col h-full justify-between">
              <div className="flex justify-between items-start">
                 <div className="px-2 py-1 bg-white/5 border border-white/10">
                    <span className="text-[10px] font-mono text-gray-400 flex items-center gap-2 uppercase">
                       <BsTerminal size={10} />
                       PID_{index.toString().padStart(4, '0')}
                    </span>
                 </div>
                 <div className="flex items-center gap-2">
                    <span className="text-[8px] font-mono text-green-500 uppercase animate-pulse">Active</span>
                    <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
                 </div>
              </div>
              <h3 className="text-xl font-bold text-white tracking-tight uppercase group-hover:text-cyan-400 transition-colors">
                 {project.title}
              </h3>
           </div>
        </div>

        {/* Description Area */}
        <div className="p-6 flex-grow flex flex-col gap-6 bg-[#0A0A0A]">
           <div className="space-y-3">
              <div className="flex items-center gap-2 text-[10px] font-mono text-gray-500 uppercase tracking-widest">
                 <span className="w-2 h-[1px] bg-gray-600" />
                 System_Description
              </div>
              <p className="text-xs text-gray-400 leading-relaxed font-mono">
                 {project.description}
              </p>
           </div>

           {/* Metrics Grid - Technical */}
           {project.metrics && (
              <div className="grid grid-cols-2 gap-px bg-white/10 border border-white/10">
                 {Object.entries(project.metrics).map(([key, value]) => (
                    <div key={key} className="bg-[#0C0C0C] p-3 flex flex-col">
                       <span className="text-[8px] text-gray-600 uppercase tracking-wider mb-1">{key}</span>
                       <span className="text-xs font-mono text-white">{value}</span>
                    </div>
                 ))}
              </div>
           )}

           {/* Tech Stack - Tags */}
           <div className="flex flex-wrap gap-2 mt-auto pt-4 border-t border-white/5">
              {project.tech.map(tech => (
                 <span key={tech} className="px-2 py-1 text-[9px] text-gray-500 bg-white/[0.03] border border-white/5 uppercase tracking-wider">
                    {tech}
                 </span>
              ))}
           </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-white/5 bg-[#080808] flex justify-between items-center">
           <a 
             href={project.live} 
             className="text-[10px] font-mono text-gray-500 hover:text-cyan-400 flex items-center gap-2 transition-colors uppercase tracking-widest"
           >
              <FiExternalLink /> Execute_Demo
           </a>
           <a 
             href={project.code} 
             className="text-[10px] font-mono text-gray-500 hover:text-white flex items-center gap-2 transition-colors uppercase tracking-widest"
           >
              <FiCode /> View_Source
           </a>
        </div>
      </div>
    </motion.div>
  );
};

const GenerativeProjects: React.FC<GenerativeProjectsProps> = ({ projects }) => {
  return (
    <section className="py-32 px-4 bg-[#050505] relative overflow-hidden border-t border-white/5" id="projects">
      
      <div className="max-w-7xl mx-auto relative z-10">
        <div className="flex flex-col md:flex-row justify-between items-end mb-20 gap-8 border-l-2 border-white/10 pl-8">
          <div>
            <span className="text-[10px] font-mono uppercase tracking-[0.4em] text-gray-500 mb-4 block">
              // Project_Manifest
            </span>
            <h2 className="text-4xl md:text-5xl font-bold text-white tracking-tighter uppercase">
              Research <span className="text-gray-600">Output</span>
            </h2>
          </div>
          
          <div className="flex items-center gap-8 text-[10px] text-gray-500 font-mono uppercase tracking-widest">
            <div className="flex items-center gap-2">
              <FiDatabase className="text-white" />
              <span>Count: {projects.length}</span>
            </div>
            <div className="flex items-center gap-2">
              <FiCpu className="text-white" />
              <span>Compute: Online</span>
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
