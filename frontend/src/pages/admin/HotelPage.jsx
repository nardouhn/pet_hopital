import { useState, useEffect } from "react";
import { Home, Calendar } from "lucide-react";
import { api } from "@/api/mockApi";

export default function HotelPage() {
  const [bookings, setBookings] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([api.getHotelBookings(), api.getHotelRooms()]).then(
      ([bookingsData, roomsData]) => {
        setBookings(bookingsData);
        setRooms(roomsData);
        setLoading(false);
      }
    );
  }, []);

  // Calculate statistics
  const totalRooms = rooms.length;
  const occupiedRooms = rooms.filter((r) => r.status === "Occupied").length;
  const reservedRooms = rooms.filter((r) => r.status === "Reserved").length;
  const bookedRooms = occupiedRooms + reservedRooms;
  const vacancyRate =
    totalRooms > 0
      ? Math.round(((totalRooms - bookedRooms) / totalRooms) * 100)
      : 0;

  // Split bookings
  const currentBookings = bookings.filter((b) => b.bookingType === "current");
  const upcomingBookings = bookings.filter((b) => b.bookingType === "upcoming");

  const getRoomStatusColor = (status) => {
    switch (status) {
      case "Occupied":
        return "bg-teal-100 border-teal-300";
      case "Reserved":
        return "bg-blue-100 border-blue-300";
      case "Available":
        return "bg-white border-gray-200";
      default:
        return "bg-gray-100 border-gray-200";
    }
  };

  const getRoomStatusTextColor = (status) => {
    switch (status) {
      case "Occupied":
        return "text-teal-700";
      case "Reserved":
        return "text-blue-700";
      case "Available":
        return "text-gray-500";
      default:
        return "text-gray-500";
    }
  };

  if (loading) {
    return <div className="p-6">Loading...</div>;
  }

  return (
    <div className="p-6 space-y-6 bg-[#f8fafb] min-h-screen">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Khách sạn thú cưng</h1>
        <p className="text-sm text-gray-600 mt-1">
          Quản lý dịch vụ lưu trú cho vật nuôi
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Total Rooms */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-start justify-between mb-4">
            <div className="p-3 bg-teal-50 rounded-xl">
              <Home className="size-6 text-teal-600" />
            </div>
          </div>
          <p className="text-sm text-gray-600 mb-2">Tổng số phòng</p>
          <p className="text-3xl font-bold text-gray-900">{totalRooms}</p>
        </div>

        {/* Booked Rooms */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-start justify-between mb-4">
            <div className="p-3 bg-blue-50 rounded-xl">
              <Calendar className="size-6 text-blue-600" />
            </div>
          </div>
          <p className="text-sm text-gray-600 mb-2">Phòng đã đặt</p>
          <p className="text-3xl font-bold text-gray-900">{bookedRooms}</p>
        </div>

        {/* Monthly Usage Rate */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-start justify-between mb-4">
            <div className="p-3 bg-purple-50 rounded-xl">
              <Calendar className="size-6 text-purple-600" />
            </div>
          </div>
          <p className="text-sm text-gray-600 mb-2">
            Tỷ lệ sử dụng trong tháng
          </p>
          <p className="text-3xl font-bold text-gray-900">{occupiedRooms}</p>
        </div>

        {/* Vacancy Rate */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-start justify-between mb-4">
            <div className="p-3 bg-green-50 rounded-xl">
              <Home className="size-6 text-green-600" />
            </div>
          </div>
          <p className="text-sm text-gray-600 mb-2">Tỷ lệ phòng trống</p>
          <p className="text-3xl font-bold text-gray-900">{vacancyRate}%</p>
        </div>
      </div>

      {/* Two Column Layout - Current Rentals and Contracts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Current Rentals - Left Column */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900 mb-6">
            Đang thuê
          </h2>
          <div className="space-y-4">
            {currentBookings.length === 0 ? (
              <p className="text-sm text-gray-500 text-center py-8">
                Không có đặt phòng đang diễn ra
              </p>
            ) : (
              currentBookings.map((booking) => (
                <div
                  key={booking.id}
                  className="bg-gray-50 rounded-xl p-4 border border-gray-100"
                >
                  {/* Pet Name and Owner */}
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="font-medium text-gray-900">
                        {booking.petName} - {booking.ownerName}
                      </h3>
                    </div>
                    <span className="px-3 py-1 bg-teal-100 text-teal-700 rounded-lg text-xs font-medium">
                      Ongoing
                    </span>
                  </div>

                  {/* Date Range */}
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Calendar className="size-4" />
                    <span>
                      {booking.checkIn} - {booking.checkOut}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Upcoming Contracts - Right Column */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900 mb-6">Hợp đồng</h2>
          <div className="space-y-4">
            {upcomingBookings.length === 0 ? (
              <p className="text-sm text-gray-500 text-center py-8">
                Không có hợp đồng sắp tới
              </p>
            ) : (
              upcomingBookings.map((booking) => (
                <div
                  key={booking.id}
                  className="bg-gray-50 rounded-xl p-4 border border-gray-100"
                >
                  {/* Pet Name and Owner */}
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="font-medium text-gray-900">
                        {booking.petName} - {booking.ownerName}
                      </h3>
                    </div>
                    <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-lg text-xs font-medium">
                      Upcoming
                    </span>
                  </div>

                  {/* Date Range */}
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Calendar className="size-4" />
                    <span>
                      {booking.checkIn} - {booking.checkOut}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Room Status Grid */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-gray-900">
            Tình trạng phòng
          </h2>

          {/* Legend */}
          <div className="flex items-center gap-4 text-xs">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-white border-2 border-gray-200"></div>
              <span className="text-gray-600">Available</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-teal-100 border-2 border-teal-300"></div>
              <span className="text-gray-600">Occupied</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-blue-100 border-2 border-blue-300"></div>
              <span className="text-gray-600">Reserved</span>
            </div>
          </div>
        </div>

        {/* Room Grid */}
        <div className="grid grid-cols-5 gap-4">
          {rooms.map((room) => (
            <div
              key={room.number}
              className={`p-4 rounded-xl border-2 transition-all hover:shadow-md ${getRoomStatusColor(
                room.status
              )}`}
            >
              <div className="text-center">
                <p
                  className={`text-sm font-semibold ${getRoomStatusTextColor(
                    room.status
                  )}`}
                >
                  {room.number}
                </p>
                <p
                  className={`text-xs mt-1 ${getRoomStatusTextColor(
                    room.status
                  )}`}
                >
                  {room.status}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}