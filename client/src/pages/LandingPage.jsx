import React, { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import './LandingPage.css';

const LandingPage = () => {
  const observerRef = useRef(null);

  useEffect(() => {
    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('revealed');
          }
        });
      },
      { threshold: 0.15 }
    );

    document.querySelectorAll('.reveal-on-scroll').forEach((el) => {
      observerRef.current.observe(el);
    });

    return () => observerRef.current?.disconnect();
  }, []);

  return (
    <div className="landing-container">
      {/* ─── Hero ─── */}
      <section className="hero" id="hero">
        <div className="hero-grid">
          <div className="hero-text">
            <h1 className="hero-title">
              Sync your goals.<br />
              Beat procrastination, <span className="hero-highlight">together.</span>
            </h1>
            <p className="hero-subtitle">
              PrepSync pairs personal goal tracking with group accountability —
              streaks, shared resources, and analytics that keep your study group moving.
            </p>
            <div className="hero-cta">
              <Link to="/signup" className="cta-btn cta-primary" id="hero-signup">
                Get Started — It's Free
              </Link>
              <Link to="/login" className="cta-btn cta-outline" id="hero-login">
                Sign In
              </Link>
            </div>
            <div className="hero-stats-row">
              <div className="hero-stat">
                <span className="hero-stat-num">500+</span>
                <span className="hero-stat-label">Goals Tracked</span>
              </div>
              <div className="hero-stat-divider" />
              <div className="hero-stat">
                <span className="hero-stat-num">50+</span>
                <span className="hero-stat-label">Study Groups</span>
              </div>
              <div className="hero-stat-divider" />
              <div className="hero-stat">
                <span className="hero-stat-num">98%</span>
                <span className="hero-stat-label">Uptime</span>
              </div>
            </div>
          </div>

          <div className="hero-visual">
            <div className="hero-img-wrapper">
              <img
                src="/dashboard-preview.png"
                alt="PrepSync Dashboard Preview"
                className="hero-img"
                loading="eager"
              />
              <div className="hero-img-glow" />
            </div>
          </div>
        </div>
      </section>

      {/* ─── Features ─── */}
      <section className="features" id="features">
        <div className="section-inner">
          <p className="section-eyebrow reveal-on-scroll">Features</p>
          <h2 className="section-heading reveal-on-scroll">
            Everything you need to stay on track
          </h2>

          <div className="features-grid">
            {FEATURES.map((f, i) => (
              <div
                className="feature-card reveal-on-scroll"
                key={i}
                style={{ transitionDelay: `${i * 0.08}s` }}
              >
                <div className="feature-icon-wrap" style={{ background: f.bg }}>
                  {f.icon}
                </div>
                <h3 className="feature-title">{f.title}</h3>
                <p className="feature-desc">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── How it Works ─── */}
      <section className="how-it-works" id="how-it-works">
        <div className="section-inner">
          <div className="hiw-layout reveal-on-scroll">
            <div className="hiw-left">
              <p className="section-eyebrow">How It Works</p>
              <h2 className="hiw-heading">
                Procrastination thrives in isolation.
              </h2>
              <p className="hiw-sub">
                Traditional to-do apps are lonely. Group platforms are noisy.
                PrepSync is the quiet middle.
              </p>
            </div>

            <div className="hiw-right">
              {STEPS.map((s, i) => (
                <div className="hiw-step" key={i}>
                  <span className="hiw-step-num">{String(i + 1).padStart(2, '0')}</span>
                  <div className="hiw-step-content">
                    <h3 className="hiw-step-title">{s.title}</h3>
                    <p className="hiw-step-desc">{s.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ─── Problem / Solution ─── */}
      <section className="ps-section" id="why-prepsync">
        <div className="section-inner">
          <div className="ps-grid reveal-on-scroll">
            <div className="ps-card ps-problem">
              <div className="ps-label">The Problem</div>
              <h3>Procrastination thrives in isolation</h3>
              <p>
                You set goals, but without accountability they fade. Study groups
                lose momentum. Deadlines pass silently. Traditional to-do apps
                are isolated. Group platforms are messy.
              </p>
            </div>
            <div className="ps-card ps-solution">
              <div className="ps-label">The Solution</div>
              <h3>PrepSync bridges the gap</h3>
              <p>
                Track personal goals while staying connected to your study group.
                See what others are achieving. Get nudged when deadlines
                approach. Celebrate wins together.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Coming Soon ─── */}
      <section className="roadmap" id="roadmap">
        <div className="section-inner">
          <p className="section-eyebrow reveal-on-scroll">Roadmap</p>
          <h2 className="section-heading reveal-on-scroll">
            What's coming next
          </h2>

          <div className="roadmap-grid">
            {ROADMAP.map((r, i) => (
              <div className="roadmap-item reveal-on-scroll" key={i} style={{ transitionDelay: `${i * 0.08}s` }}>
                <span className="roadmap-icon">{r.icon}</span>
                <span className="roadmap-text">{r.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Final CTA ─── */}
      <section className="final-cta" id="cta">
        <div className="section-inner reveal-on-scroll">
          <h2 className="final-cta-heading">
            Ready to stop procrastinating?
          </h2>
          <p className="final-cta-sub">
            Join PrepSync and start achieving your goals with your peers today.
          </p>
          <Link to="/signup" className="cta-btn cta-primary cta-lg" id="footer-signup">
            Create Free Account
          </Link>
        </div>
      </section>

      {/* ─── Footer ─── */}
      <footer className="landing-footer">
        <div className="footer-inner">
          <span className="footer-brand">PrepSync</span>
          <span className="footer-copy">© {new Date().getFullYear()} PrepSync. All rights reserved.</span>
        </div>
      </footer>
    </div>
  );
};

/* ─── Data ─── */

const FEATURES = [
  {
    icon: (
      <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18"/><path d="M9 21V9"/></svg>
    ),
    title: 'Smart Dashboard',
    desc: 'Track progress with visual insights — streaks, charts, and a consistency heatmap.',
    bg: 'rgba(99,102,241,0.1)',
  },
  {
    icon: (
      <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><path d="m9 12 2 2 4-4"/></svg>
    ),
    title: 'Goal Management',
    desc: 'Create, organise, and track personal goals. Break ambitions into actionable tasks.',
    bg: 'rgba(16,185,129,0.1)',
  },
  {
    icon: (
      <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
    ),
    title: 'Group Accountability',
    desc: 'Form study groups, share resources, and track collective progress together.',
    bg: 'rgba(37,99,235,0.1)',
  },
  {
    icon: (
      <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>
    ),
    title: 'Shared Resources',
    desc: 'Upload study materials and build a collaborative knowledge base with Cloudinary.',
    bg: 'rgba(245,158,11,0.1)',
  },
  {
    icon: (
      <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
    ),
    title: 'Secure & Private',
    desc: 'JWT-based auth, encrypted data, and fine-grained access control keep you safe.',
    bg: 'rgba(239,68,68,0.1)',
  },
  {
    icon: (
      <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>
    ),
    title: 'Analytics & Streaks',
    desc: 'Weekly bar charts, pie breakdowns, and a year-long heatmap to keep you consistent.',
    bg: 'rgba(139,92,246,0.1)',
  },
];

const STEPS = [
  {
    title: 'Set your goals',
    desc: "Define what you're chasing this week. Daily checkpoints keep things moving.",
  },
  {
    title: 'Join a prep group',
    desc: 'Bring your peers in. Visibility creates the accountability that to-do apps lack.',
  },
  {
    title: 'Track and reflect',
    desc: 'Watch streaks build. Weekly analytics show exactly where your time goes.',
  },
];

const ROADMAP = [
  { icon: '🔔', label: 'Real-time Notifications' },
  { icon: '🏆', label: 'Leaderboards & Gamification' },
  { icon: '⏱️', label: 'Pomodoro Timer' },
  { icon: '📧', label: 'Smart Reminders' },
];

export default LandingPage;
