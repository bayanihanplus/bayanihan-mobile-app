import React, { createContext, useState, ReactNode } from "react";
import { useContext } from "react";
export interface Post {
  id: number | string; // string when optimistic placeholder
  user_id: number;
  username: string;
  avatar_url?: string;
  type: "image" | "video";
  uri: string;
  caption?: string;
  created_at: string;
  likes: number;
  isPlaceholder?: boolean; // ✅ mark if this is a temporary post
}

interface FeedContextType {
  feedData: Post[];
  setFeedData: React.Dispatch<React.SetStateAction<Post[]>>;
  addPost: (post: Post, replace?: boolean) => void;
  removePlaceholder: (tempId: string) => void;
}
export function useFeed() {
  const context = useContext(FeedContext);
  if (!context) throw new Error("useFeed must be used within a FeedProvider");
  return context;
}
export const FeedContext = createContext<FeedContextType>({
  feedData: [],
  setFeedData: () => {},
  addPost: () => {},
  removePlaceholder: () => {},
});

export const FeedProvider = ({ children }: { children: ReactNode }) => {
  const [feedData, setFeedData] = useState<Post[]>([]);

  const addPost = (post: Post, replace: boolean = false) => {
    setFeedData((prev) => {
      if (replace) {
        // ✅ Replace placeholder with real post
        return prev.map((p) => (p.id === post.id ? post : p));
      }
      return [post, ...prev];
    });
  };

  const removePlaceholder = (tempId: string) => {
    setFeedData((prev) => prev.filter((p) => p.id !== tempId));
  };
  
  return (
    <FeedContext.Provider value={{ feedData, setFeedData, addPost, removePlaceholder }}>
      {children}
    </FeedContext.Provider>
  );
};
