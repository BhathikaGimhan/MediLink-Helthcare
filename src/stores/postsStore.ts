// src/stores/postsStore.ts
import { create } from "zustand";

interface Comment {
  id: string;
  author: string;
  role: "doctor" | "patient";
  content: string;
}

interface Post {
  id: string;
  content: string;
  role: "doctor" | "patient";
  comments: Comment[];
}

interface PostsStore {
  posts: Post[];
  addComment: (postId: string, comment: Comment) => void;
}

export const usePostsStore = create<PostsStore>((set) => ({
  posts: [
    { id: "1", content: "Sample Doctor Post", role: "doctor", comments: [] },
    { id: "2", content: "Sample Patient Post", role: "patient", comments: [] },
  ],
  addComment: (postId, comment) =>
    set((state) => ({
      posts: state.posts.map((post) =>
        post.id === postId
          ? {
              ...post,
              comments: [
                ...post.comments,
                { ...comment, id: Math.random().toString(36).substr(2, 9) },
              ],
            }
          : post
      ),
    })),
}));
