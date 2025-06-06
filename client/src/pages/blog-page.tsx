import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Navbar from "@/components/navbar";
import PostCard from "@/components/post-card";
import Footer from "@/components/footer";
import { Post } from "@shared/schema";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Loader2 } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { motion } from "framer-motion";

export default function BlogPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [category, setCategory] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const postsPerPage = 6; // Number of posts to display per page
  
  // Fetch all posts
  const { data: posts, isLoading } = useQuery<Post[]>({
    queryKey: ["/api/posts", { search: searchQuery, category }],
  });
  
  // Normalize posts to always have an 'id' property
  const normalizedPosts = posts?.map(post => ({
    ...post,
    id: post.id || post._id
  }));
  
  // Filter posts by search and category
  const filteredPosts = normalizedPosts?.filter(post => {
    const matchesSearch = searchQuery === "" || 
      post.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
      post.content.toLowerCase().includes(searchQuery.toLowerCase());
      
    const matchesCategory = category === "all" || post.category === category;
    
    return matchesSearch && matchesCategory;
  });
  
  // Pagination logic
  const totalPosts = filteredPosts?.length || 0;
  const totalPages = Math.ceil(totalPosts / postsPerPage);
  
  // Get current posts for the current page
  const indexOfLastPost = currentPage * postsPerPage;
  const indexOfFirstPost = indexOfLastPost - postsPerPage;
  const currentPosts = filteredPosts?.slice(indexOfFirstPost, indexOfLastPost);
  
  // Change page
  const handlePageChange = (pageNumber: number) => {
    setCurrentPage(pageNumber);
    // Scroll to top of posts section
    const postsGrid = document.getElementById('posts-grid');
    if (postsGrid) {
      window.scrollTo({ top: postsGrid.offsetTop - 100, behavior: 'smooth' });
    }
  };
  
  // Get unique categories from posts
  const categories = posts ? Array.from(new Set(posts.map(post => post.category))) : [];

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      {/* Blog Header */}
      <div className="relative h-[50vh] md:h-[60vh] flex items-center justify-center bg-cover bg-center" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1464983953574-0892a716854b?auto=format&fit=crop&w=1200&q=80')" }}>
        <div className="absolute inset-0 bg-black bg-opacity-60"></div>
        <div className="relative z-10 container mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-6 font-poppins text-white drop-shadow-lg">Our Blog</h1>
          <p className="text-lg md:text-xl max-w-2xl mx-auto text-white drop-shadow">Explore our collection of articles on mindfulness, productivity, and personal growth.</p>
        </div>
      </div>
      
      {/* Filter Section */}
      <div className="bg-white py-8 border-b">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row gap-4 items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                type="text"
                placeholder="Search posts..."
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="w-full md:w-64">
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger>
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {categories?.map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {cat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </div>
      
      {/* Posts Grid */}
      <motion.section
        id="posts-grid"
        className="py-12 bg-white flex-1"
        initial={{ opacity: 0, y: 32 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: "easeOut" }}
      >
        <div className="container mx-auto px-4">
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="space-y-4">
                  <Skeleton className="h-48 w-full rounded-lg" />
                  <Skeleton className="h-6 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                  <Skeleton className="h-4 w-1/3" />
                </div>
              ))}
            </div>
          ) : filteredPosts?.length === 0 ? (
            <div className="text-center py-20">
              <h3 className="text-xl font-semibold mb-2">No posts found</h3>
              <p className="text-gray-500">Try adjusting your search or filter criteria</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {currentPosts?.map((post) => (
                <motion.div
                  key={post.id}
                  whileHover={{ scale: 1.03, boxShadow: "0 8px 32px rgba(0,0,0,0.08)" }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <PostCard post={post} />
                </motion.div>
              ))}
            </div>
          )}
          
          {/* Pagination */}
          {filteredPosts && filteredPosts.length > postsPerPage && (
            <div className="mt-12 flex flex-wrap justify-center items-center gap-2">
              <Button 
                variant="outline" 
                className="mx-1"
                onClick={() => currentPage > 1 && handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
              >
                Previous
              </Button>
              
              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .filter(page => {
                  // Show first page, last page, current page, and pages around current page
                  return page === 1 || 
                    page === totalPages || 
                    (page >= currentPage - 1 && page <= currentPage + 1);
                })
                .map((page, index, array) => {
                  // Add ellipsis where pages are skipped
                  const showEllipsis = index > 0 && page - array[index - 1] > 1;
                  
                  return (
                    <div key={page} className="flex items-center">
                      {showEllipsis && (
                        <span className="mx-1 text-gray-500">...</span>
                      )}
                      <Button 
                        variant={currentPage === page ? "default" : "outline"} 
                        className={`mx-1 ${currentPage === page ? 'bg-muted-blue text-white' : ''}`}
                        onClick={() => handlePageChange(page)}
                      >
                        {page}
                      </Button>
                    </div>
                  );
                })
              }
              
              <Button 
                variant="outline" 
                className="mx-1"
                onClick={() => currentPage < totalPages && handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
              >
                Next
              </Button>
            </div>
          )}
        </div>
      </motion.section>
      
      <Footer />
    </div>
  );
}
