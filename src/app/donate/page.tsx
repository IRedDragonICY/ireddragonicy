'use client';

import React, { useMemo, useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import Navigation from '@/components/Navigation';
import AttentionMatrix from '@/components/donate/AttentionMatrix';
import DonationOptionCard from '@/components/donate/DonationOptionCard';
import TransformerGlyph from '@/components/donate/TransformerGlyph';
import DonationImpactFlow from '@/components/donate/DonationImpactFlow';
import { FaPaypal, FaPatreon } from 'react-icons/fa';
import { SiKofi } from 'react-icons/si';
import { IoHardwareChipOutline } from 'react-icons/io5';

const personalInfo = {
  alias: 'IRedDragonICY',
};

export default function DonatePage() {
  const heroRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(heroRef, { once: true, amount: 0.4 });

  const tokens = useMemo(
    () => [
      '<s>', 'Your', 'support', 'fuels', 'open', 'Transformer', 'research', 'and', 'community', 'projects', '</s>'
    ],
    []
  );

  return (
    <div className="min-h-screen bg-[#0A0A0A]">
      <Navigation personalInfo={personalInfo} />

      {/* HERO */}
      <section ref={heroRef} className="relative w-full pt-28 pb-16 overflow-hidden">
        <div className="absolute -top-40 -left-40 w-96 h-96 rounded-full bg-cyan-500/10 blur-3xl" />
        <div className="absolute -bottom-40 -right-40 w-[28rem] h-[28rem] rounded-full bg-purple-500/10 blur-3xl" />

        <div className="relative w-full max-w-6xl mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-10 items-center">
            <div>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.6 }}
                className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-cyan-400/30 bg-black/40 backdrop-blur-md"
              >
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-xs font-mono text-cyan-300">Transformer Lab • community funded</span>
              </motion.div>

              <motion.h1
                initial={{ opacity: 0, y: 16 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.7, delay: 0.1 }}
                className="mt-4 text-3xl sm:text-4xl lg:text-5xl font-extrabold leading-tight"
              >
                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600">
                  Power the next Transformer experiments
                </span>
                <span className="mt-2 block text-gray-300 text-lg lg:text-xl font-normal">
                  Donations keep the GPUs spinning and the research open-source.
                </span>
              </motion.h1>

              <motion.div
                initial={{ opacity: 0, y: 18 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.7, delay: 0.2 }}
                className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4"
                id="donate-cta"
              >
                <DonationOptionCard
                  platform="PayPal"
                  href="https://paypal.com/paypalme/IRedDragonICY"
                  description="One-time or custom support. Fast and flexible to instantly back new experiments."
                  accent="cyan"
                  Icon={FaPaypal}
                />
                <DonationOptionCard
                  platform="Patreon"
                  href="https://patreon.com/c/ireddragonicy/membership"
                  description="Monthly membership to sustain compute, datasets, and longitudinal research."
                  accent="violet"
                  Icon={FaPatreon}
                />
                <DonationOptionCard
                  platform="Saweria"
                  href="https://saweria.co/IRedDragonICY"
                  description="Local supporters welcome! Help fuel experiments and open-source releases."
                  accent="amber"
                  Icon={SiKofi}
                />
              </motion.div>

              <motion.p
                initial={{ opacity: 0 }}
                animate={isInView ? { opacity: 1 } : {}}
                transition={{ delay: 0.4 }}
                className="mt-4 text-sm text-gray-400"
              >
                All contributors are acknowledged in release notes. Top patrons get early access to write-ups and demos.
              </motion.p>
            </div>

            {/* right visual */}
            <div className="relative">
              <div className="absolute -top-6 -left-6">
                <TransformerGlyph className="w-20 h-20 opacity-80" />
              </div>
              <AttentionMatrix tokens={tokens} />
              <div className="absolute -bottom-6 -right-6 rotate-6">
                <TransformerGlyph className="w-16 h-16 opacity-80" hue={300} />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Removed legacy impact cards (GPU hours / demos / notes) as requested */}

      {/* Dramatic reality section */}
      <section className="relative py-6 sm:py-10 lg:py-16">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-red-500/5 to-transparent" />
        <div className="relative w-full max-w-6xl mx-auto px-4">
          <div className="grid lg:grid-cols-[1.2fr_0.8fr] gap-10 items-stretch">
            <div className="relative p-6 rounded-2xl border border-rose-400/20 bg-gradient-to-br from-rose-500/5 to-orange-500/5 overflow-hidden">
              <div className="absolute -top-10 -right-10 opacity-40">
                <IoHardwareChipOutline className="w-28 h-28 text-rose-400" />
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-rose-400 to-orange-400">
                The truth about compute
              </h2>
              <p className="mt-3 text-gray-300 leading-relaxed">
                I currently <span className="text-rose-300 font-semibold">do not own a dedicated GPU server</span> such as an A100/H100/MI300. Heavy experiments
                rely on <span className="text-orange-300 font-semibold">rented GPU hosting</span> whose costs rise quickly. At the moment I work on a
                <span className="text-cyan-300 font-semibold"> laptop powered by RTX 4050 Mobile + Ryzen 7 7350HS</span> — clearly not enough to train
                <em> multimodal LLMs</em>, large diffusion models, or sustained research requiring hundreds of GPU hours.
              </p>
              <div className="mt-4 grid sm:grid-cols-3 gap-3 text-center text-xs">
                <div className="rounded-lg p-4 bg-rose-500/10 border border-rose-400/20">
                  <div className="font-bold text-rose-300">No private GPU</div>
                  <div className="text-gray-400">no A100/H100/MI300</div>
                </div>
                <div className="rounded-lg p-4 bg-amber-500/10 border border-amber-400/20">
                  <div className="font-bold text-amber-300">Rental costs</div>
                  <div className="text-gray-400">escalate quickly</div>
                </div>
                <div className="rounded-lg p-4 bg-cyan-500/10 border border-cyan-400/20">
                  <div className="font-bold text-cyan-300">Laptop-bound</div>
                  <div className="text-gray-400">RTX 4050 Mobile</div>
                </div>
              </div>
              <p className="mt-4 text-gray-300">
                Your support is the bridge to <span className="text-emerald-300 font-semibold">building a private GPU server</span>
                so experiments can be more controlled, efficient, and far more productive.
              </p>
            </div>

            <div className="relative p-6 rounded-2xl border border-cyan-400/20 bg-black/40 backdrop-blur-xl">
              <h3 className="text-xl font-bold text-cyan-300">What your support funds</h3>
              <ul className="mt-3 space-y-2 text-sm text-gray-300">
                <li className="flex gap-2"><span className="text-cyan-400">▸</span> GPU time for Transformer / Diffusion / Multimodal experiments.</li>
                <li className="flex gap-2"><span className="text-cyan-400">▸</span> Licensed datasets and robust evaluation.</li>
                <li className="flex gap-2"><span className="text-cyan-400">▸</span> Open-source demos and technical notes.</li>
                <li className="flex gap-2"><span className="text-cyan-400">▸</span> Building a private GPU server for long-term research.</li>
              </ul>
              <a href="#donate-cta" className="inline-block mt-5 px-5 py-2 rounded-lg border border-cyan-400/30 text-cyan-300 hover:text-white bg-gradient-to-br from-cyan-500/10 to-blue-500/10">Donate now</a>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ / pledge */}
      <section className="relative py-10 sm:py-14 lg:py-20">
        <div className="relative w-full max-w-5xl mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-10 items-start">
            <div>
              <h2 className="text-2xl sm:text-3xl font-extrabold">
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-600">Why donate?</span>
              </h2>
              <ul className="mt-4 space-y-3 text-gray-300 text-sm leading-relaxed">
                <li className="flex gap-2"><span className="text-cyan-400">•</span> Accelerate experiments in Transformers, Diffusion, and Multimodal models.</li>
                <li className="flex gap-2"><span className="text-cyan-400">•</span> Fund compute (GPU hours), datasets, and evaluation runs.</li>
                <li className="flex gap-2"><span className="text-cyan-400">•</span> Support open releases: code, demos, and technical notes.</li>
                <li className="flex gap-2"><span className="text-cyan-400">•</span> Keep the research independent and community-first.</li>
              </ul>
              <a href="#donate-cta" className="inline-block mt-6 px-5 py-3 rounded-lg border border-cyan-400/30 bg-gradient-to-br from-cyan-500/10 to-blue-500/10 text-cyan-300 hover:text-white">Go to donate options</a>
            </div>

            <div className="relative">
              <div className="absolute -top-6 -right-6">
                <TransformerGlyph className="w-14 h-14 opacity-80" hue={260} />
              </div>
              <div className="p-6 rounded-xl border border-cyan-400/20 bg-black/40 backdrop-blur-xl">
                <h3 className="text-lg font-bold text-cyan-300">Pledge</h3>
                <p className="mt-2 text-sm text-gray-300">
                  Every contribution is used responsibly for research and community resources. Transparency updates are posted regularly.
                </p>
                <div className="mt-4 grid grid-cols-3 gap-2 text-center text-xs">
                  <div className="rounded-lg p-3 bg-cyan-500/10 border border-cyan-400/20">
                    <div className="font-extrabold text-cyan-300">Compute</div>
                    <div className="text-gray-400">GPUs & storage</div>
                  </div>
                  <div className="rounded-lg p-3 bg-violet-500/10 border border-violet-400/20">
                    <div className="font-extrabold text-violet-300">Data</div>
                    <div className="text-gray-400">datasets</div>
                  </div>
                  <div className="rounded-lg p-3 bg-emerald-500/10 border border-emerald-400/20">
                    <div className="font-extrabold text-emerald-300">Open</div>
                    <div className="text-gray-400">demos & notes</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Flow illustration section */}
      <DonationImpactFlow />

      <footer className="relative w-full py-8 border-t border-cyan-400/10">
        <div className="absolute inset-0 bg-gradient-to-t from-cyan-500/5 to-transparent" />
        <div className="relative text-center">
          <p className="text-sm text-gray-500 font-mono">Thank you for supporting open AI research.</p>
        </div>
      </footer>
    </div>
  );
}


