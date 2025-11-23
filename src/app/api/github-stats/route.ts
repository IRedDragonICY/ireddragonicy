import { NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 60;

type GithubUser = {
  name: string;
  username: string;
  avatar: string;
  url: string;
};

type GithubStats = {
  username: string;
  totalRepositories: number;
  totalFollowers: number;
  totalFollowing: number;
  totalStars: number;
  totalCommits: number; // Approximation from contributions
  totalPRs: number; // Hard to get without API, maybe skip or approximate
  totalContributed: number;
  followersList: GithubUser[];
  followingList: GithubUser[];
  notFollowingBack: GithubUser[];
};

async function fetchText(url: string): Promise<string> {
  const res = await fetch(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8',
      'Accept-Language': 'en-US,en;q=0.9',
      'Referer': 'https://github.com/',
    },
    next: { revalidate: 3600 }
  });
  if (!res.ok) throw new Error(`Failed to fetch ${url}: ${res.status} ${res.statusText}`);
  return res.text();
}

function parseCount(text: string): number {
  if (!text) return 0;
  const clean = text.replace(/[^\d\.]/g, '');
  if (text.toLowerCase().includes('k')) {
    return Math.round(parseFloat(clean) * 1000);
  }
  return parseInt(clean, 10) || 0;
}

function extractUsers(html: string): GithubUser[] {
  const users: GithubUser[] = [];
  // Regex to find user blocks in the followers/following list
  // Try to match the container div for each user
  const userBlockRegex = /<div class="[^"]*d-table[^"]*"[^>]*>([\s\S]*?)<\/div>\s*<\/div>/g;
  
  let match;
  while ((match = userBlockRegex.exec(html)) !== null) {
    const block = match[1];
    
    // Extract username and link
    // Look for the first link that looks like a user profile
    const linkMatch = block.match(/href="\/(?!.*tab=)([^"?]+)"/);
    const username = linkMatch ? linkMatch[1] : '';
    
    // Extract avatar
    const avatarMatch = block.match(/src="([^"]+)"/);
    const avatar = avatarMatch ? avatarMatch[1] : '';
    
    // Extract name
    // Try to find the name in a span or just use username
    const nameMatch = block.match(/<span class="[^"]*Link--primary[^"]*">([^<]+)<\/span>/) ||
                      block.match(/<span class="[^"]*">([^<]+)<\/span>/);
    const name = nameMatch ? nameMatch[1].trim() : username;

    if (username && !users.some(u => u.username === username)) {
      users.push({
        name: name || username,
        username,
        avatar,
        url: `https://github.com/${username}`
      });
    }
  }
  return users;
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const username = searchParams.get('username') || 'IRedDragonICY';

  try {
    const [profileHtml, reposHtml, followersHtml, followingHtml] = await Promise.all([
      fetchText(`https://github.com/${username}`),
      fetchText(`https://github.com/${username}?tab=repositories`),
      fetchText(`https://github.com/${username}?tab=followers`),
      fetchText(`https://github.com/${username}?tab=following`)
    ]);

    // 1. Parse Basic Stats from Profile
    // Followers
    let totalFollowers = 0;
    const followersMatch = profileHtml.match(/href=".*?tab=followers".*?>\s*<span[^>]*>([\d,k\.]+)<\/span>/) ||
                           profileHtml.match(/([\d,k\.]+)\s+followers/);
    if (followersMatch) totalFollowers = parseCount(followersMatch[1]);

    // Following
    let totalFollowing = 0;
    const followingMatch = profileHtml.match(/href=".*?tab=following".*?>\s*<span[^>]*>([\d,k\.]+)<\/span>/) ||
                           profileHtml.match(/([\d,k\.]+)\s+following/);
    if (followingMatch) totalFollowing = parseCount(followingMatch[1]);

    // Contributions (Total Contributed)
    let totalContributed = 0;
    const contribMatch = profileHtml.match(/([\d,k\.]+)\s+contributions\s+in\s+the\s+last\s+year/);
    if (contribMatch) totalContributed = parseCount(contribMatch[1]);

    // 2. Parse Repositories Count
    let totalRepositories = 0;
    const reposCountMatch = reposHtml.match(/data-tab-item="repositories".*?class="Counter">([\d,k\.]+)<\/span>/) || 
                            profileHtml.match(/href=".*?tab=repositories".*?class="Counter">([\d,k\.]+)<\/span>/) ||
                            profileHtml.match(/Repositories\s*<span[^>]*>([\d,k\.]+)<\/span>/);
    if (reposCountMatch) totalRepositories = parseCount(reposCountMatch[1]);

    // 3. Parse Total Stars (Approximate from first page of repos)
    let totalStars = 0;
    // Try aria-label first
    const starMatches = reposHtml.matchAll(/aria-label="(\d+) users? starred this repository"/g);
    for (const match of starMatches) {
      totalStars += parseInt(match[1], 10);
    }
    // Fallback: look for star icon and number
    if (totalStars === 0) {
        const starTextMatches = reposHtml.matchAll(/<a[^>]*href=".*?\/stargazers"[^>]*>\s*<svg[^>]*>.*?<\/svg>\s*([\d,k\.]+)\s*<\/a>/g);
        for (const match of starTextMatches) {
            totalStars += parseCount(match[1]);
        }
    }

    // 4. Parse Users Lists
    const followersList = extractUsers(followersHtml);
    const followingList = extractUsers(followingHtml);

    // 5. Calculate Not Following Back
    const followersSet = new Set(followersList.map(u => u.username));
    const notFollowingBack = followingList.filter(u => !followersSet.has(u.username));

    // 6. Total Commits/PRs (Hard to get exactly without API, using contributions as proxy or 0)
    // We can try to find "Created ? commits" in the contribution activity, but it's dynamic JS often.
    // For now, we'll return 0 or maybe just use totalContributed as a main metric.
    const totalCommits = 0; 
    const totalPRs = 0;

    const stats: GithubStats = {
      username,
      totalRepositories,
      totalFollowers,
      totalFollowing,
      totalStars,
      totalCommits,
      totalPRs,
      totalContributed,
      followersList,
      followingList,
      notFollowingBack
    };

    return NextResponse.json(stats);

  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
