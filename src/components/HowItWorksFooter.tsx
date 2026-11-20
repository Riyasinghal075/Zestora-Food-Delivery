import { useState } from 'react';
import { Check, Copy, X } from 'lucide-react';
import { motion, useReducedMotion } from 'motion/react';

const STEPS = [
  {
    number: '01. Browse Local Kitchens',
    title: 'Pick your favorite meal in seconds',
    description:
      'Filter by cuisine, pure-veg kitchens, delivery speed, or search directly for a dish you are craving.',
  },
  {
    number: '02. Customize & Check Out',
    title: 'Portions, offers, and zero guesswork',
    description:
      'Choose serving sizes, apply promo codes like WELCOME20, and see exact itemized totals before you pay.',
  },
  {
    number: '03. Follow Live Delivery',
    title: 'Track from kitchen stove to your doorstep',
    description:
      'Watch every stage from confirmation to rider handoff with clear arrival estimates and one-click reordering.',
  },
];

const GITHUB_COMMANDS = `git init
git add .
git commit -m "Initial commit: Zestora online food ordering system"
git branch -M main
git remote add origin https://github.com/Riyasinghal075/Zestora-Food-Ordering.git
git push -u origin main`;

const DOCKER_COMMANDS = `docker compose up --build -d
curl http://localhost:3000/api/health`;

export function HowItWorksFooter() {
  const prefersReduced = useReducedMotion();
  const [showSetupModal, setShowSetupModal] = useState(false);
  const [copiedBlock, setCopiedBlock] = useState<'git' | 'docker' | null>(null);

  const handleCopy = async (text: string, block: 'git' | 'docker') => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedBlock(block);
      setTimeout(() => setCopiedBlock(null), 2000);
    } catch {
      // Clipboard API fallback ignored cleanly
    }
  };

  return (
    <>
      <section id="how-it-works" className="py-12 lg:py-16 bg-[#FAFAFA]">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6">
          <div className="max-w-xl mb-10">
            <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500 mb-1">
              Simple Ordering Flow
            </p>
            <h2
              className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-zinc-900"
              style={{ textWrap: 'balance' }}
            >
              From craving to dinner table in three effortless steps
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
            {STEPS.map((step, index) => (
              <motion.div
                key={step.number}
                initial={prefersReduced ? false : { opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-40px' }}
                transition={{
                  duration: 0.35,
                  delay: index * 0.06,
                  ease: [0.16, 1, 0.3, 1],
                }}
                className="bg-white border border-zinc-200/90 rounded-2xl p-6"
              >
                <p className="text-xs font-semibold text-[#D9381E] mb-2">
                  {step.number}
                </p>
                <h3 className="font-display text-lg font-bold text-zinc-900 mb-2">
                  {step.title}
                </h3>
                <p className="text-sm text-zinc-600 leading-relaxed">
                  {step.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Quiet Footer */}
      <footer className="bg-white border-t border-zinc-200 py-8">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-sm text-zinc-500">
          <div className="flex items-center gap-3">
            <span className="font-display text-base font-extrabold text-zinc-900">
              Zestora
            </span>
            <span aria-hidden="true">·</span>
            <span className="text-xs">
              Fresh neighborhood kitchens, delivered fast.
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-5 text-xs font-medium">
            <a href="#explore" className="hover:text-zinc-900 transition-colors">
              Explore
            </a>
            <a href="#cuisines" className="hover:text-zinc-900 transition-colors">
              Cuisines
            </a>
            <a href="#track" className="hover:text-zinc-900 transition-colors">
              Track Order
            </a>
            <button
              type="button"
              onClick={() => setShowSetupModal(true)}
              className="text-zinc-600 hover:text-[#D9381E] transition-colors cursor-pointer"
            >
              GitHub & Docker Guide
            </button>
          </div>
        </div>
      </footer>

      {/* Optional Project & GitHub Deployment Guide Modal */}
      {showSetupModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-[2px] p-4"
          onClick={() => setShowSetupModal(false)}
          role="dialog"
          aria-modal="true"
          aria-label="GitHub and Docker Setup Guide"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white w-full max-w-xl rounded-2xl border border-zinc-200 shadow-2xl overflow-hidden"
          >
            <div className="px-6 py-4 border-b border-zinc-200 flex items-center justify-between">
              <div>
                <h3 className="font-display text-lg font-bold text-zinc-900">
                  GitHub & DevOps Setup Guide
                </h3>
                <p className="text-xs text-zinc-500 mt-0.5">
                  Includes Dockerfile, docker-compose.yml, and GitHub Actions CI/CD
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowSetupModal(false)}
                aria-label="Close guide"
                className="w-8 h-8 rounded-lg flex items-center justify-center text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 space-y-5 text-sm text-zinc-700">
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="font-semibold text-zinc-900 text-xs">
                    1. Push this project to GitHub
                  </span>
                  <button
                    type="button"
                    onClick={() => handleCopy(GITHUB_COMMANDS, 'git')}
                    className="inline-flex items-center gap-1 text-xs font-medium text-[#D9381E] hover:underline cursor-pointer"
                  >
                    {copiedBlock === 'git' ? (
                      <>
                        <Check className="w-3.5 h-3.5" />
                        Copied
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        Copy
                      </>
                    )}
                  </button>
                </div>
                <pre className="p-3.5 rounded-xl bg-zinc-900 text-zinc-100 text-xs font-mono overflow-x-auto leading-relaxed">
                  {GITHUB_COMMANDS}
                </pre>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="font-semibold text-zinc-900 text-xs">
                    2. Run containerized with Docker Compose
                  </span>
                  <button
                    type="button"
                    onClick={() => handleCopy(DOCKER_COMMANDS, 'docker')}
                    className="inline-flex items-center gap-1 text-xs font-medium text-[#D9381E] hover:underline cursor-pointer"
                  >
                    {copiedBlock === 'docker' ? (
                      <>
                        <Check className="w-3.5 h-3.5" />
                        Copied
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        Copy
                      </>
                    )}
                  </button>
                </div>
                <pre className="p-3.5 rounded-xl bg-zinc-900 text-zinc-100 text-xs font-mono overflow-x-auto leading-relaxed">
                  {DOCKER_COMMANDS}
                </pre>
              </div>

              <p className="text-xs text-zinc-500 leading-relaxed">
                Every push to <span className="font-mono text-zinc-800">main</span>{' '}
                automatically triggers the CI/CD pipeline in{' '}
                <span className="font-mono text-zinc-800">
                  .github/workflows/ci-cd.yml
                </span>{' '}
                to verify TypeScript, build the production bundle, test{' '}
                <span className="font-mono text-zinc-800">/api/health</span>, and
                build the Docker image.
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
