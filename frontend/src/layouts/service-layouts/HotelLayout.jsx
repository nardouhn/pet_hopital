const HotelLayout = ({ service }) => {
  return (
    <section className=" max-w-7xl mx-auto px-6 py-16">
      <h2 className="text-[42px] font-bold  bg-[linear-gradient(90deg,#0C615B_0%,#056498_100%)] bg-clip-text text-transparent mb-6">
        {service.introTitle}
      </h2>

      <p className="text-[36px] font-semibold mb-6">{service.introText}</p>

      <div className="space-y-4 font-semibold italic text-[33px] ">
        {service.description.map((text, i) => (
          <p key={i}>{text}</p>
        ))}
      </div>

      <div className="grid md:grid-cols-2 gap-10 items-start">
        <div>
          <ul className="list-none pl-6 mt-6 space-y-2 text-[32px] text-gray-800">
            {service.services.map((item, i) => (
              <li key={i}>{item}</li>
            ))}
          </ul>
        </div>

        <img src={service.image} alt="Hotel Service" className="mt-16" />
      </div>

      <p
        className="mt-6 text-[40px] font-semibold italic text-center text-[#09776D] "
        style={{ textShadow: "0 4px 10px rgba(0,0,0,0.25)" }}
      >
        {service.commit}
      </p>

      <div className="mt-12 text-[35px] font-semibold">{service.cta}</div>
    </section>
  );
};

export default HotelLayout;
