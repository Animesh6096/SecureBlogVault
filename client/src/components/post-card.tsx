import { Link } from "wouter";
import { formatDate, truncateText, getCategoryColor } from "@/lib/utils";
import { Post } from "@shared/schema";

interface PostCardProps {
  post: Post;
}

export default function PostCard({ post }: PostCardProps) {
  return (
    <div className="post-card rounded-lg overflow-hidden shadow-md bg-white hover-grow">
      <div className="relative">
        <img 
          src={post.imageUrl} 
          alt={post.title} 
          className="w-full h-56 object-cover"
        />
        <div className={`absolute top-4 right-4 ${getCategoryColor(post.category)} text-xs uppercase tracking-wider py-1 px-2 rounded`}>
          {post.category}
        </div>
      </div>
      <div className="p-6">
        <span className="text-sm text-gray-500">{formatDate(post.createdAt)}</span>
        <h3 className="font-poppins font-semibold text-xl mt-2 mb-3">{post.title}</h3>
        <p className="text-dark-gray mb-4">{truncateText(post.summary || "", 120)}</p>
        <Link href={`/post/${post.id}`} className="text-muted-blue font-medium inline-flex items-center hover:text-soft-coral transition-colors">
          Read More 
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
          </svg>
        </Link>
      </div>
    </div>
  );
}
