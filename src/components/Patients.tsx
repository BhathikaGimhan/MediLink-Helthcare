import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { db } from '../firebase';
import { collection, query, where, addDoc, updateDoc, doc, onSnapshot, orderBy, arrayRemove, arrayUnion, increment } from 'firebase/firestore';
import { useUserStore } from '../stores/userStore';
import { Post, Comment } from '../types';
import { Heart, MessageCircle, Share2, Send, ChevronDown, ChevronUp } from 'lucide-react';
import { format } from 'date-fns';

const Patients: React.FC = () => {
  const { user } = useUserStore();
  const [posts, setPosts] = useState<Post[]>([]);
  const [newPost, setNewPost] = useState('');
  const [comments, setComments] = useState<{ [postId: string]: Comment[] }>({});
  const [newComments, setNewComments] = useState<{ [postId: string]: string }>({});
  const [error, setError] = useState<string | null>(null);
  const [expandedPost, setExpandedPost] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Real-time listener for posts
  useEffect(() => {
    if (!user) {
      setError('Please log in to view the Patients\' Problems section.');
      setLoading(false);
      return;
    }
    const q = query(
      collection(db, 'posts'),
      where('type', '==', 'patient'),
      orderBy('createdAt', 'desc')
    );
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const postsData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Post[];
      setPosts(postsData);
      setError(null);
      setLoading(false);
    }, (err) => {
      console.error('Firestore error:', err);
      setLoading(false);
      if (err.code === 'failed-precondition' && err.message.includes('index')) {
        setError('The query requires an index. Please create it in the Firebase Console or contact the administrator.');
      } else {
        setError(err.message || 'Failed to fetch posts.');
      }
    });
    return () => unsubscribe();
  }, [user]);

  // Real-time listener for comments
  useEffect(() => {
    if (!user) return;
    const unsubscribeFuncs: (() => void)[] = [];
    posts.forEach((post) => {
      const q = query(
        collection(db, 'posts', post.id, 'comments'),
        orderBy('createdAt', 'asc')
      );
      const unsubscribe = onSnapshot(q, (snapshot) => {
        const commentsData = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Comment[];
        setComments((prev) => ({
          ...prev,
          [post.id]: commentsData,
        }));
      }, (err) => {
        console.error('Firestore comments error:', err);
        setError(err.message || 'Failed to fetch comments.');
      });
      unsubscribeFuncs.push(unsubscribe);
    });
    return () => unsubscribeFuncs.forEach((unsubscribe) => unsubscribe());
  }, [posts, user]);

  const handlePostSubmit = async () => {
    if (!user) {
      setError('You must be logged in to post.');
      return;
    }
    if (user.role === 'admin-1') {
      setError('Admins cannot post in the Patients\' Problems section.');
      return;
    }
    if (!newPost.trim()) {
      setError('Post content cannot be empty.');
      return;
    }

    try {
      await addDoc(collection(db, 'posts'), {
        userId: user.id,
        userName: user.name || user.displayName || 'Anonymous',
        content: newPost,
        createdAt: new Date().toISOString(),
        type: 'patient',
        likes: [],
        likeCount: 0,
      });
      setNewPost('');
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Failed to create post.');
      console.error(err);
    }
  };

  const handleCommentSubmit = async (postId: string) => {
    if (!user) {
      setError('You must be logged in to comment.');
      return;
    }
    const commentText = newComments[postId]?.trim();
    if (!commentText) {
      setError('Comment cannot be empty.');
      return;
    }

    try {
      await addDoc(collection(db, 'posts', postId, 'comments'), {
        userId: user.id,
        userName: user.name || user.displayName || 'Anonymous',
        content: commentText,
        createdAt: new Date().toISOString(),
      });
      setNewComments((prev) => ({ ...prev, [postId]: '' }));
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Failed to add comment.');
      console.error(err);
    }
  };

  const handleLikeToggle = async (postId: string, isLiked: boolean) => {
    if (!user) {
      setError('You must be logged in to like a post.');
      return;
    }

    try {
      const postRef = doc(db, 'posts', postId);
      if (isLiked) {
        await updateDoc(postRef, {
          likes: arrayRemove(user.id),
          likeCount: increment(-1),
        });
      } else {
        await updateDoc(postRef, {
          likes: arrayUnion(user.id),
          likeCount: increment(1),
        });
      }
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Failed to toggle like.');
      console.error(err);
    }
  };

  const toggleExpanded = (postId: string) => {
    setExpandedPost(expandedPost === postId ? null : postId);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="min-h-screen bg-gray-900 text-cyan-50 p-4 md:p-8"
    >
      <div className="container mx-auto max-w-5xl">
        <h2 className="text-3xl font-bold neon-text text-cyan-400 mb-6">Patients' Problems</h2>
        {error && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-red-400 bg-red-900/20 border border-red-500/30 p-3 rounded-lg mb-4"
          >
            {error}
          </motion.div>
        )}
        {loading && (
          <p className="text-gray-400 text-center">Loading posts...</p>
        )}
        {!loading && user?.role !== 'admin-1' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="cyber-card p-6 mb-6"
          >
            <div className="flex space-x-4">
              <img
                src={user?.avatar || 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=100&h=100'}
                alt="Your avatar"
                className="w-10 h-10 rounded-full"
              />
              <div className="flex-1">
                <textarea
                  className="w-full px-4 py-2 bg-gray-800 border border-cyan-500/30 rounded-lg focus:outline-none focus:border-cyan-400 resize-none"
                  rows={3}
                  placeholder="Share your health concerns..."
                  value={newPost}
                  onChange={(e) => setNewPost(e.target.value)}
                />
                <div className="flex justify-end mt-2">
                  <button
                    className="cyber-button flex items-center space-x-2"
                    onClick={handlePostSubmit}
                    disabled={!newPost.trim()}
                  >
                    <Send className="w-4 h-4" />
                    <span>Post</span>
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
        {!loading && (
          <div className="space-y-6">
            {posts.map((post, index) => (
              <motion.div
                key={post.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="cyber-card p-6"
              >
                <div className="flex space-x-4">
                  <img
                    src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=100&h=100"
                    alt={post.userName}
                    className="w-10 h-10 rounded-full"
                  />
                  <div className="flex-1">
                    <div className="flex justify-between items-center mb-2">
                      <h3 className="font-bold text-cyan-400">{post.userName}</h3>
                      <span className="text-sm text-gray-400">
                        {format(new Date(post.createdAt), 'MMM dd, yyyy HH:mm')}
                      </span>
                    </div>
                    <p className="text-gray-300 mb-4">
                      {expandedPost === post.id
                        ? post.content
                        : `${post.content.slice(0, 100)}${post.content.length > 100 ? '...' : ''}`}
                    </p>
                    {post.content.length > 100 && (
                      <button
                        className="text-cyan-400 flex items-center"
                        onClick={() => toggleExpanded(post.id)}
                      >
                        {expandedPost === post.id ? (
                          <>
                            <ChevronUp className="w-4 h-4" /> Collapse
                          </>
                        ) : (
                          <>
                            <ChevronDown className="w-4 h-4" /> Read More
                          </>
                        )}
                      </button>
                    )}
                    <div className="flex items-center space-x-6 mt-4">
                      <button
                        className="flex items-center space-x-2 text-gray-400 hover:text-cyan-400 transition-colors"
                        onClick={() => handleLikeToggle(post.id, post.likes.includes(user?.id || ''))}
                      >
                        <Heart
                          className={`w-4 h-4 ${post.likes.includes(user?.id || '') ? 'text-red-500' : ''}`}
                          fill={post.likes.includes(user?.id || '') ? 'currentColor' : 'none'}
                        />
                        <span>{post.likeCount}</span>
                      </button>
                      <button className="flex items-center space-x-2 text-gray-400 hover:text-cyan-400 transition-colors">
                        <MessageCircle className="w-4 h-4" />
                        <span>{comments[post.id]?.length || 0}</span>
                      </button>
                      <button className="flex items-center space-x-2 text-gray-400 hover:text-cyan-400 transition-colors">
                        <Share2 className="w-4 h-4" />
                        <span>Share</span>
                      </button>
                    </div>
                    <div className="mt-4">
                      <h3 className="text-lg font-bold text-cyan-400">Comments</h3>
                      {comments[post.id]?.length > 0 ? (
                        <div className="space-y-2 mt-2">
                          {comments[post.id].map((comment) => (
                            <div key={comment.id} className="bg-gray-800 p-3 rounded-lg">
                              <p className="text-gray-300">{comment.content}</p>
                              <p className="text-gray-500 text-sm">
                                {comment.userName} - {format(new Date(comment.createdAt), 'MMM dd, yyyy HH:mm')}
                              </p>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-gray-400 text-sm">No comments yet.</p>
                      )}
                      {user && (
                        <div className="mt-4">
                          <textarea
                            className="w-full px-4 py-2 bg-gray-800 border border-cyan-500/30 rounded-lg focus:outline-none focus:border-cyan-400 resize-none"
                            rows={2}
                            placeholder="Add a comment..."
                            value={newComments[post.id] || ''}
                            onChange={(e) => setNewComments({ ...newComments, [post.id]: e.target.value })}
                          />
                          <div className="flex justify-end mt-2">
                            <button
                              className="cyber-button flex items-center space-x-2"
                              onClick={() => handleCommentSubmit(post.id)}
                              disabled={!newComments[post.id]?.trim()}
                            >
                              <Send className="w-4 h-4" />
                              <span>Comment</span>
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
        {!loading && posts.length === 0 && (
          <p className="text-gray-400 text-center">No posts yet in the Patients' Problems section.</p>
        )}
      </div>
    </motion.div>
  );
};

export default Patients;