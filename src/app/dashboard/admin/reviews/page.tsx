"use client";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Star, CheckCircle2, XCircle, Clock, Eye } from "lucide-react";
import { StatsCard, Badge, SectionHeader, Card, Button, Modal, EmptyState, Skeleton } from "@/components/ui";
import { reviewsAPI } from "@/lib/api";
import { Review } from "@/types";
import { timeAgo, formatDate } from "@/lib/utils";
import toast from "react-hot-toast";

export default function AdminReviewsPage() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "pending" | "approved" | "rejected">("all");
  const [selectedReview, setSelectedReview] = useState<Review | null>(null);
  const [processing, setProcessing] = useState<string | null>(null);

  useEffect(() => { fetchReviews(); }, []);

  const fetchReviews = async () => {
    try {
      const res = await reviewsAPI.getAll();
      setReviews(res.data.reviews || []);
    } catch {
      setReviews([]);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id: string) => {
    setProcessing(id);
    try {
      await reviewsAPI.approve(id);
      setReviews((prev) => prev.map((r) => r.id === id ? { ...r, status: "approved" } : r));
      toast.success("Review approved and published to website!");
      if (selectedReview?.id === id) setSelectedReview(null);
    } catch {
      toast.error("Failed to approve review");
    } finally {
      setProcessing(null);
    }
  };

  const handleReject = async (id: string) => {
    setProcessing(id);
    try {
      await reviewsAPI.reject(id);
      setReviews((prev) => prev.map((r) => r.id === id ? { ...r, status: "rejected" } : r));
      toast.success("Review rejected");
      if (selectedReview?.id === id) setSelectedReview(null);
    } catch {
      toast.error("Failed to reject review");
    } finally {
      setProcessing(null);
    }
  };

  const filtered = filter === "all" ? reviews : reviews.filter((r) => r.status === filter);
  const pending = reviews.filter((r) => r.status === "pending");
  const approved = reviews.filter((r) => r.status === "approved");

  const StarRating = ({ rating }: { rating: number }) => (
    <div className="flex gap-0.5">
      {Array(5).fill(0).map((_, i) => (
        <Star key={i} size={14} className={i < rating ? "text-gold-400 fill-gold-400" : "text-slate-600"} />
      ))}
    </div>
  );

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="font-display font-bold text-3xl text-white">Client Reviews</h1>
        <p className="text-slate-400 mt-1">Review and approve client feedback for website publication</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatsCard title="Total Reviews" value={reviews.length} icon={<Star size={20} />} iconBg="bg-gold-500/15" iconColor="text-gold-400" glowColor="rgba(245,158,11,0.2)" />
        <StatsCard title="Pending Approval" value={pending.length} icon={<Clock size={20} />} iconBg="bg-orange-500/15" iconColor="text-orange-400" glowColor="rgba(249,115,22,0.2)" />
        <StatsCard title="Published" value={approved.length} icon={<CheckCircle2 size={20} />} iconBg="bg-emerald-500/15" iconColor="text-emerald-400" glowColor="rgba(16,185,129,0.2)" />
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 flex-wrap">
        {(["all", "pending", "approved", "rejected"] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all capitalize ${filter === f ? "bg-brand-500/20 text-brand-300 border border-brand-500/30" : "glass-card text-slate-400 hover:text-white border border-white/5"}`}
          >
            {f} {f === "pending" ? `(${pending.length})` : f === "approved" ? `(${approved.length})` : ""}
          </button>
        ))}
      </div>

      {/* Reviews Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {Array(6).fill(0).map((_, i) => <Skeleton key={i} className="h-48" />)}
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState icon={<Star size={28} />} title="No reviews found" description={`No ${filter === "all" ? "" : filter} reviews yet`} />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map((review, i) => (
            <motion.div
              key={review.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="glass-card p-5 card-hover"
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-brand-500/20 flex items-center justify-center text-brand-400 font-bold font-display">
                    {review.clientName[0]}
                  </div>
                  <div>
                    <p className="text-white font-semibold text-sm">{review.clientName}</p>
                    <p className="text-slate-500 text-xs">{review.projectName}</p>
                  </div>
                </div>
                <Badge variant={review.status === "approved" ? "success" : review.status === "rejected" ? "danger" : "warning"}>
                  {review.status}
                </Badge>
              </div>

              <StarRating rating={review.rating} />
              <p className="text-slate-300 text-sm mt-3 leading-relaxed line-clamp-3">{review.comment}</p>
              <p className="text-slate-500 text-xs mt-3">{timeAgo(review.createdAt)}</p>

              {review.status === "pending" && (
                <div className="flex gap-2 mt-4">
                  <Button
                    variant="primary"
                    size="sm"
                    className="flex-1"
                    loading={processing === review.id}
                    onClick={() => handleApprove(review.id)}
                    icon={<CheckCircle2 size={14} />}
                  >
                    Approve
                  </Button>
                  <Button
                    variant="danger"
                    size="sm"
                    className="flex-1"
                    loading={processing === review.id}
                    onClick={() => handleReject(review.id)}
                    icon={<XCircle size={14} />}
                  >
                    Reject
                  </Button>
                </div>
              )}

              {review.status !== "pending" && (
                <button
                  onClick={() => setSelectedReview(review)}
                  className="mt-4 text-sm text-slate-400 hover:text-white flex items-center gap-1 transition-colors"
                >
                  <Eye size={14} />View full review
                </button>
              )}
            </motion.div>
          ))}
        </div>
      )}

      {/* Review Detail Modal */}
      <Modal open={!!selectedReview} onClose={() => setSelectedReview(null)} title="Review Details" size="md">
        {selectedReview && (
          <div className="space-y-4">
            <div className="flex items-center gap-4 p-4 rounded-xl bg-white/3">
              <div className="w-12 h-12 rounded-xl bg-brand-500/20 flex items-center justify-center text-brand-400 font-bold font-display text-lg">
                {selectedReview.clientName[0]}
              </div>
              <div>
                <p className="text-white font-semibold">{selectedReview.clientName}</p>
                <p className="text-slate-400 text-sm">{selectedReview.projectName}</p>
                <div className="flex gap-0.5 mt-1">
                  {Array(5).fill(0).map((_, i) => (
                    <Star key={i} size={14} className={i < selectedReview.rating ? "text-gold-400 fill-gold-400" : "text-slate-600"} />
                  ))}
                </div>
              </div>
            </div>
            <div className="p-4 rounded-xl bg-white/3 border border-white/5">
              <p className="text-slate-300 text-sm leading-relaxed">{selectedReview.comment}</p>
            </div>
            <p className="text-slate-500 text-xs">Submitted {timeAgo(selectedReview.createdAt)}</p>
          </div>
        )}
      </Modal>
    </div>
  );
}
