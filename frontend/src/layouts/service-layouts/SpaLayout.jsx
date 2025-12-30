const SpaLayout = ({ service }) => {
  return (
    <section className=" max-w-7xl mx-auto px-6 py-16">
      <h2 className="text-[42px] font-bold  bg-[linear-gradient(90deg,#0C615B_0%,#056498_100%)] bg-clip-text text-transparent mb-6">
        {service.introTitle}
      </h2>

      <p className="text-[36px] font-semibold mb-6">{service.introText}</p>

      <div className="space-y-4 italic text-[33px] text-gray-700">
        {service.description.map((text, i) => (
          <p key={i}>{text}</p>
        ))}
      </div>

      <div className="grid md:grid-cols-2 gap-10 items-start">
        <div>
          <p className="mt-8 text-[34px] text-gray-800">
            Dịch vụ Spa & Grooming giúp bé luôn thơm tho, gọn gàng và đồng thời
            phát hiện sớm các vấn đề về da, lông hay sức khỏe tổng quát. Những
            thay đổi nhỏ như kích ứng, viêm da hay rối loạn tuyến nhờn đều được
            kiểm tra và xử lý kịp thời.
          </p>

          <ul className="list-none  space-y-2 text-[34px] text-gray-900">
            {service.services.map((item, i) => (
              <li key={i}>
                <strong>{item}</strong>
              </li>
            ))}
          </ul>

          <p className="mt-3 font-semibold italic text-[33px] text-gray-900">
            Một buổi spa không chỉ giúp bé đẹp hơn mà còn mang lại sự thoải mái,
            thư giãn và sức khỏe tốt hơn mỗi ngày !
          </p>
        </div>

        <img src={service.image} alt="Spa Service" className="rounded-xl " />
      </div>

      <p className="mt-9 text-[38px] font-semibold italic">{service.commit}</p>

      <div className="mt-12 text-[36px] font-semibold">{service.cta}</div>
    </section>
  );
};

export default SpaLayout;
