// The hotel's own identity — the things that differ between one installation
// and the next.
//
// This is the first piece of the per-hotel config idea: Ception is the product,
// and everything here belongs to the hotel running it. For now it's a file you
// edit per install; later it becomes a settings table the admin can edit.
//
// Anywhere the hotel (rather than the software) is being named should read from
// here rather than hardcoding it.
export const HOTEL = {
  name: "Ception Grand Hotel",
  nameLine2: "& Suites",
  addressLine1: "Plot 14 Victoria Island Expressway",
  addressLine2: "Lagos, Nigeria",
  phone: "+234 1 234 5678 / 5679",
  vatRate: 0.075,
};