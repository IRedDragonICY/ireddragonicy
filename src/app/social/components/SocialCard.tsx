import React from 'react';
import { motion } from 'framer-motion';
import { FiExternalLink } from 'react-icons/fi';
import type { SocialItem } from '../types';
import { StatsDisplay } from './StatsDisplay';
import { 
  useXStats, 
  useThreadsStats, 
  usePinterestStats, 
  useInstagramStats, 
  useYoutubeStats, 
  useBlueskyStats, 
  useTiktokStats, 
  useHoyolabStats, 
  useStravaStats 
} from '../hooks';

interface SocialCardProps {
  item: SocialItem;
  index: number;
}

export const SocialCard: React.FC<SocialCardProps> = ({ item, index }) => {
  const Icon = item.icon;

  // Get stats based on social platform
  const getStatsForPlatform = () => {
    switch (item.id) {
      case 'x':
        const xStats = useXStats('ireddragonicy');
        return [
          { label: 'Followers', value: xStats.followers, loading: xStats.loading },
          { label: 'Following', value: xStats.following, loading: xStats.loading },
          { label: 'Posts', value: xStats.posts, loading: xStats.loading },
        ];
      
      case 'threads':
        const threadsStats = useThreadsStats('ireddragonicy');
        return [
          { label: 'Followers', value: threadsStats.followers, loading: threadsStats.loading },
        ];
      
      case 'pinterest':
        const pinterestStats = usePinterestStats('IRedDragonICY');
        return [
          { label: 'Followers', value: pinterestStats.followers, loading: pinterestStats.loading },
          { label: 'Following', value: pinterestStats.following, loading: pinterestStats.loading },
        ];
      
      case 'instagram':
        const instagramStats = useInstagramStats('ireddragonicy');
        return [
          { label: 'Posts', value: instagramStats.posts, loading: instagramStats.loading },
          { label: 'Followers', value: instagramStats.followers, loading: instagramStats.loading },
          { label: 'Following', value: instagramStats.following, loading: instagramStats.loading },
        ];
      
      case 'instagram-dev':
        const instagramDevStats = useInstagramStats('ireddragonicy.code');
        return [
          { label: 'Posts', value: instagramDevStats.posts, loading: instagramDevStats.loading },
          { label: 'Followers', value: instagramDevStats.followers, loading: instagramDevStats.loading },
          { label: 'Following', value: instagramDevStats.following, loading: instagramDevStats.loading },
        ];
      
      case 'youtube':
        const youtubeStats = useYoutubeStats('@Ndik');
        return [
          { label: 'Subscribers', value: youtubeStats.subscribers, loading: youtubeStats.loading },
          { label: 'Videos', value: youtubeStats.videos, loading: youtubeStats.loading },
          { label: 'Views', value: youtubeStats.views, loading: youtubeStats.loading },
        ];
      
      case 'bluesky':
        const blueskyStats = useBlueskyStats('ireddragonicy.bsky.social');
        return [
          { label: 'Followers', value: blueskyStats.followers, loading: blueskyStats.loading },
          { label: 'Following', value: blueskyStats.following, loading: blueskyStats.loading },
          { label: 'Posts', value: blueskyStats.posts, loading: blueskyStats.loading },
        ];
      
      case 'tiktok':
        const tiktokStats = useTiktokStats('ireddragonicy');
        return [
          { label: 'Followers', value: tiktokStats.followers, loading: tiktokStats.loading },
          { label: 'Following', value: tiktokStats.following, loading: tiktokStats.loading },
          { label: 'Likes', value: tiktokStats.likes, loading: tiktokStats.loading },
        ];
      
      case 'hoyolab':
        const hoyolabStats = useHoyolabStats('10849915');
        return [
          { label: 'Posts', value: hoyolabStats.posts, loading: hoyolabStats.loading },
          { label: 'Following', value: hoyolabStats.following, loading: hoyolabStats.loading },
          { label: 'Followers', value: hoyolabStats.followers, loading: hoyolabStats.loading },
          { label: 'Likes', value: hoyolabStats.likes, loading: hoyolabStats.loading },
        ];
      
      case 'strava':
        const stravaStats = useStravaStats('164295314');
        return [
          { label: 'Followers', value: stravaStats.followers, loading: stravaStats.loading },
          { label: 'Following', value: stravaStats.following, loading: stravaStats.loading },
          { label: 'Distance (month)', value: stravaStats.distanceKm, loading: stravaStats.loading, suffix: ' km' },
          { label: 'Moving Time (month)', value: stravaStats.movingTime, loading: stravaStats.loading },
        ];
      
      default:
        return [];
    }
  };

  const stats = getStatsForPlatform();

  return (
    <motion.a
      href={item.href}
      target="_blank"
      rel="noopener noreferrer"
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.5, delay: index * 0.06 }}
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

          {stats.length > 0 && <StatsDisplay stats={stats} />}

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
};