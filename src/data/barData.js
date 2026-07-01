// Sample bar inventory for the Bartender Dashboard and Bar Report.
// Each product has a category so the filter pills can narrow the list.

export const barLocations = ["Bar 1", "Bar 3", "Lounge"];

export const barCategories = ["All", "Spirits", "Beer", "Wine", "Cocktails", "Water"];

export const products = [
  { name: "Hennessy VS", category: "Spirits", price: "₦8,500", priceValue: 8500, unit: "Shot" },
  { name: "Jack Daniel's", category: "Spirits", price: "₦7,200", priceValue: 7200, unit: "Shot" },
  { name: "Star Lager", category: "Beer", price: "₦1,200", priceValue: 1200, unit: "Bottle" },
  { name: "Heineken", category: "Beer", price: "₦1,500", priceValue: 1500, unit: "Pint" },
  { name: "Chamdor Red", category: "Wine", price: "₦4,800", priceValue: 4800, unit: "Glass" },
  { name: "Moët & Chandon", category: "Wine", price: "₦65,000", priceValue: 65000, unit: "Bottle" },
  { name: "Mojito", category: "Cocktails", price: "₦3,500", priceValue: 3500, unit: "Glass" },
  { name: "Piña Colada", category: "Cocktails", price: "₦3,800", priceValue: 3800, unit: "Glass" },
  { name: "Eva Water", category: "Water", price: "₦500", priceValue: 500, unit: "Bottle" },
  { name: "Voltic 75cl", category: "Water", price: "₦700", priceValue: 700, unit: "Bottle" },
  { name: "Jameson", category: "Spirits", price: "₦9,000", priceValue: 9000, unit: "Shot" },
  { name: "Guinness", category: "Beer", price: "₦1,400", priceValue: 1400, unit: "Bottle" },
];

export const barStats = { totalProducts: 48, categories: 6 };

// Bar Report figures (admin-side view of bar performance).
export const barReportRows = [
  { product: "Hennessy VS", category: "Spirits", sold: 84, revenue: "₦714,000" },
  { product: "Moët & Chandon", category: "Wine", sold: 22, revenue: "₦1,430,000" },
  { product: "Heineken", category: "Beer", sold: 410, revenue: "₦615,000" },
  { product: "Mojito", category: "Cocktails", sold: 196, revenue: "₦686,000" },
  { product: "Jameson", category: "Spirits", sold: 73, revenue: "₦657,000" },
  { product: "Star Lager", category: "Beer", sold: 388, revenue: "₦465,600" },
  { product: "Voltic 75cl", category: "Water", sold: 512, revenue: "₦358,400" },
];

export const barReportStats = {
  totalRevenue: "₦4,926,000",
  unitsSold: "1,685",
  topProduct: "Heineken",
};

// The Add/Edit Drinks management screen shows one extra category ("Soft Drinks")
// and lets you create more, so it keeps its own list separate from the
// bartender dashboard's filter pills above.
export const manageCategories = [
  "All", "Spirits", "Beer", "Wine", "Cocktails", "Soft Drinks", "Water",
];

// A sample order shown in the Bar Order Details modal. `qty` × unit price
// gives each line total; the totals are derived in the page from these rows.
export const sampleOrder = {
  id: "#00124",
  location: "Bar 1",
  time: "2:34 PM",
  payment: "Cash",
  servedBy: "James",
  items: [
    { name: "Hennessy VS", unit: 8500, qty: 2 },
    { name: "Macallan 12Y", unit: 24000, qty: 1 },
    { name: "Heineken Draught", unit: 3200, qty: 1 },
    { name: "Coca-Cola", unit: 800, qty: 2 },
  ],
  vatRate: 0.075,
};

// --- Bar Report ("Record") screen -------------------------------------------
// Top summary cards.
export const recordStats = {
  currentRevenue: "₦298,000",
  drinksSold: "156",
};

// "Daily Sales History" table rows. Each has an order id, bar, payment method
// and total; clicking View opens the order details modal.
export const salesHistory = [
  { time: "2:34 PM", orderId: "#000124", bar: "Bar 1", payment: "Cash", total: "₦17,000" },
  { time: "2:21 PM", orderId: "#000123", bar: "Bar 1", payment: "POS", total: "₦42,500" },
  { time: "1:58 PM", orderId: "#000122", bar: "Lounge", payment: "Cash", total: "₦8,400" },
  { time: "1:30 PM", orderId: "#000121", bar: "Bar 2", payment: "Transfer", total: "₦65,000" },
  { time: "12:47 PM", orderId: "#000120", bar: "Bar 1", payment: "Cash", total: "₦12,800" },
];

// "Revenue" table: each period broken down by bar, plus a total column.
export const revenueByPeriod = [
  { period: "Daily", bar1: "₦145,000", bar2: "₦92,000", lounge: "₦55,000", total: "₦292,000" },
  { period: "Weekly", bar1: "₦1,015,000", bar2: "₦644,000", lounge: "₦385,000", total: "₦2,044,000" },
  { period: "Monthly", bar1: "₦4,350,000", bar2: "₦2,760,000", lounge: "₦1,650,000", total: "₦8,760,000" },
];

export const monthlyTargetPct = 72;
