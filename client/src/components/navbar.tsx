import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { Menu, X } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Avatar,
  AvatarImage,
  AvatarFallback,
} from "@/components/ui/avatar";
import { motion, AnimatePresence } from "framer-motion";

interface NavbarProps {
  forceSolid?: boolean;
}

export default function Navbar({ forceSolid = false }: NavbarProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [transparent, setTransparent] = useState(true);
  const [, navigate] = useLocation();
  const { user, logoutMutation } = useAuth();

  const PLACEHOLDER_IMAGE = "https://ui-avatars.com/api/?name=User&background=eee&color=888&size=128";

  useEffect(() => {
    if (forceSolid) {
      setTransparent(false);
      return;
    }
    const handleScroll = () => {
      setTransparent(window.scrollY < 50);
    };
    window.addEventListener("scroll", handleScroll);
    handleScroll(); // Check initial state
    return () => window.removeEventListener("scroll", handleScroll);
  }, [forceSolid]);

  const handleLogin = () => {
    navigate("/auth");
  };

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  // Create user initials for avatar
  const getUserInitials = () => {
    if (!user || !user.username) return "U";
    return user.username.charAt(0).toUpperCase();
  };

  return (
    <nav id="main-nav" className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${transparent ? 'bg-transparent' : 'bg-white shadow-md'}`}>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          <Link href="/" className="flex items-center">
            <span className={`text-2xl font-bold font-poppins transition-colors duration-300 ${transparent ? 'text-white' : 'text-dark-gray'}`} style={{ textShadow: transparent ? '0 2px 8px rgba(0,0,0,0.3)' : 'none' }}>
              <span className={transparent ? 'text-white' : 'text-dark-gray'}>Mindful</span><span className={transparent ? 'text-soft-coral' : 'text-soft-coral'}>Blog</span>
            </span>
          </Link>
          
          {/* Desktop Navigation */}
          <div className="hidden md:flex space-x-8 items-center">
            <Link href="/" className={`nav-item font-medium hover:text-muted-blue transition-colors ${transparent ? 'text-white' : 'text-dark-gray'}`}>
              Home
            </Link>
            <Link href="/blog" className={`nav-item font-medium hover:text-muted-blue transition-colors ${transparent ? 'text-white' : 'text-dark-gray'}`}>
              Blog
            </Link>
            <Link href="/contact" className={`nav-item font-medium hover:text-muted-blue transition-colors ${transparent ? 'text-white' : 'text-dark-gray'}`}>
              Contact
            </Link>
            
            {user ? (
              <>
                <Link href="/create-post" className="bg-soft-coral text-white px-4 py-2 rounded-md hover:bg-opacity-90 transition-colors">
                  New Post
                </Link>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={user?.image || PLACEHOLDER_IMAGE} alt={user?.username || "User"} />
                        <AvatarFallback className="bg-muted-blue text-white">
                          {getUserInitials()}
                        </AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent asChild className="w-56" align="end" forceMount>
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.2 }}
                    >
                      <DropdownMenuLabel className="font-normal">
                        <div className="flex flex-col space-y-1">
                          <p className="text-sm font-medium leading-none">
                            {user.username}
                          </p>
                        </div>
                      </DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => navigate("/dashboard")}>
                        Dashboard
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => navigate("/profile")}>
                        Profile
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={handleLogout}>
                        Log out
                      </DropdownMenuItem>
                    </motion.div>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <button 
                id="auth-button" 
                className="bg-muted-blue text-white px-4 py-2 rounded-md hover:bg-opacity-90 transition-colors"
                onClick={handleLogin}
              >
                Login / Register
              </button>
            )}
          </div>
          
          {/* Mobile Navigation Toggle */}
          <button 
            className="md:hidden text-2xl"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? (
              <X className={transparent ? "text-white" : "text-dark-gray"} />
            ) : (
              <Menu className={transparent ? "text-white" : "text-dark-gray"} />
            )}
          </button>
        </div>
        
        {/* Mobile Navigation Menu */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.25 }}
              className="md:hidden bg-white rounded-lg shadow-lg mt-2 absolute left-4 right-4"
            >
              <div className="flex flex-col p-4 space-y-3">
                <Link href="/" className="text-dark-gray font-medium py-2 px-4 rounded hover:bg-soft-gray transition-colors" onClick={() => setMobileMenuOpen(false)}>
                  Home
                </Link>
                <Link href="/blog" className="text-dark-gray font-medium py-2 px-4 rounded hover:bg-soft-gray transition-colors" onClick={() => setMobileMenuOpen(false)}>
                  Blog
                </Link>
                <Link href="/contact" className="text-dark-gray font-medium py-2 px-4 rounded hover:bg-soft-gray transition-colors" onClick={() => setMobileMenuOpen(false)}>
                  Contact
                </Link>
                
                {user ? (
                  <>
                    <Link href="/create-post" className="text-dark-gray font-medium py-2 px-4 rounded hover:bg-soft-gray transition-colors" onClick={() => setMobileMenuOpen(false)}>
                      New Post
                    </Link>
                    <Link href="/profile" className="text-dark-gray font-medium py-2 px-4 rounded hover:bg-soft-gray transition-colors" onClick={() => setMobileMenuOpen(false)}>
                      Profile
                    </Link>
                    <button 
                      className="bg-soft-coral text-white py-2 px-4 rounded-md hover:bg-opacity-90 transition-colors"
                      onClick={() => {
                        handleLogout();
                        setMobileMenuOpen(false);
                      }}
                    >
                      Log out
                    </button>
                  </>
                ) : (
                  <button 
                    className="bg-muted-blue text-white py-2 px-4 rounded-md hover:bg-opacity-90 transition-colors"
                    onClick={() => {
                      handleLogin();
                      setMobileMenuOpen(false);
                    }}
                  >
                    Login / Register
                  </button>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </nav>
  );
}
