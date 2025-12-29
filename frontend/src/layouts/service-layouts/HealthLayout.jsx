const HealthLayout = ({ service }) => {
  return (
    <section className="max-w-7xl mx-auto px-6 py-16">
      <h2 className="text-[42px] font-bold  bg-[linear-gradient(90deg,#0C615B_0%,#056498_100%)] bg-clip-text text-transparent mb-6">
        {service.introTitle}
      </h2>

      <p className="text-[35px] font-semibold mb-8">{service.introText}</p>

      <div className="grid md:grid-cols-2 gap-10 items-start">
        <img
          src={service.image}
          alt="Health Service"
          className="rounded-xl shadow-lg"
        />

        <div className="space-y-4 text-[30px] italic text-gray-700">
          {service.description.map((text, i) => (
            <p key={i}>{text}</p>
          ))}
        </div>
      </div>
      <p className="mt-8 text-[30px]">
        <strong>Dịch vụ khám sức khỏe</strong> của chúng tôi ra đời để giải
        quyết vấn đề này. Với đội ngũ bác sĩ thú y giàu kinh nghiệm và trang
        thiết bị hiện đại, chúng tôi giúp bạn:
      </p>
      <ul className="list-disc text-[30px] pl-6 mt-8 space-y-2 text-gray-800">
        {service.services.map((item, i) => (
          <li key={i}>
            <strong>{item.split(":")[0]}:</strong> {item.split(":")[1]}
          </li>
        ))}
      </ul>

      <div className="mt-6 text-[30px] font-semibold">{service.commit}</div>
      <div className="mt-12 text-[35px] font-semibold">{service.cta}</div>
    </section>
  );
};

export default HealthLayout;
