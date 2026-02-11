import { useState, useEffect } from 'react';
import { X, Download } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showPrompt, setShowPrompt] = useState(false);
  
  useEffect(() => {
    // Listen for the beforeinstallprompt event
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      
      // Don't show immediately - wait a bit for better UX
      setTimeout(() => {
        setShowPrompt(true);
      }, 3000); // Show after 3 seconds
    };
    
    window.addEventListener('beforeinstallprompt', handler);
    
    // Check if already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      console.log('[PWA] App is running in standalone mode');
      return;
    }
    
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);
  
  const handleInstall = async () => {
    if (!deferredPrompt) return;
    
    // Show the install prompt
    deferredPrompt.prompt();
    
    // Wait for the user to respond
    const { outcome } = await deferredPrompt.userChoice;
    
    console.log(`[PWA] User response: ${outcome}`);
    
    // Clear the prompt
    setDeferredPrompt(null);
    setShowPrompt(false);
  };
  
  const handleDismiss = () => {
    setShowPrompt(false);
    // Don't show again for this session
    sessionStorage.setItem('pwa-prompt-dismissed', 'true');
  };
  
  // Don't show if dismissed in this session
  if (sessionStorage.getItem('pwa-prompt-dismissed')) {
    return null;
  }
  
  if (!showPrompt) return null;
  
  return (
    <div 
      className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-96 
                 bg-gradient-to-br from-purple-900/95 to-blue-900/95 
                 backdrop-blur-xl border border-white/10 rounded-2xl p-6 
                 shadow-2xl z-50 animate-slide-up"
      style={{
        animation: 'slideUp 0.3s ease-out'
      }}
    >
      <button 
        onClick={handleDismiss}
        className="absolute top-3 right-3 p-1.5 hover:bg-white/10 rounded-full transition-colors"
        aria-label="Dismiss"
      >
        <X className="w-4 h-4 text-white/70" />
      </button>
      
      <div className="flex items-start gap-4 mb-4">
        <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center flex-shrink-0">
          <Download className="w-6 h-6 text-white" />
        </div>
        <div className="flex-1">
          <h3 className="font-semibold text-white mb-1">Install Insight</h3>
          <p className="text-sm text-white/80 leading-relaxed">
            Get quick access from your home screen and use the app offline
          </p>
        </div>
      </div>
      
      <div className="flex gap-3">
        <button 
          onClick={handleDismiss}
          className="flex-1 bg-white/10 text-white font-medium py-2.5 rounded-lg 
                     hover:bg-white/20 transition-colors"
        >
          Not Now
        </button>
        <button 
          onClick={handleInstall}
          className="flex-1 bg-white text-black font-semibold py-2.5 rounded-lg 
                     hover:bg-gray-100 transition-colors shadow-lg"
        >
          Install
        </button>
      </div>
    </div>
  );
}

// Add keyframe animation
const style = document.createElement('style');
style.textContent = `
  @keyframes slideUp {
    from {
      opacity: 0;
      transform: translateY(20px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
`;
document.head.appendChild(style);
