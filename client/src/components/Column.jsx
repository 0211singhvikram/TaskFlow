// src/components/Column.jsx
import Card from "./Card";
import { Droppable, Draggable } from "@hello-pangea/dnd";

export default function Column({ id, title, cards = [] }) {
  return (
    <div className="bg-indigo-300 rounded-lg p-4 w-72 flex-shrink-0">
      <div className="flex items-center justify-between mb-4">
        <h2 id={`col-${id}`} className="font-semibold text-lg text-indigo-900">
          {title}
        </h2>
        <span className="text-xs text-gray-600 bg-white/60 px-2 py-0.5 rounded">
          {cards.length}
        </span>
      </div>

      <Droppable droppableId={id}>
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            // role=list so screen readers can treat it as a list of items (cards)
            role="list"
            aria-labelledby={`col-${id}`}
            className={`space-y-3 min-h-[40px] p-1 rounded transition-colors ${
              snapshot.isDraggingOver ? "bg-indigo-200 ring-2 ring-indigo-400" : ""
            }`}
          >
            {cards.length === 0 ? (
              // show a clearer placeholder when user is dragging over the column
              snapshot.isDraggingOver ? (
                <div className="text-sm text-indigo-700 italic text-center py-6">Drop cards here</div>
              ) : (
                <div className="text-xs text-gray-500">No cards</div>
              )
            ) : (
              cards.map((c, index) => (
                <Draggable key={c.id} draggableId={c.id} index={index}>
                  {(prov, snap) => (
                    <div
                      ref={prov.innerRef}
                      {...prov.draggableProps}
                      {...prov.dragHandleProps}
                      className={`mb-2 transition-all ${
                        snap.isDragging ? "opacity-95 scale-[1.01] shadow-md" : "hover:shadow-md"
                      }`}
                      role="listitem"
                    >
                      <Card card={c} />
                    </div>
                  )}
                </Draggable>
              ))
            )}

            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </div>
  );
}
