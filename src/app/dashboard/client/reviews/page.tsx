"use client";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Star, Send, CheckCircle2, AlertCircle } from "lucide-react";
import { Card, Button, SectionHeader, Textarea, Select, EmptyState } from "@/components/ui";
import { reviewsAPI, projectsAPI } from "@/lib/api";
import { Project, Review } from "@/types";
import { useAuthStore } from "@/lib/store/authStore";
import { formatDate, timeAgo } from "@/lib/utils";
import toast from "react-hot-toast";

export default function ClientReviewsPage() {
  const { user } = useAuthStore();
  const [projects, setProjects] = useState<Project[]>([]);
  const [myReviews, setMyReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);

  const [form, setForm] = useState({
    projectId: "",
    comment: "",
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [projRes, reviewRes] = await Promise.all([
          projectsAPI.getAll({ status: "completed" }),
          reviewsAPI.getAll(),
        ]);
        const completedProjects = projRes.data.projects || [];
        setProjects(completedProjects);
        setMyReviews(reviewRes.data.reviews || []);
      } catch {
        setProjects([]);
        setMyReviews([]);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleSubmit = async () => {
    if (!form.projectId || !rating || !form.comment) {
      toast.error("Please complete all fields and select a rating");
      return;
    }
    setSubmitting(true);
    try {
      await reviewsAPI.create({
        projectId: form.projectId,
        rating,
        comment: form.comment,
      });
      toast.success("Review submitted! It will be published after admin approval.");
      setForm({ projectId: "", comment: "" });
      setRating(0);
      const reviewRes = await reviewsAPI.getAll();
      setMyReviews(reviewRes.data.reviews || []);
    } catch {
      toast.error("Failed to submit review");
    } finally {
      setSubmitting(false);
    }
  };

  const completedProjectsWithoutReview = projects.filter(
    (p) => !myReviews.find((r) => r.projectId === p.id)
  );

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="font-display font-bold text-3xl text-white">Reviews</h1>
        <p className="text-slate-400 mt-1">Share your experience with our services</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Submit Review */}
        <Card>
          <SectionHeader title="Submit a Review" subtitle="Your feedback helps us improve" />

          {completedProjectsWithoutReview.length === 0 && !loading ? (
            <div className="p-4 rounded-xl bg-brand-500/5 border border-brand-500/20 flex items-start gap-3">
              <AlertCircle size={16} className="text-brand-400 mt-0.5 shrink-0" />
              <p className="text-slate-300 text-sm">
                You can only submit reviews for completed projects. No eligible projects at this time.
              </p>
            </div>
          ) : (
            <div className="space-y-5">
              <Select
                label="Select Project *"
                value={form.projectId}
                onChange={(e: any) => setForm({ ...form, projectId: e.target.value })}
                options={[
                  { value: "", label: "Choose a completed project..." },
                  ...completedProjectsWithoutReview.map((p) => ({ value: p.id, label: p.title })),
                ]}
              />

              {/* Star Rating */}
              <div>
                <label className="text-sm font-medium text-slate-300 block mb-3">Rating *</label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <motion.button
                      key={star}
                      whileHover={{ scale: 1.2 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => setRating(star)}
                      onMouseEnter={() => setHoveredRating(star)}
                      onMouseLeave={() => setHoveredRating(0)}
                      className="transition-all"
                    >
                      <Star
                        size={32}
                        className={`transition-all ${star <= (hoveredRating || rating) ? "text-gold-400 fill-gold-400" : "text-slate-600"}`}
                      />
                    </motion.button>
                  ))}
                </div>
                {rating > 0 && (
                  <p className="text-sm text-slate-400 mt-2">
                    {["", "Poor", "Fair", "Good", "Very Good", "Excellent"][rating]}
                  </p>
                )}
              </div>

              <Textarea
                label="Your Review *"
                placeholder="Share your experience working with King Praise Techz. What did you love? What could be improved?"
                value={form.comment}
                onChange={(e: any) => setForm({ ...form, comment: e.target.value })}
              />

              <div className="p-3 rounded-xl bg-white/3 border border-white/5 flex items-start gap-2">
                <AlertCircle size={14} className="text-slate-500 mt-0.5 shrink-0" />
                <p className="text-xs text-slate-500">
                  Your review will be submitted for admin approval before being published on our website.
                </p>
              </div>

              <Button
                variant="primary"
                size="lg"
                className="w-full"
                loading={submitting}
                icon={<Send size={16} />}
                onClick={handleSubmit}
              >
                Submit Review
              </Button>
            </div>
          )}
        </Card>

        {/* My Reviews */}
        <Card>
          <SectionHeader title="My Reviews" subtitle="Your submitted feedback" />
          {myReviews.length === 0 ? (
            <EmptyState
              icon={<Star size={24} />}
              title="No reviews yet"
              description="Complete a project and submit your first review"
            />
          ) : (
            <div className="space-y-4">
              {myReviews.map((review) => (
                <div key={review.id} className="p-4 rounded-xl bg-white/3 border border-white/5">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <p className="text-white font-medium text-sm">{review.projectName}</p>
                      <div className="flex gap-0.5 mt-1">
                        {Array(5).fill(0).map((_, i) => (
                          <Star key={i} size={12} className={i < review.rating ? "text-gold-400 fill-gold-400" : "text-slate-600"} />
                        ))}
                      </div>
                    </div>
                    <div className={`text-xs px-2 py-1 rounded-full font-medium ${review.status === "approved" ? "badge-success" : review.status === "rejected" ? "badge-danger" : "badge-warning"}`}>
                      {review.status === "approved" ? (
                        <span className="flex items-center gap-1"><CheckCircle2 size={10} />Published</span>
                      ) : review.status}
                    </div>
                  </div>
                  <p className="text-slate-400 text-sm leading-relaxed">{review.comment}</p>
                  <p className="text-slate-600 text-xs mt-2">{timeAgo(review.createdAt)}</p>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
