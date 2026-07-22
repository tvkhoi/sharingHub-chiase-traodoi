import React, { useEffect, useState } from 'react';
import { proposalsService } from '../services/proposals.service';
import { negotiationService } from '../services/negotiation.service';
import { socketService } from '../services/socket.service';
import type { Proposal, NegotiationMessage } from '../types';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { MessageSquare, Send, CheckCircle2, XCircle, Clock } from 'lucide-react';
import { createPortal } from 'react-dom';
import { getImageUrl, DEFAULT_ASSET_IMAGE } from '../utils/image';

export const ProposalsPage: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'received' | 'sent'>('received');
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Negotiation Drawer state
  const [selectedProposal, setSelectedProposal] = useState<Proposal | null>(null);
  const [messages, setMessages] = useState<NegotiationMessage[]>([]);
  const [newMessage, setNewMessage] = useState<string>('');
  const [loadingMessages, setLoadingMessages] = useState<boolean>(false);

  useEffect(() => {
    fetchProposals(false);

    // Continuous 3-second background polling to automatically sync proposal status (Cancel / Accept / Reject)
    const interval = setInterval(() => {
      fetchProposals(true);
    }, 3000);

    return () => clearInterval(interval);
  }, [activeTab]);

  // Real-time Chat Listener & Sync Effect
  useEffect(() => {
    if (!selectedProposal) return;

    // 1. Socket.io Realtime Listener
    socketService.joinRoom(selectedProposal.de_xuat_id);
    socketService.onNewMessage((newMsg) => {
      setMessages((prev) => {
        if (prev.some((m) => m.tin_nhan_id === newMsg.tin_nhan_id)) return prev;
        return [...prev, newMsg];
      });
    });

    // 2. Continuous Background Sync (3-second polling fallback)
    const interval = setInterval(async () => {
      try {
        const msgs = await negotiationService.getMessages(selectedProposal.de_xuat_id);
        setMessages(msgs);
      } catch {
        // Silent catch
      }
    }, 3000);

    return () => {
      socketService.leaveRoom();
      clearInterval(interval);
    };
  }, [selectedProposal]);

  const fetchProposals = async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      if (activeTab === 'received') {
        const res = await proposalsService.getReceivedProposals();
        setProposals(res);
      } else {
        const res = await proposalsService.getSentProposals();
        setProposals(res);
      }
    } catch (err) {
      console.error('Lỗi lấy danh sách đề xuất:', err);
    } finally {
      if (!silent) setLoading(false);
    }
  };

  const handleOpenNegotiation = async (prop: Proposal) => {
    setSelectedProposal(prop);
    setLoadingMessages(true);
    try {
      const msgs = await negotiationService.getMessages(prop.de_xuat_id);
      setMessages(msgs);
    } catch (err) {
      toast.error('Lỗi lấy tin nhắn thương lượng');
    } finally {
      setLoadingMessages(false);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProposal || !newMessage.trim()) return;

    try {
      const sentMsg = await negotiationService.sendMessage(selectedProposal.de_xuat_id, newMessage);
      setMessages((prev) => [...prev, sentMsg]);
      setNewMessage('');
    } catch (err) {
      toast.error('Gửi tin nhắn thất bại');
    }
  };

  const handleAcceptProposal = async (proposalId: string) => {
    try {
      await proposalsService.acceptProposal(proposalId);
      toast.success('Chấp nhận đề xuất thành công! Giao dịch đã được khởi tạo.');
      fetchProposals();
      if (selectedProposal?.de_xuat_id === proposalId) {
        setSelectedProposal(null);
      }
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Thao tác thất bại!';
      toast.error(msg);
    }
  };

  const handleRejectProposal = async (proposalId: string) => {
    try {
      await proposalsService.rejectProposal(proposalId);
      toast.success('Đã từ chối đề xuất này.');
      fetchProposals();
      if (selectedProposal?.de_xuat_id === proposalId) {
        setSelectedProposal(null);
      }
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Thao tác thất bại!';
      toast.error(msg);
    }
  };

  const renderStatusBadge = (status: string) => {
    switch (status) {
      case 'DA_CHAP_NHAN':
        return <span className="badge badge-emerald flex items-center gap-1"><CheckCircle2 className="w-3.5 h-3.5" /> Đã chấp nhận</span>;
      case 'TU_CHOI':
        return <span className="badge badge-rose flex items-center gap-1"><XCircle className="w-3.5 h-3.5" /> Đã từ chối</span>;
      case 'DA_HUY':
        return <span className="badge badge-rose flex items-center gap-1"><XCircle className="w-3.5 h-3.5" /> Đã hủy giao dịch</span>;
      case 'DANG_THUONG_LUONG':
        return <span className="badge badge-indigo flex items-center gap-1"><MessageSquare className="w-3.5 h-3.5" /> Đang thương lượng</span>;
      default:
        return <span className="badge badge-amber flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> Chờ xử lý</span>;
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-extrabold text-primary">Quản Lý Đề Xuất & Thương Lượng</h1>
          <p className="text-sm text-secondary">Theo dõi các đề xuất nhận/trao đổi tài sản và thương lượng trực tiếp</p>
        </div>

        {/* Tab switcher */}
        <div className="flex items-center w-full md:w-auto gap-1 p-1.5 glass-panel rounded-xl">
          <button
            onClick={() => setActiveTab('received')}
            className={`flex-1 md:flex-none px-3 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all ${
              activeTab === 'received' ? 'bg-indigo-600 text-white shadow-md' : 'text-secondary hover:text-primary'
            }`}
          >
            Đề xuất nhận được
          </button>
          <button
            onClick={() => setActiveTab('sent')}
            className={`flex-1 md:flex-none px-3 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all ${
              activeTab === 'sent' ? 'bg-indigo-600 text-white shadow-md' : 'text-secondary hover:text-primary'
            }`}
          >
            Đề xuất đã gửi
          </button>
        </div>
      </div>

      {loading ? (
        <div className="space-y-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="glass-card p-6 h-28 animate-pulse rounded-2xl" />
          ))}
        </div>
      ) : proposals.length === 0 ? (
        <div className="glass-card text-center py-16 px-4">
          <MessageSquare className="w-16 h-16 text-muted mx-auto mb-4 opacity-50" />
          <h3 className="text-xl font-bold text-primary mb-1">
            {activeTab === 'received' ? 'Chưa nhận được đề xuất nào' : 'Bạn chưa gửi đề xuất nào'}
          </h3>
          <p className="text-sm text-secondary">
            {activeTab === 'received'
              ? 'Khi có thành viên đề xuất nhận/trao đổi bài đăng tài sản của bạn, danh sách sẽ hiển thị ở đây.'
              : 'Hãy khám phá bảng tin và chọn bài đăng tài sản phù hợp để gửi đề xuất nhé.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {proposals.map((prop) => (
            <div key={prop.de_xuat_id} className="glass-card p-6 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="flex items-start gap-4">
                <div className="w-16 h-16 rounded-xl overflow-hidden bg-gray-900 flex-shrink-0">
                  <img
                    src={getImageUrl(prop.bai_dang?.hinh_anh?.[0]?.duong_dan_anh)}
                    alt={prop.bai_dang?.ten_tai_san || 'Asset'}
                    className="w-full h-full object-cover text-transparent"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = DEFAULT_ASSET_IMAGE;
                    }}
                  />
                </div>

                <div>
                  <div className="flex items-center gap-2 mb-1">
                    {renderStatusBadge(prop.trang_thai)}
                    <span className="text-xs text-muted">
                      {new Date(prop.ngay_gui).toLocaleDateString('vi-VN')}
                    </span>
                  </div>

                  <h3 className="font-bold text-lg text-primary">
                    {prop.bai_dang?.ten_tai_san || 'Bài đăng tài sản'}
                  </h3>

                  <p className="text-sm text-secondary mt-1">
                    <span className="font-medium text-primary">Yêu cầu:</span> {prop.so_luong_yeu_cau} sản phẩm.
                    {prop.tai_san_doi_ung && (
                      <span className="ml-2 font-medium text-brand-emerald">
                        (Đổi lấy: {prop.tai_san_doi_ung})
                      </span>
                    )}
                  </p>

                  {prop.loi_nhan && (
                    <p className="text-xs text-muted italic mt-1">
                      "{prop.loi_nhan}"
                    </p>
                  )}

                  {prop.ly_do_tu_choi && (prop.trang_thai === 'TU_CHOI' || prop.trang_thai === 'DA_HUY') && (
                    <p className="text-xs text-brand-rose italic mt-1 font-semibold">
                      Lý do hủy/từ chối: "{prop.ly_do_tu_choi}"
                    </p>
                  )}
                </div>
              </div>

              {/* Action Toolbar */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3 w-full md:w-auto mt-2 md:mt-0">
                <button
                  onClick={() => handleOpenNegotiation(prop)}
                  className="btn btn-outline text-sm w-full sm:w-auto justify-center"
                >
                  <MessageSquare className="w-4 h-4 text-brand-primary" />
                  Thương lượng trực tiếp
                </button>

                {activeTab === 'received' && prop.trang_thai !== 'DA_CHAP_NHAN' && prop.trang_thai !== 'TU_CHOI' && prop.trang_thai !== 'DA_HUY' && (
                  <div className="flex items-center gap-2 w-full sm:w-auto">
                    <button
                      onClick={() => handleAcceptProposal(prop.de_xuat_id)}
                      className="btn btn-emerald text-sm flex-1 sm:flex-none justify-center"
                    >
                      Chấp nhận
                    </button>
                    <button
                      onClick={() => handleRejectProposal(prop.de_xuat_id)}
                      className="btn btn-danger text-sm flex-1 sm:flex-none justify-center"
                    >
                      Từ chối
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Drawer / Modal: Negotiation Room */}
      {selectedProposal && createPortal(
        <div className="fixed inset-0 z-[100] bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="glass-panel max-w-2xl w-full h-[90vh] max-h-[700px] p-4 sm:p-6 rounded-3xl border border-color shadow-2xl flex flex-col justify-between animate-fade-in">
            {/* Room Header */}
            <div className="pb-4 border-b border-color flex items-center justify-between">
              <div>
                <h3 className="font-bold text-lg text-primary">
                  Thương lượng với: <span className="text-brand-primary">
                    {activeTab === 'received' 
                      ? selectedProposal.nguoi_gui?.ho_so?.ho_ten || 'Người gửi' 
                      : selectedProposal.bai_dang?.chu_so_huu?.ho_so?.ho_ten || 'Chủ bài đăng'}
                  </span>
                </h3>
                <p className="text-xs text-secondary mt-1">
                  Bài đăng: <span className="font-semibold text-primary">{selectedProposal.bai_dang?.ten_tai_san}</span>
                </p>
              </div>

              <button
                onClick={() => setSelectedProposal(null)}
                className="btn btn-outline text-xs px-3 py-1.5"
              >
                Đóng
              </button>
            </div>

            {/* Chat Timeline */}
            <div className="flex-1 overflow-y-auto py-4 px-2 space-y-2">
              {loadingMessages ? (
                <div className="text-center py-8 text-muted">Đang tải tin nhắn...</div>
              ) : messages.length === 0 ? (
                <div className="text-center py-8 text-muted text-sm">Chưa có tin nhắn thương lượng. Hãy bắt đầu nhắn tin!</div>
              ) : (
                messages.map((msg) => {
                  const isMine = msg.nguoi_gui_id === user?.nguoi_dung_id;
                  
                  const senderAvatar = isMine 
                    ? user?.ho_so?.anh_dai_dien 
                    : msg.nguoi_gui?.ho_so?.anh_dai_dien;
                    
                  const senderName = isMine 
                    ? user?.ho_so?.ho_ten 
                    : msg.nguoi_gui?.ho_so?.ho_ten;
                    
                  const initial = senderName?.charAt(0).toUpperCase() || 'U';

                  return (
                    <div
                      key={msg.tin_nhan_id}
                      className={`flex w-full ${isMine ? 'justify-end' : 'justify-start'} mb-4`}
                    >
                      <div className={`flex items-end gap-2 max-w-[85%] ${isMine ? 'flex-row-reverse' : 'flex-row'}`}>
                        {/* Avatar */}
                        <div className="w-8 h-8 rounded-full bg-slate-600 flex-shrink-0 flex items-center justify-center overflow-hidden shadow-sm">
                          {senderAvatar ? (
                            <img src={senderAvatar} alt="Avatar" className="w-full h-full object-cover" />
                          ) : (
                            <span className="text-xs text-white font-bold">{initial}</span>
                          )}
                        </div>

                        {/* Bubble */}
                        <div className={`flex flex-col ${isMine ? 'items-end' : 'items-start'}`}>
                          <span className={`text-[10px] text-muted mb-1 px-1 font-semibold ${isMine ? 'text-right' : 'text-left'}`}>
                            {isMine ? 'Bạn' : senderName || 'Người gửi'}
                          </span>
                          <div
                            className={`px-4 py-2.5 rounded-2xl text-sm shadow-md ${
                              isMine
                                ? 'bg-indigo-600 text-white rounded-br-sm'
                                : 'bg-slate-700 text-white rounded-bl-sm'
                            }`}
                          >
                            {msg.noi_dung}
                          </div>
                          <span className="text-[10px] text-muted mt-1 px-1">
                            {new Date(msg.thoi_gian_gui).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Message Input */}
            <form onSubmit={handleSendMessage} className="pt-3 border-t border-color flex gap-2">
              <input
                type="text"
                placeholder="Nhập nội dung nhắn tin thương lượng..."
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                className="form-input flex-1"
              />
              <button type="submit" className="btn btn-primary px-5">
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};
