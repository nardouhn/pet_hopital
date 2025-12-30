const ConsultLayout = ({ service }) => {
  return (
    <section className=" max-w-7xl mx-auto px-6 py-16">
      <h2 className="text-[42px] font-bold  bg-[linear-gradient(90deg,#0C615B_0%,#056498_100%)] bg-clip-text text-transparent mb-6">
        {service.introTitle}
      </h2>

      <p className="text-[36px] font-semibold mb-6">{service.introText}</p>

      <div className="space-y-4 italic text-[33px] text-gray-700">
        {service.description?.[0]}
      </div>

      <div className="space-y-4 text-[33px] text-gray-700">
        {service.description?.[1]}
      </div>
      <div className="grid md:grid-cols-2 gap-10 items-start">
        <div>
          <ul className="list-none  mt-8 space-y-2 text-[30px] text-gray-800">
            {service.services.map((item, i) => (
              <li key={i}>
                <strong>{item.split("-")?.[0]}-</strong> {item.split("-")?.[1]}
              </li>
            ))}
          </ul>

          <p className="text-[30px] text-gray-800 font-semibold italic">
            Tại Petorium, chúng tôi không chỉ điều trị bệnh – mà đồng hành cùng
            ba mẹ để bé luôn khỏe mạnh và hạnh phúc mỗi ngày.
          </p>
        </div>

        <img src={service.image} alt="Consult Service" className="scale-85" />
      </div>

      <p className="mt-5 text-[32px] font-semibold italic text-center">
        {service.commit}
      </p>

      <div className="mt-12 text-[35px] font-semibold">{service.cta}</div>
    </section>
  );
};

export default ConsultLayout;
