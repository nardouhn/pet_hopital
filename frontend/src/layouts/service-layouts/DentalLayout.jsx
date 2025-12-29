const DentalLayout = ({ service }) => {
  return (
    <section className=" max-w-7xl mx-auto px-6 py-16">
      <h2 className="text-[42px] font-bold  bg-[linear-gradient(90deg,#0C615B_0%,#056498_100%)] bg-clip-text text-transparent mb-6">
        {service.introTitle}
      </h2>

      <p className="text-[36px] font-semibold mb-6">{service.introText}</p>

      <div className="space-y-4 font-semibold italic text-[35px] text-gray-800 mb-10">
        {service.description[0]}
      </div>

      <div className="grid md:grid-cols-2 gap-10 items-start">
        <img
          src={service.image}
          alt="Vaccine Service"
          className="rounded-xl "
        />

        <div>
          <div className="space-y-4  text-[33px] text-gray-700">
            {service.description[1]}
          </div>

          <ul className="list-disc pl-6 mt-8 space-y-2 text-[27px] text-gray-800">
            {service.services.map((item, i) => (
              <li key={i}>
                <strong>{item.split(":")[0]}:</strong> {item.split(":")[1]}
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="mt-6 text-[32px] font-semibold italic">
        <p>{service.commit[0]}</p>
        <p>{service.commit[1]}</p>
      </div>

      <div className="mt-12 text-[35px] font-semibold">{service.cta}</div>
    </section>
  );
};

export default DentalLayout;
