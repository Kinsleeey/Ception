import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import ModuleHeader from "../components/ModuleHeader.jsx";
import CategoryTabs from "../components/CategoryTabs.jsx";
import StatusFilterPanel from "../components/StatusFilterPanel.jsx";
import RoomCard from "../components/RoomCard.jsx";
import RoomDetailsModal from "../components/RoomDetailsModal.jsx";
import StatusLegendRibbon from "../components/StatusLegendRibbon.jsx";
import ReportIssueModal from "../components/ReportIssueModal.jsx";
import MyReportsModal from "../components/MyReportsModal.jsx";
import GuestRegistration from "./GuestRegistration.jsx";
import ReservationModal from "../components/ReservationModal.jsx";
import BookingDetails from "./BookingDetails.jsx";
import ConfirmModal from "../components/ConfirmModal.jsx";
import { PlusIcon } from "../components/icons.jsx";
import { CATEGORIES } from "../data/roomsData.js";        // keep the category list
import { getRooms, checkOut, getRoomStatusCounts, getIssues } from "../api.js";


export default function RoomDashboard() {
  // "Standard" "Available" rooms as default
  const [category, setCategory] = useState("Standard");   
  const [status, setStatus] = useState("Available");

  const [counts, setCounts] = useState({});

  //rooms array, loading state and error
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

 //for the pop ups
  const [modal, setModal] = useState(null); //which popup is currently open
  // Which room's details popup is open, or null. Opened by the ⓘ on a card.
  const [infoRoomId, setInfoRoomId] = useState(null);

  // Issue reporting: which popup is open, and how many reports still need
  // attention (the number in the circle).
  const [issueModal, setIssueModal] = useState(null);   // "report" | "list" | null
  const [openIssues, setOpenIssues] = useState(0);

  async function loadIssueCount() {
    try {
      const d = await getIssues("Reception");
      setOpenIssues(d.openCount || 0);
    } catch {
      setOpenIssues(0);
    }
  }

  useEffect(() => { loadIssueCount(); }, []);
  const [activeRoom, setActiveRoom] = useState(null); //which room is that popup about

  
  async function loadRooms() { //the entire function is run below inside useEffect
    try {
      setLoading(true);
      setError(null);
      const data = await getRooms({ category, status, activeOnly: true });
      setRooms(data); //stores all the room objects in an array called rooms
      // Also refresh the per-status badge counts (active-only, to match the list).
      const statusCounts = await getRoomStatusCounts({ category, activeOnly: true });
      setCounts(statusCounts);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  // Run loadRooms() on first render, and again whenever category or status
  // changes.
  useEffect(() => {
    loadRooms(); 
  }, [category, status]); //runs whenever category/status changes

  function openModal(name, room) {
    setActiveRoom(room); //room that modal belongs to
    setModal(name); //name of the modal to be opened 
  }

  function closeModal() {
    setModal(null);
    setActiveRoom(null);
  }

  // Which buttons a card shows depends on its status.
  function actionsForRoom(room) {
    if (room.status === "Available") {
      return [
        { label: "Check-in Guest", variant: "solid", onClick: () => openModal("checkin", room) },
        { label: "Reserve for Guest", variant: "outline", onClick: () => openModal("reserve", room) },
      ];
    }
    return [
      { label: "View Guest", variant: "solid", onClick: () => openModal("booking", room) },
      { label: "Check-out Guest", variant: "outline", onClick: () => openModal("checkout", room) },
    ];
  }

  // ----- Action handlers that hit the API, then refresh the list -----
  async function handleCheckout() {
    try {
      await checkOut(activeRoom.id);   // POST /api/rooms/:id/checkout
      closeModal();
      await loadRooms();               // refresh so the room leaves this view. it restored all the rooms in the rooms array
    } catch (err) {
      alert(`Checkout failed: ${err.message}`);
    }
  }

  return (
    <div className="room-page">
      <ModuleHeader module="Reception" />

      <div className="room-main">
        {/* Two purple text links, right-aligned above the category tabs. */}
        <div className="room-actions-row">
          <Link className="room-action-link" to="/reservations/new">
            <PlusIcon size={12} /> Create Multiple Reservations
          </Link>
          <Link className="room-action-link" to="/reservations">
            View Reservations
          </Link>

          <span className="room-actions-row__divider" />

          <button className="room-action-link" onClick={() => setIssueModal("report")}>
            Report an Issue
          </button>
          <Link className="room-action-link" to="/room-activity">
            Today's Activity
          </Link>
          {/* The circle shows how many reports still need attention. */}
          <button
            className="issue-badge"
            onClick={() => setIssueModal("list")}
            aria-label={`${openIssues} open report${openIssues === 1 ? "" : "s"}`}
            title="View reports"
          >
            {openIssues}
          </button>
        </div>

        <CategoryTabs categories={CATEGORIES} active={category} onChange={setCategory} />

        <p className="room-caption">
          All <strong>{status}</strong> rooms for <strong>{category}</strong>.
        </p>

        <StatusLegendRibbon />

        <div className="room-layout">
          <StatusFilterPanel counts={counts} active={status} onChange={setStatus} />

          {loading ? (
            <p style={{ padding: "24px", color: "#7b7487" }}>Loading rooms…</p> //if loading is true
          ) : error ? (                                                           //if loading isnt true, is there an error?
                                                                                          //if there's an error
            <p style={{ padding: "24px", color: "#c0392b" }}>                     
              Couldn’t load rooms: {error}
            </p>                                                                            
          ) : rooms.length === 0 ? (                                                        //if there is no error, are there any rooms?
                                                                                                  //if there is no room
            <p style={{ padding: "24px", color: "#7b7487" }}>                                      
              No {status.toLowerCase()} rooms in {category} right now.
            </p>
          ) : (                                                                                    //if there is a room/ are rooms
            <div className="room-grid">
              {rooms.map((room) => (
                <RoomCard
                  key={room.id}
                  onInfo={(r) => setInfoRoomId(r.id)}
                  room={room}
                  actions={actionsForRoom(room)}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Popups render over this page. Closing one just clears the state. */}
      {modal === "checkin" && (
        <GuestRegistration
          room={activeRoom}
          onClose={closeModal}
          onDone={async () => { closeModal(); await loadRooms(); }}
        />
      )}
      {modal === "reserve" && (
        <ReservationModal
          room={activeRoom}
          onClose={closeModal}
          onDone={async () => { closeModal(); await loadRooms(); }}
        />
      )}
      {modal === "booking" && (
        <BookingDetails
          roomId={activeRoom?.id}
          onClose={closeModal}
          onCheckout={handleCheckout}
        />
      )}
      {modal === "checkout" && (
        <ConfirmModal
          variant="default"
          title="Check Out Guest?"
          confirmLabel="Check Out"
          cancelLabel="Cancel"
          onCancel={closeModal}
          onConfirm={handleCheckout}
        >
          You are about to check out the guest in <strong>{activeRoom?.number}</strong>.
          This will mark the room as available.
        </ConfirmModal>
      )}

      {infoRoomId && (
        <RoomDetailsModal roomId={infoRoomId} onClose={() => setInfoRoomId(null)} />
      )}

      {issueModal === "report" && (
        <ReportIssueModal
          rooms={rooms}
          onClose={() => setIssueModal(null)}
          onSaved={async () => { setIssueModal(null); await loadIssueCount(); }}
        />
      )}
      {issueModal === "list" && (
        <MyReportsModal onClose={() => setIssueModal(null)} />
      )}
    </div>
  );
}