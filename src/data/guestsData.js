// Guest leaderboard data for the Guest Database screen, ordered by spend.
// `initials` drives the colored avatar circle. The top 3 get accent colors.
// The extra fields (phone, room, etc.) are shown in the "View" popup.
export const guests = [
  { rank: 1, name: "Emeka Okafor", email: "emeka.o@luxe.ng", initials: "EO", revenue: "₦5,400,000", phone: "0801 234 5678", room: "RM 301", lastStay: "17 Jun 2026", visits: 14, status: "Checked in" },
  { rank: 2, name: "Amina Bello", email: "amina.b@corp.com", initials: "AB", revenue: "₦4,250,000", phone: "0808 765 4321", room: "RM 204", lastStay: "12 Jun 2026", visits: 11, status: "Reserved" },
  { rank: 3, name: "Kojo Smith", email: "kojo.smith@gh.co", initials: "KS", revenue: "₦3,100,000", phone: "0700 111 2222", room: "RM 102", lastStay: "8 Jun 2026", visits: 9, status: "Checked out" },
  { rank: 4, name: "Seyi Makinde", email: "seyi.m@gov.ng", initials: "SM", revenue: "₦2,800,000", phone: "0802 333 4444", room: "RM 305", lastStay: "2 Jun 2026", visits: 8, status: "Checked out" },
  { rank: 5, name: "Zainab Usman", email: "z.usman@ngo.org", initials: "ZU", revenue: "₦1,900,000", phone: "0803 555 6666", room: "RM 201", lastStay: "28 May 2026", visits: 6, status: "Checked out" },
  { rank: 6, name: "Victor Ike", email: "ike.victor@tech.io", initials: "VI", revenue: "₦1,750,000", phone: "0805 777 8888", room: "RM 303", lastStay: "21 May 2026", visits: 5, status: "Checked out" },
  { rank: 7, name: "Funmi Ade", email: "funmi@design.co", initials: "FA", revenue: "₦1,400,000", phone: "0806 999 0000", room: "RM 101", lastStay: "15 May 2026", visits: 4, status: "Checked out" },
  { rank: 8, name: "John Doe", email: "john@suites.com", initials: "JD", revenue: "₦1,200,000", phone: "0809 121 3141", room: "RM 304", lastStay: "9 May 2026", visits: 3, status: "Checked out" },
  { rank: 9, name: "Sarah Connor", email: "sarah@future.net", initials: "SC", revenue: "₦1,100,000", phone: "0701 516 1718", room: "RM 202", lastStay: "1 May 2026", visits: 3, status: "Checked out" },
  { rank: 10, name: "Ibrahim Lawal", email: "i.lawal@law.ng", initials: "IL", revenue: "₦1,050,000", phone: "0802 192 0212", room: "RM 103", lastStay: "24 Apr 2026", visits: 2, status: "Checked out" },
];

export const guestStats = {
  total: "120",
  totalRevenue: "₦29,800,000",
  topSpender: "Emeka Okafor",
};
