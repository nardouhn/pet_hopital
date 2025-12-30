const NeuterLayout = ({ service }) => {
  return (
    <section className="max-w-7xl mx-auto px-6 py-16">
      <h2 className="text-[42px] font-bold  bg-[linear-gradient(90deg,#0C615B_0%,#056498_100%)] bg-clip-text text-transparent mb-6">
        {service.introTitle}
      </h2>

      <p className="text-[35px] font-semibold mb-8">{service.introText}</p>

      <div className="space-y-4 text-[33px] font-semibold italic text-gray-800 mb-6">
        {service.description.map((text, i) => (
          <p key={i}>{text}</p>
        ))}
      </div>

      <p className="text-[31px] font-medium italic mb-6">
        {service.services[0]}
      </p>

      <img
        src={service.image}
        alt="Neuter Service"
        className=" mx-auto  shadow-lg"
      />

      <p className="text-[31px] font-medium italic mt-6">
        {service.services[0]}
      </p>
      <div className="mt-6 text-[30px] font-semibold">{service.commit}</div>
      <div className="mt-12 text-[35px] font-semibold">{service.cta}</div>
    </section>
  );
};

export default NeuterLayout;
