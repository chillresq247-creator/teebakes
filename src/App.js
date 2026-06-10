import React, { useState, useContext, createContext, useReducer, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  "https://iofvfvttmobamxclwspq.supabase.co",
  "sb_publishable_30CyLoBwFssXKPeiPhImCg_UQlArxjL"
);

// ============================================================
// CART CONTEXT
// ============================================================
const CartContext = createContext();
function cartReducer(state, action) {
  switch (action.type) {
    case "ADD": {
      const existing = state.find(i => i.id === action.item.id && JSON.stringify(i.options) === JSON.stringify(action.item.options));
      if (existing) return state.map(i => i === existing ? { ...i, qty: i.qty + 1 } : i);
      return [...state, { ...action.item, qty: 1 }];
    }
    case "REMOVE": return state.filter((_, idx) => idx !== action.idx);
    case "UPDATE_QTY": return state.map((i, idx) => idx === action.idx ? { ...i, qty: action.qty } : i).filter(i => i.qty > 0);
    case "CLEAR": return [];
    default: return state;
  }
}
function CartProvider({ children }) {
  const [cart, dispatch] = useReducer(cartReducer, []);
  const total = cart.reduce((s, i) => s + i.price * i.qty, 0);
  const count = cart.reduce((s, i) => s + i.qty, 0);
  return <CartContext.Provider value={{ cart, dispatch, total, count }}>{children}</CartContext.Provider>;
}

// ============================================================
// REAL MENU DATA based on photos
// ============================================================
const MENU = [
  // DONUTS
  {
    id: "d-sugar", category: "donut", name: "Sugar Donut Box (4)", price: 3.00,
    badge: "4 for £3",
    description: "A box of 4 fresh fried ring donuts dusted in caster sugar. Light, pillowy and made fresh to order. A TeeBakes classic.",
    allergens: ["gluten", "eggs", "dairy"], emoji: "🍩",
    bg: "#2d1b69", accent: "#f5c542",
    options: {}
  },
  {
    id: "d-loaded", category: "donut", name: "Loaded Donut Box (4)", price: 4.00,
    badge: "4 for £4",
    description: "A box of 4 loaded donuts smothered in your chosen sauce and piled high with toppings. Mix or all one flavour.",
    allergens: ["gluten", "eggs", "dairy", "soy"], emoji: "🍩",
    bg: "#8B4513", accent: "#f5c542",
    options: { flavour: ["Mixed", "Oreo", "Kinder", "Biscoff"] }
  },
  {
    id: "d-flavoured", category: "donut", name: "Flavoured Box (4)", price: 4.00,
    badge: "4 for £4",
    description: "A box of 4 donuts in your chosen flavour — Apple Crumble with white choc sauce, Oreo, Kinder or Biscoff.",
    allergens: ["gluten", "eggs", "dairy", "soy"], emoji: "🍩",
    bg: "#5c3317", accent: "#f5c542",
    options: { flavour: ["Apple Crumble & White Choc", "Oreo", "Kinder", "Biscoff"] }
  },
  // COOKIE PIES
  {
    id: "cp-slice", category: "cookie_pie", name: "Cookie Pie Slice", price: 3.00,
    badge: "Warm & Gooey",
    description: "A generous slice of our famous cookie pie. £3 cold or £3.50 warm with sauce. Ask about today's flavour.",
    allergens: ["gluten", "eggs", "dairy"], emoji: "🥧",
    bg: "#5c3317", accent: "#f5c542",
    options: { serving: ["Cold — £3.00", "Warm with sauce — £3.50"] }
  },
  {
    id: "cp-choc", category: "cookie_pie", name: "Triple Choc Pie Slice", price: 3.00,
    badge: null,
    description: "Thick cookie base loaded with dark, milk and white chocolate chunks. Gooey in the middle, crisp on the edges. £3 cold, £3.50 warm with sauce.",
    allergens: ["gluten", "eggs", "dairy", "soy"], emoji: "🥧",
    bg: "#2c1507", accent: "#f5c542",
    options: { serving: ["Cold — £3.00", "Warm with sauce — £3.50"] }
  },
  {
    id: "cp-lotus-pie", category: "cookie_pie", name: "Biscoff Cookie Pie Slice", price: 3.00,
    badge: "Most Popular",
    description: "Cookie base swirled with Biscoff spread, topped with a Biscoff biscuit and chocolate drizzle. £3 cold, £3.50 warm with sauce.",
    allergens: ["gluten", "eggs", "dairy", "soy"], emoji: "🥧",
    bg: "#b5722a", accent: "#f5c542",
    options: { serving: ["Cold — £3.00", "Warm with sauce — £3.50"] }
  },
  {
    id: "cp-oreo-pie", category: "cookie_pie", name: "Oreo Cookie Pie Slice", price: 3.00,
    badge: null,
    description: "Cookie dough baked with Oreo pieces throughout, topped with chocolate ganache and a whole Oreo. £3 cold, £3.50 warm with sauce.",
    allergens: ["gluten", "eggs", "dairy", "soy"], emoji: "🥧",
    bg: "#1a1a1a", accent: "#f5c542",
    options: { serving: ["Cold — £3.00", "Warm with sauce — £3.50"] }
  },
  {
    id: "cp-mm-pie", category: "cookie_pie", name: "M&M Cookie Pie Slice", price: 3.00,
    badge: null,
    description: "Soft golden cookie pie studded with M&Ms, drizzled with milk chocolate. Fun, colourful and delicious. £3 cold, £3.50 warm with sauce.",
    allergens: ["gluten", "eggs", "dairy", "soy"], emoji: "🥧",
    bg: "#3d6b35", accent: "#f5c542",
    options: { serving: ["Cold — £3.00", "Warm with sauce — £3.50"] }
  },
  {
    id: "cp-whole", category: "cookie_pie", name: "Whole Cookie Pie", price: 25.00,
    badge: "Pre-Order",
    description: "Order a whole cookie pie for collection or delivery. Choose your flavour — perfect for sharing (serves 6-8). Needs 24hr notice.",
    allergens: ["gluten", "eggs", "dairy"], emoji: "🥧",
    bg: "#2d1b69", accent: "#f5c542",
    options: { flavour: ["Triple Chocolate", "Biscoff", "Oreo", "M&M", "Mixed/Custom"] }
  },
  // COOKIE CUPS
  {
    id: "cc-main", category: "cookie_cup", name: "Cookie Cup", price: 3.00,
    badge: "New",
    description: "Individual cookie baked into a cup shape, filled with chocolate ganache and topped with your choice of topping.",
    allergens: ["gluten", "eggs", "dairy"], emoji: "🍪",
    bg: "#6b3fa0", accent: "#f5c542",
    options: { topping: ["Lotus & Biscoff", "Oreo & Choc", "M&M & Caramel", "Cadbury & Caramel", "Easter Eggs & Choc"] }
  },
];

function getNextDays(n) {
  const days = [];
  for (let i = 1; i <= n + 3; i++) {
    const d = new Date(); d.setDate(d.getDate() + i);
    if (d.getDay() !== 0) days.push(d);
    if (days.length === n) break;
  }
  return days;
}

// ⬇️ EDIT THESE ANYTIME ⬇️
const SETTINGS = {
  openStart: 13, // 1pm
  openEnd: 23, // 11pm
  openDays: [5, 6, 0], // Fri=5, Sat=6, Sun=0
  minNoticeWeekend: 1, // 1hr notice for Fri/Sat/Sun
  minNoticeWeekday: 24, // 24hr notice for Mon-Thu
  slotInterval: 30 // 30min time slots
};

const generateTimeSlots = (selectedDate) => {
  const slots = [];
  const now = new Date();
  const selected = new Date(selectedDate);
  const dayOfWeek = selected.getDay();
  const isOpenDay = SETTINGS.openDays.includes(dayOfWeek);

  const formatTime = (hour, mins) =>
    new Date(0, 0, 0, hour, mins).toLocaleTimeString('en-GB', {
      hour: 'numeric', minute: '2-digit', hour12: true
    });

  for (let hour = 0; hour < 24; hour++) {
    for (let mins of ['00', '30']) {
      const slotDate = new Date(selected);
      slotDate.setHours(hour, mins, 0, 0);

      const requiredNotice = isOpenDay ? SETTINGS.minNoticeWeekend : SETTINGS.minNoticeWeekday;
      if (slotDate < new Date(now.getTime() + requiredNotice * 3600000)) continue;

      if (isOpenDay && (hour < SETTINGS.openStart || hour >= SETTINGS.openEnd)) continue;

      slots.push({ value: `${hour}:${mins}`, label: formatTime(hour, mins) });
    }
  }
  return slots;
};

function MenuPage() {
  const { dispatch } = useContext(CartContext);
  const [selectedItem, setSelectedItem] = useState(null);
  const [activeTab, setActiveTab] = useState("all");

  const tabs = [
    { id: "all", label: "🍽️ Everything" },
    { id: "donut", label: "🍩 Donuts" },
    { id: "cookie_pie", label: "🥧 Cookie Pies" },
    { id: "cookie_cup", label: "🍪 Cookie Cups" },
  ];

  const filtered = activeTab === "all" ? MENU : MENU.filter(i => i.category === activeTab);

  return (
    <>
      <div className="hero">
        <div className="hero-badge">🔥 Fresh Made to Order · Walsall</div>
        <div style={{ display: "flex", justifyContent: "center", marginBottom: "1rem", position: "relative" }}>
          <TeeBakesLogo size={110} />
        </div>
        <h1>TEE<span>BAKES</span></h1>
        <div className="hero-sub">Specialty Bakes</div>
        <p>Fresh fried donuts, loaded with your favourite toppings. Warm gooey cookie pies by the slice. Pre-order for collection or delivery.</p>
        <div className="hero-pills">
          <span className="hero-pill">🍩 Loaded Donuts</span>
          <span className="hero-pill">🥧 Cookie Pies</span>
          <span className="hero-pill">🍪 Cookie Cups</span>
          <span className="hero-pill">🚗 Delivery Available</span>
        </div>
      </div>

      <div className="cat-tabs">
        {tabs.map(t => (
          <button key={t.id} className={`cat-tab ${activeTab === t.id ? "active" : ""}`} onClick={() => setActiveTab(t.id)}>
            {t.label}
          </button>
        ))}
      </div>

      <div className="page">
        <div className="menu-grid">
          {filtered.map(item => <MenuCard key={item.id} item={item} onOpen={setSelectedItem} />)}
        </div>
      </div>

      {selectedItem && (
        <ProductModal
          item={selectedItem}
          onClose={() => setSelectedItem(null)}
          onAdd={(item, options) => dispatch({ type: "ADD", item: { ...item, options } })}
        />
      )}
    </>
  );
}

function CheckoutPage({ onBack, onConfirm }) {
  const { cart, total } = useContext(CartContext);
  const days = getNextDays(9);
  const [type, setType] = useState("collection");
  const [selDate, setSelDate] = useState(null);
  const [selTime, setSelTime] = useState(null);
  const [payment, setPayment] = useState("on_arrival");
  const [form, setForm] = useState({ name: "", email: "", phone: "", address: "" });

  const fmtDate = d => d.toLocaleDateString("en-GB", { weekday: "short", month: "short", day: "numeric" });
  const canSubmit = form.name && form.email && selDate && selTime;

  function handleSubmit() {
    const orderId = "TB-" + Math.random().toString(36).substr(2, 6).toUpperCase();
    onConfirm({ orderId, ...form, type, date: fmtDate(selDate), time: selTime, payment, items: cart, total });
  }

  return (
    <div className="page">
      <div style={{ display: "flex", alignItems: "center", gap: "1rem", marginBottom: "1.5rem" }}>
        <button className="back-nav-btn" onClick={onBack}>← Back to Menu</button>
        <h2 style={{ fontFamily: "'Bangers',cursive", fontSize: "1.6rem", color: "var(--yellow)", letterSpacing: "2px" }}>CHECKOUT</h2>
      </div>
      <div className="checkout-grid">
        <div>
          <div className="co-section">
            <div className="co-title">📦 COLLECTION OR DELIVERY?</div>
            <div className="type-toggle">
              <button className={`type-btn ${type === "collection" ? "selected" : ""}`} onClick={() => setType("collection")}>🏪 Collection</button>
              <button className={`type-btn ${type === "delivery" ? "selected" : ""}`} onClick={() => setType("delivery")}>🚗 Delivery</button>
            </div>
            <div className="co-title" style={{ fontSize: "0.8rem", marginBottom: "0.6rem" }}>📅 PICK A DATE</div>
            <div className="date-grid">
              {days.map(d => (
                <button key={d.toString()} className={`date-btn ${selDate === d ? "selected" : ""}`}
                  onClick={() => { setSelDate(d); setSelTime(null); }}>{fmtDate(d)}</button>
              ))}
            </div>
            {selDate && <>
              <div className="co-title" style={{ fontSize: "0.8rem", margin: "1rem 0 0.6rem" }}>⏰ PICK A TIME</div>
              <div className="time-grid">
                {TIME_SLOTS[type].map(t => (
                  <button key={t} className={`time-btn ${selTime === t ? "selected" : ""}`} onClick={() => setSelTime(t)}>{t}</button>
                ))}
              </div>
            </>}
          </div>

          <div className="co-section">
            <div className="co-title">👤 YOUR DETAILS</div>
            {[{ k: "name", l: "Full Name", p: "Your name" }, { k: "email", l: "Email", p: "email@example.com" }, { k: "phone", l: "Phone", p: "+44 7700 000000" }].map(f => (
              <div key={f.k} className="form-group">
                <label className="form-label">{f.l}</label>
                <input className="form-input" type="text" placeholder={f.p}
                  value={form[f.k]} onChange={e => setForm(p => ({ ...p, [f.k]: e.target.value }))} />
              </div>
            ))}
            {type === "delivery" && (
              <div className="form-group">
                <label className="form-label">Delivery Address</label>
                <input className="form-input" type="text" placeholder="Your address"
                  value={form.address} onChange={e => setForm(p => ({ ...p, address: e.target.value }))} />
              </div>
            )}
          </div>

          <div className="co-section">
            <div className="co-title">💳 PAYMENT</div>
            <div className="payment-opts">
              <div className={`payment-opt ${payment === "card" ? "selected" : ""}`} onClick={() => setPayment("card")}>
                <div className="payment-opt-icon">💳</div>
                <div><div className="payment-opt-label">Pay Now (SumUp)</div><div className="payment-opt-sub">Secure card payment</div></div>
              </div>
            </div>
          </div>
        </div>

        <div>
          <div className="co-section" style={{ position: "sticky", top: "80px" }}>
            <div className="co-title">🧾 ORDER SUMMARY</div>
            {cart.map((item, idx) => (
              <div key={idx} className="summary-item">
                <span>{item.qty}× {item.name}</span>
                <span>£{(item.price * item.qty).toFixed(2)}</span>
              </div>
            ))}
            <div className="summary-total"><span>Total</span><span>£{total.toFixed(2)}</span></div>
            {selDate && selTime && (
              <div style={{ marginTop: "1rem", padding: "0.8rem", background: "rgba(245,197,66,0.07)", borderRadius: "8px", fontSize: "0.82rem", color: "rgba(255,255,255,0.5)", border: "1px solid rgba(245,197,66,0.2)" }}>
                📅 {fmtDate(selDate)} at {selTime}<br />
                {type === "collection" ? "🏪 Collection" : "🚗 Delivery"}
              </div>
            )}
            <button className="place-btn" onClick={handleSubmit} disabled={!canSubmit}>
              {payment === "card" ? "PAY & PLACE ORDER →" : "PLACE ORDER →"}
            </button>
            {!canSubmit && (
              <div style={{ textAlign: "center", fontSize: "0.75rem", color: "rgba(255,255,255,0.3)", marginTop: "0.5rem" }}>
                Fill in your details and select a date & time
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function ConfirmationPage({ order, onBackToMenu }) {
  return (
    <div className="confirmation">
      <div className="confirm-icon">🎉</div>
      <div className="confirm-title">ORDER PLACED!</div>
      <div className="confirm-sub">
        Thanks {order.name.split(" ")[0]}! We'll get your order freshly made.<br />
        Confirmation sent to <strong style={{ color: "var(--yellow)" }}>{order.email}</strong>
      </div>
      <div className="confirm-card">
        {[
          ["Order ID", order.orderId],
          ["Type", order.type === "collection" ? "🏪 Collection" : "🚗 Delivery"],
          ["Date", order.date],
          ["Time", order.time],
          ["Payment", "Paid by card"],
          ["Total", `£${order.total.toFixed(2)}`],
        ].map(([l, v]) => (
          <div key={l} className="confirm-row">
            <span className="confirm-label">{l}</span>
            <span className="confirm-value">{v}</span>
          </div>
        ))}
      </div>
      <button className="back-btn" onClick={onBackToMenu}>ORDER MORE 🍩</button>
    </div>
  );
}

// ============================================================
// ADMIN
// ============================================================
const MOCK_ORDERS = [
  { id: "TB-A1B2C3", name: "Aisha Rahman", email: "aisha@email.com", type: "collection", date: "Mon 9 Jun", time: "11:00", total: 12.00, status: "new", payment: "on_arrival", items: [{ name: "Loaded Box (4)", qty: 1 }, { name: "Cookie Pie Slice", qty: 2 }] },
  { id: "TB-D4E5F6", name: "Jake Thomas", email: "jake@email.com", type: "delivery", date: "Mon 9 Jun", time: "14:00", total: 28.00, status: "confirmed", payment: "card", items: [{ name: "Whole Cookie Pie (Biscoff)", qty: 1 }, { name: "Sugar Donuts (4)", qty: 2 }] },
  { id: "TB-G7H8I9", name: "Priya Patel", email: "priya@email.com", type: "collection", date: "Tue 10 Jun", time: "10:30", total: 15.50, status: "ready", payment: "card", items: [{ name: "Oreo Dream", qty: 2 }, { name: "Biscoff Cookie Pie Slice", qty: 3 }] },
  { id: "TB-J1K2L3", name: "Marcus Webb", email: "marcus@email.com", type: "delivery", date: "Tue 10 Jun", time: "13:00", total: 9.00, status: "completed", payment: "on_arrival", items: [{ name: "M&M Madness", qty: 1 }, { name: "Cookie Cup", qty: 2 }] },
];

function AdminDashboard() {
  const [orders, setOrders] = useState([]);
  const [filter, setFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const prevOrderCount = React.useRef(0);

  useEffect(() => {
    loadOrders();
    // Poll for new orders every 30 seconds
    const interval = setInterval(loadOrders, 30000);
    return () => clearInterval(interval);
  }, []);

  async function loadOrders() {
    const { data, error } = await supabase
      .from("orders")
      .select("*")
      .order("created_at", { ascending: false });
    if (data) {
      // Play sound if new orders arrived
      if (prevOrderCount.current > 0 && data.length > prevOrderCount.current) {
        playNotificationSound();
      }
      prevOrderCount.current = data.length;
      setOrders(data);
    }
    if (error) console.error(error);
    setLoading(false);
  }

  async function updateStatus(id, status) {
    await supabase.from("orders").update({ order_status: status }).eq("id", id);
    setOrders(os => os.map(o => o.id === id ? { ...o, order_status: status } : o));
  }

  const filtered = filter === "all" ? orders : orders.filter(o => o.order_status === filter);

  return (
    <div>
      <div className="stats-grid">
        {[
          { label: "Total Orders", value: orders.length, sub: `${orders.filter(o=>o.order_status==="new").length} new` },
          { label: "Revenue", value: `£${orders.reduce((s,o)=>s+(o.total||0),0).toFixed(2)}`, sub: "all time" },
          { label: "Collections", value: orders.filter(o=>o.type==="collection").length, sub: "total" },
          { label: "Deliveries", value: orders.filter(o=>o.type==="delivery").length, sub: "total" },
        ].map(s => (
          <div key={s.label} className="stat-card">
            <div className="stat-label">{s.label}</div>
            <div className="stat-value">{s.value}</div>
            <div className="stat-sub">{s.sub}</div>
          </div>
        ))}
      </div>
      <div className="orders-filter">
        {["all","new","confirmed","ready","completed"].map(f => (
          <button key={f} className={`filter-btn ${filter===f?"active":""}`} onClick={() => setFilter(f)}>
            {f.charAt(0).toUpperCase()+f.slice(1)}
          </button>
        ))}
      </div>
      {loading ? (
        <div style={{ color: "rgba(255,255,255,0.4)", padding: "2rem", textAlign: "center" }}>Loading orders...</div>
      ) : filtered.length === 0 ? (
        <div style={{ color: "rgba(255,255,255,0.4)", padding: "2rem", textAlign: "center" }}>No orders yet 👀</div>
      ) : (
      <div className="orders-list">
        {filtered.map(o => (
          <div key={o.id} className="order-card">
            <div>
              <div className="order-id">{o.id}</div>
              <div className="order-name">{o.customer_name}</div>
              <div className="order-detail">📧 {o.customer_email}</div>
              <div className="order-detail">{o.type==="collection"?"🏪 Collection":"🚗 Delivery"} · {o.date} at {o.time}</div>
              <div className="order-detail">{o.payment_method==="card"?"💳 Paid by card":"💵 Pay on arrival"}</div>
              <div style={{ marginTop: "0.4rem" }}>
                {o.items && o.items.map((item,i) => <span key={i} className="order-item-chip">{item.qty}× {item.name}</span>)}
              </div>
            </div>
            <div style={{ textAlign: "right" }}>
              <div className="order-total-badge">£{(o.total||0).toFixed(2)}</div>
              <div><span className={`status-badge status-${o.order_status}`}>{o.order_status}</span></div>
              <select className="status-select" value={o.order_status}
                onChange={e => updateStatus(o.id, e.target.value)}>
                <option value="new">New</option>
                <option value="confirmed">Confirmed</option>
                <option value="ready">Ready</option>
                <option value="completed">Completed</option>
              </select>
            </div>
          </div>
        ))}
      </div>
      )}
    </div>
  );
}

function AdminMenu() {
  const [items, setItems] = useState(MENU.map(i => ({ ...i, available: true })));
  const toggle = id => setItems(is => is.map(i => i.id===id ? {...i, available:!i.available} : i));
  const cats = [
    { id: "donut", label: "🍩 Donuts" },
    { id: "cookie_pie", label: "🥧 Cookie Pies" },
    { id: "cookie_cup", label: "🍪 Cookie Cups" },
  ];
  return (
    <div>
      {cats.map(cat => (
        <div key={cat.id} style={{ marginBottom: "2rem" }}>
          <div style={{ fontFamily: "'Bangers',cursive", fontSize: "1.1rem", color: "var(--yellow)", letterSpacing: "2px", marginBottom: "0.8rem" }}>{cat.label}</div>
          <div className="admin-menu-grid">
            {items.filter(i => i.category===cat.id).map(item => (
              <div key={item.id} className="admin-menu-card">
                <span style={{ fontSize: "1.8rem" }}>{item.emoji}</span>
                <div>
                  <div className="admin-card-name">{item.name}</div>
                  <div className="admin-card-price">from £{item.price.toFixed(2)}</div>
                  <button className={`toggle-avail ${item.available?"on":"off"}`} onClick={() => toggle(item.id)}>
                    {item.available ? "● Available" : "✗ Hidden"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

function AdminPage() {
  const [tab, setTab] = useState("orders");
  return (
    <div className="admin-layout">
      <div className="admin-sidebar">
        <div className="admin-sidebar-label">Admin Panel</div>
        {[{ id:"orders", label:"📋 Orders" }, { id:"menu", label:"🍩 Menu" }].map(t => (
          <button key={t.id} className={`admin-nav-btn ${tab===t.id?"active":""}`} onClick={() => setTab(t.id)}>{t.label}</button>
        ))}
      </div>
      <div className="admin-main">
        <div className="admin-page-title">{tab==="orders" ? "ORDERS" : "MENU MANAGER"}</div>
        {tab==="orders" && <AdminDashboard />}
        {tab==="menu" && <AdminMenu />}
      </div>
    </div>
  );
}

// ============================================================
// ROOT
// ============================================================
// ============================================================
// NOTIFICATION SOUND
// ============================================================
function playNotificationSound() {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const notes = [523, 659, 784, 1047];
    notes.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.frequency.value = freq;
      osc.type = "sine";
      gain.gain.setValueAtTime(0.3, ctx.currentTime + i * 0.15);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + i * 0.15 + 0.3);
      osc.start(ctx.currentTime + i * 0.15);
      osc.stop(ctx.currentTime + i * 0.15 + 0.3);
    });
  } catch (e) {}
}

// ============================================================
// ADMIN PIN LOCK
// ============================================================
const ADMIN_PIN = "0408"; // Change this to your own PIN!

function AdminPinLock({ onUnlock }) {
  const [pin, setPin] = useState("");
  const [error, setError] = useState(false);

  function handleSubmit() {
    if (pin === ADMIN_PIN) {
      onUnlock();
    } else {
      setError(true);
      setPin("");
      setTimeout(() => setError(false), 2000);
    }
  }

  return (
    <div style={{
      minHeight: "100vh", background: "var(--dark)",
      display: "flex", alignItems: "center", justifyContent: "center"
    }}>
      <div style={{
        background: "#1a1040", borderRadius: "20px", padding: "2.5rem",
        border: "2px solid rgba(245,197,66,0.3)", width: "320px", textAlign: "center"
      }}>
        <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>🔒</div>
        <div style={{ fontFamily: "'Bangers',cursive", fontSize: "1.8rem", color: "var(--yellow)", letterSpacing: "2px", marginBottom: "0.5rem" }}>ADMIN ACCESS</div>
        <div style={{ color: "rgba(255,255,255,0.4)", fontSize: "0.85rem", marginBottom: "1.5rem" }}>Enter your PIN to continue</div>
        <input
          type="password" inputMode="numeric" maxLength={6}
          value={pin} onChange={e => setPin(e.target.value)}
          onKeyDown={e => e.key === "Enter" && handleSubmit()}
          placeholder="Enter PIN"
          style={{
            width: "100%", padding: "0.9rem", borderRadius: "10px", textAlign: "center",
            border: `2px solid ${error ? "#e06060" : "rgba(255,255,255,0.15)"}`,
            background: "rgba(255,255,255,0.05)", color: "white",
            fontFamily: "'Nunito',sans-serif", fontSize: "1.5rem",
            letterSpacing: "0.5rem", outline: "none", marginBottom: "1rem"
          }}
        />
        {error && <div style={{ color: "#e06060", fontSize: "0.85rem", marginBottom: "0.8rem" }}>❌ Wrong PIN, try again</div>}
        <button onClick={handleSubmit} style={{
          width: "100%", padding: "0.9rem", background: "var(--yellow)",
          color: "var(--dark)", border: "none", borderRadius: "10px", cursor: "pointer",
          fontFamily: "'Bangers',cursive", fontSize: "1.2rem", letterSpacing: "2px"
        }}>UNLOCK</button>
      </div>
    </div>
  );
}

function App() {
  const [page, setPage] = useState("menu");
  const [cartOpen, setCartOpen] = useState(false);
  const [confirmedOrder, setConfirmedOrder] = useState(null);
  const [adminUnlocked, setAdminUnlocked] = useState(false);
  const { count, dispatch } = useContext(CartContext);

  // Secret admin access — add ?admin to URL to show hidden button
  const showAdminBtn = typeof window !== "undefined" && window.location.search.includes("admin");

  async function handleConfirm(order) {
    const { error } = await supabase.from("orders").insert({
      id: order.orderId,
      customer_name: order.name,
      customer_email: order.email,
      customer_phone: order.phone,
      items: order.items,
      total: order.total,
      type: order.type,
      delivery_address: order.address || null,
      date: order.date,
      time: order.time,
      payment_method: order.payment,
      order_status: "new"
    });// Send new order alert email
    await fetch("https://api.web3forms.com/submit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        access_key: "77ce4f8c-6a71-484d-908c-0ae1e5318610",
        subject: "📦 New Teebakes Order",
        name: order.name,
        email: order.email,
        phone: order.phone,
        message: `
    Order Details:
    -------------------
    Name: ${order.name}
    Phone: ${order.phone}
    Email: ${order.email}
    Items: ${order.items.map(i => `${i.quantity}x ${i.name}`).join(', ')}
    Total: £${order.total.toFixed(2)}
    Type: ${order.type === 'collection' ? 'Collection' : 'Delivery'}
    Date: ${order.date}
    Time: ${order.time}
    Notes: ${order.notes || 'None'}
        `
      })
    });
    
    if (error) console.error("Order save error:", error);
    setConfirmedOrder(order);
    dispatch({ type: "CLEAR" });
    setPage("confirmation");
    setCartOpen(false);
  }

  return (
    <div className="app">
      <style>{STYLES}</style>
      <nav className="nav">
        <div className="nav-logo" onClick={() => setPage("menu")}>
          <TeeBakesLogo size={48} />
          <div className="logo-text-block">
            <div className="logo-text">TeeBakes</div>
            <div className="logo-sub">Specialty Bakes</div>
          </div>
        </div>
        <div className="nav-actions">
          <button className={`nav-btn ${page==="menu"?"active":""}`} onClick={() => setPage("menu")}>Menu</button>
          {showAdminBtn && (
            <button className={`nav-btn ${page==="admin"?"active":""}`} onClick={() => setPage("admin")}>Admin</button>
          )}
          {page !== "admin" && (
            <button className="cart-btn" onClick={() => setCartOpen(true)}>
              🛒 Cart {count > 0 && <span className="cart-badge">{count}</span>}
            </button>
          )}
        </div>
      </nav>

      {page === "menu" && <MenuPage />}
      {page === "checkout" && <CheckoutPage onBack={() => setPage("menu")} onConfirm={handleConfirm} />}
      {page === "confirmation" && confirmedOrder && <ConfirmationPage order={confirmedOrder} onBackToMenu={() => { setPage("menu"); setConfirmedOrder(null); }} />}
      {page === "admin" && (
        adminUnlocked
          ? <AdminPage />
          : <AdminPinLock onUnlock={() => setAdminUnlocked(true)} />
      )}

      {cartOpen && (
        <>
          <div className="modal-overlay" onClick={() => setCartOpen(false)} style={{ zIndex: 250 }} />
          <CartDrawer onClose={() => setCartOpen(false)} onCheckout={() => { setCartOpen(false); setPage("checkout"); }} />
        </>
      )}
    </div>
  );
}

export default function WrappedApp() {
  return <CartProvider><App /></CartProvider>;
}