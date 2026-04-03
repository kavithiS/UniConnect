import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, Zap, MessageSquare, Award, TrendingUp, Sparkles, ArrowRight, Github, Linkedin, Mail } from 'lucide-react';

export default function LandingPage() {
  const navigate = useNavigate();
  const [scrollY, setScrollY] = React.useState(0);

  React.useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 overflow-hidden">
      {/* Animated background elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-indigo-600 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob" />
        <div className="absolute top-40 right-10 w-72 h-72 bg-cyan-600 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000" />
        <div className="absolute -bottom-8 left-20 w-72 h-72 bg-purple-600 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000" />
      </div>

      {/* Header/Navigation */}
      <header className="relative z-20 border-b border-slate-800 bg-slate-950/80 backdrop-blur-md sticky top-0">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-10 h-10 bg-gradient-to-br from-indigo-600 to-cyan-600 rounded-lg flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-bold bg-gradient-to-r from-indigo-400 to-cyan-400 bg-clip-text text-transparent">
              UniConnect
            </span>
          </div>
          <nav className="hidden md:flex items-center space-x-8">
            <a href="#features" className="text-slate-300 hover:text-indigo-400 transition">Features</a>
            <a href="#why" className="text-slate-300 hover:text-indigo-400 transition">Why Us</a>
            <a href="#testimonials" className="text-slate-300 hover:text-indigo-400 transition">Testimonials</a>
          </nav>
          <div className="flex items-center space-x-4">
            <button
              onClick={() => navigate('/login')}
              className="px-6 py-2 text-slate-300 border border-slate-700 rounded-lg hover:border-indigo-500 hover:text-indigo-400 transition"
            >
              Sign In
            </button>
            <button
              onClick={() => navigate('/register')}
              className="px-6 py-2 bg-gradient-to-r from-indigo-600 to-cyan-600 rounded-lg hover:from-indigo-500 hover:to-cyan-500 transition font-medium flex items-center space-x-2"
            >
              <span>Join Now</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-32">
        <div className="text-center" style={{ transform: `translateY(${scrollY * 0.3}px)` }}>
          <div className="mb-6">
            <span className="inline-block px-4 py-2 bg-slate-900 border border-indigo-500 rounded-full text-sm font-medium text-indigo-300 mb-6">
              🚀 The Future of Student Collaboration
            </span>
          </div>
          
          <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
            Find Your Perfect
            <br />
            <span className="bg-gradient-to-r from-indigo-400 via-cyan-400 to-purple-400 bg-clip-text text-transparent">
              Study Squad
            </span>
          </h1>

          <p className="text-xl text-slate-300 mb-8 max-w-2xl mx-auto leading-relaxed">
            Connect with like-minded students, build amazing projects together, and grow your skills. 
            UniConnect makes collaboration effortless.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <button
              onClick={() => navigate('/register')}
              className="px-8 py-4 bg-gradient-to-r from-indigo-600 to-cyan-600 rounded-lg hover:from-indigo-500 hover:to-cyan-500 transition font-semibold text-white flex items-center justify-center space-x-2 text-lg"
            >
              <Users className="w-5 h-5" />
              <span>Start for Free</span>
            </button>
            <button
              onClick={() => navigate('/login')}
              className="px-8 py-4 border-2 border-slate-700 rounded-lg hover:border-indigo-500 hover:bg-slate-900/50 transition font-semibold text-white flex items-center justify-center space-x-2 text-lg"
            >
              <span>Sign In</span>
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 max-w-2xl mx-auto text-center">
            <div>
              <div className="text-3xl font-bold text-indigo-400">2000+</div>
              <div className="text-sm text-slate-400">Active Students</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-cyan-400">500+</div>
              <div className="text-sm text-slate-400">Projects</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-purple-400">4.9★</div>
              <div className="text-sm text-slate-400">Rating</div>
            </div>
          </div>
        </div>

        {/* Hero Image Placeholder */}
        <div className="mt-16 mx-auto max-w-4xl">
          <div className="relative rounded-2xl overflow-hidden border border-slate-800 bg-slate-900/50 aspect-video flex items-center justify-center backdrop-blur-xl">
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 to-cyan-500/10" />
            <div className="relative z-10 text-center">
              <Sparkles className="w-16 h-16 text-indigo-400 mx-auto mb-4 opacity-50" />
              <p className="text-slate-400">Premium collaboration experience awaits</p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <h2 className="text-4xl font-bold text-center mb-16">Powerful Features Built for You</h2>
        
        <div className="grid md:grid-cols-3 gap-8">
          {[
            {
              icon: Users,
              title: 'Smart Matching',
              description: 'Our AI finds teammates with complementary skills and learning goals.'
            },
            {
              icon: MessageSquare,
              title: 'Real-Time Chat',
              description: 'Instant messaging, file sharing, and collaboration tools in one place.'
            },
            {
              icon: Zap,
              title: 'Project Management',
              description: 'Organize tasks, track progress, and deliver projects on time.'
            },
            {
              icon: Award,
              title: 'Peer Feedback',
              description: 'Give and receive constructive feedback to grow together.'
            },
            {
              icon: TrendingUp,
              title: 'Skill Development',
              description: 'Track your growth and get personalized learning recommendations.'
            },
            {
              icon: Sparkles,
              title: 'Smart Suggestions',
              description: 'Discover learning opportunities and ideal study partners.'
            }
          ].map((feature, idx) => (
            <div
              key={idx}
              className="p-8 rounded-xl border border-slate-800 bg-slate-900/50 hover:border-indigo-600 hover:bg-slate-900/80 transition group cursor-pointer"
            >
              <feature.icon className="w-12 h-12 text-indigo-400 mb-4 group-hover:text-cyan-400 transition" />
              <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
              <p className="text-slate-400">{feature.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Why Section */}
      <section id="why" className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-4xl font-bold mb-6">Why Students Love UniConnect</h2>
            <div className="space-y-6">
              {[
                'Find teammates with complementary skills in seconds',
                'Collaborate more effectively with integrated tools',
                'Get recognized for your contributions',
                'Learn from diverse perspectives and experiences',
                'Build a network that lasts beyond graduation'
              ].map((point, idx) => (
                <div key={idx} className="flex items-start space-x-4">
                  <div className="w-6 h-6 rounded-full bg-indigo-600 flex items-center justify-center flex-shrink-0 mt-1">
                    <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <p className="text-lg text-slate-300">{point}</p>
                </div>
              ))}
            </div>
          </div>
          <div className="bg-gradient-to-br from-indigo-600/20 to-cyan-600/20 rounded-2xl p-12 border border-slate-800 h-96 flex items-center justify-center">
            <div className="text-center">
              <TrendingUp className="w-24 h-24 text-indigo-400 mx-auto mb-6 opacity-50" />
              <p className="text-slate-400">Join 2000+ students thriving on UniConnect</p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <h2 className="text-4xl font-bold text-center mb-16">What Students Say</h2>
        
        <div className="grid md:grid-cols-3 gap-8">
          {[
            {
              name: 'Nethmi K.',
              role: 'Computer Science',
              quote: 'UniConnect helped me find the perfect teammates for my capstone project. Game changer!'
            },
            {
              name: 'Alex J.',
              role: 'Business & Tech',
              quote: 'The collaboration tools are so intuitive. We shipped our MVP in half the time.'
            },
            {
              name: 'Sarah M.',
              role: 'Engineering',
              quote: 'Best investment in my academic journey. Met amazing people, learned tons.'
            }
          ].map((testimonial, idx) => (
            <div key={idx} className="p-8 rounded-xl border border-slate-800 bg-slate-900/50">
              <div className="flex mb-4">
                {[...Array(5)].map((_, i) => (
                  <span key={i} className="text-yellow-400">★</span>
                ))}
              </div>
              <p className="text-slate-300 mb-6 italic">"{testimonial.quote}"</p>
              <div>
                <p className="font-semibold">{testimonial.name}</p>
                <p className="text-sm text-slate-400">{testimonial.role}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
        <h2 className="text-4xl font-bold mb-6">Ready to Find Your Study Squad?</h2>
        <p className="text-xl text-slate-300 mb-8">Join thousands of students building amazing projects together.</p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={() => navigate('/register')}
            className="px-8 py-4 bg-gradient-to-r from-indigo-600 to-cyan-600 rounded-lg hover:from-indigo-500 hover:to-cyan-500 transition font-semibold text-white flex items-center justify-center space-x-2 text-lg"
          >
            <span>Get Started Free</span>
            <ArrowRight className="w-5 h-5" />
          </button>
          <button
            onClick={() => navigate('/login')}
            className="px-8 py-4 border-2 border-slate-700 rounded-lg hover:border-indigo-500 hover:bg-slate-900/50 transition font-semibold text-white"
          >
            Already a member? Sign In
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-slate-800 bg-slate-950/50 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <h3 className="font-semibold mb-4">UniConnect</h3>
              <p className="text-slate-400 text-sm">Building the future of student collaboration.</p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-slate-400 text-sm">
                <li><a href="#features" className="hover:text-indigo-400 transition">Features</a></li>
                <li><a href="#why" className="hover:text-indigo-400 transition">Why UniConnect</a></li>
                <li><a href="#testimonials" className="hover:text-indigo-400 transition">Testimonials</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Legal</h4>
              <ul className="space-y-2 text-slate-400 text-sm">
                <li><a href="#" className="hover:text-indigo-400 transition">Privacy</a></li>
                <li><a href="#" className="hover:text-indigo-400 transition">Terms</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Connect</h4>
              <div className="flex space-x-4">
                <a href="#" className="text-slate-400 hover:text-indigo-400 transition"><Github className="w-5 h-5" /></a>
                <a href="#" className="text-slate-400 hover:text-indigo-400 transition"><Linkedin className="w-5 h-5" /></a>
                <a href="#" className="text-slate-400 hover:text-indigo-400 transition"><Mail className="w-5 h-5" /></a>
              </div>
            </div>
          </div>
          
          <div className="border-t border-slate-800 pt-8 text-center text-slate-400 text-sm">
            <p>&copy; 2026 UniConnect. All rights reserved. Built with ❤️ for students.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
