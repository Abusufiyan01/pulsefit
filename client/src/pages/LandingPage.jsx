import React, { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Zap,
  Dumbbell,
  Apple,
  TrendingUp,
  Trophy,
  Award,
  Sparkles,
  ChevronDown,
  Sun,
  Moon,
  Menu,
  X,
  Star,
  ArrowRight,
  Play,
  Flame,
} from 'lucide-react'
import { useThemeStore } from '../store/themeStore'

// Animated counter hook
function useCountUp(end, duration = 2000, start = false) {
  const [count, setCount] = useState(0)
  useEffect(() => {
    if (!start) return
    let startTime = null
    let animationFrameId
    const step = (timestamp) => {
      if (!startTime) startTime = timestamp
      const progress = Math.min((timestamp - startTime) / duration, 1)
      setCount(Math.floor(progress * end))
      if (progress < 1) {
        animationFrameId = requestAnimationFrame(step)
      }
    }
    animationFrameId = requestAnimationFrame(step)
    return () => {
      if (animationFrameId) cancelAnimationFrame(animationFrameId)
    }
  }, [end, duration, start])
  return count
}

// Navbar component
function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const { theme, toggleTheme } = useThemeStore()

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handler)
    return () => window.removeEventListener('scroll', handler)
  }, [])

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? 'py-3 backdrop-blur-xl shadow-lg' : 'py-5'
      }`}
      style={
        scrolled
          ? {
              background: 'var(--color-bg-card)',
              borderBottom: '1px solid var(--color-border)',
              opacity: 0.97,
            }
          : {}
      }
    >
      <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-xl bg-gradient-primary flex items-center justify-center shadow-glow">
            <Zap className="w-5 h-5 text-white" fill="white" />
          </div>
          <span className="font-display font-black text-xl gradient-text">PulseFit</span>
        </div>

        <nav className="hidden md:flex items-center gap-8">
          {['Features', 'How It Works', 'Testimonials', 'FAQ'].map((item) => (
            <a
              key={item}
              href={`#${item.toLowerCase().replace(/\s+/g, '-')}`}
              className="text-sm font-semibold text-muted hover:text-current transition-colors cursor-pointer"
            >
              {item}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <button
            onClick={toggleTheme}
            className="p-2 rounded-xl hover:bg-white/10 transition-all cursor-pointer text-muted"
            aria-label="Toggle theme"
          >
            {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>
          <Link to="/login" className="hidden sm:inline-flex btn-secondary btn-sm">
            Log in
          </Link>
          <Link to="/register" className="btn-primary btn-sm">
            Get Started Free
          </Link>
          <button
            className="md:hidden p-2 rounded-xl hover:bg-white/10 cursor-pointer"
            onClick={() => setMobileOpen(true)}
            aria-label="Open mobile menu"
          >
            <Menu className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 z-40"
              onClick={() => setMobileOpen(false)}
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className="fixed top-0 right-0 h-full w-72 p-6 flex flex-col z-50 shadow-2xl"
              style={{ background: 'var(--color-bg-card)' }}
            >
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-gradient-primary flex items-center justify-center">
                    <Zap className="w-4 h-4 text-white" fill="white" />
                  </div>
                  <span className="font-display font-bold text-lg gradient-text">PulseFit</span>
                </div>
                <button
                  onClick={() => setMobileOpen(false)}
                  className="p-2 rounded-xl hover:bg-white/10 cursor-pointer text-muted"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <nav className="flex flex-col gap-4">
                {['Features', 'How It Works', 'Testimonials', 'FAQ'].map((item) => (
                  <a
                    key={item}
                    href={`#${item.toLowerCase().replace(/\s+/g, '-')}`}
                    onClick={() => setMobileOpen(false)}
                    className="text-base font-semibold hover:text-primary-500 transition-colors cursor-pointer py-1"
                  >
                    {item}
                  </a>
                ))}
              </nav>

              <div className="mt-auto space-y-3 pt-6 border-t" style={{ borderColor: 'var(--color-border)' }}>
                <Link
                  to="/login"
                  onClick={() => setMobileOpen(false)}
                  className="btn-secondary btn-lg w-full block text-center"
                >
                  Log in
                </Link>
                <Link
                  to="/register"
                  onClick={() => setMobileOpen(false)}
                  className="btn-primary btn-lg w-full block text-center"
                >
                  Get Started Free
                </Link>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </header>
  )
}

// FAQ Accordion item
function FaqItem({ q, a }) {
  const [open, setOpen] = useState(false)
  return (
    <div
      className="rounded-2xl overflow-hidden transition-all duration-200"
      style={{ border: '1px solid var(--color-border)', background: 'var(--color-bg-card)' }}
    >
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex items-center justify-between w-full px-6 py-5 text-left font-semibold cursor-pointer gap-4"
      >
        <span>{q}</span>
        <motion.div animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.2 }}>
          <ChevronDown className="w-5 h-5 text-muted flex-shrink-0" />
        </motion.div>
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden"
          >
            <p className="px-6 pb-5 text-muted text-sm leading-relaxed border-t pt-3" style={{ borderColor: 'var(--color-border)' }}>
              {a}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default function LandingPage() {
  const statsRef = useRef(null)
  const [statsVisible, setStatsVisible] = useState(false)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setStatsVisible(true)
        }
      },
      { threshold: 0.3 }
    )
    if (statsRef.current) observer.observe(statsRef.current)
    return () => observer.disconnect()
  }, [])

  const count1 = useCountUp(10000, 2000, statsVisible)
  const count2 = useCountUp(500, 1500, statsVisible)
  const count3 = useCountUp(120, 1000, statsVisible)

  const features = [
    {
      icon: Sparkles,
      title: 'AI Workout Generator',
      desc: 'Get personalized workout plans powered by Google Gemini AI, tailored to your goals, equipment and schedule.',
    },
    {
      icon: Apple,
      title: 'Smart Nutrition Tracking',
      desc: 'Log meals from 200+ foods including Indian favorites. Track macros, calories, and water intake effortlessly.',
    },
    {
      icon: TrendingUp,
      title: 'Body Progress Analytics',
      desc: 'Visualize your transformation with beautiful charts, body measurements, and progress photos.',
    },
    {
      icon: Trophy,
      title: 'Personal Records',
      desc: 'Automatic PR detection with celebration animations. Track your strength progress over time.',
    },
    {
      icon: Dumbbell,
      title: '120+ Exercise Library',
      desc: 'Complete exercise database with muscle groups, equipment, difficulty, instructions and form tips.',
    },
    {
      icon: Award,
      title: 'Achievements & Badges',
      desc: 'Stay motivated with 11+ achievement badges. Earn them for streaks, PRs, consistency and more.',
    },
  ]

  const steps = [
    {
      n: '01',
      title: 'Set Your Goals',
      desc: 'Tell us about your fitness goals, experience level, and available equipment in our quick 4-step onboarding.',
    },
    {
      n: '02',
      title: 'Track Every Session',
      desc: 'Log workouts with our powerful tracker. Set timer, track sets, detect PRs, and log nutrition daily.',
    },
    {
      n: '03',
      title: 'Watch Your Progress',
      desc: 'See your transformation through beautiful charts, heatmaps, and AI-powered weekly insights.',
    },
  ]

  const testimonials = [
    {
      name: 'Priya Sharma',
      role: 'Software Engineer, Mumbai',
      text: 'PulseFit completely transformed my relationship with fitness. The AI meal suggestions with Indian food options are incredibly helpful!',
      rating: 5,
    },
    {
      name: 'Rahul Verma',
      role: 'Fitness Enthusiast, Bangalore',
      text: 'The workout tracker is phenomenal. The rest timer and PR detection keep me focused and motivated every session.',
      rating: 5,
    },
    {
      name: 'Anjali Patel',
      role: 'Yoga Instructor, Delhi',
      text: 'Finally an app that tracks both strength training AND nutrition in one beautiful place. The dark mode is stunning.',
      rating: 5,
    },
  ]

  const faqs = [
    {
      q: 'Is PulseFit really free?',
      a: 'Yes! PulseFit is completely free to use. All features including AI workout plans, nutrition tracking, and progress analytics are available at no cost.',
    },
    {
      q: 'How does the AI workout generator work?',
      a: 'PulseFit uses Google Gemini AI (free tier) to generate personalized workout plans based on your profile, goals, equipment, and schedule. If the API is unavailable, our smart rule-based system ensures you always get a plan.',
    },
    {
      q: 'Does it work without internet?',
      a: 'PulseFit is a Progressive Web App (PWA) with offline support. Cached pages work offline, and you can install it on your phone like a native app.',
    },
    {
      q: 'Can I track Indian foods?',
      a: 'Absolutely! Our food database includes 50+ common Indian foods including roti, dal, paneer, biryani, dosa, idli, chicken curry, and many more with accurate nutritional data.',
    },
    {
      q: 'How is my data protected?',
      a: 'Your data is secured with JWT authentication, encrypted passwords using bcrypt, and httpOnly cookies that protect against XSS attacks. We never sell your data.',
    },
    {
      q: 'Can I export my data?',
      a: 'Yes! You can export all your workout history, nutrition logs, and body metrics as CSV or JSON from the Settings page.',
    },
  ]

  return (
    <div style={{ background: 'var(--color-bg)', color: 'var(--color-text)' }}>
      <Navbar />

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-28 pb-16">
        {/* Background gradient mesh */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div
            className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full blur-3xl opacity-20"
            style={{ background: '#FF5A1F' }}
          />
          <div
            className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full blur-3xl opacity-15"
            style={{ background: '#F0261B' }}
          />
        </div>

        <div className="relative max-w-7xl mx-auto px-6 text-center">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <div
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-6 text-sm font-semibold"
              style={{
                background: 'rgba(255,90,31,0.15)',
                color: '#FF5A1F',
                border: '1px solid rgba(255,90,31,0.3)',
              }}
            >
              <Sparkles className="w-4 h-4" />
              AI-Powered Fitness Tracking
            </div>

            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black font-display mb-6 leading-tight">
              Train Smarter. <span className="gradient-text">Live Better.</span>
            </h1>

            <p className="text-xl text-muted max-w-2xl mx-auto mb-10 leading-relaxed">
              The all-in-one fitness platform that tracks your workouts, nutrition, and progress with
              <strong className="text-primary-500 font-bold"> AI-powered insights</strong>. Including 50+ Indian foods.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
              <motion.div whileTap={{ scale: 0.97 }}>
                <Link
                  to="/register"
                  className="btn-primary btn-lg inline-flex items-center gap-2 px-8 py-4 text-base"
                >
                  Get Started Free <ArrowRight className="w-5 h-5" />
                </Link>
              </motion.div>
              <motion.div whileTap={{ scale: 0.97 }}>
                <Link
                  to="/login"
                  className="btn-secondary btn-lg inline-flex items-center gap-2 px-8 py-4 text-base"
                >
                  <Play className="w-5 h-5" /> Try Demo
                </Link>
              </motion.div>
            </div>

            {/* App preview mockup */}
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.6 }}
              className="relative max-w-2xl mx-auto"
            >
              <div
                className="rounded-2xl p-6 shadow-float text-left"
                style={{ background: 'var(--color-bg-card)', border: '1px solid var(--color-border)' }}
              >
                {/* Mock dashboard */}
                <div className="flex items-center justify-between mb-5">
                  <div>
                    <div className="text-xs text-muted font-medium">Good morning,</div>
                    <div className="font-bold font-display text-lg">Rahul 💪</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div
                      className="flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-bold"
                      style={{ background: 'rgba(255,90,31,0.15)', color: '#FF5A1F' }}
                    >
                      <Flame className="w-3.5 h-3.5" fill="currentColor" />
                      12 day streak
                    </div>
                  </div>
                </div>

                {/* Stats rings */}
                <div className="grid grid-cols-4 gap-3 mb-5">
                  {[
                    { label: 'Calories', pct: 72, val: '1,620', color: '#FF5A1F' },
                    { label: 'Protein', pct: 85, val: '136g', color: '#10B981' },
                    { label: 'Water', pct: 60, val: '6/10', color: '#3B82F6' },
                    { label: 'Workout', pct: 100, val: '1/1', color: '#8B5CF6' },
                  ].map((s) => (
                    <div
                      key={s.label}
                      className="flex flex-col items-center gap-1 p-2 rounded-xl"
                      style={{ background: 'var(--color-surface)' }}
                    >
                      <svg width="40" height="40" viewBox="0 0 40 40" className="-rotate-90">
                        <circle
                          cx="20"
                          cy="20"
                          r="15"
                          fill="none"
                          stroke="rgba(255,255,255,0.1)"
                          strokeWidth="4"
                        />
                        <circle
                          cx="20"
                          cy="20"
                          r="15"
                          fill="none"
                          stroke={s.color}
                          strokeWidth="4"
                          strokeDasharray={`${2 * Math.PI * 15}`}
                          strokeDashoffset={`${2 * Math.PI * 15 * (1 - s.pct / 100)}`}
                          strokeLinecap="round"
                        />
                      </svg>
                      <span className="text-xs font-bold" style={{ fontSize: 10 }}>
                        {s.val}
                      </span>
                      <span className="text-muted" style={{ fontSize: 9 }}>
                        {s.label}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Activity chart mock */}
                <div className="rounded-xl p-3" style={{ background: 'var(--color-surface)' }}>
                  <div className="text-xs font-semibold mb-2 text-muted">Weekly Activity</div>
                  <div className="flex items-end gap-2 h-16">
                    {[40, 65, 80, 55, 90, 100, 70].map((h, i) => (
                      <div
                        key={i}
                        className="flex-1 rounded-t-lg transition-all"
                        style={{
                          height: `${h}%`,
                          background:
                            i === 5
                              ? 'linear-gradient(135deg, #FF5A1F, #F0261B)'
                              : 'var(--color-border)',
                        }}
                      />
                    ))}
                  </div>
                  <div className="flex justify-between mt-1">
                    {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((d, i) => (
                      <span key={i} className="text-muted flex-1 text-center" style={{ fontSize: 9 }}>
                        {d}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Stats Strip */}
      <section
        ref={statsRef}
        className="py-16 border-y"
        style={{ borderColor: 'var(--color-border)', background: 'var(--color-bg-card)' }}
      >
        <div className="max-w-5xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {[
              { value: `${count1.toLocaleString()}+`, label: 'Workouts Logged' },
              { value: `${count2}+`, label: 'Active Users' },
              { value: `${count3}+`, label: 'Exercises' },
              { value: 'Free', label: 'Forever. No credit card.' },
            ].map((s) => (
              <div key={s.label}>
                <div className="text-3xl font-black font-display gradient-text">{s.value}</div>
                <div className="text-sm text-muted mt-1">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="py-24 max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <div
            className="inline-block px-4 py-1.5 rounded-full text-sm font-semibold mb-4"
            style={{ background: 'rgba(255,90,31,0.1)', color: '#FF5A1F' }}
          >
            Everything You Need
          </div>
          <h2 className="text-4xl font-black font-display mb-4">Built for Serious Athletes</h2>
          <p className="text-muted text-lg max-w-2xl mx-auto">
            Every feature you need to track your fitness journey, powered by AI, designed beautifully.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map(({ icon: Icon, title, desc }, i) => (
            <motion.div
              key={title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              whileHover={{ scale: 1.02 }}
              className="p-6 rounded-2xl cursor-default"
              style={{ background: 'var(--color-bg-card)', border: '1px solid var(--color-border)' }}
            >
              <div className="w-12 h-12 rounded-xl bg-gradient-primary flex items-center justify-center mb-4 shadow-glow">
                <Icon className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-lg font-bold mb-2">{title}</h3>
              <p className="text-muted text-sm leading-relaxed">{desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-24" style={{ background: 'var(--color-bg-card)' }}>
        <div className="max-w-5xl mx-auto px-6">
          <div className="text-center mb-16">
            <div
              className="inline-block px-4 py-1.5 rounded-full text-sm font-semibold mb-4"
              style={{ background: 'rgba(255,90,31,0.1)', color: '#FF5A1F' }}
            >
              Simple to Start
            </div>
            <h2 className="text-4xl font-black font-display">3 Steps to Your Best Self</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-8 relative">
            <div
              className="hidden md:block absolute top-10 left-1/4 right-1/4 h-0.5"
              style={{ background: 'linear-gradient(90deg, #FF5A1F, #F0261B)' }}
            />
            {steps.map(({ n, title, desc }, i) => (
              <motion.div
                key={n}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15 }}
                className="relative text-center"
              >
                <div className="w-20 h-20 rounded-2xl bg-gradient-primary flex items-center justify-center mx-auto mb-6 shadow-glow">
                  <span className="text-2xl font-black text-white">{n}</span>
                </div>
                <h3 className="text-xl font-bold mb-3">{title}</h3>
                <p className="text-muted leading-relaxed">{desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="py-24 max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <div
            className="inline-block px-4 py-1.5 rounded-full text-sm font-semibold mb-4"
            style={{ background: 'rgba(255,90,31,0.1)', color: '#FF5A1F' }}
          >
            Loved by Users
          </div>
          <h2 className="text-4xl font-black font-display">What Our Community Says</h2>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          {testimonials.map(({ name, role, text, rating }, i) => (
            <motion.div
              key={name}
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="p-6 rounded-2xl"
              style={{ background: 'var(--color-bg-card)', border: '1px solid var(--color-border)' }}
            >
              <div className="flex gap-1 mb-4">
                {Array.from({ length: rating }).map((_, rIdx) => (
                  <Star key={rIdx} className="w-4 h-4 text-amber-400" fill="#F59E0B" />
                ))}
              </div>
              <p className="text-sm leading-relaxed mb-5 text-muted">"{text}"</p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-primary flex items-center justify-center text-white font-bold text-sm">
                  {name[0]}
                </div>
                <div>
                  <div className="font-semibold text-sm">{name}</div>
                  <div className="text-xs text-muted">{role}</div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="py-24" style={{ background: 'var(--color-bg-card)' }}>
        <div className="max-w-3xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-black font-display mb-4">Frequently Asked Questions</h2>
            <p className="text-muted">Everything you need to know about PulseFit.</p>
          </div>
          <div className="space-y-3">
            {faqs.map((f) => (
              <FaqItem key={f.q} {...f} />
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-24 max-w-4xl mx-auto px-6 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="rounded-3xl p-12 relative overflow-hidden"
          style={{ background: 'linear-gradient(135deg, #FF5A1F 0%, #F0261B 100%)' }}
        >
          <div
            className="absolute inset-0 opacity-20"
            style={{
              backgroundImage:
                'radial-gradient(circle at 20% 20%, white 1px, transparent 1px), radial-gradient(circle at 80% 80%, white 1px, transparent 1px)',
              backgroundSize: '40px 40px',
            }}
          />
          <div className="relative">
            <h2 className="text-4xl font-black font-display text-white mb-4">Ready to Transform?</h2>
            <p className="text-white/80 text-lg mb-8 max-w-xl mx-auto">
              Join thousands of fitness enthusiasts who are already training smarter with PulseFit.
            </p>
            <Link
              to="/register"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-white text-primary-500 font-bold text-lg hover:shadow-float transition-all hover:scale-105 active:scale-95"
            >
              Start Free Today <ArrowRight className="w-5 h-5" />
            </Link>
            <p className="text-white/60 text-sm mt-4">No credit card required. Free forever.</p>
          </div>
        </motion.div>
      </section>

      {/* Footer */}
      <footer
        className="border-t py-12 px-6"
        style={{ borderColor: 'var(--color-border)', background: 'var(--color-bg-card)' }}
      >
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div className="md:col-span-2">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-9 h-9 rounded-xl bg-gradient-primary flex items-center justify-center">
                  <Zap className="w-5 h-5 text-white" fill="white" />
                </div>
                <span className="font-display font-black text-xl gradient-text">PulseFit</span>
              </div>
              <p className="text-muted text-sm max-w-xs">
                Your AI-powered fitness companion. Train smarter, live better.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-sm text-muted">
                <li>
                  <a href="#features" className="hover:text-primary-500 transition-colors">
                    Features
                  </a>
                </li>
                <li>
                  <a href="#how-it-works" className="hover:text-primary-500 transition-colors">
                    How It Works
                  </a>
                </li>
                <li>
                  <Link to="/register" className="hover:text-primary-500 transition-colors">
                    Get Started
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Account</h4>
              <ul className="space-y-2 text-sm text-muted">
                <li>
                  <Link to="/login" className="hover:text-primary-500 transition-colors">
                    Login
                  </Link>
                </li>
                <li>
                  <Link to="/register" className="hover:text-primary-500 transition-colors">
                    Register
                  </Link>
                </li>
                <li>
                  <Link to="/forgot-password" className="hover:text-primary-500 transition-colors">
                    Reset Password
                  </Link>
                </li>
              </ul>
            </div>
          </div>
          <div
            className="pt-6 border-t text-sm text-muted text-center"
            style={{ borderColor: 'var(--color-border)' }}
          >
            © 2026 PulseFit. Built with ❤️ for fitness enthusiasts everywhere.
          </div>
        </div>
      </footer>
    </div>
  )
}
