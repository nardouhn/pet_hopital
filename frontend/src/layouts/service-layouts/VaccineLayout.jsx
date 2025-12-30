const VaccineLayout = ({ service }) => {
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
          <p className="mt-8 text-[27px] text-gray-800">
            <strong>Dịch vụ tiêm chủng</strong> của chúng tôi ra đời nhằm mang
            đến giải pháp phòng bệnh hiệu quả và an toàn cho thú cưng của bạn.
            Với đội ngũ bác sĩ thú y giàu kinh nghiệm cùng quy trình tiêm chủng
            chuẩn, Petorium cam kết:
          </p>
          <ul className="list-disc pl-6 mt-8 space-y-2 text-[27px] text-gray-800">
            {service.services.map((item, i) => (
              <li key={i}>
                <strong>{item.split(":")?.[0]}:</strong> {item.split(":")?.[1]}
              </li>
            ))}
          </ul>
        </div>

        <img
          src={service.image}
          alt="Vaccine Service"
          className="rounded-xl "
        />
      </div>

      <p className="mt-6 text-[32px] font-semibold italic">{service.commit}</p>

      <div className="mt-12 text-[35px] font-semibold">{service.cta}</div>
    </section>
  );
};

export default VaccineLayout;
