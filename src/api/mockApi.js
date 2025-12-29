const delay = (ms = 600) => new Promise((resolve) => setTimeout(resolve, ms));

/* ===== DASHBOARD ===== */
export async function getOverviewStats() {
  await delay();
  return [
    { title: "Tổng thú cưng", value: 1247 },
    { title: "Người dùng", value: 892 },
    { title: "Lịch hôm nay", value: 34 },
    { title: "Doanh thu", value: "₫245M" },
  ];
}

export async function getRecentAppointments() {
  await delay();
  return [
    {
      pet: "Max",
      owner: "Nguyễn Văn A",
      doctor: "BS. Minh",
      time: "09:00",
      status: "Đang khám",
    },
    {
      pet: "Luna",
      owner: "Lê Thị B",
      doctor: "BS. Lan",
      time: "10:30",
      status: "Chờ",
    },
  ];
}

/* ===== USERS ===== */
export async function getUsers() {
  await delay();
  return [
    {
      id: 1,
      name: "Nguyễn Văn A",
      email: "vana@gmail.com",
      phone: "0912345678",
      pets: 2,
      status: "Hoạt động",
    },
    {
      id: 2,
      name: "Lê Thị B",
      email: "lethi@gmail.com",
      phone: "0987654321",
      pets: 1,
      status: "Tạm khóa",
    },
  ];
}

/* ===== DOCTORS ===== */
export async function getDoctors() {
  await delay();
  return [
    {
      id: 1,
      name: "BS. Trần Minh",
      specialty: "Nội khoa",
      experience: "8 năm",
      status: "Đang làm việc",
    },
    {
      id: 2,
      name: "BS. Nguyễn Lan",
      specialty: "Ngoại khoa",
      experience: "5 năm",
      status: "Nghỉ phép",
    },
  ];
}

/* ===== FEEDBACKS ===== */
export const getReviews = () =>
  new Promise((resolve) => {
    setTimeout(() => {
      resolve([
        {
          id: 1,
          name: "Trang Lê",
          pet: "Max (Chó Poodle)",
          content:
            "Bác sĩ ở đây siêu dễ thương luôn! Bé chó nhà mình đi khám mà cứ vẫy đuôi suốt.",
          rating: 5,
        },
        {
          id: 2,
          name: "Hải Đăng",
          pet: "Luna (Mèo Anh lông dài)",
          content:
            "Phòng khám rất chuyên nghiệp, bác sĩ nhẹ nhàng và giải thích rõ ràng.",
          rating: 5,
        },
        {
          id: 3,
          name: "Tú Anh",
          pet: "Đen (Chó cỏ)",
          content:
            "Thật sự biết ơn vì đã cứu bé cún của mình. Rất đáng tin cậy!",
          rating: 5,
        },
      ]);
    }, 600);
  });

export const submitFeedback = (data) =>
  new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        success: true,
        message: "Feedback submitted",
        data,
      });
    }, 800);
  });
