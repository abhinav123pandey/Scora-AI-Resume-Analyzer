/**
 * ============================================
 * LANDING PAGE - AI Resume Analyzer
 * THEME: Black & Blue (Modern AI Platform)
 * ============================================
 * 
 * COLOR SCHEME:
 * - Background: Slate-900 to Blue-900 (Deep navy blue)
 * - Primary: Blue-500, Cyan-400, Indigo-500
 * - Accent: Electric Blue (#3B82F6)
 * - Glass Effect: Blue-900/20 with backdrop blur
 * 
 * UI ENHANCEMENTS USED (For Interview):
 * - Glassmorphism: backdrop-blur-xl with blue-tinted transparency
 * - Gradient text: Blue to Cyan for headings
 * - Black-blue theme: Professional, modern AI aesthetic
 * - Subtle floating animations (reduced intensity)
 * - Grid pattern background with dots
 * - Scroll-triggered counter animation
 * - Hover scale transitions on cards
 * - Static gradient orbs (no blinking)
 * 
 * BACKEND INTEGRATION POINTS:
 * ============================================
 * 
 * 1. GET /api/stats
 *    - Response: { accuracyRate, totalResumesAnalyzed, interviewIncreaseRate }
 *    - Location: fetchStats() function
 * 
 * 2. POST /api/newsletter/subscribe
 *    - Request: { email }
 *    - Location: handleNewsletterSubmit()
 * 
 * 3. GET /api/testimonials
 *    - Response: Array of testimonials
 *    - Location: fetchTestimonials()
 */

import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { 
  TrendingUp, 
  Target, 
  Sparkles, 
  AlertCircle, 
  ArrowRight,
  Zap,
  Shield,
  Users,
  Star,
  FileCheck,
  Rocket,
  Mail,
  Send,
  Upload,
  FileText,
  Loader2,
  Briefcase,
  Brain,
  BarChart3,
  Clock
} from 'lucide-react';
import Button from '../components/ui/Button';

const LandingPage = () => {
  // ============================================
  // STATE MANAGEMENT
  // ============================================
  const [stats, setStats] = useState({
    accuracyRate: 0,
    totalResumesAnalyzed: 0,
    interviewIncreaseRate: 0,
    avgResponseTime: 0
  });
  const [isAnimating, setIsAnimating] = useState(true);
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [newsletterStatus, setNewsletterStatus] = useState(null);
  const [testimonials, setTestimonials] = useState([]);
  const [currentTestimonial, setCurrentTestimonial] = useState(0);
  const statsRef = useRef(null);

  // Mock data
  const mockStats = {
    accuracyRate: 98.5,
    totalResumesAnalyzed: 52481,
    interviewIncreaseRate: 34.7,
    avgResponseTime: 2.4
  };

  const mockTestimonials = [
    {
      id: 1,
      name: "Sarah Johnson",
      role: "Senior Frontend Developer",
      company: "Google",
      content: "This AI tool helped me optimize my resume and I got interviews at 5 top tech companies within 2 weeks!",
      rating: 5,
      image: "https://randomuser.me/api/portraits/women/1.jpg"
    },
    {
      id: 2,
      name: "Michael Chen",
      role: "Product Manager",
      company: "Microsoft",
      content: "The ATS score analysis was spot-on. My resume acceptance rate tripled after using this platform.",
      rating: 5,
      image: "https://randomuser.me/api/portraits/men/2.jpg"
    },
    {
      id: 3,
      name: "Priya Patel",
      role: "Data Scientist",
      company: "Amazon",
      content: "Best investment for my career. The skill gap detection helped me identify exactly what to learn next.",
      rating: 5,
      image: "https://randomuser.me/api/portraits/women/3.jpg"
    }
  ];

  const features = [
    {
      icon: FileCheck,
      title: 'ATS Score Analysis',
      description: 'Get detailed ATS compatibility score with actionable optimization tips for each section.',
      color: 'from-violet-500 to-violet-400',
      stats: '85% users see improvement'
    },
    {
      icon: Target,
      title: 'Job Match Percentage',
      description: 'AI compares your resume with job description to show exact match percentage.',
      color: 'from-indigo-500 to-violet-500',
      stats: '92% matching accuracy'
    },
    {
      icon: Brain,
      title: 'AI Bullet Rewriter',
      description: 'Transform weak bullet points into powerful, achievement-focused statements.',
      color: 'from-violet-600 to-indigo-500',
      stats: '10,000+ rewrites done'
    },
    {
      icon: AlertCircle,
      title: 'Skill Gap Analysis',
      description: 'Identify missing skills and get personalized learning recommendations.',
      color: 'from-violet-500 to-blue-500',
      stats: '50+ skills tracked'
    },
    {
      icon: BarChart3,
      title: 'Industry Benchmark',
      description: 'Compare your resume against industry standards and top candidates.',
      color: 'from-violet-500 to-violet-400',
      stats: 'Real-time comparison'
    },
    {
      icon: Rocket,
      title: 'Instant Download',
      description: 'Export optimized resume in PDF, DOCX, or TXT with professional formatting.',
      color: 'from-violet-500 to-indigo-600',
      stats: 'Multiple formats'
    }
  ];

  // API Functions
  const fetchStats = async () => {
    try {
      // Replace with: const response = await api.get('/stats');
      setStats(mockStats);
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const fetchTestimonials = async () => {
    try {
      // Replace with: const response = await api.get('/testimonials');
      setTestimonials(mockTestimonials);
    } catch (error) {
      console.error('Error fetching testimonials:', error);
    }
  };

  const handleNewsletterSubmit = async (e) => {
    e.preventDefault();
    if (!newsletterEmail) return;
    
    setNewsletterStatus('loading');
    try {
      // Replace with: await api.post('/newsletter/subscribe', { email: newsletterEmail });
      setTimeout(() => {
        setNewsletterStatus('success');
        setNewsletterEmail('');
        setTimeout(() => setNewsletterStatus(null), 3000);
      }, 1000);
    } catch (error) {
      setNewsletterStatus('error');
      setTimeout(() => setNewsletterStatus(null), 3000);
    }
  };

  // Counter Animation
  useEffect(() => {
    fetchStats();
    fetchTestimonials();
    
    const interval = setInterval(() => {
      setCurrentTestimonial((prev) => (prev + 1) % testimonials.length);
    }, 5000);
    
    return () => clearInterval(interval);
  }, [testimonials.length]);

  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting && isAnimating) {
          animateNumbers();
          setIsAnimating(false);
        }
      });
    });
    
    if (statsRef.current) {
      observer.observe(statsRef.current);
    }
    
    return () => observer.disconnect();
  }, [stats]);

  const animateNumbers = () => {
    const targets = {
      accuracyRate: stats.accuracyRate,
      totalResumesAnalyzed: stats.totalResumesAnalyzed,
      interviewIncreaseRate: stats.interviewIncreaseRate
    };
    
    Object.keys(targets).forEach(key => {
      let start = 0;
      const end = targets[key];
      const duration = 2000;
      const increment = end / (duration / 16);
      
      const timer = setInterval(() => {
        start += increment;
        if (start >= end) {
          clearInterval(timer);
          start = end;
        }
        setStats(prev => ({ ...prev, [key]: Math.floor(start) }));
      }, 16);
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-violet-900/30 to-slate-900 relative overflow-x-hidden">
      
      {/* ============================================ */}
      {/* BACKGROUND - Black & Blue Theme (Static) */}
      {/* ============================================ */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        {/* Grid pattern overlay */}
        <div className="absolute inset-0 opacity-20" style={{
          backgroundImage: `linear-gradient(rgba(59, 130, 246, 0.1) 1px, transparent 1px),
                            linear-gradient(90deg, rgba(59, 130, 246, 0.1) 1px, transparent 1px)`,
          backgroundSize: '50px 50px',
        }} />
        
        {/* Static stars - no animation */}
        <div className="absolute inset-0">
          {[...Array(80)].map((_, i) => (
            <div
              key={i}
              className="absolute bg-blue-300 rounded-full"
              style={{
                width: Math.random() * 2 + 1 + 'px',
                height: Math.random() * 2 + 1 + 'px',
                top: Math.random() * 100 + '%',
                left: Math.random() * 100 + '%',
                opacity: Math.random() * 0.3 + 0.1,
              }}
            />
          ))}
        </div>
        
        {/* Static dots pattern */}
        <div className="absolute inset-0 opacity-20" style={{
          backgroundImage: 'radial-gradient(circle, rgba(59,130,246,0.15) 1px, transparent 1px)',
          backgroundSize: '40px 40px',
        }} />
        
        {/* Static gradient orbs - Blue theme, no blinking */}
        <div className="absolute top-20 -left-20 w-96 h-96 bg-blue-600 rounded-full mix-blend-multiply filter blur-3xl opacity-15" />
        <div className="absolute bottom-20 -right-20 w-96 h-96 bg-cyan-600 rounded-full mix-blend-multiply filter blur-3xl opacity-15" />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-indigo-600 rounded-full mix-blend-multiply filter blur-3xl opacity-10" />
      </div>

      {/* ============================================ */}
      {/* HERO SECTION */}
      {/* ============================================ */}
      <div className="relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16 lg:pt-24 lg:pb-20">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            
            {/* LEFT SIDE - Text Content */}
            <div className="space-y-8">
              {/* Badge */}
              <div className="inline-flex items-center gap-2 bg-violet-900/30 backdrop-blur-sm rounded-full px-4 py-2 border border-violet-500/30">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-violet-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-violet-500"></span>
                </span>
                <span className="text-violet-200 text-sm font-medium">Scora — AI Resume Intelligence</span>
                <Sparkles className="h-4 w-4 text-violet-400" />
              </div>
              
              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold">
                <span className="text-white">Optimize Your Resume with </span>
                <span className="bg-gradient-to-r from-violet-400 via-violet-300 to-indigo-400 bg-clip-text text-transparent">
                  AI Intelligence
                </span>
              </h1>
              
              <p className="text-xl text-blue-100/70 leading-relaxed">
                Get past ATS systems with our advanced AI analyzer. Match job descriptions perfectly and 
                land interviews at top companies like <span className="text-blue-300 font-semibold">Google, Microsoft, Amazon</span>.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <Link to="/upload">
                  <Button size="lg" className="px-8 bg-gradient-to-r from-violet-600 to-violet-500 hover:from-violet-700 hover:to-violet-600 transition-all duration-300 hover:scale-105 shadow-lg shadow-violet-500/30">
                    Start Analyzing Free
                    <Rocket className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
                <Link to="/dashboard">
                  <Button variant="outline" size="lg" className="border-violet-500/40 text-violet-200 hover:bg-violet-500/10 hover:border-violet-400">
                    View Demo
                  </Button>
                </Link>
              </div>
              
              <div className="flex items-center gap-6 pt-4">
                <div className="flex -space-x-2">
                  {[1, 2, 3, 4].map((i) => (
                    <img
                      key={i}
                      src={`https://randomuser.me/api/portraits/${i % 2 === 0 ? 'women' : 'men'}/${i}.jpg`}
                      className="w-8 h-8 rounded-full border-2 border-slate-900"
                      alt="User"
                    />
                  ))}
                </div>
                <div className="text-slate-400/80 text-sm">
                  <span className="text-white font-semibold">10,000+</span> professionals already improved
                </div>
              </div>
            </div>
            
            {/* RIGHT SIDE - Professional Preview Card */}
            <div className="relative">
              <div className="relative transform transition-all duration-500 hover:-translate-y-1">
                <div className="bg-gradient-to-br from-blue-900/40 to-slate-900/60 backdrop-blur-xl rounded-2xl border border-blue-500/30 p-6 shadow-2xl">
                  
                  {/* Header */}
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center shadow-lg">
                      <FileCheck className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-white font-semibold">Live Analysis Preview</h3>
                      <p className="text-slate-400/80 text-sm">AI Processing Complete</p>
                    </div>
                  </div>
                  
                  {/* Scores */}
                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="bg-blue-900/30 rounded-xl p-4 text-center border border-blue-500/20">
                      <div className="text-3xl font-bold text-cyan-400">85<span className="text-sm">/100</span></div>
                      <div className="text-slate-400/80 text-sm mt-1">ATS Score</div>
                      <div className="w-full bg-blue-900/50 rounded-full h-1.5 mt-2">
                        <div className="bg-gradient-to-r from-blue-400 to-cyan-400 h-1.5 rounded-full w-[85%]"></div>
                      </div>
                    </div>
                    <div className="bg-blue-900/30 rounded-xl p-4 text-center border border-blue-500/20">
                      <div className="text-3xl font-bold text-blue-400">92<span className="text-sm">%</span></div>
                      <div className="text-slate-400/80 text-sm mt-1">Job Match</div>
                      <div className="w-full bg-blue-900/50 rounded-full h-1.5 mt-2">
                        <div className="bg-gradient-to-r from-blue-400 to-cyan-400 h-1.5 rounded-full w-[92%]"></div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Keywords */}
                  <div className="mb-6">
                    <p className="text-white text-sm font-medium mb-2">Matched Keywords</p>
                    <div className="flex flex-wrap gap-2">
                      {['React', 'Node.js', 'TypeScript', 'AWS', 'MongoDB'].map(keyword => (
                        <span key={keyword} className="bg-blue-500/20 text-blue-300 px-2 py-1 rounded-lg text-xs border border-blue-500/30">
                          {keyword}
                        </span>
                      ))}
                    </div>
                  </div>
                  
                  {/* AI Suggestion */}
                  <div className="bg-gradient-to-r from-blue-500/20 to-cyan-500/20 rounded-xl p-3 border border-blue-500/30">
                    <div className="flex items-start gap-2">
                      <Sparkles className="h-4 w-4 text-cyan-400 mt-0.5" />
                      <div>
                        <p className="text-cyan-300 text-xs font-medium">AI Suggestion</p>
                        <p className="text-white/90 text-sm">Add quantifiable achievements to increase score by 15%</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ============================================ */}
      {/* STATS SECTION - Black Blue Theme */}
      {/* ============================================ */}
      <div ref={statsRef} className="relative z-10 py-16 border-y border-blue-500/20 bg-slate-900/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-violet-400 to-violet-300 bg-clip-text text-transparent">
                {stats.accuracyRate}%
              </div>
              <div className="text-slate-400/80 mt-2">Accuracy Rate</div>
              <div className="text-cyan-400 text-sm mt-1">↑ 12% this month</div>
            </div>
            <div className="text-center">
              <div className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">
                {stats.totalResumesAnalyzed.toLocaleString()}+
              </div>
              <div className="text-slate-400/80 mt-2">Resumes Analyzed</div>
              <div className="text-cyan-400 text-sm mt-1">↑ 5.2k this week</div>
            </div>
            <div className="text-center">
              <div className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
                {stats.interviewIncreaseRate}%
              </div>
              <div className="text-slate-400/80 mt-2">Interview Rate ↑</div>
              <div className="text-cyan-400 text-sm mt-1">Average increase</div>
            </div>
          </div>
        </div>
      </div>

      {/* ============================================ */}
      {/* FEATURES SECTION - Black Blue Cards */}
      {/* ============================================ */}
      <div className="relative z-10 py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
              Powerful{' '}
              <span className="bg-gradient-to-r from-violet-400 to-violet-300 bg-clip-text text-transparent">
                Features
              </span>
            </h2>
            <p className="text-xl text-slate-400/80 max-w-2xl mx-auto">
              Everything you need to optimize your resume and land your dream job
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <div
                key={index}
                className="group bg-blue-900/20 backdrop-blur-sm rounded-2xl p-6 border border-blue-500/20 hover:border-blue-500/40 transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl hover:shadow-blue-500/10"
              >
                <div className={`bg-gradient-to-r ${feature.color} w-12 h-12 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300 shadow-lg`}>
                  <feature.icon className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">{feature.title}</h3>
                <p className="text-slate-400/80 text-sm mb-4 leading-relaxed">{feature.description}</p>
                <div className="flex items-center justify-between pt-3 border-t border-blue-500/20">
                  <span className="text-xs text-blue-300/50">{feature.stats}</span>
                  <ArrowRight className="h-4 w-4 text-blue-400/50 group-hover:text-cyan-400 transition-colors" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ============================================ */}
      {/* UPLOAD CARD - Redesigned Black Blue */}
      {/* ============================================ */}
      <div className="relative z-10 py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gradient-to-r from-blue-600/10 via-cyan-600/10 to-blue-600/10 backdrop-blur-sm rounded-3xl p-8 md:p-10 border border-blue-500/30">
            <div className="text-center mb-6">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-2xl mb-4 shadow-lg shadow-violet-500/25">
                <Upload className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-2">Ready to Optimize Your Resume?</h3>
              <p className="text-slate-400/80">Upload your resume and get AI-powered analysis in seconds</p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/upload">
                <Button size="lg" className="bg-gradient-to-r from-violet-600 to-violet-500 hover:from-violet-700 hover:to-violet-600 px-8 shadow-lg shadow-violet-500/25">
                  <Upload className="mr-2 h-5 w-5" />
                  Upload Resume Now
                </Button>
              </Link>
              <Link to="/dashboard">
                <Button variant="outline" size="lg" className="border-blue-500/40 text-blue-200 hover:bg-blue-500/10">
                  <FileText className="mr-2 h-5 w-5" />
                  View Dashboard
                </Button>
              </Link>
            </div>
            
            <div className="flex items-center justify-center gap-4 mt-6 text-xs text-blue-300/50">
              <span className="flex items-center gap-1">✓ PDF</span>
              <span>•</span>
              <span className="flex items-center gap-1">✓ DOCX</span>
              <span>•</span>
              <span className="flex items-center gap-1">✓ TXT</span>
              <span>•</span>
              <span className="flex items-center gap-1">🔒 Secure</span>
            </div>
          </div>
        </div>
      </div>

      {/* ============================================ */}
      {/* TESTIMONIALS SECTION */}
      {/* ============================================ */}
      <div className="relative z-10 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-3">
              Trusted by <span className="text-violet-400">Job Seekers</span>
            </h2>
            <p className="text-slate-400/80">Join thousands of successful professionals</p>
          </div>
          
          {testimonials.length > 0 && (
            <div className="max-w-2xl mx-auto">
              <div className="bg-blue-900/20 backdrop-blur-sm rounded-2xl p-6 border border-blue-500/20">
                <div className="flex gap-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <p className="text-white leading-relaxed mb-4">
                  "{testimonials[currentTestimonial]?.content}"
                </p>
                <div className="flex items-center gap-3">
                  <img
                    src={testimonials[currentTestimonial]?.image}
                    alt=""
                    className="w-10 h-10 rounded-full object-cover border border-blue-500/30"
                  />
                  <div>
                    <h4 className="text-white font-semibold text-sm">{testimonials[currentTestimonial]?.name}</h4>
                    <p className="text-slate-400/80 text-xs">
                      {testimonials[currentTestimonial]?.role} at {testimonials[currentTestimonial]?.company}
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="flex justify-center gap-2 mt-4">
                {testimonials.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setCurrentTestimonial(idx)}
                    className={`h-1.5 rounded-full transition-all duration-300 ${
                      currentTestimonial === idx ? 'w-6 bg-violet-400' : 'w-1.5 bg-violet-500/30'
                    }`}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ============================================ */}
      {/* NEWSLETTER SECTION */}
      {/* ============================================ */}
      <div className="relative z-10 py-16">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h3 className="text-2xl font-bold text-white mb-2">Get Weekly Resume Tips</h3>
            <p className="text-slate-400/80 mb-6">Join 50,000+ job seekers getting AI insights</p>
            
            <form onSubmit={handleNewsletterSubmit} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
              <input
                type="email"
                value={newsletterEmail}
                onChange={(e) => setNewsletterEmail(e.target.value)}
                placeholder="Enter your email"
                className="flex-1 px-4 py-3 bg-blue-900/30 border border-blue-500/30 rounded-xl text-white placeholder-blue-300/40 focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400 transition-colors"
                required
              />
              <Button type="submit" className="bg-gradient-to-r from-violet-600 to-violet-500 hover:from-violet-700 hover:to-violet-600 whitespace-nowrap">
                {newsletterStatus === 'loading' ? (
                  <Loader2 className="animate-spin h-5 w-5" />
                ) : (
                  <>
                    Subscribe
                    <Send className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>
            </form>
            
            {newsletterStatus === 'success' && (
              <p className="text-green-400 text-sm mt-3">✓ Subscribed successfully!</p>
            )}
            {newsletterStatus === 'error' && (
              <p className="text-red-400 text-sm mt-3">✗ Something went wrong. Please try again.</p>
            )}
          </div>
        </div>
      </div>

      {/* ============================================ */}
      {/* FOOTER */}
      {/* ============================================ */}
      <div className="relative z-10 py-8 border-t border-blue-500/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap justify-center gap-8 text-sm text-blue-300/40">
            <div className="flex items-center gap-2">
              <Shield className="h-4 w-4" />
              <span>Secure & Private</span>
            </div>
            <div className="flex items-center gap-2">
              <Zap className="h-4 w-4" />
              <span>Real-time Analysis</span>
            </div>
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              <span>50K+ Users</span>
            </div>
          </div>
          <p className="text-center text-blue-300/30 text-xs mt-4">
            © 2025 Scora. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;