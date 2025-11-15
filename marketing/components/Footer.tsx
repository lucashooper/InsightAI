import React from 'react';
import { Twitter, Github, MessageCircle } from 'lucide-react';

const Footer: React.FC = () => {
  return (
    <footer className="border-t border-white/10 bg-black/50 backdrop-blur-sm">
      <div className="max-w-7xl mx-auto px-6 py-12">
        {/* Top section - Logo + Links */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-8">
          {/* Brand column */}
          <div className="md:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-xl font-bold">
                Insight<span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-400">AI</span>
              </span>
            </div>
            <p className="text-gray-400 text-sm leading-relaxed">
              Your AI-powered journal companion
            </p>
          </div>
          
          {/* Product links */}
          <div>
            <h3 className="font-semibold mb-4 text-white">PRODUCT</h3>
            <ul className="space-y-3">
              <li><a href="#features" className="text-gray-400 hover:text-white transition-colors text-sm">Features</a></li>
              <li><a href="#security" className="text-gray-400 hover:text-white transition-colors text-sm">Security</a></li>
              <li><a href="#pricing" className="text-gray-400 hover:text-white transition-colors text-sm">Pricing</a></li>
              <li><a href="/app" className="text-gray-400 hover:text-white transition-colors text-sm">Try Now</a></li>
            </ul>
          </div>
          
          {/* Resources links */}
          <div>
            <h3 className="font-semibold mb-4 text-white">RESOURCES</h3>
            <ul className="space-y-3">
              <li><a href="/docs" className="text-gray-400 hover:text-white transition-colors text-sm">Documentation</a></li>
              <li><a href="/guides" className="text-gray-400 hover:text-white transition-colors text-sm">Guides</a></li>
              <li><a href="/blog" className="text-gray-400 hover:text-white transition-colors text-sm">Blog</a></li>
              <li><a href="/support" className="text-gray-400 hover:text-white transition-colors text-sm">Support</a></li>
            </ul>
          </div>
          
          {/* Company links */}
          <div>
            <h3 className="font-semibold mb-4 text-white">COMPANY</h3>
            <ul className="space-y-3">
              <li><a href="/about" className="text-gray-400 hover:text-white transition-colors text-sm">About</a></li>
              <li><a href="/privacy" className="text-gray-400 hover:text-white transition-colors text-sm">Privacy</a></li>
              <li><a href="/terms" className="text-gray-400 hover:text-white transition-colors text-sm">Terms</a></li>
              <li><a href="/contact" className="text-gray-400 hover:text-white transition-colors text-sm">Contact</a></li>
            </ul>
          </div>
        </div>
        
        {/* Bottom section - Copyright + Social */}
        <div className="pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-gray-500 text-sm">
            © 2024 InsightAI. All rights reserved.
          </p>
          
          {/* Social links */}
          <div className="flex items-center gap-6">
            <a href="https://twitter.com/yourhandle" className="text-gray-400 hover:text-white transition-colors">
              <Twitter className="w-5 h-5" />
            </a>
            <a href="https://github.com/yourrepo" className="text-gray-400 hover:text-white transition-colors">
              <Github className="w-5 h-5" />
            </a>
            <a href="https://discord.gg/yourinvite" className="text-gray-400 hover:text-white transition-colors">
              <MessageCircle className="w-5 h-5" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
