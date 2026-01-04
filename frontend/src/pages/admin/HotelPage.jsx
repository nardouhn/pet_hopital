import { useState, useEffect } from 'react';
import { Home, Calendar, DollarSign, Users, Plus, CalendarCheck, ArrowLeft } from 'lucide-react';
import { createPortal } from 'react-dom';
import { api, getHotelRooms as fetchHotelRooms, getHotelBookings as fetchHotelBookings } from '@/api/mockApi';
import svgPaths from '@/assets/svg-m4bne1t8yn';
import toast from "react-hot-toast";


export default function HotelPage() {
  const [bookings, setBookings] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showInvoiceHistory, setShowInvoiceHistory] = useState(false);
  const [checkoutTimes, setCheckoutTimes] = useState({});
  
  // Form state
  const [formData, setFormData] = useState({
    ownerEmail: '',
    petName: '',
    visitDate: '',
    roomType: '',
    description: ''
  });

  // Room prices and invoices are fetched from backend APIs now (no mock data)

  useEffect(() => {
    let mounted = true;
    Promise.all([
      fetchHotelBookings(),
      fetchHotelRooms()
    ]).then(([bookingsData = [], roomsData = []]) => {
      if (!mounted) return;
      setBookings(bookingsData);
      setRooms(roomsData);
    }).catch((err) => {
      console.error('Failed to load hotel data', err);
    }).finally(() => {
      if (mounted) setLoading(false);
    });

    return () => { mounted = false; };
  }, []);

  const roomPrices = [
    { name: 'Phòng Tiêu Chuẩn - Thú nhỏ', price: 120000 },
    { name: 'Phòng Tiêu Chuẩn - Thú vừa', price: 150000 },
    { name: 'Phòng Tiêu Chuẩn - Thú lớn', price: 180000 },
    { name: 'Phòng Thoáng Mát Có Quạt', price: 200000 },
    { name: 'Phòng Điều Hòa Cơ Bản', price: 250000 },
    { name: 'Phòng Điều Hòa Cao Cấp', price: 300000 },
    { name: 'Phòng VIP Riêng Biệt', price: 350000 },
    { name: 'Phòng VIP Có Camera Giám Sát', price: 400000 },
    { name: 'Phòng Luxury - Không Gian Rộng', price: 450000 },
    { name: 'Phòng Suite Đặc Biệt 5 Sao', price: 500000 }
  ];

  // Calculate statistics from backend data
  const currentBookings = bookings.filter(b => !b.checkOut);
  const totalRooms = rooms.length * 10; // Assuming each room can accommodate 10 pets
  const occupiedRooms = new Set(currentBookings.map(b => b.pethouse)).size;
  const currentPetsInClinic = currentBookings.length;

  // Calculate revenue (sum of invoice totals)
  const totalRevenue = bookings.reduce((sum, b) => sum + (Number(b.total) || 0), 0);

  // Format currency
  const formatCurrency = (amount) => {
    return (Number(amount) || 0).toLocaleString('vi-VN') + 'đ';
  };

  // Format date/time for display
  const formatDate = (dateStr) => {
    try {
      if (!dateStr) return '-';
      return new Date(dateStr).toLocaleString('vi-VN');
    } catch (e) {
      return dateStr || '-';
    }
  };

  // Handle checkout (UI only for now)

  // Handle adding new booking
  const handleAddBooking = () => {
    if (!formData.ownerEmail || !formData.petName || !formData.visitDate || !formData.roomType) {
      toast.error('Vui lòng điền đầy đủ thông tin bắt buộc!');
      return;
    }

    // Format the visit date
    const visitDate = new Date(formData.visitDate);
    const checkInFormatted = visitDate.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });

    // Calculate checkout date (7 days later for example)
    const checkOutDate = new Date(visitDate);
    checkOutDate.setDate(checkOutDate.getDate() + 7);
    const checkOutFormatted = checkOutDate.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });

    // Find the price for the selected room type
    const selectedRoom = roomPrices.find(room => room.name === formData.roomType);
    const price = selectedRoom ? selectedRoom.price : 250000;

    // Generate a random room number
    const roomNumber = `B-${Math.floor(Math.random() * 300) + 200}`;

    // Create new booking object
    const newBooking = {
      id: Date.now(), // Unique ID
      petName: formData.petName,
      ownerName: formData.ownerEmail,
      bookingType: 'current',
      checkIn: checkInFormatted,
      checkOut: null,
      roomNumber: roomNumber,
      price: price,
      roomType: formData.roomType,
      description: formData.description
    };

    // Add to bookings array
    setBookings([newBooking, ...bookings]);

    toast.success('Đơn đặt phòng đã được thêm thành công!');
    
    // Reset form
    setFormData({
      ownerEmail: '',
      petName: '',
      visitDate: '',
      roomType: '',
      description: ''
    });
    
    setShowAddModal(false);
  };
  



  const handleCheckout = (bookingId) => {
    const now = new Date();
    const formattedTime = now.toLocaleString('vi-VN');
    setCheckoutTimes({
      ...checkoutTimes,
      [bookingId]: formattedTime
    });
    toast.success('Check-out thành công!');
  };

  const getRoomStatusColor = (status) => {
    switch (status) {
      case 'Occupied':
        return 'bg-teal-100 border-teal-300';
      case 'Reserved':
        return 'bg-blue-100 border-blue-300';
      case 'Available':
        return 'bg-white border-gray-200';
      default:
        return 'bg-gray-100 border-gray-200';
    }
  };

  const getRoomStatusTextColor = (status) => {
    switch (status) {
      case 'Occupied':
        return 'text-teal-700';
      case 'Reserved':
        return 'text-blue-700';
      case 'Available':
        return 'text-gray-500';
      default:
        return 'text-gray-500';
    }
  };

  if (loading) {
    return <div className="p-6">Loading...</div>;
  }

  // If showing invoice history, render invoice view
  if (showInvoiceHistory) {
    return (
      <div className="p-6 space-y-6 bg-[#f8fafb] min-h-screen">
        {/* Header with Back Button */}
        <div className="flex items-center gap-4 mb-6">
          <button
            onClick={() => setShowInvoiceHistory(false)}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="size-5 text-gray-700" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Hóa đơn Pet Hotel</h1>
            <p className="text-sm text-gray-500 mt-1">Quản lý các hóa đơn dịch vụ khách sạn thú cưng</p>
          </div>
        </div>

        {/* Invoice List (from backend bookings/invoices) */}
        <div className="space-y-3">
          {bookings.map((inv, idx) => (
            <div
              key={`${inv.petName || 'inv'}-${idx}`}
              className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start gap-4">
                {/* Pet Avatar */}
                <div className="size-10 rounded-full bg-gradient-to-br from-teal-400 to-blue-400 flex items-center justify-center flex-shrink-0">
                  <span className="text-white font-semibold">
                    {(inv.petName || '-').charAt(0)}
                  </span>
                </div>

                {/* Invoice Details Grid */}
                <div className="flex-1 grid grid-cols-6 gap-4 items-center">
                  {/* Name & Owner */}
                  <div>
                    <p className="font-semibold text-gray-900">{inv.petName}</p>
                    <p className="text-xs text-gray-500">{inv.user_name || inv.ownerName || '-'}</p>
                  </div>

                  {/* Check-in */}
                  <div>
                    <p className="text-xs text-gray-500 mb-1">📅 Check-in</p>
                    <p className="text-xs text-gray-700">{formatDate(inv.check_in || inv.checkIn)}</p>
                  </div>

                  {/* Check-out */}
                  <div>
                    <p className="text-xs text-gray-500 mb-1">📅 Check-out</p>
                    <p className="text-xs text-gray-700">{formatDate(inv.check_out || inv.checkOut)}</p>
                  </div>

                  {/* Days */}
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Số ngày</p>
                    <p className="text-xs text-gray-700">{inv.days}</p>
                  </div>

                  {/* Room Type */}
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Loại phòng</p>
                    <p className="text-xs text-gray-700">{inv.pethouse}</p>
                  </div>

                  {/* Total */}
                  <div className="text-right">
                    <p className="text-xs text-gray-500 mb-1">Tổng tiền</p>
                    <p className="font-bold text-gray-900">{formatCurrency(inv.total)}</p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }



  
  
  return (
    <div className="p-6 space-y-6 bg-[#f8fafb] min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Khách sạn thú cưng</h1>
          <p className="text-sm text-gray-500 mt-1">Chào mừng đến với khách sạn thú cưng</p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-teal-500 text-white rounded-lg hover:bg-teal-600 transition-colors"
          >
            <Plus className="size-4" />
            Thêm đơn
          </button>
          
          <button 
            onClick={() => setShowInvoiceHistory(true)}
            className="flex items-center gap-2 px-4 py-2.5 border border-teal-500 text-teal-600 rounded-lg hover:bg-teal-50 transition-colors"
          >
            <Calendar className="size-4" />
            Lịch sử hóa đơn
          </button>
          
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Pets in Clinic / Total Rooms */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-start justify-between mb-4">
            <div className="p-3 bg-purple-50 rounded-xl">
              <Users className="size-6 text-purple-600" />
            </div>
          </div>
          <p className="text-sm text-gray-600 mb-2">Thú cưng / Số phòng</p>
          <p className="text-3xl font-bold text-gray-900">{currentPetsInClinic}/{totalRooms}</p>
        </div>

        {/* Total Revenue */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-start justify-between mb-4">
            <div className="p-3 bg-green-50 rounded-xl">
              <DollarSign className="size-6 text-green-600" />
            </div>
          </div>
          <p className="text-sm text-gray-600 mb-2">Tổng doanh thu</p>
          <p className="text-3xl font-bold text-gray-900">{formatCurrency(totalRevenue)}</p>
        </div>

        
      </div>

      {/* Two Column Layout - Pets in Clinic and Room Prices */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pets in Clinic - Left Column */}
        <div className="bg-white rounded-lg p-6 shadow-sm border border-[#e5e7eb]">
          <h2 className="text-lg font-bold text-[#1f2937] mb-6">Đang thuê</h2>

          {/* Scrollable area */}
          <div className="space-y-4 max-h-[620px] overflow-y-auto pr-2">
            {currentBookings.length === 0 ? (
              <p className="text-sm text-gray-500 text-center py-8">
                Không có thú cưng nào
              </p>
            ) : (
              currentBookings.map((booking, idx) => (
                <div
                  key={`${booking.petName ||  'b'}-${idx}`}
                  className="border border-[#e5e7eb] rounded-lg p-4 relative hover:shadow-md transition-shadow"
                >
                  <h3 className="font-bold text-[#1f2937] text-sm mb-2">
                    {booking.petName || booking.pet_name|| "-"} -{" "}
                    {booking.ownerName ||
                    booking.user_name ||
                    booking.customer_name ||
                    booking.userName ||
                    booking.username ||
                    booking.owner_name ||
                    booking.customer?.name ||
                    booking.user_name ||
                    "-"}
                  </h3>



                  <p className="text-xs text-[#4b5563] mb-3">
                    {booking.pethouse || '-'}
                  </p>

                  <button
                    className={`absolute right-3 top-3 rounded-full px-3 py-1 transition-colors ${
                      checkoutTimes[`${booking.petName || ''}-${idx}`]
                        ? 'bg-[#fee2e2] hover:bg-[#fecaca]'
                        : 'bg-[#dcfce7] hover:bg-[#bbf7d0]'
                    }`}
                  >
                    {checkoutTimes[`${booking.petName || ''}-${idx}`] ? (
                      <div className="flex flex-col items-end">
                        <span className="text-xs text-[#991b1b] font-semibold">
                          Check-out
                        </span>
                        <span className="text-[10px] text-[#991b1b]">
                          {checkoutTimes[`${booking.petName || ''}-${idx}`]}
                        </span>
                      </div>
                    ) : (
                      <span className="text-xs text-[#15803d]">Checked In</span>
                    )}
                  </button>

                  <div className="flex items-center gap-2 mt-2">
                    <svg className="size-3" fill="none" viewBox="0 0 11.4423 11.4423">
                      <g>
                        <path d="M3.81485 0.954127V2.86118" stroke="#4B5563" strokeWidth="0.95" />
                        <path d="M7.62896 0.954127V2.86118" stroke="#4B5563" strokeWidth="0.95" />
                        <path d={svgPaths.p3d996180} stroke="#4B5563" strokeWidth="0.95" />
                        <path d="M1.43104 4.76823H10.0128" stroke="#4B5563" strokeWidth="0.95" />
                      </g>
                    </svg>
                    <span className="text-xs text-[#4b5563]">
                      {formatDate(booking.check_in || booking.checkIn)} -{' '}
                      {formatDate(booking.check_out || booking.checkOut)}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>


        {/* Room Prices - Right Column */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900 mb-6">Bảng giá phòng/ngày</h2>
          <div className="space-y-2">
            {rooms.map((room, index) => (
              <div
                key={room.hotel_id || `${room.name}-${index}`}
                className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors border border-gray-100"
              >
                <div className="flex items-center gap-3">
                  <div className="size-8 rounded-lg bg-gradient-to-br from-purple-100 to-pink-100 flex items-center justify-center flex-shrink-0">
                    <Home className="size-4 text-purple-600" />
                  </div>
                  <span className="text-sm text-gray-700">{room.name}</span>
                </div>
                <span className="font-semibold text-teal-600">{formatCurrency(room.price)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Add Booking Modal */}
      {showAddModal && createPortal(
        <div className="fixed inset-0 bg-[rgba(0,0,0,0.4)] flex items-center justify-center p-4 z-50">
          <div className="bg-[rgba(210,255,250,0.95)] rounded-3xl shadow-2xl w-full max-w-xl relative">
            {/* Header */}
            <div className="text-center py-6 border-b border-teal-200">
              <h2 className="text-2xl font-bold text-[#143937]">Thêm đơn khách sạn thú cưng</h2>
            </div>
            
            {/* Form */}
            <div className="bg-white rounded-2xl m-6 p-6 border-4 border-[#ccfbf1]">
              <div className="space-y-5">
                {/* Email chủ */}
                <div>
                  <label className="flex items-center gap-2 text-sm font-bold text-gray-900 mb-2">
                    <span>👤</span>
                    <span>Email chủ</span>
                  </label>
                  <input
                    type="email"
                    placeholder="user@gmail.com"
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-transparent text-sm"
                    value={formData.ownerEmail}
                    onChange={(e) => setFormData({ ...formData, ownerEmail: e.target.value })}
                  />
                </div>

                {/* Tên thú cưng */}
                <div>
                  <label className="flex items-center gap-2 text-sm font-bold text-gray-900 mb-2">
                    <span>🐕</span>
                    <span>Tên thú cưng của bạn</span>
                  </label>
                  <input
                    type="text"
                    placeholder="Chó, mèo,....."
                    className="w-full px-4 py-3 bg-[#ccfbf1] border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-transparent text-sm text-black"
                    value={formData.petName}
                    onChange={(e) => setFormData({ ...formData, petName: e.target.value })}
                  />
                </div>

                {/* Two column layout for date and room type */}
                <div className="grid grid-cols-2 gap-4">
                  {/* Ngày thăm khám */}
                  <div>
                    <label className="flex items-center gap-2 text-sm font-bold text-gray-900 mb-2">
                      <span>📅</span>
                      <span>Ngày thăm khám*</span>
                    </label>
                    <input
                      type="datetime-local"
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-transparent text-sm"
                      value={formData.visitDate}
                      onChange={(e) => setFormData({ ...formData, visitDate: e.target.value })}
                    />
                  </div>

                  {/* Loại phòng */}
                  <div>
                    <label className="flex items-center gap-2 text-sm font-bold text-gray-900 mb-2">
                      <Home className="size-4" />
                      <span>Loại phòng</span>
                    </label>
                    <select
                      className="w-full px-4 py-3 bg-[#ccfbf1] border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-transparent text-sm text-black"
                      value={formData.roomType}
                      onChange={(e) => setFormData({ ...formData, roomType: e.target.value })}
                    >
                      <option value="">Loại phòng</option>
                      {rooms.map((room) => (
                        <option key={room.hotel_id || room.name} value={room.name}>{room.name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Mô tả */}
                <div>
                  <label className="text-sm font-bold text-gray-900 mb-2 block text-center">
                    Mô tả tình trạng của thú cưng
                  </label>
                  <textarea
                    placeholder="Mô tả ...."
                    rows={3}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-transparent text-sm resize-none"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  />
                </div>

                {/* Submit Button */}
               {/* Submit Button */}
                <button
                  type="button"
                  className="w-full bg-gradient-to-r from-teal-500 to-blue-500 text-white py-3 rounded-xl font-bold hover:from-teal-600 hover:to-blue-600 transition-all flex items-center justify-center gap-2"
                  onClick={handleAddBooking}
                >
                  <CalendarCheck className="size-5" />
                  Đặt lịch hẹn ngay
                </button>
              </div>
            </div>

            {/* Close button */}
            <button
              onClick={() => setShowAddModal(false)}
              className="absolute top-4 right-4 text-gray-600 hover:text-gray-900 text-2xl font-bold"
            >
              ×
            </button>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}