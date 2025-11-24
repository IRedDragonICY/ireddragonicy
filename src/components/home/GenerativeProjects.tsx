'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { FiExternalLink, FiCode, FiCpu, FiDatabase } from 'react-icons/fi';
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
      <div className="absolute inset-0 bg-card border border-card-border transition-colors duration-300 group-hover:border-foreground/30" />
      
      {/* Corner Accents */}
      <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-card-border group-hover:border-foreground/50 transition-colors" />
      <div className="absolute top-0 right-0 w-2 h-2 border-t border-r border-card-border group-hover:border-foreground/50 transition-colors" />
      <div className="absolute bottom-0 left-0 w-2 h-2 border-b border-l border-card-border group-hover:border-foreground/50 transition-colors" />
      <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-card-border group-hover:border-foreground/50 transition-colors" />

      {/* Inner Content */}
      <div className="relative flex flex-col h-full p-1">
        
        {/* Header Area */}
        <div className="relative h-48 bg-card border-b border-card-border p-6 overflow-hidden group-hover:bg-muted transition-colors">
           {/* Technical Grid Background */}
           <div className="absolute inset-0 opacity-10 bg-[linear-gradient(rgba(128,128,128,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(128,128,128,0.1)_1px,transparent_1px)] bg-[size:20px_20px]" />
           
           <div className="relative z-10 flex flex-col h-full justify-between">
              <div className="flex justify-between items-start">
                 <div className="px-2 py-1 bg-foreground/5 border border-card-border">
                    <span className="text-[10px] font-mono text-muted-foreground flex items-center gap-2 uppercase">
                       <BsTerminal size={10} />
                       PID_{index.toString().padStart(4, '0')}
                    </span>
                 </div>
                 <div className="flex items-center gap-2">
                    <span className="text-[8px] font-mono text-green-500 uppercase animate-pulse">Active</span>
                    <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
                 </div>
              </div>
              <h3 className="text-xl font-bold text-foreground tracking-tight uppercase group-hover:text-cyan-500 transition-colors">
                 {project.title}
              </h3>
           </div>
        </div>

        {/* Description Area */}
        <div className="p-6 flex-grow flex flex-col gap-6 bg-card">
           <div className="space-y-3">
              <div className="flex items-center gap-2 text-[10px] font-mono text-muted-foreground uppercase tracking-widest">
                 <span className="w-2 h-[1px] bg-muted-foreground" />
                 System_Description
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed font-mono">
                 {project.description}
              </p>
           </div>

           {/* Metrics Grid - Technical */}
           {project.metrics && (
              <div className="grid grid-cols-2 gap-px bg-card-border border border-card-border">
                 {Object.entries(project.metrics).map(([key, value]) => (
                    <div key={key} className="bg-background p-3 flex flex-col">
                       <span className="text-[8px] text-muted-foreground uppercase tracking-wider mb-1">{key}</span>
                       <span className="text-xs font-mono text-foreground">{value}</span>
                    </div>
                 ))}
              </div>
           )}

           {/* Tech Stack - Tags */}
           <div className="flex flex-wrap gap-2 mt-auto pt-4 border-t border-card-border">
              {project.tech.map(tech => (
                 <span key={tech} className="px-2 py-1 text-[9px] text-muted-foreground bg-foreground/[0.03] border border-card-border uppercase tracking-wider">
                    {tech}
                 </span>
              ))}
           </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-card-border bg-card flex justify-between items-center">
           <a 
             href={project.live} 
             className="text-[10px] font-mono text-muted-foreground hover:text-cyan-500 flex items-center gap-2 transition-colors uppercase tracking-widest"
           >
              <FiExternalLink /> Execute_Demo
           </a>
           <a 
             href={project.code} 
             className="text-[10px] font-mono text-muted-foreground hover:text-foreground flex items-center gap-2 transition-colors uppercase tracking-widest"
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
    <section className="py-32 px-4 bg-background relative overflow-hidden border-t border-card-border" id="projects">
      
      <div className="max-w-7xl mx-auto relative z-10">
        <div className="flex flex-col md:flex-row justify-between items-end mb-20 gap-8 border-l-2 border-card-border pl-8">
          <div>
            <span className="text-[10px] font-mono uppercase tracking-[0.4em] text-muted-foreground mb-4 block">
              {'// Project_Manifest'}
            </span>
            <h2 className="text-4xl md:text-5xl font-bold text-foreground tracking-tighter uppercase">
              Research <span className="text-muted-foreground">Output</span>
            </h2>
          </div>
          
          <div className="flex items-center gap-8 text-[10px] text-muted-foreground font-mono uppercase tracking-widest">
            <div className="flex items-center gap-2">
              <FiDatabase className="text-foreground" />
              <span>Count: {projects.length}</span>
            </div>
            <div className="flex items-center gap-2">
              <FiCpu className="text-foreground" />
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
