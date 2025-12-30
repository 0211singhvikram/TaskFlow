import { useEffect, useState } from "react";
import { DragDropContext } from "@hello-pangea/dnd";
import Column from "./Column";
import { io } from "socket.io-client";


const BOARD_ID = "6954249107c4417696cc5e71";
const API = "http://localhost:5000";
const socket = io("http://localhost:5000");


export default function Board() {
  const [board, setBoard] = useState(null);
  const [columns, setColumns] = useState([]);
  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(true);

  // ---------- FETCH / REFETCH ----------
  async function fetchBoard() {
    try {
      const res = await fetch(`${API}/boards/${BOARD_ID}`);
      const data = await res.json();

      setBoard(data.board);
      setColumns(data.columns);
      setCards(data.cards);
    } catch (err) {
      console.error("Failed to fetch board", err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchBoard();

    socket.emit("join-board", BOARD_ID);

    socket.on("board-updated", () => {
      fetchBoard();
    });

    return () => {
      socket.off("board-updated");
    };
  }, []);

  // ---------- DRAG HANDLER ----------
  async function onDragEnd(result) {
    const { source, destination, draggableId } = result;
    if (!destination) return;

    if (
      source.droppableId === destination.droppableId &&
      source.index === destination.index
    )
      return;

    // snapshot for rollback
    const prevColumns = JSON.parse(JSON.stringify(columns));

    // ----- OPTIMISTIC UI UPDATE -----
    setColumns((cols) => {
      const next = cols.map((c) => ({ ...c, cardIds: [...c.cardIds] }));

      const src = next.find((c) => c._id === source.droppableId);
      const dst = next.find((c) => c._id === destination.droppableId);
      if (!src || !dst) return cols;

      if (src._id === dst._id) {
        const [moved] = src.cardIds.splice(source.index, 1);
        src.cardIds.splice(destination.index, 0, moved);
      } else {
        const [moved] = src.cardIds.splice(source.index, 1);
        dst.cardIds.splice(destination.index, 0, moved);
      }

      return next;
    });

    // ----- BACKEND CALL -----
    try {
      const sourceCol = columns.find((c) => c._id === source.droppableId);
      const destCol = columns.find((c) => c._id === destination.droppableId);

      const res = await fetch(`${API}/boards/${BOARD_ID}/move-card`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          cardId: draggableId,
          sourceColumnId: source.droppableId,
          destinationColumnId: destination.droppableId,
          sourceIndex: source.index,
          destinationIndex: destination.index,
          sourceVersion: sourceCol.version,
          destinationVersion: destCol.version
        })
      });

      if (!res.ok) {
        // conflict or server error → rollback
        setColumns(prevColumns);
      }

      // 🔑 ALWAYS RESYNC FROM BACKEND (SUCCESS OR FAILURE)
      await fetchBoard();

    } catch (err) {
      // network error → rollback + resync
      setColumns(prevColumns);
      await fetchBoard();
    }
  }

  // ---------- UI ----------
  if (loading) return <div className="p-6">Loading board...</div>;
  if (!board) return <div className="p-6 text-red-600">Board not found</div>;

  return (
    <div className="min-h-screen bg-indigo-100 p-6">
      <header className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">{board.name}</h1>
          <p className="text-sm text-gray-600">
            Backend-driven Kanban board
          </p>
        </div>
        <div className="text-sm text-gray-600">Drag cards to reorder</div>
      </header>

      <DragDropContext onDragEnd={onDragEnd}>
        <main className="flex gap-4 overflow-x-auto pb-6">
          {board.columnIds.map((columnId) => {
            const column = columns.find((c) => c._id === columnId);
            if (!column) return null;

            const columnCards = column.cardIds
              .map((id) => cards.find((c) => c._id === id))
              .filter(Boolean);

            return (
              <section key={column._id} className="flex flex-col">
                <Column
                  id={column._id}
                  title={column.title}
                  cards={columnCards}
                />
              </section>
            );
          })}
        </main>
      </DragDropContext>
    </div>
  );
}
