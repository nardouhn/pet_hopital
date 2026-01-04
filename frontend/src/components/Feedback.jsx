
// // // export default Feedback;
// // import React, { useEffect, useState } from "react";
// // import { motion } from "framer-motion";
// // import { Heart, Star } from "lucide-react";
// // import toast, { Toaster } from "react-hot-toast";
// // import { getReviews, submitFeedback } from "@/api/mockApi";
// // import { useNavigate } from "react-router-dom";

// // import imgCat from "@/assets/image 10.png";
// // import imgDog from "@/assets/Rectangle 4.png";

// // const Feedback = () => {
// //   const [reviews, setReviews] = useState([]);
// //   const [form, setForm] = useState({
// //     userName: "",
// //     petName: "",
// //     petType: "",
// //     rating: 5,
// //     comment: "",
// //   });

// //   useEffect(() => {
// //     getReviews().then(setReviews);
// //   }, []);

// //   const handleChange = (e) => {
// //     setForm({ ...form, [e.target.name]: e.target.value });
// //   };

// //   const handleSubmit = async (e) => {
// //     e.preventDefault();

// //     if (!form.userName || !form.petName || !form.petType || !form.comment) {
// //       toast.error("Vui lòng điền đầy đủ thông tin!");
// //       return;
// //     }

// //     await submitFeedback(form);
// //     toast.success("Gửi feedback thành công!");

// //     setForm({
// //       userName: "",
// //       petName: "",
// //       petType: "",
// //       rating: 5,
// //       comment: "",
// //     });
// //   };

// //   const handleRatingChange = (rating) => {
// //     setForm({
// //       ...form,
// //       rating,
// //     });
// //   };

// //   const inputStyle = (value) =>
// //     `w-full rounded-lg px-4 py-2 border transition-all duration-200
// //    ${value ? "bg-[#CCFBF1]/70 border-teal-300" : "bg-white/70 border-gray-200"}
// //    focus:outline-none focus:ring-2 focus:ring-teal-300`;

// //   return (
// //     <section className="relative py-24 bg-gradient-to-br from-[#F0FAF9] to-[#E6FFFA] overflow-hidden">
// //       <Toaster />

// //       {/* ẢNH TRANG TRÍ */}
// //       <img
// //         src={imgCat}
// //         alt="cat"
// //         className="hidden lg:block absolute right-0 top-20 w-72 opacity-90 scale-140 mt-100"
// //       />

// //       <div className="max-w-6xl mx-auto px-6 text-center">
// //         {/* ===== REVIEW HEADER ===== */}
// //         <motion.div
// //           initial={{ opacity: 0, y: -30 }}
// //           whileInView={{ opacity: 1, y: 0 }}
// //           viewport={{ once: true }}
// //           className="mb-16"
// //         >
// //           <span className="inline-flex items-center gap-2 bg-yellow-100 text-yellow-700 px-4 py-1 rounded-full font-semibold text-sm">
// //             <Star className="w-4 h-4" /> 5-Star Reviews
// //           </span>
// //           <h2 className="text-4xl font-bold text-gray-800 mt-4 mb-2">
// //             Đánh giá về chúng tôi
// //           </h2>
// //           <p className="text-gray-600">
// //             Câu chuyện thật từ những người tin tưởng Petorium
// //           </p>
// //         </motion.div>

// //         {/* ===== REVIEW LIST ===== */}
// //         <div className="grid md:grid-cols-3 gap-8 mb-24">
// //           {reviews.map((item, i) => (
// //             <motion.div
// //               key={item.id}
// //               initial={{ opacity: 0, y: 40 }}
// //               whileInView={{ opacity: 1, y: 0 }}
// //               transition={{ delay: i * 0.1 }}
// //               viewport={{ once: true }}
// //               className="bg-white rounded-3xl p-6 text-left shadow-lg hover:shadow-xl transition"
// //             >
// //               <div className="flex mb-3">
// //                 {[...Array(item.rating)].map((_, idx) => (
// //                   <Star
// //                     key={idx}
// //                     className="w-5 h-5 text-yellow-400"
// //                     fill="gold"
// //                   />
// //                 ))}
// //               </div>

// //               <p className="text-gray-700 italic mb-6">“{item.content}”</p>

// //               <div className="flex items-center gap-3">
// //                 <div className="w-9 h-9 rounded-full bg-cyan-500 text-white font-bold flex items-center justify-center">
// //                   {item.name[0]}
// //                 </div>
// //                 <div>
// //                   <p className="font-semibold">{item.name}</p>
// //                   <p className="text-sm text-gray-500">{item.pet}</p>
// //                 </div>
// //               </div>
// //             </motion.div>
// //           ))}
// //         </div>

// //         {/* ===== FEEDBACK FORM ===== */}
// //         <motion.div
// //           initial={{ opacity: 0, y: 40 }}
// //           whileInView={{ opacity: 1, y: 0 }}
// //           viewport={{ once: true }}
// //         >
// //           <span className="inline-flex bg-white/70 backdrop-blur-xl items-center gap-2 bg-pink-100 text-pink-700 px-4 py-1 rounded-full font-semibold text-sm mb-4">
// //             <Heart className="w-4 h-4" /> Hãy để lại feedback tại đây nhé!
// //           </span>

// //           <h2 className="text-3xl font-bold text-gray-800 mb-2">
// //             Chia sẻ trải nghiệm của bạn
// //           </h2>
// //           <p className="text-gray-600 mb-10">
// //             Trải nghiệm của bạn giúp chúng tôi cải thiện dịch vụ!
// //           </p>

// //           <form
// //             onSubmit={handleSubmit}
// //             className="relative overflow-hidden bg-white/70 backdrop-blur-xl max-w-3xl mx-auto p-10 rounded-3xl shadow-xl "
// //           >
// //             {/* Background image */}
// //             <img
// //               src={imgDog}
// //               alt="dog"
// //               className="pointer-events-none absolute inset-0 mx-auto  opacity-50"
// //             />

// //             {/* Content */}
// //             <div className="relative z-10">
// //               {/* Row 1 */}
// //               <div className="mb-4">
// //                 <label className="flex items-center gap-2 text-sm  mb-2">
// //                   <span>👤</span>
// //                   <span>Your Name *</span>
// //                 </label>
// //                 <input
// //                   type="text"
// //                   name="userName"
// //                   value={form.userName}
// //                   onChange={handleChange}
// //                   placeholder="Your name"
// //                   className={inputStyle(form.userName)}
// //                   required
// //                 />
// //               </div>

// //               {/* Pet's Name and Breed */}
// //               <div className="grid grid-cols-2 gap-4 mb-4">
// //                 <div>
// //                   <label className="text-sm mb-2 block">Pet's Name *</label>
// //                   <input
// //                     type="text"
// //                     name="petName"
// //                     value={form.petName}
// //                     onChange={handleChange}
// //                     placeholder="pet's name"
// //                     className={inputStyle(form.petName)}
// //                     required
// //                   />
// //                 </div>
// //                 <div>
// //                   <label className="text-sm  mb-2 block">Breed *</label>
// //                   <input
// //                     type="text"
// //                     name="petType"
// //                     value={form.petType}
// //                     onChange={handleChange}
// //                     placeholder="Dog, Cat,..."
// //                     className={inputStyle(form.petType)}
// //                     required
// //                   />
// //                 </div>
// //               </div>

// //               {/* Rating */}
// //               {/* Rating */}
// //               <div className="mb-4 relative">
// //                 <label className="absolute left-0 top-0 text-sm flex items-center gap-2">
// //                   <span>📧</span>
// //                   <span>Rating:</span>
// //                 </label>

// //                 <div className="flex gap-2 pt-6">
// //                   {[1, 2, 3, 4, 5].map((star) => (
// //                     <button
// //                       key={star}
// //                       type="button"
// //                       onClick={() => handleRatingChange(star)}
// //                       className="focus:outline-none"
// //                     >
// //                       <Star
// //                         className={`size-8 transition-all ${
// //                           star <= form.rating
// //                             ? "text-yellow-400 fill-yellow-400"
// //                             : "text-gray-300"
// //                         }`}
// //                       />
// //                     </button>
// //                   ))}
// //                 </div>
// //               </div>

// //               {/* Your Feedback */}
// //               <div className="mb-6">
// //                 <label className="flex items-center gap-2 text-sm text-gray-900 mb-2">
// //                   <span>💬</span>
// //                   <span>Your Feedback *</span>
// //                 </label>
// //                 <textarea
// //                   name="comment"
// //                   value={form.comment}
// //                   onChange={handleChange}
// //                   placeholder="Share your experience or suggestions..."
// //                   rows="5"
// //                   className={inputStyle(form.comment)}
// //                   required
// //                 />
// //               </div>

// //               {/* Submit */}
// //               <motion.button
// //                 whileHover={{ scale: 1.03 }}
// //                 whileTap={{ scale: 0.97 }}
// //                 type="submit"
// //                 className="w-full bg-gradient-to-r from-sky-500 to-teal-500 text-white font-semibold py-4 rounded-full shadow-lg flex items-center justify-center gap-2"
// //               >
// //                 Submit Feedback <Heart className="w-5 h-5" />
// //               </motion.button>
// //             </div>
// //           </form>
// //         </motion.div>
// //       </div>
// //     </section>
// //   );
// // };

// // export default Feedback;


// import React, { useEffect, useState } from "react";
// import { motion } from "framer-motion";
// import { Heart, Star } from "lucide-react";
// import toast, { Toaster } from "react-hot-toast";
// import { getReviews, submitFeedback } from "@/api/mockApi";
// import { useNavigate } from "react-router-dom";

// import imgCat from "@/assets/image 10.png";
// import imgDog from "@/assets/Rectangle 4.png";

// const Feedback = () => {
//   const navigate = useNavigate();

//   // ===== AUTH CHECK =====
//   let auth = null;
//   try {
//     auth = JSON.parse(localStorage.getItem("auth"));
//   } catch (e) {
//     auth = null;
//   }

//   const isAuthenticated = !!(auth && auth.isAuthenticated);

//   // ===== STATE =====
//   const [reviews, setReviews] = useState([]);
//   const [backendReviews, setBackendReviews] = useState([]);
//   const [form, setForm] = useState({
//     userName: isAuthenticated ? auth?.user?.name || "" : "",
//     petName: "",
//     petType: "",
//     rating: 5,
//     comment: "",
//   });

//   // ===== LOAD REVIEWS =====
//   useEffect(() => {
//     fetchReviews();
//     fetchBackendReviews();
//   }, []);

//   const fetchReviews = async () => {
//     try {
//       const data = await getReviews();
//       console.debug('fetchReviews -> received', data?.length, 'items');
//       setReviews(data);
//     } catch (err) {
//       console.error('fetchReviews error', err);
//       setReviews([]);
//     }
//   };

//   const fetchBackendReviews = async () => {
//     try {
//       // getReviews() in mockApi calls the backend public /feedback endpoint
//       const data = await getReviews();
//       console.debug('fetchBackendReviews -> received', data?.length, 'items');
//       setBackendReviews(data);
//     } catch (err) {
//       console.error('fetchBackendReviews error', err);
//       setBackendReviews([]);
//     }
//   };

//   // ===== HANDLERS =====
//   const handleChange = (e) => {
//     setForm({ ...form, [e.target.name]: e.target.value });
//   };

//   const handleRatingChange = (rating) => {
//     setForm({ ...form, rating });
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();

//     if (!isAuthenticated) {
//       toast.error("Vui lòng đăng nhập để gửi feedback!");
//       return;
//     }

//     if (!form.petName || !form.petType || !form.comment) {
//       toast.error("Vui lòng điền đầy đủ thông tin!");
//       return;
//     }

//     try {
//       await submitFeedback(form);
//       toast.success("Gửi feedback thành công!");

//       setForm({
//         userName: auth?.user?.name || "",
//         petName: "",
//         petType: "",
//         rating: 5,
//         comment: "",
//       });

//       fetchReviews();
//     } catch (err) {
//       toast.error("Gửi feedback thất bại!");
//     }
//   };

//   // ===== INPUT STYLE =====
//   const inputStyle = (value) =>
//     `w-full rounded-lg px-4 py-2 border transition-all duration-200
//      ${value ? "bg-[#CCFBF1]/70 border-teal-300" : "bg-white/70 border-gray-200"}
//      focus:outline-none focus:ring-2 focus:ring-teal-300`;

//   return (
//     <section className="relative py-24 bg-gradient-to-br from-[#F0FAF9] to-[#E6FFFA] overflow-hidden">
//       <Toaster />

//       {/* IMAGE DECOR */}
//       <img
//         src={imgCat}
//         alt="cat"
//         className="hidden lg:block absolute right-0 top-20 w-72 opacity-90"
//       />

//       <div className="max-w-6xl mx-auto px-6 text-center">
//         {/* ===== HEADER ===== */}
//         <motion.div
//           initial={{ opacity: 0, y: -30 }}
//           whileInView={{ opacity: 1, y: 0 }}
//           viewport={{ once: true }}
//           className="mb-16"
//         >
//           <span className="inline-flex items-center gap-2 bg-yellow-100 text-yellow-700 px-4 py-1 rounded-full font-semibold text-sm">
//             <Star className="w-4 h-4" /> 5-Star Reviews
//           </span>
//           <h2 className="text-4xl font-bold text-gray-800 mt-4 mb-2">
//             Đánh giá về chúng tôi
//           </h2>
//           <p className="text-gray-600">
//             Câu chuyện thật từ những người tin tưởng Petorium
//           </p>
//         </motion.div>

//         {/* ===== REVIEW LIST ===== */}
//         <div className="grid md:grid-cols-3 gap-8 mb-24">
//           {reviews.map((item, i) => (
//             <motion.div
//               key={item.id || i}
//               initial={{ opacity: 0, y: 40 }}
//               whileInView={{ opacity: 1, y: 0 }}
//               transition={{ delay: i * 0.1 }}
//               viewport={{ once: true }}
//               className="bg-white rounded-3xl p-6 text-left shadow-lg"
//             >
//               <div className="flex mb-3">
//                 {[...Array(item.rating || 5)].map((_, idx) => (
//                   <Star
//                     key={idx}
//                     className="w-5 h-5 text-yellow-400"
//                     fill="gold"
//                   />
//                 ))}
//               </div>

//               <p className="text-gray-700 italic mb-6">
//                 “{item.content || item.comment}”
//               </p>

//               <div className="flex items-center gap-3">
//                 <div className="w-9 h-9 rounded-full bg-cyan-500 text-white font-bold flex items-center justify-center">
//                   {item.name?.[0] || "U"}
//                 </div>
//                 <div>
//                   <p className="font-semibold">{item.name}</p>
//                   <p className="text-sm text-gray-500">{item.pet}</p>
//                 </div>
//               </div>
//             </motion.div>
//           ))}
//         </div>

//         {/* DANH SÁCH REVIEW (TỪ BACKEND) */}
//         <div className="grid md:grid-cols-3 gap-8 mb-20">
//           {backendReviews.map((item, i) => (
//             <motion.div
//               key={item.id || i}
//               whileHover={{ scale: 1.03 }}
//               initial={{ opacity: 0, y: 40 }}
//               whileInView={{ opacity: 1, y: 0 }}
//               transition={{ delay: i * 0.1, duration: 0.6 }}
//               viewport={{ once: true }}
//               className="bg-white rounded-3xl shadow-md p-6 text-left border border-gray-100 hover:shadow-xl transition-all"
//             >
//               <div className="flex mb-3">
//                 {[...Array(item.rating || 5)].map((_, idx) => (
//                   <Star
//                     key={idx}
//                     className="w-5 h-5 text-yellow-400"
//                     fill="gold"
//                   />
//                 ))}
//               </div>
//               <p className="text-gray-700 italic mb-6">{`"${item.content || item.text || ''}"`}</p>
//               <div className="flex items-center gap-3">
//                 <div className="bg-cyan-500 text-white font-bold rounded-full w-8 h-8 flex items-center justify-center uppercase">
//                   {(item.name || 'U')[0]}
//                 </div>
//                 <div>
//                   <p className="font-semibold text-gray-800">{item.name}</p>
//                   <p className="text-sm text-gray-500">{item.pet}</p>
//                 </div>
//               </div>
//             </motion.div>
//           ))}
//         </div>

//         {/* ===== FEEDBACK FORM ===== */}
//         {isAuthenticated ? (
//           <motion.div
//             initial={{ opacity: 0, y: 40 }}
//             whileInView={{ opacity: 1, y: 0 }}
//             viewport={{ once: true }}
//           >
//             <span className="inline-flex bg-pink-100 text-pink-700 px-4 py-1 rounded-full font-semibold text-sm mb-4 gap-2">
//               <Heart className="w-4 h-4" /> Hãy để lại feedback tại đây nhé!
//             </span>

//             <h2 className="text-3xl font-bold text-gray-800 mb-10">
//               Chia sẻ trải nghiệm của bạn
//             </h2>

//             <form
//               onSubmit={handleSubmit}
//               className="relative overflow-hidden bg-white/70 backdrop-blur-xl max-w-3xl mx-auto p-10 rounded-3xl shadow-xl"
//             >
//               <img
//                 src={imgDog}
//                 alt="dog"
//                 className="absolute inset-0 mx-auto opacity-50 pointer-events-none"
//               />

//               <div className="relative z-10">
//                 {/* NAME */}
//                 <div className="mb-4">
//                   <label className="text-sm mb-2 block">Your Name</label>
//                   <input
//                     value={form.userName}
//                     disabled
//                     className="w-full rounded-lg px-4 py-2 bg-gray-100 border border-gray-200 cursor-not-allowed"
//                   />
//                 </div>

//                 {/* PET INFO */}
//                 <div className="grid grid-cols-2 gap-4 mb-4">
//                   <input
//                     name="petName"
//                     value={form.petName}
//                     onChange={handleChange}
//                     placeholder="Pet's name"
//                     className={inputStyle(form.petName)}
//                   />
//                   <input
//                     name="petType"
//                     value={form.petType}
//                     onChange={handleChange}
//                     placeholder="Dog, Cat..."
//                     className={inputStyle(form.petType)}
//                   />
//                 </div>

//                 {/* RATING */}
//                 <div className="mb-4 flex gap-2">
//                   {[1, 2, 3, 4, 5].map((star) => (
//                     <button
//                       key={star}
//                       type="button"
//                       onClick={() => handleRatingChange(star)}
//                     >
//                       <Star
//                         className={`size-8 ${
//                           star <= form.rating
//                             ? "text-yellow-400 fill-yellow-400"
//                             : "text-gray-300"
//                         }`}
//                       />
//                     </button>
//                   ))}
//                 </div>

//                 {/* COMMENT */}
//                 <textarea
//                   name="comment"
//                   value={form.comment}
//                   onChange={handleChange}
//                   rows="5"
//                   placeholder="Share your experience..."
//                   className={inputStyle(form.comment)}
//                 />

//                 {/* SUBMIT */}
//                 <motion.button
//                   whileHover={{ scale: 1.03 }}
//                   whileTap={{ scale: 0.97 }}
//                   type="submit"
//                   className="mt-6 w-full bg-gradient-to-r from-sky-500 to-teal-500 text-white py-4 rounded-full flex justify-center gap-2"
//                 >
//                   Submit Feedback <Heart className="w-5 h-5" />
//                 </motion.button>
//               </div>
//             </form>
//           </motion.div>
//         ) : (
//           <div className="bg-white max-w-3xl mx-auto p-8 rounded-3xl shadow-lg text-center">
//             <p className="font-semibold text-gray-700 mb-4">
//               Vui lòng đăng nhập để gửi feedback
//             </p>
//             <div className="flex gap-3 justify-center">
//               <button
//                 onClick={() => navigate("/login")}
//                 className="px-6 py-2 rounded-full bg-[#2e94a5] text-white"
//               >
//                 Đăng nhập
//               </button>
//               <button
//                 onClick={() => navigate("/signup")}
//                 className="px-6 py-2 rounded-full border border-[#2e94a5] text-[#2e94a5]"
//               >
//                 Đăng ký
//               </button>
//             </div>
//           </div>
//         )}
//       </div>
//     </section>
//   );
// };

// export default Feedback;


import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Heart, Star } from "lucide-react";
import toast, { Toaster } from "react-hot-toast";
import { getReviews, submitFeedback } from "@/api/mockApi";
import { useNavigate } from "react-router-dom";

import imgCat from "@/assets/image 10.png";
import imgDog from "@/assets/Rectangle 4.png";

const Feedback = () => {
  const navigate = useNavigate();

  // ===== AUTH CHECK =====
  let auth = null;
  try {
    auth = JSON.parse(localStorage.getItem("auth"));
  } catch {
    auth = null;
  }
  const isAuthenticated = !!(auth && auth.isAuthenticated);

  // ===== STATE =====
  const [reviews, setReviews] = useState([]);
  const [form, setForm] = useState({
    userName: isAuthenticated ? auth?.user?.name || "" : "",
    petName: "",
    petType: "",
    rating: 5,
    comment: "",
  });

  // ===== UNIQUE FILTER =====
  // Return up to `max` feedbacks, treating items with same content+name as duplicates
  const uniqueFeedbacks = (data = [], max = 3) => {
    const seen = new Set();
    const out = [];

    for (const item of Array.isArray(data) ? data : []) {
      const content = (item.content || item.comment || "").trim();
      if (!content) continue;
      const name = (item.name || item.user_name || "").trim();
      const key = `${content}::${name}`;
      if (seen.has(key)) continue;
      seen.add(key);
      out.push(item);
      if (out.length >= max) break;
    }

    return out;
  };


  // ===== LOAD REVIEWS =====
  useEffect(() => {
    fetchReviews();
  }, []);

  const fetchReviews = async () => {
    try {
      const data = await getReviews();
      setReviews(uniqueFeedbacks(data, 3));
    } catch (err) {
      setReviews([]);
    }
  };

  // ===== HANDLERS =====
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleRatingChange = (rating) => {
    setForm({ ...form, rating });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!isAuthenticated) {
      toast.error("Vui lòng đăng nhập để gửi feedback!");
      return;
    }

    if (!form.petName || !form.petType || !form.comment) {
      toast.error("Vui lòng điền đầy đủ thông tin!");
      return;
    }

    try {
      await submitFeedback(form);
      toast.success("Gửi feedback thành công!");

      setForm({
        userName: auth?.user?.name || "",
        petName: "",
        petType: "",
        rating: 5,
        comment: "",
      });

      fetchReviews();
    } catch {
      toast.error("Gửi feedback thất bại!");
    }
  };

  // ===== INPUT STYLE =====
  const inputStyle = (value) =>
    `w-full rounded-lg px-4 py-2 border transition-all duration-200
     ${value ? "bg-[#CCFBF1]/70 border-teal-300" : "bg-white/70 border-gray-200"}
     focus:outline-none focus:ring-2 focus:ring-teal-300`;

  return (
    <section className="relative py-24 bg-gradient-to-br from-[#F0FAF9] to-[#E6FFFA] overflow-hidden">
      <Toaster />

      {/* IMAGE DECOR */}
      <img
        src={imgCat}
        alt="cat"
        className="hidden lg:block absolute right-0 top-20 w-72 opacity-90"
      />

      <div className="max-w-6xl mx-auto px-6 text-center">
        {/* ===== HEADER ===== */}
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-16"
        >
          <span className="inline-flex items-center gap-2 bg-yellow-100 text-yellow-700 px-4 py-1 rounded-full font-semibold text-sm">
            <Star className="w-4 h-4" /> 5-Star Reviews
          </span>
          <h2 className="text-4xl font-bold text-gray-800 mt-4 mb-2">
            Đánh giá về chúng tôi
          </h2>
          <p className="text-gray-600">
            Câu chuyện thật từ những người tin tưởng Petorium
          </p>
        </motion.div>

        {/* ===== REVIEW LIST ===== */}
        <div className="grid md:grid-cols-3 gap-8 mb-24">
          {reviews.map((item, i) => (
            <motion.div
              key={`${item.name}-${i}`}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              viewport={{ once: true }}
              className="bg-white rounded-3xl p-6 text-left shadow-lg"
            >
              <div className="flex mb-3">
                {[...Array(item.rating || 5)].map((_, idx) => (
                  <Star
                    key={idx}
                    className="w-5 h-5 text-yellow-400"
                    fill="gold"
                  />
                ))}
              </div>

              <p className="text-gray-700 italic mb-6">
                “{item.content || item.comment}”
              </p>

              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-cyan-500 text-white font-bold flex items-center justify-center">
                  {(item.name || "U")[0]}
                </div>
                <div>
                  <p className="font-semibold">{item.name}</p>
                  <p className="text-sm text-gray-500">{item.pet}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* ===== FEEDBACK FORM ===== */}
        {isAuthenticated ? (
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <span className="inline-flex bg-pink-100 text-pink-700 px-4 py-1 rounded-full font-semibold text-sm mb-4 gap-2">
              <Heart className="w-4 h-4" /> Hãy để lại feedback tại đây nhé!
            </span>

            <h2 className="text-3xl font-bold text-gray-800 mb-10">
              Chia sẻ trải nghiệm của bạn
            </h2>

            <form
              onSubmit={handleSubmit}
              className="relative overflow-hidden bg-white/70 backdrop-blur-xl max-w-3xl mx-auto p-10 rounded-3xl shadow-xl"
            >
              <img
                src={imgDog}
                alt="dog"
                className="absolute inset-0 mx-auto opacity-50 pointer-events-none"
              />

              <div className="relative z-10">
                {/* NAME */}
                <div className="mb-4">
                  <label className="text-sm mb-2 block">Your Name</label>
                  <input
                    value={form.userName}
                    disabled
                    className="w-full rounded-lg px-4 py-2 bg-gray-100 border border-gray-200 cursor-not-allowed"
                  />
                </div>

                {/* PET INFO */}
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <input
                    name="petName"
                    value={form.petName}
                    onChange={handleChange}
                    placeholder="Pet's name"
                    className={inputStyle(form.petName)}
                  />
                  <input
                    name="petType"
                    value={form.petType}
                    onChange={handleChange}
                    placeholder="Dog, Cat..."
                    className={inputStyle(form.petType)}
                  />
                </div>

                {/* RATING */}
                <div className="mb-4 flex gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => handleRatingChange(star)}
                    >
                      <Star
                        className={`size-8 ${
                          star <= form.rating
                            ? "text-yellow-400 fill-yellow-400"
                            : "text-gray-300"
                        }`}
                      />
                    </button>
                  ))}
                </div>

                {/* COMMENT */}
                <textarea
                  name="comment"
                  value={form.comment}
                  onChange={handleChange}
                  rows="5"
                  placeholder="Share your experience..."
                  className={inputStyle(form.comment)}
                />

                {/* SUBMIT */}
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  type="submit"
                  className="mt-6 w-full bg-gradient-to-r from-sky-500 to-teal-500 text-white py-4 rounded-full flex justify-center gap-2"
                >
                  Submit Feedback <Heart className="w-5 h-5" />
                </motion.button>
              </div>
            </form>
          </motion.div>
        ) : (
          <div className="bg-white max-w-3xl mx-auto p-8 rounded-3xl shadow-lg text-center">
            <p className="font-semibold text-gray-700 mb-4">
              Vui lòng đăng nhập để gửi feedback
            </p>
            <div className="flex gap-3 justify-center">
              <button
                onClick={() => navigate("/login")}
                className="px-6 py-2 rounded-full bg-[#2e94a5] text-white"
              >
                Đăng nhập
              </button>
              <button
                onClick={() => navigate("/signup")}
                className="px-6 py-2 rounded-full border border-[#2e94a5] text-[#2e94a5]"
              >
                Đăng ký
              </button>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default Feedback;
