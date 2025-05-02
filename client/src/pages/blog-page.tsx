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

export default function BlogPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [category, setCategory] = useState("all");
  
  // Fetch all posts
  const { data: posts, isLoading } = useQuery<Post[]>({
    queryKey: ["/api/posts", { search: searchQuery, category }],
  });
  
  // Filter posts by search and category
  const filteredPosts = posts?.filter(post => {
    const matchesSearch = searchQuery === "" || 
      post.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
      post.content.toLowerCase().includes(searchQuery.toLowerCase());
      
    const matchesCategory = category === "all" || post.category === category;
    
    return matchesSearch && matchesCategory;
  });
  
  // Get unique categories from posts
  const categories = [...new Set(posts?.map(post => post.category))];

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      {/* Blog Header */}
      <div className="bg-soft-gray py-24 px-4">
        <div className="container mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-6 font-poppins">Our Blog</h1>
          <p className="text-dark-gray text-lg max-w-2xl mx-auto">
            Explore our collection of articles on mindfulness, productivity, and personal growth.
          </p>
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
      <section className="py-12 bg-white flex-1">
        <div className="container mx-auto px-4">
          {isLoading ? (
            <div className="flex justify-center py-20">
              <Loader2 className="h-12 w-12 animate-spin text-muted-blue" />
            </div>
          ) : filteredPosts?.length === 0 ? (
            <div className="text-center py-20">
              <h3 className="text-xl font-semibold mb-2">No posts found</h3>
              <p className="text-gray-500">Try adjusting your search or filter criteria</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredPosts?.map((post) => (
                <PostCard key={post.id} post={post} />
              ))}
            </div>
          )}
          
          {/* Pagination - Simplified version */}
          {filteredPosts && filteredPosts.length > 0 && (
            <div className="mt-12 flex justify-center">
              <Button variant="outline" className="mx-1">Previous</Button>
              <Button variant="outline" className="mx-1 bg-muted-blue text-white">1</Button>
              <Button variant="outline" className="mx-1">2</Button>
              <Button variant="outline" className="mx-1">3</Button>
              <Button variant="outline" className="mx-1">Next</Button>
            </div>
          )}
        </div>
      </section>
      
      <Footer />
    </div>
  );
}
