'use client';

import React from 'react';
import { FaPython, FaReact, FaNodeJs, FaDocker, FaGitAlt, FaGithub, FaLinkedin } from 'react-icons/fa';
import { SiTypescript, SiTailwindcss, SiNextdotjs, SiTensorflow, SiPytorch, SiScikitlearn, SiJupyter, SiPostgresql, SiOpenai, SiHuggingface } from 'react-icons/si';
import Hero from '@/components/Hero';
import CursorEffect from '@/components/CursorEffect';
import DiffusionProfile from '@/components/home/DiffusionProfile';
import GenerativeProjects from '@/components/home/GenerativeProjects';
import TechStack from '@/components/home/TechStack';
import AgencyFooter from '@/components/home/AgencyFooter';

const portfolioData = {
  personalInfo: {
    name: "Mohammad Farid Hendianto",
    alias: "IRedDragonICY",
    dreamJob: "AI Research Scientist",
    bio: "Pioneering the intersection of artificial intelligence and scientific discovery. Specializing in deep learning, neural architectures, and generative AI models to solve complex real-world problems.",
    email: "mohammad.farid@example.com",
  },
  socials: [
    { name: 'GitHub', url: 'https://github.com', icon: FaGithub },
    { name: 'LinkedIn', url: 'https://linkedin.com', icon: FaLinkedin },
    { name: 'HuggingFace', url: 'https://huggingface.co', icon: SiHuggingface },
  ],
  skills: [
    {
      category: 'AI & Machine Learning',
      items: [
        { name: 'TensorFlow', icon: SiTensorflow },
        { name: 'PyTorch', icon: SiPytorch },
        { name: 'Scikit-learn', icon: SiScikitlearn },
        { name: 'OpenAI', icon: SiOpenai },
        { name: 'HuggingFace', icon: SiHuggingface }
      ]
    },
    {
      category: 'Programming',
      items: [
        { name: 'Python', icon: FaPython },
        { name: 'TypeScript', icon: SiTypescript },
        { name: 'React', icon: FaReact },
        { name: 'Next.js', icon: SiNextdotjs },
        { name: 'Node.js', icon: FaNodeJs }
      ]
    },
    {
      category: 'Tools & Infrastructure',
      items: [
        { name: 'Docker', icon: FaDocker },
        { name: 'Git', icon: FaGitAlt },
        { name: 'Jupyter', icon: SiJupyter },
        { name: 'PostgreSQL', icon: SiPostgresql },
        { name: 'Tailwind', icon: SiTailwindcss }
      ]
    },
  ],
  projects: [
    {
      title: 'Vixevia',
      description: 'Virtual Interactive and Xpressive Entertainment Visual Idol Avatar. An innovative AI-based Vtuber leveraging Google\'s Gemini for natural conversation, computer vision, and multimodal interaction.',
      tech: ['Python', 'Gemini Pro', 'Google Cloud', 'OpenCV'],
      metrics: { license: 'MIT', gpu: 'RTX 4050+', langs: 'ID/JP/EN/ZN' },
      live: 'https://github.com/IRedDragonICY/vixevia',
      code: 'https://github.com/IRedDragonICY/vixevia'
    },
  ],
  competencies: [
    { name: 'Deep Learning & Neural Networks', level: 95 },
    { name: 'Computer Vision & NLP', level: 92 },
    { name: 'Model Optimization & Deployment', level: 88 },
    { name: 'Research & Paper Implementation', level: 85 },
  ],
};

export default function Home() {
    return (
        <>
            <style jsx global>{`
                @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap');
                
                body {
                    font-family: 'Inter', sans-serif;
                    background: #0A0A0A;
                    color: white;
                    overflow-x: hidden;
                }
            `}</style>

            <CursorEffect />

            <main className="relative bg-[#0A0A0A] z-10">
                <Hero />
                <DiffusionProfile />
                <GenerativeProjects projects={portfolioData.projects} />
                <TechStack skills={portfolioData.skills} />
            </main>

            <AgencyFooter />
        </>
    );
}
