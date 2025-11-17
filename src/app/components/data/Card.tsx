interface CardProps {
  title: string;
  value: any;
  type: "monetário" | "numeral";
}

export default function Card(props: CardProps) {
  const { title, value, type } = props;

  return (
    <div className="w-full gap-4">
      <div className="bg-slate-800 rounded-lg border border-slate-700 p-4">
        <div className="text-sm font-medium text-slate-400">{title}</div>
        <div className="text-2xl font-semibold text-slate-100 mt-1">
          {type == "monetário" ? `${value}` : type == "numeral" ? value : null} 
        </div>
      </div>
    </div>
  );
}
