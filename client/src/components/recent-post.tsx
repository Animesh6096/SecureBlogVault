import { Link } from "wouter";
import { formatDate, truncateText, getCategoryColor } from "@/lib/utils";
import { Post } from "@shared/schema";

interface RecentPostProps {
  post: Post;
}

export default function RecentPost({ post }: RecentPostProps) {
  return (
    <div className="flex flex-col md:flex-row gap-8 items-center">
      <div className="md:w-1/3">
        <img 
          src={post.imageUrl} 
          alt={post.title} 
          className="w-full h-64 md:h-48 object-cover rounded-lg"
        />
      </div>
      <div className="md:w-2/3">
        <div className="flex items-center gap-3 mb-3">
          <span className={`${getCategoryColor(post.category)} text-xs uppercase tracking-wider py-1 px-2 rounded`}>
            {post.category}
          </span>
          <span className="text-sm text-gray-500">{formatDate(post.createdAt)}</span>
        </div>
        <h3 className="font-poppins font-semibold text-2xl mb-3">{post.title}</h3>
        <p className="text-dark-gray mb-4">{truncateText(post.summary || "", 200)}</p>
        <Link href={`/post/${post.id}`} className="text-muted-blue font-medium inline-flex items-center hover:text-soft-coral transition-colors">
          Continue Reading
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
          </svg>
        </Link>
      </div>
    </div>
  );
}
