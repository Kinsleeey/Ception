import { useState } from "react";
import TopBar from "../components/TopBar.jsx";
import CategoryTabs from "../components/CategoryTabs.jsx";
import StatusFilterPanel from "../components/StatusFilterPanel.jsx";
import RoomCard from "../components/RoomCard.jsx";
import GuestRegistration from "./GuestRegistration.jsx";
import ReservationModal from "../components/ReservationModal.jsx";
import ReservationDetailsModal from "../components/ReservationDetailsModal.jsx";
import BookingDetails from "./BookingDetails.jsx";
import ConfirmModal from "../components/ConfirmModal.jsx";
import { rooms, CATEGORIES, countByStatus } from "../data/roomsData.js";

// The reception dashboard. Each room card opens a popup *over* this page
// (which stays blurred behind it) rather than navigating to a new screen.
// `modal` holds which popup is open, or null when none is.
export default function RoomDashboard() {
  const [category, setCategory] = useState("Executive");
  const [status, setStatus] = useState("Available");
  // "checkin" | "reserve" | "reservedDetails" | "booking" | "checkout" | null
  const [modal, setModal] = useState(null);
  // The room a popup was opened for (so the modal can show its details).
  const [activeRoom, setActiveRoom] = useState(null);

  const visibleRooms = rooms.filter(
    (room) => room.category === category && room.status === status
  );
  const counts = countByStatus(category);

  function openModal(name, room) {
    setActiveRoom(room);
    setModal(name);
  }
  function closeModal() {
    setModal(null);
    setActiveRoom(null);
  }

  // Which buttons a card shows depends on its status:
  //  - Available -> Check-in Guest / Reserve for Guest
  //  - Reserved  -> a single "View Details" button (opens reservation details)
  //  - otherwise (Booked / 1hour Left / Overdue) -> View Guest / Check-out
  function actionsForRoom(room) {
    if (room.status === "Available") {
      return [
        { label: "Check-in Guest", variant: "solid", onClick: () => openModal("checkin", room) },
        { label: "Reserve for Guest", variant: "outline", onClick: () => openModal("reserve", room) },
      ];
    }
    if (room.status === "Reserved") {
      return [
        { label: "View Details", variant: "solid", onClick: () => openModal("reservedDetails", room) },
      ];
    }
    return [
      { label: "View Guest", variant: "solid", onClick: () => openModal("booking", room) },
      { label: "Check-out Guest", variant: "outline", onClick: () => openModal("checkout", room) },
    ];
  }

  return (
    <div className="room-page">
      <TopBar title="Room Dashboard" />

      <div className="room-main">
        <CategoryTabs categories={CATEGORIES} active={category} onChange={setCategory} />

        <p className="room-caption">
          All <strong>{status}</strong> rooms for <strong>{category}</strong>.
        </p>

        <div className="room-layout">
          <StatusFilterPanel counts={counts} active={status} onChange={setStatus} />

          {visibleRooms.length === 0 ? (
            <p style={{ padding: "24px", color: "#7b7487" }}>
              No {status.toLowerCase()} rooms in {category} right now.
            </p>
          ) : (
            <div className="room-grid">
              {visibleRooms.map((room) => (
                <RoomCard
                  key={room.number}
                  room={room}
                  actions={actionsForRoom(room)}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Popups render over this page. Closing one just clears the state. */}
      {modal === "checkin" && <GuestRegistration onClose={closeModal} />}
      {modal === "reserve" && <ReservationModal room={activeRoom} onClose={closeModal} />}
      {modal === "reservedDetails" && <ReservationDetailsModal reservation={activeRoom ? {
        room: activeRoom.number,
        price: activeRoom.price,
        duration: "3 Nights",
        amountPaid: "₦180,000",
        payment: "Cash",
        start: { date: "17 Jun 2026", time: "2:00 PM" },
        end: { date: "20 Jun 2026", time: "12:00 PM" },
        guest: { name: "Emeka Okafor", phone: "08012345678", email: "emeka@gmail.com", address: "12 Broad Street, Lagos" },
      } : null} onClose={closeModal} />}
      {modal === "booking" && <BookingDetails onClose={closeModal} />}
      {modal === "checkout" && (
        <ConfirmModal
          variant="default"
          title="Check Out Guest?"
          confirmLabel="Check Out"
          cancelLabel="Cancel"
          onCancel={closeModal}
          onConfirm={() => {
            alert(`Guest in ${activeRoom?.number || "this room"} checked out. (Demo — nothing is stored yet.)`);
            closeModal();
          }}
        >
          You are about to check out the guest in <strong>{activeRoom?.number}</strong>.
          This will mark the room as available.
        </ConfirmModal>
      )}
    </div>
  );
}
