import { useState } from "react";
import Column from "./Column";
import { DragDropContext } from "@hello-pangea/dnd";

/**
 * Initial board data (kept outside the component to avoid re-creation on each render)
 */
const INITIAL_COLUMNS = [
  {
    id: "col-1",
    title: "Todo",
    cards: [
      { id: "c1", title: "Learn React", description: "Read official docs" },
      { id: "c2", title: "Setup Tailwind", description: "Configure Vite & tailwind" },
    ],
  },
  {
    id: "col-2",
    title: "In Progress",
    cards: [{ id: "c3", title: "Build Kanban UI", description: "Board / Column / Card" }],
  },
  {
    id: "col-3",
    title: "Done",
    cards: [{ id: "c4", title: "Project Setup", description: "Vite + Tailwind ready" }],
  },
];

export default function Board() {
  const [columns, setColumns] = useState(INITIAL_COLUMNS);

  // simple id generator for demo cards (ok for client-only usage)
  const genId = (prefix = "c") =>
    `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 7)}`;

  // onDragEnd: handle moving a card between columns (immutable)
  function onDragEnd(result) {
    const { source, destination } = result;

    // dropped outside a droppable
    if (!destination) return;

    // no movement
    if (source.droppableId === destination.droppableId && source.index === destination.index)
      return;

    setColumns((prev) => {
      // create shallow clone of columns with cloned cards arrays
      const newColumns = prev.map((col) => ({ ...col, cards: [...col.cards] }));

      const sourceColIndex = newColumns.findIndex((c) => c.id === source.droppableId);
      const destColIndex = newColumns.findIndex((c) => c.id === destination.droppableId);

      // safety checks
      if (sourceColIndex === -1 || destColIndex === -1) return prev;

      const sourceCards = newColumns[sourceColIndex].cards;
      const destCards = newColumns[destColIndex].cards;

      // remove card from source
      const [moved] = sourceCards.splice(source.index, 1);
      if (!moved) return prev;

      // insert into destination at the correct index
      destCards.splice(destination.index, 0, moved);

      return newColumns;
    });
  }

  return (
    <div className="min-h-screen bg-indigo-100 p-6">
      <header className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Kanban Board</h1>
          <p className="text-sm text-gray-600">Project: Real-time collaborative board (local demo)</p>
        </div>

        {/* You can re-enable a single action button here later (e.g. "New Card") */}
        <div className="text-sm text-gray-600">Drag cards to reorder</div>
      </header>

      <DragDropContext onDragEnd={onDragEnd}>
        <main className="flex gap-4 overflow-x-auto pb-6" role="list">
          {columns.map((col) => (
            <section key={col.id} className="flex flex-col" aria-labelledby={`col-${col.id}`}>
              {/* pass id prop required by Column droppable */}
              <Column id={col.id} title={col.title} cards={col.cards} />
            </section>
          ))}
        </main>
      </DragDropContext>
    </div>
  );
}
