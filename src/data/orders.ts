export interface Order {
  id: string;
  customer: {
    name: string;
    email: string;
  };
  date: string;
  items: number;
  total: number;
  status: "Processing" | "Shipped" | "Delivered" | "Cancelled";
}

export const ORDERS: Order[] = [
  { 
    id: "#8304", 
    customer: { name: "Robert Downey", email: "rdj@tony.it" }, 
    date: "2026-03-13 16:45", 
    items: 1, 
    total: 24500, 
    status: "Processing" 
  },
  { 
    id: "#8303", 
    customer: { name: "Alice Johnson", email: "alice.j@vault.com" }, 
    date: "2026-03-13 10:15", 
    items: 2, 
    total: 31000, 
    status: "Processing" 
  },
  { 
    id: "#8302", 
    customer: { name: "John Smith", email: "john@example.com" }, 
    date: "2026-03-13 14:20", 
    items: 2, 
    total: 37000, 
    status: "Processing" 
  },
  { 
    id: "#8301", 
    customer: { name: "Emma Woods", email: "emma.w@gmail.com" }, 
    date: "2026-03-12 11:45", 
    items: 1, 
    total: 16000, 
    status: "Shipped" 
  },
  { 
    id: "#8300", 
    customer: { name: "Michael Chen", email: "m.chen@outlook.com" }, 
    date: "2026-03-11 09:30", 
    items: 3, 
    total: 55500, 
    status: "Delivered" 
  },
  { 
    id: "#8299", 
    customer: { name: "Sarah Blake", email: "sarah.b@hey.com" }, 
    date: "2026-03-10 16:15", 
    items: 1, 
    total: 16000, 
    status: "Processing" 
  },
  { 
    id: "#8298", 
    customer: { name: "David Miller", email: "david.m@example.com" }, 
    date: "2026-03-08 10:50", 
    items: 2, 
    total: 31000, 
    status: "Cancelled" 
  },
  { 
    id: "#8297", 
    customer: { name: "Lucas Gray", email: "lucas.g@pro.com" }, 
    date: "2026-03-05 15:20", 
    items: 4, 
    total: 74000, 
    status: "Delivered" 
  },
  { 
    id: "#8296", 
    customer: { name: "Sophia Bell", email: "sophia.b@design.co" }, 
    date: "2026-03-02 12:00", 
    items: 2, 
    total: 32000, 
    status: "Shipped" 
  },
];
