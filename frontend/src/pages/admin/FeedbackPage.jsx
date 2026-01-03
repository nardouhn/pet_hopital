import { useState, useEffect } from 'react';
import { Star, Plus, ArrowLeft } from 'lucide-react';
import { getFeedbackList, getFeedbackStats, updateFeedbackStatus } from '@/api/mockApi';

export default function FeedbacksPage() {
  const [feedbackList, setFeedbackList] = useState([]);
  const [viewAll, setViewAll] = useState(false);
  const [stats, setStats] = useState({
    total: 0,
    fiveStars: 0,
    lowRating: 0,
    satisfaction: 0
  });

  useEffect(() => {
    loadFeedback();
  }, []);

  const loadFeedback = async () => {
    try {
      const [listData, statsData] = await Promise.all([
        getFeedbackList(),
        getFeedbackStats()
      ]);
      // Map backend shape to UI-friendly shape
      const mapped = (listData || []).map(f => ({
        id: f.feedback_id || f.id,
        feedbackId: f.feedback_id || f.id,
        userName: f.user_name || f.userName || f.email || 'Unknown',
        petName: f.pet_name || f.petName || '-',
        rating: Number(f.rating) || 0,
        comment: f.content || f.comment || '',
        status: f.status || 'Hidden',
        createdAt: f.created_at || f.createdAt || null
      }));
      setFeedbackList(mapped);
      
      // Map backend stats keys to UI keys
      setStats({
        total: statsData.totalFeedback || statsData.total || 0,
        fiveStars: statsData.ratingHigh || statsData.fiveStars || 0,
        lowRating: statsData.ratingLow || statsData.lowRating || 0,
        satisfaction: statsData.satisfaction || 0
      });
    } catch (error) {
      console.error('Error loading feedback:', error);
      setFeedbackList([]);
      setStats({ total: 0, fiveStars: 0, lowRating: 0, satisfaction: 0 });
    }
  };

  const toggleFeedbackStatus = async (feedbackId, currentStatus) => {
    const newStatus = currentStatus === 'Show' ? 'Hidden' : 'Show';
    try {
      await updateFeedbackStatus(feedbackId, newStatus);
      // Update local state
      setFeedbackList((prev) => prev.map(f => f.feedbackId === feedbackId ? { ...f, status: newStatus } : f));
    } catch (err) {
      console.error('Failed to update feedback status', err);
      window.alert('Cập nhật trạng thái thất bại: ' + (err.message || 'Lỗi máy chủ'));
    }
  };

  const displayedFeedback = viewAll ? feedbackList : feedbackList.slice(0, 3);

  return (
    <div className="p-6">
      {/* Header */}
      {viewAll && (
        <button
          onClick={() => setViewAll(false)}
          className="flex items-center gap-2 text-teal-600 hover:text-teal-700 mb-4"
        >
          <ArrowLeft className="size-4" />
          <span className="text-sm">Quay lại</span>
        </button>
      )}

      {/* <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl text-gray-900 mb-1">
            {viewAll ? 'Toàn bộ feedback' : 'Feedback'}
          </h1>
          <p className="text-sm text-gray-600">
            {viewAll ? '' : 'Đánh giá mới nhất từ tổng của khách hàng'}
          </p>
        </div>
        {!viewAll && (
          <button className="flex items-center gap-2 bg-teal-500 text-white px-6 py-2.5 rounded-lg hover:bg-teal-600 transition-all">
            <Plus className="size-5" />
            <span>Thêm</span>
          </button>
        )}
      </div> */}

      {/* Stats Cards */}
      {!viewAll && (
        <div className="grid grid-cols-4 gap-4 mb-8">
          {/* Total */}
          <div className="bg-teal-50 rounded-2xl p-6">
            <div className="text-sm text-gray-600 mb-2">Tổng số</div>
            <div className="text-4xl text-gray-900">{stats.total}</div>
          </div>

          {/* 5 Stars */}
          <div className="bg-teal-50 rounded-2xl p-6">
            <div className="text-sm text-gray-600 mb-2">Số lượng 4-5</div>
            <div className="text-4xl text-gray-900">{stats.fiveStars}</div>
          </div>

          {/* 1-3 Stars */}
          <div className="bg-teal-50 rounded-2xl p-6">
            <div className="text-sm text-gray-600 mb-2">Số lượng 1-3</div>
            <div className="text-4xl text-gray-900">{stats.lowRating}</div>
          </div>

          {/* Satisfaction */}
          <div className="bg-pink-50 rounded-2xl p-6">
            <div className="text-sm text-gray-600 mb-2">Mức độ hài lòng</div>
            <div className="text-4xl text-pink-600">{stats.satisfaction}%</div>
          </div>
        </div>
      )}

      {/* Section Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg text-gray-900">
          {viewAll ? '' : 'Feedback gần đây'}
        </h2>
        {!viewAll && (
          <button
            onClick={() => setViewAll(true)}
            className="text-sm text-teal-600 hover:text-teal-700 flex items-center gap-1"
          >
            <span>Xem thêm</span>
            <span>→</span>
          </button>
        )}
      </div>

      {/* Feedback Grid or Table */}
      {viewAll ? (
        <div className="bg-white rounded-2xl p-4 border border-gray-100">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-xs text-gray-600 uppercase bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left">User</th>
                  <th className="px-4 py-3 text-left">Content</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Created At</th>
                  <th className="px-4 py-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {feedbackList.map((fb) => (
                  <tr key={fb.feedbackId} className="border-t">
                    <td className="px-4 py-3">{fb.userName}</td>
                    <td className="px-4 py-3 max-w-xl line-clamp-2">{fb.comment}</td>
                    <td className="px-4 py-3 text-center">
                      <button onClick={() => toggleFeedbackStatus(fb.feedbackId, fb.status)} className={`text-xs px-3 py-1 rounded-full ${fb.status === 'Show' ? 'bg-teal-100 text-teal-700' : 'bg-yellow-100 text-yellow-700'}`}>
                        {fb.status}
                      </button>
                    </td>
                    <td className="px-4 py-3">{fb.createdAt ? new Date(fb.createdAt).toLocaleString() : '-'}</td>
                    <td className="px-4 py-3">
                      <button onClick={() => toggleFeedbackStatus(fb.feedbackId, fb.status)} className="text-sm text-teal-600">Toggle</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-6">
          {displayedFeedback.map((feedback) => (
            <FeedbackCard key={feedback.id} feedback={feedback} onToggleStatus={toggleFeedbackStatus} />
          ))}
        </div>
      )}
    </div>
  );
}

function FeedbackCard({ feedback, onToggleStatus }) {
  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-6 hover:shadow-lg transition-all">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="text-sm text-gray-900">{feedback.feedbackId}</div>
        <button onClick={() => onToggleStatus && onToggleStatus(feedback.feedbackId, feedback.status)} className={`text-xs px-3 py-1 rounded-full ${feedback.status === 'Show' ? 'bg-teal-100 text-teal-700' : 'bg-yellow-100 text-yellow-700'}`}>
          {feedback.status}
        </button>
      </div>

      {/* Stars */}
      <div className="flex gap-1 mb-4">
        {[...Array(5)].map((_, i) => (
          <Star 
            key={i} 
            className={`size-4 ${
              i < feedback.rating 
                ? 'text-yellow-400 fill-yellow-400' 
                : 'text-gray-300'
            }`} 
          />
        ))}
      </div>

      {/* Pet Info */}
      <div className="mb-4">
        <div className="flex items-center justify-between text-sm mb-1">
          <span className="text-gray-600">Pet Name:</span>
          <span className="text-gray-900">{feedback.petName}</span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600">Owner:</span>
          <span className="text-gray-900">{feedback.userName}</span>
        </div>
      </div>

      {/* Comment */}
      <p className="text-sm text-gray-700 mb-6 line-clamp-3 italic">
        "{feedback.comment}"
      </p>

      {/* Detail Button */}
      {/* <button className="w-full bg-teal-500 text-white py-2.5 rounded-lg hover:bg-teal-600 transition-all text-sm">
        Detail
      </button> */}
    </div>
  );
}