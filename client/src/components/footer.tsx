import { Link } from "wouter";

export default function Footer() {
  return (
    <footer className="bg-white py-12 border-t border-gray-200">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center mb-8">
            <div className="mb-6 md:mb-0">
              <Link href="/" className="flex items-center">
                <span className="text-2xl font-bold font-poppins">Mindful<span className="text-soft-coral">Blog</span></span>
              </Link>
              <p className="text-gray-500 mt-2 max-w-xs">A minimalist blog focused on mindful living, productivity, and personal growth.</p>
            </div>
            
            <div className="flex flex-col space-y-2">
              <h4 className="font-poppins font-semibold mb-2">Quick Links</h4>
              <Link href="/" className="text-gray-600 hover:text-muted-blue transition-colors">
                Home
              </Link>
              <Link href="/blog" className="text-gray-600 hover:text-muted-blue transition-colors">
                Blog
              </Link>
              <a href="#contact" className="text-gray-600 hover:text-muted-blue transition-colors">Contact</a>
            </div>
            
            <div className="flex flex-col space-y-2">
              <h4 className="font-poppins font-semibold mb-2">Follow Us</h4>
              <div className="flex space-x-4">
                <a href="#" className="text-gray-600 hover:text-muted-blue transition-colors text-xl">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-twitter">
                    <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z" />
                  </svg>
                </a>
                <a href="#" className="text-gray-600 hover:text-muted-blue transition-colors text-xl">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-instagram">
                    <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
                    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                    <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
                  </svg>
                </a>
                <a href="#" className="text-gray-600 hover:text-muted-blue transition-colors text-xl">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-facebook">
                    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
                  </svg>
                </a>
                <a href="#" className="text-gray-600 hover:text-muted-blue transition-colors text-xl">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-linkedin">
                    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
                    <rect width="4" height="12" x="2" y="9" />
                    <circle cx="4" cy="4" r="2" />
                  </svg>
                </a>
              </div>
            </div>
          </div>
          
          <div className="border-t border-gray-200 pt-8 mt-8 text-center text-gray-500 text-sm">
            <p>&copy; {new Date().getFullYear()} MindfulBlog. All rights reserved.</p>
            <div className="flex justify-center mt-2 space-x-4">
              <a href="#" className="hover:text-muted-blue transition-colors">Privacy Policy</a>
              <a href="#" className="hover:text-muted-blue transition-colors">Terms of Service</a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
