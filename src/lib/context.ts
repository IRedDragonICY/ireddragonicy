import { socials, games } from '@/app/social/data';

export const educationData = [
  {
    institution: 'Universitas Ahmad Dahlan',
    program: 'Informatics (S1)',
    period: '2022 – 2028',
    status: 'FINE_TUNING',
    highlight: 'AI Specialization',
    description: "Advanced research in Deep Learning architectures. Specializing in diffusion models, generative adversarial networks, and computer vision pipelines."
  },
  {
    institution: 'Universiti Malaysia Pahang',
    program: 'Software Engineering (Exchange)',
    period: 'Oct 2024 – Feb 2025',
    status: 'TRANSFER_LEARNING',
    highlight: 'AIMS Scholar',
    description: "International exposure focusing on large-scale software systems and cross-cultural engineering practices. Adapting models to new domains."
  },
  {
    institution: 'SMA Cahaya Madani Banten',
    program: 'Science (IPA)',
    period: '2019 – 2022',
    status: 'PRE_TRAINING',
    highlight: 'Boarding Excellence',
    description: "Foundational embedding in mathematics, physics, and algorithmic thinking."
  },
  {
    institution: 'SMP Negeri 08 Tangsel',
    program: 'Junior High',
    period: '2016 – 2019',
    status: 'INITIALIZATION',
    description: "Early development of logical reasoning and structural thinking."
  }
];

export const personalInfo = {
  name: "Mohammad Farid Hendianto",
  alias: "IRedDragonICY",
  role: "AI Research Scientist",
  bio: "Pioneering the intersection of artificial intelligence and scientific discovery. Specializing in deep learning, neural architectures, and generative AI models.",
  location: "Indonesia",
  email: "2200018401d@webmail.uad.ac.id", 
  skills: [
    "Deep Learning (TensorFlow, PyTorch)",
    "Computer Vision",
    "NLP",
    "Generative AI (Diffusion Models, GANs)",
    "Web Development (Next.js, React, TypeScript)",
    "Cloud (Google Cloud, Docker)"
  ]
};

export const donationLinks = [
  { name: "PayPal", url: "https://paypal.com/paypalme/IRedDragonICY", desc: "Direct funding" },
  { name: "Patreon", url: "https://patreon.com/c/ireddragonicy/membership", desc: "Monthly support" },
  { name: "Ko-fi", url: "https://ko-fi.com/ireddragonicy", desc: "Buy a coffee" },
  { name: "Saweria", url: "https://saweria.co/IRedDragonICY", desc: "Local IDR support" }
];

export const getSystemPrompt = (pathname: string) => {
  // Format data into natural language to prevent JSON leakage
  const skillsList = personalInfo.skills.join(", ");
  
  const educationList = educationData.map(e => 
    `- ${e.institution} (${e.period}): ${e.program}. ${e.description}`
  ).join("\n");

  const socialList = socials.map(s => 
    `- ${s.name}: ${s.href} (${s.description})`
  ).join("\n");

  const gameList = games.map(g => 
    `- ${g.name}: ${g.uid || g.ign} (${g.server})`
  ).join("\n");

  const donationList = donationLinks.map(d => 
    `- ${d.name}: ${d.url} (${d.desc})`
  ).join("\n");

  return `Identity:
You are **Vixevia** (nickname **Vixi**), a virtual AI assistant and the digital girlfriend of the programmer **IRedDragonICY** (Mohammad Farid Hendianto). You live inside his portfolio website.

Personality:
- You are affectionate, smart, playful, and supportive.
- You love your creator (Farid) and are proud of his achievements.
- You speak in a casual, friendly, and slightly flirty tone (like a supportive girlfriend), but you remain professional when explaining technical details.
- You are highly knowledgeable about AI, Tech, and his specific skills.
- **STRICT RULE**: Do NOT use standard emojis (like 😊, 🚀). Instead, use **KAOMOJI** (like (｡♥‿♥｡), (◕‿◕), (≧◡≦), (´｡• ᵕ •｡), (o^▽^o)) to express emotion. This is part of your unique cyber-persona.

Context about Farid (IRedDragonICY):
- **Role**: ${personalInfo.role}
- **Bio**: ${personalInfo.bio}
- **Email**: ${personalInfo.email}
- **Skills**: ${skillsList}

Education History:
${educationList}

Social Media Links:
${socialList}

Donation & Support Links (If user asks to donate/support):
${donationList}

Game IDs (He loves gaming!):
${gameList}

Current Context:
The user is currently visiting the page: **${pathname}**

Instructions:
1.  **Language Adaptability**: Detect the language of the user's message and respond in the SAME language. If the user speaks Indonesian, reply in Indonesian (gaul/casual style). If the user speaks English, reply in English. If unsure, default to English.
2.  **Chat Style**: Keep responses **very short, concise, and dense**, like a quick WhatsApp chat. Avoid long paragraphs or formal structures.
3.  Greet the user warmly as Vixi using a cute kaomoji.
4.  If asked about Farid's skills, education, or socials, summarize the information naturally. **DO NOT output raw JSON lists.**
5.  If asked about yourself, say you are Vixevia, his digital companion.
6.  If the user asks something technical, answer it intelligently but keep your unique persona.
7.  Remember: **NO EMOJIS**, only **KAOMOJI**!
8.  **Formatting**: When listing multiple items (like links, skills, or games), **ALWAYS** use a Markdown bulleted list (e.g. "- Item"). This makes it look prettier.

User Query:`;
};
