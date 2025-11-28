'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { FaPaypal, FaPatreon, FaHeart, FaCode, FaDatabase, FaServer } from 'react-icons/fa';
import { SiKofi } from 'react-icons/si';
import CursorEffect from '@/components/CursorEffect';
import DiffusionBackground from '@/app/social/components/diffusion/DiffusionBackground';
import AgencyFooter from '@/components/home/AgencyFooter';

const donationMethods = [
  {
    name: 'PayPal',
    icon: FaPaypal,
    description: 'One-time or recurring support',
    link: 'https://paypal.com/paypalme/IRedDragonICY'
  },
  {
    name: 'Patreon',
    icon: FaPatreon,
    description: 'Monthly membership with updates',
    link: 'https://patreon.com/c/ireddragonicy/membership'
  },
  {
    name: 'Ko-fi',
    icon: SiKofi,
    description: 'Buy me a coffee',
    link: 'https://ko-fi.com/ireddragonicy'
  },
  {
    name: 'Saweria',
    icon: FaHeart,
    description: 'Support in IDR',
    link: 'https://saweria.co/IRedDragonICY'
  }
];

const fundingGoals = [
  {
    icon: FaServer,
    title: 'GPU Compute',
    description: 'Training and inference costs for AI models and experiments',
    current: 45,
  },
  {
    icon: FaDatabase,
    title: 'Datasets & APIs',
    description: 'Access to quality datasets and cloud API credits',
    current: 30,
  },
  {
    icon: FaCode,
    title: 'Open Source',
    description: 'Maintaining and improving open source projects',
    current: 60,
  },
];

const supporters = [
  { name: '승림 장', amount: '$18.82' },
];

export default function DonatePage() {
  return (
    <>
      <CursorEffect />

      <main className="relative min-h-screen bg-background text-foreground overflow-x-hidden selection:bg-foreground/20 selection:text-foreground">
        
        {/* Background */}
        <div className="fixed inset-0 z-0 opacity-30 pointer-events-none">
           <DiffusionBackground />
        </div>
        
        {/* Content */}
        <div className="relative z-10 pt-32 pb-20">
          
          {/* Hero */}
          <div className="max-w-3xl mx-auto px-4 text-center mb-20">
            <motion.div
               initial={{ opacity: 0, y: 20 }}
               animate={{ opacity: 1, y: 0 }}
               transition={{ duration: 0.6 }}
            >
               <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-6">
                 Support My Work
               </h1>

               <p className="text-muted-foreground text-lg leading-relaxed max-w-xl mx-auto">
                 Your support helps fund AI research, maintain open-source projects, 
                 and create educational content. Every contribution makes a difference.
               </p>
            </motion.div>
          </div>

          {/* What Your Support Funds */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="max-w-4xl mx-auto px-4 mb-20"
          >
            <h2 className="text-sm text-muted-foreground mb-8 text-center">What your support funds</h2>
            
            <div className="grid md:grid-cols-3 gap-6">
              {fundingGoals.map((goal, index) => (
                <motion.div
                  key={goal.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 * index }}
                  className="p-6 rounded-lg border border-card-border bg-card"
                >
                  <goal.icon className="w-6 h-6 text-muted-foreground mb-4" />
                  <h3 className="font-medium text-foreground mb-2">{goal.title}</h3>
                  <p className="text-sm text-muted-foreground mb-4">{goal.description}</p>
                  
                  {/* Progress bar */}
                  <div className="h-1 bg-muted/30 rounded-full overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${goal.current}%` }}
                      transition={{ duration: 1, delay: 0.5 + index * 0.1 }}
                      className="h-full bg-foreground/50 rounded-full"
                    />
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">{goal.current}% of monthly goal</p>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Donation Methods */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="max-w-3xl mx-auto px-4 mb-20"
          >
            <h2 className="text-sm text-muted-foreground mb-8 text-center">Choose how to support</h2>
            
            <div className="grid sm:grid-cols-2 gap-4">
              {donationMethods.map((method, index) => (
                <motion.a
                  key={method.name}
                  href={method.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 * index }}
                  className="group p-6 rounded-lg border border-card-border bg-card hover:border-foreground/20 transition-all"
                >
                  <div className="flex items-center gap-4">
                    <div className="p-3 rounded-full bg-muted/30">
                      <method.icon className="w-5 h-5 text-foreground" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-medium text-foreground group-hover:text-muted-foreground transition-colors">
                        {method.name}
                      </h3>
                      <p className="text-sm text-muted-foreground">{method.description}</p>
                    </div>
                    <span className="text-muted-foreground group-hover:translate-x-1 transition-transform">
                      →
                    </span>
                  </div>
                </motion.a>
              ))}
            </div>
          </motion.div>

          {/* Recent Supporters */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="max-w-2xl mx-auto px-4"
          >
            <div className="border-t border-card-border pt-12">
              <h2 className="text-sm text-muted-foreground mb-6 text-center">Recent supporters</h2>
              
              <div className="flex flex-wrap justify-center gap-4">
                {supporters.map((supporter, index) => (
                  <div 
                    key={index}
                    className="px-4 py-2 rounded-full border border-card-border bg-card text-sm"
                  >
                    <span className="text-foreground">{supporter.name}</span>
                    <span className="text-muted-foreground ml-2">{supporter.amount}</span>
                  </div>
                ))}
                <div className="px-4 py-2 rounded-full border border-dashed border-card-border text-sm text-muted-foreground hover:text-foreground hover:border-foreground/30 transition-colors cursor-pointer">
                  + Your name here
                </div>
              </div>
              
              <p className="text-center text-muted-foreground text-xs mt-8">
                Thank you to everyone who has supported my work. ❤️
              </p>
            </div>
          </motion.div>

        </div>

        <AgencyFooter />
      </main>
    </>
  );
}
