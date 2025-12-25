export default function Card({ card }) {
  return (
    <div
      className="
        bg-white rounded-md p-3
        shadow-sm
        cursor-pointer
        transition
        duration-200
        hover:shadow-md
        hover:-translate-y-0.5
        active:scale-[0.99]
      "
    >
      <div className="text-sm font-semibold text-gray-800">
        {card.title}
      </div>

      {card.description && (
        <div className="text-xs text-gray-500 mt-1 leading-snug">
          {card.description}
        </div>
      )}
    </div>
  );
}
