'use client';

import React, { useCallback, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import Navigation from '@/components/Navigation';
import CursorEffect from '@/components/CursorEffect';
import { FiExternalLink, FiSearch, FiCopy, FiCheck } from 'react-icons/fi';
import { FaInstagram, FaYoutube, FaTelegram, FaDiscord, FaReddit, FaLinkedin, FaPinterest, FaGamepad, FaRobot, FaGithub } from 'react-icons/fa';
import { FaXTwitter } from 'react-icons/fa6';
import { SiPixiv, SiXdadevelopers, SiThreads, SiTiktok, SiGooglecloud, SiGoogle, SiOrcid, SiKaggle, SiGitlab, SiSteam, SiEpicgames, SiBilibili } from 'react-icons/si';
import { TbBrandBluesky, TbWorld } from 'react-icons/tb';
import { MdForum } from 'react-icons/md';
import type { IconType } from 'react-icons';

type SocialItem = {
  id: string;
  name: string;
  href: string;
  icon: IconType;
  description: string;
  accent: string; // primary hex for border/glow
  gradientFrom: string;
  gradientTo: string;
};

const personalInfo = { alias: 'IRedDragonICY' };

const socials: SocialItem[] = [
  {
    id: 'pixiv',
    name: 'Pixiv',
    href: 'https://www.pixiv.net/en/users/63934020',
    icon: SiPixiv,
    description: 'Illustrations, concepts, and generative art explorations.',
    accent: '#00A2FF',
    gradientFrom: '#00A2FF',
    gradientTo: '#0061FF',
  },
  {
    id: 'youtube',
    name: 'YouTube',
    href: 'https://www.youtube.com/channel/UCb-5o4_6ci9QCW2dHgasLEg',
    icon: FaYoutube,
    description: 'AI demos, research breakdowns, and development logs.',
    accent: '#FF0033',
    gradientFrom: '#FF3D3D',
    gradientTo: '#B31217',
  },
  {
    id: 'hoyolab',
    name: 'HoYoLAB',
    href: 'https://www.hoyolab.com/accountCenter/postList?id=10849915',
    icon: TbWorld,
    description: 'Game logs, posts, and events across HoYoverse titles.',
    accent: '#00D4FF',
    gradientFrom: '#00D4FF',
    gradientTo: '#0077FF',
  },
  {
    id: 'instagram',
    name: 'Instagram',
    href: 'https://www.instagram.com/ireddragonicy',
    icon: FaInstagram,
    description: 'Daily visuals, behind-the-scenes, and creative snapshots.',
    accent: '#E1306C',
    gradientFrom: '#833AB4',
    gradientTo: '#E1306C',
  },
  {
    id: 'instagram-dev',
    name: 'Instagram (Dev)',
    href: 'https://www.instagram.com/ireddragonicy.code/',
    icon: FaInstagram,
    description: 'Code snippets, dev logs, and engineering snapshots.',
    accent: '#E1306C',
    gradientFrom: '#833AB4',
    gradientTo: '#E1306C',
  },
  {
    id: 'pinterest',
    name: 'Pinterest',
    href: 'https://id.pinterest.com/IRedDragonICY/',
    icon: FaPinterest,
    description: 'Moodboards, design references, and visual inspirations.',
    accent: '#BD081C',
    gradientFrom: '#BD081C',
    gradientTo: '#8C0615',
  },
  {
    id: 'x',
    name: 'X (Twitter)',
    href: 'https://x.com/ireddragonicy',
    icon: FaXTwitter,
    description: 'Short updates, threads, and community conversations.',
    accent: '#1DA1F2',
    gradientFrom: '#111111',
    gradientTo: '#2A2A2A',
  },
  {
    id: 'threads',
    name: 'Threads',
    href: 'https://www.threads.net/@ireddragonicy',
    icon: SiThreads,
    description: 'Casual tech notes and quick reflections.',
    accent: '#FFFFFF',
    gradientFrom: '#0A0A0A',
    gradientTo: '#1A1A1A',
  },
  {
    id: 'telegram',
    name: 'Telegram',
    href: 'https://t.me/ireddragonicy',
    icon: FaTelegram,
    description: 'Direct updates and channel broadcasts.',
    accent: '#24A1DE',
    gradientFrom: '#24A1DE',
    gradientTo: '#157EBA',
  },
  {
    id: '4pda',
    name: '4PDA Forum',
    href: 'https://4pda.to/forum/index.php?showuser=7787388',
    icon: MdForum,
    description: 'Discussions, support, and deep‑dive threads with peers.',
    accent: '#1E88E5',
    gradientFrom: '#1E88E5',
    gradientTo: '#1565C0',
  },
  {
    id: 'xda',
    name: 'XDA Developers',
    href: 'https://xdaforums.com/m/hendik-s.9854029/',
    icon: SiXdadevelopers,
    description: 'Development threads and device worklogs.',
    accent: '#EA7100',
    gradientFrom: '#FF8C00',
    gradientTo: '#C75E00',
  },
  {
    id: 'discord',
    name: 'Discord',
    href: 'https://discord.com',
    icon: FaDiscord,
    description: 'Handle: @ireddragonicy — reach me via DMs or mentions.',
    accent: '#5865F2',
    gradientFrom: '#5865F2',
    gradientTo: '#3C45A5',
  },
  {
    id: 'reddit',
    name: 'Reddit',
    href: 'https://www.reddit.com/user/IRedDragonICY/',
    icon: FaReddit,
    description: 'Join discussions, share ideas, and explore threads.',
    accent: '#FF4500',
    gradientFrom: '#FF7F50',
    gradientTo: '#FF4500',
  },
  {
    id: 'tiktok',
    name: 'TikTok',
    href: 'https://www.tiktok.com/@ireddragonicy',
    icon: SiTiktok,
    description: 'Short-form demos and quick tech experiments.',
    accent: '#FE2C55',
    gradientFrom: '#25F4EE',
    gradientTo: '#FE2C55',
  },
  {
    id: 'bluesky',
    name: 'Bluesky',
    href: 'https://bsky.app/profile/ireddragonicy.bsky.social',
    icon: TbBrandBluesky,
    description: 'Open social updates and research tidbits.',
    accent: '#1185FE',
    gradientFrom: '#0EA5E9',
    gradientTo: '#3B82F6',
  },
  {
    id: 'linkedin',
    name: 'LinkedIn',
    href: 'https://www.linkedin.com/in/ireddragonicy/',
    icon: FaLinkedin,
    description: 'Professional profile, experience, and networking.',
    accent: '#0A66C2',
    gradientFrom: '#0A66C2',
    gradientTo: '#004182',
  },
  {
    id: 'gcloud-skillboost',
    name: 'Google Cloud Skills Boost',
    href: 'https://www.cloudskillsboost.google/public_profiles/a0d99021-862b-40d4-b668-c5a85a2b0f85',
    icon: SiGooglecloud,
    description: 'Badges, labs, and cloud learning progress.',
    accent: '#4285F4',
    gradientFrom: '#34A853',
    gradientTo: '#4285F4',
  },
  {
    id: 'google-developers',
    name: 'Google Developers',
    href: 'https://developers.google.com/profile/u/IRedDragonICY',
    icon: SiGoogle,
    description: 'Developer profile and activities across Google platforms.',
    accent: '#1A73E8',
    gradientFrom: '#34A853',
    gradientTo: '#1A73E8',
  },
  {
    id: 'civitai',
    name: 'CivitAI',
    href: 'https://civitai.com/user/IRedDragonICY',
    icon: FaRobot,
    description: 'Model cards, checkpoints, and generative AI resources.',
    accent: '#00E5A8',
    gradientFrom: '#00E5A8',
    gradientTo: '#00B894',
  },
  {
    id: 'orcid',
    name: 'ORCID',
    href: 'https://orcid.org/0009-0001-4686-1928',
    icon: SiOrcid,
    description: 'Researcher identifier and scholarly record.',
    accent: '#A6CE39',
    gradientFrom: '#A6CE39',
    gradientTo: '#7CB518',
  },
  {
    id: 'kaggle',
    name: 'Kaggle',
    href: 'https://www.kaggle.com/ireddragonicy',
    icon: SiKaggle,
    description: 'Datasets, notebooks, and competitions.',
    accent: '#20BEFF',
    gradientFrom: '#20BEFF',
    gradientTo: '#0095FF',
  },
  {
    id: 'github',
    name: 'GitHub',
    href: 'https://github.com/IRedDragonICY',
    icon: FaGithub,
    description: 'Open-source projects, code, and contributions.',
    accent: '#FFFFFF',
    gradientFrom: '#0A0A0A',
    gradientTo: '#1A1A1A',
  },
  {
    id: 'gitlab',
    name: 'GitLab',
    href: 'https://gitlab.com/IRedDragonICY',
    icon: SiGitlab,
    description: 'Repositories and CI/CD pipelines.',
    accent: '#FC6D26',
    gradientFrom: '#FC6D26',
    gradientTo: '#FCA326',
  },
  {
    id: 'steam',
    name: 'Steam',
    href: 'https://steamcommunity.com/id/IRedDragonICY/',
    icon: SiSteam,
    description: 'Game library, achievements, and community profile.',
    accent: '#00ADEE',
    gradientFrom: '#00ADEE',
    gradientTo: '#1B2838',
  },
  {
    id: 'epic-games',
    name: 'Epic Games',
    href: 'https://store.epicgames.com/u/b3e5802b94574f029852fdf9057f0cad',
    icon: SiEpicgames,
    description: 'Epic account profile and owned titles.',
    accent: '#FFFFFF',
    gradientFrom: '#141414',
    gradientTo: '#2A2A2A',
  },
  {
    id: 'bilibili',
    name: 'Bilibili',
    href: 'https://space.bilibili.com/1604827743',
    icon: SiBilibili,
    description: 'Videos and updates for the CN community.',
    accent: '#00A1D6',
    gradientFrom: '#00A1D6',
    gradientTo: '#0083B0',
  },
];

type GameItem = {
  id: string;
  name: string;
  server: string;
  uid?: string;
  ign?: string;
  icon: IconType;
  accent: string;
  gradientFrom: string;
  gradientTo: string;
};

const games: GameItem[] = [
  {
    id: 'zzz',
    name: 'Zenless Zone Zero',
    server: 'Asia',
    uid: '1300928404',
    icon: FaGamepad,
    accent: '#00E5FF',
    gradientFrom: '#00E5FF',
    gradientTo: '#0066FF',
  },
  {
    id: 'mlbb',
    name: 'Mobile Legends',
    server: '-',
    uid: '173772595 (2886)',
    icon: FaGamepad,
    accent: '#1DA1F2',
    gradientFrom: '#1DA1F2',
    gradientTo: '#0E7490',
  },
  {
    id: 'arknights',
    name: 'Arknights',
    server: '-',
    uid: '43207056',
    icon: FaGamepad,
    accent: '#64748B',
    gradientFrom: '#64748B',
    gradientTo: '#334155',
  },
  {
    id: 'azurlane',
    name: 'Azur Lane',
    server: '-',
    uid: '71763639',
    icon: FaGamepad,
    accent: '#38BDF8',
    gradientFrom: '#38BDF8',
    gradientTo: '#0EA5E9',
  },
  {
    id: 'hsr',
    name: 'Honkai: Star Rail',
    server: 'Asia',
    uid: '800754040',
    icon: FaGamepad,
    accent: '#A855F7',
    gradientFrom: '#7C3AED',
    gradientTo: '#A855F7',
  },
  {
    id: 'genshin',
    name: 'Genshin Impact',
    server: 'Asia',
    uid: '800779666',
    icon: FaGamepad,
    accent: '#F59E0B',
    gradientFrom: '#F59E0B',
    gradientTo: '#D97706',
  },
  {
    id: 'hi3',
    name: 'Honkai Impact 3rd',
    server: 'SEA',
    ign: 'IRedDragonICY',
    icon: FaGamepad,
    accent: '#10B981',
    gradientFrom: '#10B981',
    gradientTo: '#059669',
  },
];

const SectionHeader = ({ title }: { title: string }) => (
  <div className="relative mb-12">
    <motion.div
      initial={{ scaleX: 0 }}
      animate={{ scaleX: 1 }}
      transition={{ duration: 0.8 }}
      className="absolute inset-0 bg-gradient-to-r from-transparent via-cyan-500/10 to-transparent"
    />
    <h1 className="relative text-center text-3xl md:text-5xl font-extrabold tracking-tight">
      <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600">&lt;{title}/&gt;</span>
    </h1>
  </div>
);

export default function SocialPage() {
  const [query, setQuery] = useState('');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const lowerQ = query.toLowerCase();
  const filteredSocials = useMemo(() =>
    socials.filter(s =>
      s.name.toLowerCase().includes(lowerQ) ||
      s.description.toLowerCase().includes(lowerQ) ||
      s.href.toLowerCase().includes(lowerQ)
    ), [lowerQ]
  );
  const filteredGames = useMemo(() =>
    games.filter(g =>
      g.name.toLowerCase().includes(lowerQ) ||
      g.server.toLowerCase().includes(lowerQ) ||
      (g.uid?.toLowerCase().includes(lowerQ) ?? false) ||
      (g.ign?.toLowerCase().includes(lowerQ) ?? false)
    ), [lowerQ]
  );

  const copyToClipboard = useCallback(async (label: string, value: string) => {
    try {
      await navigator.clipboard.writeText(value);
      setCopiedKey(`${label}:${value}`);
      setTimeout(() => setCopiedKey(null), 1400);
    } catch (e) {
      // no-op
    }
  }, []);

  return (
    <>
      {/* Ambient visuals and navigation */}
      <CursorEffect />
      <Navigation personalInfo={personalInfo} />

      <main className="relative min-h-screen pt-24 pb-20">
        {/* Layered ambient background */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <motion.div
            className="absolute -top-32 -left-32 w-[520px] h-[520px] rounded-full blur-3xl"
            style={{ background: 'radial-gradient(circle at 30% 30%, rgba(34,211,238,0.35), transparent 60%)' }}
            animate={{ x: [-20, 20, -20], y: [0, 10, 0] }}
            transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
          />
          <motion.div
            className="absolute -bottom-40 -right-24 w-[600px] h-[600px] rounded-full blur-3xl"
            style={{ background: 'radial-gradient(circle at 70% 70%, rgba(168,85,247,0.35), transparent 60%)' }}
            animate={{ x: [10, -10, 10], y: [0, -12, 0] }}
            transition={{ duration: 14, repeat: Infinity, ease: 'easeInOut' }}
          />
          <div
            className="absolute inset-0 opacity-[0.03]"
            style={{ backgroundImage: 'radial-gradient(rgba(255,255,255,0.6) 1px, transparent 1px)', backgroundSize: '3px 3px', mixBlendMode: 'overlay' }}
          />
        </div>

        <section className="relative w-full max-w-6xl mx-auto px-4">
          <SectionHeader title="SOCIAL_LINKS" />

          <div className="mb-8">
            <div className="relative">
              <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search socials, links, games, UIDs..."
                className="w-full pl-12 pr-4 py-3 rounded-xl bg-black/40 border border-cyan-400/20 text-gray-200 placeholder:text-gray-500 focus:outline-none focus:border-cyan-400/50 focus:ring-2 focus:ring-cyan-400/20"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {filteredSocials.map((item, idx) => {
              const Icon = item.icon;
              return (
                <motion.a
                  key={item.id}
                  href={item.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.2 }}
                  transition={{ duration: 0.5, delay: idx * 0.06 }}
                  whileHover={{ y: -4 }}
                  whileTap={{ scale: 0.98 }}
                  className="relative p-6 rounded-2xl bg-black/40 backdrop-blur-xl border border-cyan-400/20 shadow-lg shadow-cyan-500/10 overflow-hidden group"
                  style={{
                    boxShadow: `0 10px 30px -12px ${item.accent}33`,
                  }}
                >
                  {/* Accent gradient sweep */}
                  <div
                    className="absolute -inset-1 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                    style={{
                      background: `linear-gradient(135deg, ${item.gradientFrom}22, ${item.gradientTo}22)`,
                    }}
                  />

                  <div className="relative flex items-start gap-4">
                    <div
                      className="shrink-0 p-3 rounded-xl border"
                      style={{
                        background: `linear-gradient(145deg, ${item.gradientFrom}26, ${item.gradientTo}26)`,
                        borderColor: `${item.accent}33`,
                      }}
                    >
                      <Icon className="text-2xl" color={item.accent} />
                    </div>

                    <div className="min-w-0">
                      <h3 className="text-lg md:text-xl font-semibold text-white">
                        {item.name}
                      </h3>
                      <p className="mt-1 text-sm text-gray-300 line-clamp-2">
                        {item.description}
                      </p>

                      <div className="mt-4 flex items-center gap-2 text-cyan-300/90">
                        <FiExternalLink className="text-base" />
                        <span className="text-xs md:text-sm break-words">
                          {item.href}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Hover ring */}
                  <motion.div
                    className="absolute inset-0 rounded-2xl"
                    initial={false}
                    animate={{ boxShadow: ['0 0 0 0 rgba(0,0,0,0)', `0 0 0 2px ${item.accent}33`] }}
                    transition={{ duration: 0.4 }}
                  />
                </motion.a>
              );
            })}
          </div>
        </section>

        <section className="relative w-full max-w-6xl mx-auto px-4 mt-14">
          <SectionHeader title="GAME_IDS" />

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {filteredGames.map((g, idx) => (
              <motion.div
                key={g.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ duration: 0.5, delay: idx * 0.06 }}
                className="relative p-6 rounded-2xl bg-black/40 backdrop-blur-xl border border-cyan-400/20 shadow-lg shadow-cyan-500/10 overflow-hidden group"
                style={{ boxShadow: `0 10px 30px -12px ${g.accent}33` }}
              >
                <div
                  className="absolute -inset-1 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                  style={{ background: `linear-gradient(135deg, ${g.gradientFrom}22, ${g.gradientTo}22)` }}
                />

                <div className="relative flex items-start gap-4">
                  <div
                    className="shrink-0 p-3 rounded-xl border"
                    style={{ background: `linear-gradient(145deg, ${g.gradientFrom}26, ${g.gradientTo}26)`, borderColor: `${g.accent}33` }}
                  >
                    <g.icon className="text-2xl" color={g.accent} />
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-lg md:text-xl font-semibold text-white">{g.name}</h3>
                    <div className="mt-2 flex flex-wrap items-center gap-3 text-sm">
                      <span className="px-3 py-1 rounded-full bg-white/5 text-gray-200 border border-white/10">Server: {g.server}</span>
                      {g.uid && (
                        <span className="px-3 py-1 rounded-full bg-white/5 text-gray-200 border border-white/10 inline-flex items-center gap-2">
                          <span>UID: {g.uid}</span>
                          <button
                            type="button"
                            onClick={() => copyToClipboard('uid', g.uid!)}
                            className="p-1 rounded-md hover:bg-white/10"
                            aria-label="Copy UID"
                          >
                            {copiedKey === `uid:${g.uid}` ? <FiCheck className="text-emerald-400" /> : <FiCopy />}
                          </button>
                        </span>
                      )}
                      {g.ign && (
                        <span className="px-3 py-1 rounded-full bg-white/5 text-gray-200 border border-white/10 inline-flex items-center gap-2">
                          <span>IGN: {g.ign}</span>
                          <button
                            type="button"
                            onClick={() => copyToClipboard('ign', g.ign!)}
                            className="p-1 rounded-md hover:bg-white/10"
                            aria-label="Copy IGN"
                          >
                            {copiedKey === `ign:${g.ign}` ? <FiCheck className="text-emerald-400" /> : <FiCopy />}
                          </button>
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </section>
      </main>
    </>
  );
}


