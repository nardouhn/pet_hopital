const MedtestLayout = ({ service }) => {
  return (
    <section className="max-w-7xl mx-auto px-6 py-16">
      <h2 className="text-[42px] font-bold  bg-[linear-gradient(90deg,#0C615B_0%,#056498_100%)] bg-clip-text text-transparent mb-6">
        {service.introTitle}
      </h2>

      <p className="text-[35px] font-semibold mb-6">{service.introText}</p>

      <div className="grid md:grid-cols-2 gap-10 items-start mb-4">
        <div className="space-y-4 italic font-semibold text-[27px] ">
          {service.description.map((text, i) => (
            <p key={i}>{text}</p>
          ))}
        </div>

        <img src={service.image} alt="Surgery Service" className=" " />
      </div>

      <p className="text-[31px] font-md italic text-gray-800">
        Tại Petorium, chúng tôi cung cấp đa dạng các dịch vụ xét nghiệm nhằm
        kiểm tra và đánh giá sức khỏe toàn diện cho thú cưng:
      </p>

      <ul className="list-disc pl-6 mt-4 space-y-2 text-[31px] text-gray-800">
        {service.services.map((item, i) => (
          <li key={i}>
            <strong>{item.split(":")[0]}:</strong> {item.split(":")[1]}
          </li>
        ))}
      </ul>

      <p className="mt-6 text-[35px] italic font-semibold">{service.commit}</p>

      <div className="mt-12 text-[35px] font-semibold">{service.cta}</div>
    </section>
  );
};

export default MedtestLayout;
