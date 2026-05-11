import { useState, useEffect } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  LayoutDashboard, 
  FileText, 
  Package, 
  TrendingUp,
  Settings,
  HelpCircle,
  LogOut,
  Sparkles,
  Receipt,
  Menu,
  X,
  ChevronLeft
} from 'lucide-react';

const menuItems = [
  { path: '/', label: 'Dashboard', icon: LayoutDashboard, color: '#8b5cf6' },
  { path: '/invoices', label: 'Invoices & Billing', icon: Receipt, color: '#3b82f6' },
  { path: '/inventory', label: 'Inventory', icon: Package, color: '#10b981' },
  { path: '/analytics', label: 'Analytics', icon: TrendingUp, color: '#f59e0b' },
];

export const Sidebar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024);
      if (window.innerWidth >= 1024) {
        setIsOpen(true);
      } else {
        setIsOpen(false);
      }
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Close sidebar on mobile when route changes
  useEffect(() => {
    if (isMobile) {
      setIsOpen(false);
    }
  }, [location, isMobile]);

  const sidebarContent = (
    <div className="flex flex-col h-full bg-gradient-to-b from-gray-900 via-gray-900 to-gray-800">
      {/* Logo Section */}
      <div className="p-4 md:p-6 border-b border-gray-800">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 md:w-10 md:h-10 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center shadow-lg shadow-purple-500/25">
            <Sparkles className="w-4 h-4 md:w-5 md:h-5 text-white" />
          </div>
          <div className="flex-1">
            <h1 className="text-lg md:text-xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              Vyappar AI
            </h1>
            <p className="text-xs text-gray-500 hidden sm:block">Business Intelligence</p>
          </div>
          {isMobile && (
            <button
              onClick={() => setIsOpen(false)}
              className="p-2 hover:bg-white/10 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-gray-400" />
            </button>
          )}
        </div>
      </div>

      {/* AI Assistant Badge */}
      <div className="mx-3 md:mx-4 mt-4 p-2 md:p-3 rounded-xl bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/20">
        <div className="flex items-center gap-2">
          <div className="w-1.5 h-1.5 md:w-2 md:h-2 bg-green-500 rounded-full animate-pulse"></div>
          <span className="text-xs md:text-sm text-purple-400 font-medium">AI Assistant Active</span>
        </div>
        <p className="text-xs text-gray-400 mt-1 hidden md:block">Automated GST, billing & insights</p>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 md:px-4 py-4 md:py-6 space-y-1 md:space-y-2 overflow-y-auto">
        {menuItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            onClick={() => isMobile && setIsOpen(false)}
            className={({ isActive }) =>
              `flex items-center gap-2 md:gap-3 px-3 md:px-4 py-2.5 md:py-3 rounded-xl transition-all duration-200 group relative ${
                isActive
                  ? 'bg-gradient-to-r from-purple-500/20 to-pink-500/20 text-white border border-purple-500/30'
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <item.icon 
                  className="w-4 h-4 md:w-5 md:h-5" 
                  style={{ color: isActive ? item.color : undefined }}
                />
                <span className="text-sm md:text-base font-medium">{item.label}</span>
                {isActive && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute left-0 w-1 h-6 md:h-8 bg-gradient-to-b from-purple-500 to-pink-500 rounded-full"
                  />
                )}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Bottom Section */}
      <div className="p-3 md:p-4 border-t border-gray-800 space-y-1 md:space-y-2">
        <button className="w-full flex items-center gap-2 md:gap-3 px-3 md:px-4 py-2 md:py-2.5 rounded-xl text-gray-400 hover:text-white hover:bg-white/5 transition-all duration-200">
          <HelpCircle className="w-4 h-4 md:w-5 md:h-5" />
          <span className="text-sm md:text-base">Help & Support</span>
        </button>
        <button className="w-full flex items-center gap-2 md:gap-3 px-3 md:px-4 py-2 md:py-2.5 rounded-xl text-gray-400 hover:text-white hover:bg-white/5 transition-all duration-200">
          <Settings className="w-4 h-4 md:w-5 md:h-5" />
          <span className="text-sm md:text-base">Settings</span>
        </button>
        <button className="w-full flex items-center gap-2 md:gap-3 px-3 md:px-4 py-2 md:py-2.5 rounded-xl text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-all duration-200">
          <LogOut className="w-4 h-4 md:w-5 md:h-5" />
          <span className="text-sm md:text-base">Logout</span>
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-gray-800 rounded-lg shadow-lg"
      >
        <Menu className="w-5 h-5 text-white" />
      </button>

      {/* Desktop Sidebar - Always visible */}
      <div className="hidden lg:block fixed left-0 top-0 bottom-0 w-64 xl:w-72 z-40">
        {sidebarContent}
      </div>

      {/* Mobile Sidebar Drawer */}
      <AnimatePresence>
        {isOpen && isMobile && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 lg:hidden"
            />
            <motion.div
              initial={{ x: -300 }}
              animate={{ x: 0 }}
              exit={{ x: -300 }}
              transition={{ type: "spring", damping: 25 }}
              className="fixed left-0 top-0 bottom-0 w-72 z-50 lg:hidden shadow-2xl"
            >
              {sidebarContent}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};