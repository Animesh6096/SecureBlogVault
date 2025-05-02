import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import Navbar from "@/components/navbar";
import HeroSection from "@/components/hero-section";
import PostCard from "@/components/post-card";
import RecentPost from "@/components/recent-post";
import NewsletterForm from "@/components/newsletter-form";
import ContactForm from "@/components/contact-form";
import Footer from "@/components/footer";
import { Post } from "@shared/schema";
import { Loader2 } from "lucide-react";

export default function HomePage() {
  const { data: featuredPosts, isLoading: loadingFeatured } = useQuery<Post[]>({
    queryKey: ["/api/posts/featured"],
  });

  const { data: recentPosts, isLoading: loadingRecent } = useQuery<Post[]>({
    queryKey: ["/api/posts/recent"],
  });

  // Handle scroll behavior for the navbar
  useEffect(() => {
    const handleScroll = () => {
      const navbar = document.getElementById("main-nav");
      if (!navbar) return;
      
      if (window.scrollY > 50) {
        navbar.classList.add("bg-white", "shadow-md");
        navbar.classList.remove("bg-transparent");
      } else {
        navbar.classList.remove("bg-white", "shadow-md");
        navbar.classList.add("bg-transparent");
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <HeroSection />
      
      {/* Featured Posts Section */}
      <section id="blog" className="py-20 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold font-poppins">Featured Posts</h2>
            <div className="w-20 h-1 bg-muted-blue mx-auto mt-4"></div>
          </div>
          
          {loadingFeatured ? (
            <div className="flex justify-center my-12">
              <Loader2 className="h-12 w-12 animate-spin text-muted-blue" />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {featuredPosts?.map((post) => (
                <PostCard key={post.id} post={post} />
              ))}
            </div>
          )}
          
          <div className="text-center mt-12">
            <Link href="/blog" className="inline-block border-2 border-muted-blue text-muted-blue px-6 py-3 rounded-md font-medium hover:bg-muted-blue hover:text-white transition-colors">
              View All Posts
            </Link>
          </div>
        </div>
      </section>
      
      {/* Newsletter Section */}
      <NewsletterForm />
      
      {/* Recent Posts Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold font-poppins">Recent Posts</h2>
            <div className="w-20 h-1 bg-muted-blue mx-auto mt-4"></div>
          </div>
          
          {loadingRecent ? (
            <div className="flex justify-center my-12">
              <Loader2 className="h-12 w-12 animate-spin text-muted-blue" />
            </div>
          ) : (
            <div className="max-w-4xl mx-auto space-y-12">
              {recentPosts?.map((post) => (
                <RecentPost key={post.id} post={post} />
              ))}
            </div>
          )}
          
          <div className="text-center mt-12">
            <Link href="/blog" className="inline-block border-2 border-muted-blue text-muted-blue px-6 py-3 rounded-md font-medium hover:bg-muted-blue hover:text-white transition-colors">
              Load More Posts
            </Link>
          </div>
        </div>
      </section>
      
      {/* Contact Section */}
      <ContactForm />
      
      <Footer />
    </div>
  );
}
