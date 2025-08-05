interface SectionTitleProps {
  title: string;
}

export const SectionTitle = ({ title }: SectionTitleProps) => {
  return (
    <div className="relative">
      <h1 className="md:text-3xl text-xl relative z-10 font-semibold">{title}</h1>
      <div className="absolute top-[46%]"></div>
    </div>
  );
};
