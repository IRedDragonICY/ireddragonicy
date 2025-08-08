'use client';

import React from 'react';
import { motion } from 'framer-motion';
import HolographicCard from '@/components/hero/HolographicCard';
import { IconType } from 'react-icons';
import AnimatedIconBadge from '@/components/donate/AnimatedIconBadge';

type DonationOptionCardProps = {
  platform: 'PayPal' | 'Patreon' | 'Saweria';
  href: string;
  description: string;
  accent: 'cyan' | 'violet' | 'amber';
  Icon: IconType;
};

const colorMap: Record<DonationOptionCardProps['accent'], { from: string; to: string; text: string; glow: string }> = {
  cyan: { from: 'from-cyan-500', to: 'to-blue-600', text: 'text-cyan-300', glow: 'shadow-cyan-500/30' },
  violet: { from: 'from-violet-500', to: 'to-fuchsia-600', text: 'text-violet-300', glow: 'shadow-violet-500/30' },
  amber: { from: 'from-amber-500', to: 'to-orange-600', text: 'text-amber-300', glow: 'shadow-amber-500/30' },
};

const DonationOptionCard: React.FC<DonationOptionCardProps> = ({ platform, href, description, accent, Icon }) => {
  const colors = colorMap[accent];
  return (
    <HolographicCard className="w-full">
      <div className="relative p-5 sm:p-6 lg:p-7">
        <div className="flex flex-col items-center text-center gap-3">
          <motion.a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.97 }}
            aria-label={`Open ${platform}`}
            title={description}
          >
            <AnimatedIconBadge Icon={Icon as IconType} accent={accent} size={56} className="cursor-pointer" />
          </motion.a>
          <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`Open ${platform}`}
            title={description}
            className="block max-w-full"
          >
            <h3 className="text-sm sm:text-base font-bold tracking-wide leading-none">
              <span className={`text-transparent bg-clip-text bg-gradient-to-r ${colors.from} ${colors.to}`}>{platform}</span>
            </h3>
          </a>
        </div>

        {/* subtle bottom bar */}
        <div className={`mt-4 h-1 rounded-full bg-gradient-to-r ${colors.from} ${colors.to} opacity-40`} />
      </div>
    </HolographicCard>
  );
};

export default DonationOptionCard;


