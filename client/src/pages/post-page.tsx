import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useRoute } from "wouter";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import { Post } from "@shared/schema";
import { formatDate, getCategoryColor } from "@/lib/utils";
import { Loader2 } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";

export default function PostPage() {
  const [, params] = useRoute<{ id: string }>("/post/:id");
  const { user } = useAuth();
  
  // Fetch the post
  const { data: post, isLoading } = useQuery<Post>({
    queryKey: [`/api/posts/${params?.id}`],
    enabled: !!params?.id,
  });
  
  // Scroll to top on component mount
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  if (!params?.id) {
    return <div>Invalid post ID</div>;
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      {isLoading ? (
        <div className="flex-1 flex justify-center items-center py-20">
          <Loader2 className="h-12 w-12 animate-spin text-muted-blue" />
        </div>
      ) : !post ? (
        <div className="flex-1 flex justify-center items-center py-20">
          <div className="text-center">
            <h2 className="text-2xl font-semibold mb-2">Post Not Found</h2>
            <p className="text-gray-500 mb-4">The post you're looking for doesn't exist or has been removed.</p>
            <Link href="/blog">
              <Button className="bg-muted-blue hover:bg-opacity-90">Back to Blog</Button>
            </Link>
          </div>
        </div>
      ) : (
        <article className="flex-1">
          {/* Post Header */}
          <div className="w-full h-96 relative">
            <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${post.imageUrl})` }}></div>
            <div className="absolute inset-0 bg-black bg-opacity-50"></div>
            <div className="relative container mx-auto h-full flex flex-col justify-end pb-12 px-4 sm:px-6 lg:px-8">
              <div className={`${getCategoryColor(post.category)} inline-block px-3 py-1 rounded text-xs uppercase tracking-wider mb-4`}>
                {post.category}
              </div>
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white font-poppins mb-4">{post.title}</h1>
              <div className="flex items-center text-white">
                <span className="text-sm">By {post.author}</span>
                <span className="mx-2">•</span>
                <span className="text-sm">{formatDate(post.createdAt)}</span>
              </div>
            </div>
          </div>
          
          {/* Post Content */}
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="max-w-4xl mx-auto">
              {/* Admin controls if user is logged in */}
              {user && (
                <div className="mb-8 p-4 bg-soft-gray rounded-lg">
                  <h3 className="font-semibold mb-2">Admin Controls</h3>
                  <div className="flex gap-3">
                    <Button variant="outline" className="text-muted-blue border-muted-blue">
                      Edit Post
                    </Button>
                    <Button variant="outline" className="text-destructive border-destructive">
                      Delete Post
                    </Button>
                  </div>
                </div>
              )}
              
              {/* Main content */}
              <div className="prose prose-lg max-w-none">
                <div dangerouslySetInnerHTML={{ __html: post.content }} />
              </div>
              
              {/* Tags */}
              {post.tags && post.tags.length > 0 && (
                <div className="mt-12 pt-6 border-t">
                  <h3 className="font-semibold mb-3">Tags:</h3>
                  <div className="flex flex-wrap gap-2">
                    {post.tags.map((tag, index) => (
                      <span 
                        key={index}
                        className="bg-soft-gray text-dark-gray px-3 py-1 rounded-full text-sm"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Share buttons */}
              <div className="mt-8 pt-6 border-t">
                <h3 className="font-semibold mb-3">Share this post:</h3>
                <div className="flex space-x-4">
                  <button className="text-muted-blue hover:text-opacity-80 transition-colors">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-facebook">
                      <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
                    </svg>
                  </button>
                  <button className="text-muted-blue hover:text-opacity-80 transition-colors">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-twitter">
                      <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z" />
                    </svg>
                  </button>
                  <button className="text-muted-blue hover:text-opacity-80 transition-colors">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-linkedin">
                      <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
                      <rect width="4" height="12" x="2" y="9" />
                      <circle cx="4" cy="4" r="2" />
                    </svg>
                  </button>
                  <button className="text-muted-blue hover:text-opacity-80 transition-colors">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-link">
                      <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
                      <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </article>
      )}
      
      <Footer />
    </div>
  );
}
