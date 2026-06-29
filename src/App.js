import React, { useState, useContext, createContext, useReducer, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  "https://iofvfvttmobamxclwspq.supabase.co",
  "sb_publishable_30CyLoBwFssXKPeiPhImCg_UQlArxjL"
);

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

// Fallback menu if Supabase is empty
const FALLBACK_MENU = [
  { id:"d-sugar", category:"donut", name:"Sugar Donut Box (4)", price:3.00, badge:"4 for £3", description:"A box of 4 fresh fried ring donuts dusted in caster sugar. Light, pillowy and made fresh to order. A TeeBakes classic.", allergens:["gluten","eggs","dairy"], emoji:"🍩", bg:"#2d1b69", available:true, options:{}, image_url:null },
  { id:"d-loaded", category:"donut", name:"Loaded Donut Box (4)", price:4.00, badge:"4 for £4", description:"A box of 4 loaded donuts smothered in your chosen sauce and piled high with toppings. Mix or all one flavour.", allergens:["gluten","eggs","dairy","soy"], emoji:"🍩", bg:"#8B4513", available:true, options:{"Choose Flavour":["Mixed","Oreo","Kinder","Biscoff"]}, image_url:null },
  { id:"d-flavoured", category:"donut", name:"Flavoured Box (4)", price:4.00, badge:"4 for £4", description:"A box of 4 donuts in your chosen flavour — Apple Crumble with white choc sauce, Oreo, Kinder or Biscoff.", allergens:["gluten","eggs","dairy","soy"], emoji:"🍩", bg:"#5c3317", available:true, options:{"Choose Flavour":["Apple Crumble & White Choc","Oreo","Kinder","Biscoff"]}, image_url:null },
  { id:"cp-slice", category:"cookie_pie", name:"Cookie Pie Slice", price:3.00, badge:"Warm & Gooey", description:"A generous slice of our famous cookie pie. £3 cold or £3.50 warm with sauce. Ask about today's flavour.", allergens:["gluten","eggs","dairy"], emoji:"🥧", bg:"#5c3317", available:true, options:{"How would you like it?":["Cold — £3.00","Warm with sauce — £3.50"]}, image_url:null },
  { id:"cp-choc", category:"cookie_pie", name:"Triple Choc Pie Slice", price:3.00, badge:null, description:"Thick cookie base loaded with dark, milk and white chocolate chunks. Gooey in the middle, crisp on the edges.", allergens:["gluten","eggs","dairy","soy"], emoji:"🥧", bg:"#2c1507", available:true, options:{"How would you like it?":["Cold — £3.00","Warm with sauce — £3.50"]}, image_url:null },
  { id:"cp-lotus-pie", category:"cookie_pie", name:"Biscoff Cookie Pie Slice", price:3.00, badge:"Most Popular", description:"Cookie base swirled with Biscoff spread, topped with a Biscoff biscuit and chocolate drizzle. Incredible warm.", allergens:["gluten","eggs","dairy","soy"], emoji:"🥧", bg:"#b5722a", available:true, options:{"How would you like it?":["Cold — £3.00","Warm with sauce — £3.50"]}, image_url:null },
  { id:"cp-oreo-pie", category:"cookie_pie", name:"Oreo Cookie Pie Slice", price:3.00, badge:null, description:"Cookie dough baked with Oreo pieces throughout, topped with chocolate ganache and a whole Oreo on top.", allergens:["gluten","eggs","dairy","soy"], emoji:"🥧", bg:"#1a1a1a", available:true, options:{"How would you like it?":["Cold — £3.00","Warm with sauce — £3.50"]}, image_url:null },
  { id:"cp-mm-pie", category:"cookie_pie", name:"M&M Cookie Pie Slice", price:3.00, badge:null, description:"Soft golden cookie pie studded with M&Ms, drizzled with milk chocolate. Fun, colourful and delicious.", allergens:["gluten","eggs","dairy","soy"], emoji:"🥧", bg:"#3d6b35", available:true, options:{"How would you like it?":["Cold — £3.00","Warm with sauce — £3.50"]}, image_url:null },
  { id:"cp-whole", category:"cookie_pie", name:"Whole Cookie Pie", price:25.00, badge:"Pre-Order", notice:"⚠️ 24 HOURS NOTICE REQUIRED", description:"Order a whole cookie pie made fresh for you. Perfect for sharing — serves 6–8 people. Choose your flavour below.", allergens:["gluten","eggs","dairy"], emoji:"🥧", bg:"#2d1b69", available:true, options:{"Choose Flavour":["Triple Chocolate","Biscoff","Oreo","M&M","Mixed / Custom"]}, image_url:null },
  { id:"cc-main", category:"cookie_cup", name:"Cookie Cup", price:3.00, badge:"New", description:"Individual cookie baked into a cup shape, filled with chocolate ganache and topped with your choice of topping.", allergens:["gluten","eggs","dairy"], emoji:"🍪", bg:"#6b3fa0", available:true, options:{"Choose Topping":["Lotus & Biscoff","Oreo & Choc","M&M & Caramel","Cadbury & Caramel","Easter Eggs & Choc"]}, image_url:null },
];

const LIVE_DAYS = [5, 6, 0];
const PREORDER_DAYS = [1, 2, 3, 4];

function generateTimeSlots() {
  const slots = [];
  for (let h = 13; h <= 22; h++) {
    slots.push(`${h.toString().padStart(2,"0")}:00`);
    slots.push(`${h.toString().padStart(2,"0")}:30`);
  }
  slots.push("23:00");
  return slots;
}
const TIME_SLOTS = generateTimeSlots();

function fmtDate(d) {
  return d.toLocaleDateString("en-GB", { weekday:"short", month:"short", day:"numeric" });
}
function getDayType(date) {
  const day = date.getDay();
  if (LIVE_DAYS.includes(day)) return "live";
  if (PREORDER_DAYS.includes(day)) return "preorder";
  return null;
}
function getAvailableDays(n) {
  const days = [];
  for (let i = 0; i <= 60; i++) {
    const d = new Date();
    d.setDate(d.getDate() + i);
    d.setHours(0,0,0,0);
    const type = getDayType(d);
    if (!type) continue;
    if (i === 0 && new Date().getHours() >= 23) continue;
    days.push({ date:d, label:fmtDate(d), type });
    if (days.length === n) break;
  }
  return days;
}
function isTodayLive() {
  const now = new Date();
  return LIVE_DAYS.includes(now.getDay()) && now.getHours() >= 13 && now.getHours() < 23;
}
function getSumUpPaymentLink(amount, orderId) {
  return `https://pay.sumup.com/b2c/QZ9ZMUVG?amount=${amount.toFixed(2)}&currency=GBP&description=TeeBakes+Order+${orderId}`;
}
function getQRCodeUrl(text) {
  return `https://chart.googleapis.com/chart?chs=200x200&cht=qr&chl=${encodeURIComponent(text)}&choe=UTF-8`;
}

// ============================================================
// MENU STATE — loads from Supabase, falls back to hardcoded
// Pause state also saved to Supabase store_settings table
// ============================================================
const MenuStateContext = createContext();
function MenuStateProvider({ children }) {
  const [menuItems, setMenuItems] = useState([]);
  const [storePaused, setStorePausedState] = useState(false);
  const [menuLoading, setMenuLoading] = useState(true);

  // Load menu from Supabase on mount
  useEffect(() => {
  loadMenuFromSupabase();
  loadStorePauseState();
  const interval = setInterval(() => {
    loadMenuFromSupabase();
    loadStorePauseState();
  }, 30000);
  return () => clearInterval(interval);
}, []);

  async function loadMenuFromSupabase() {
    const { data, error } = await supabase
      .from("menu_items")
      .select("*")
      .order("created_at", { ascending: true });
    if (data && data.length > 0) {
      // Normalise options field — could be string or object
      const normalised = data.map(item => ({
        ...item,
        allergens: Array.isArray(item.allergens) ? item.allergens : (item.allergens ? item.allergens.split(",").map(a=>a.trim()) : []),
        options: typeof item.options === "string" ? JSON.parse(item.options || "{}") : (item.options || {}),
      }));
      setMenuItems(normalised);
    } else {
      // Use fallback and seed Supabase
      setMenuItems(FALLBACK_MENU);
      if (!error) seedMenuToSupabase();
    }
    setMenuLoading(false);
  }

  async function seedMenuToSupabase() {
    for (const item of FALLBACK_MENU) {
      await supabase.from("menu_items").upsert({
        id: item.id,
        name: item.name,
        description: item.description,
        price: item.price,
        category: item.category,
        badge: item.badge || null,
        allergens: item.allergens,
        emoji: item.emoji,
        bg: item.bg,
        available: item.available,
        options: item.options,
        notice: item.notice || null,
        image_url: null,
      });
    }
  }

  async function loadStorePauseState() {
    const { data } = await supabase
      .from("store_settings")
      .select("value")
      .eq("key", "store_paused")
      .single();
    if (data) setStorePausedState(data.value === "true");
  }

  async function setStorePaused(paused) {
    setStorePausedState(paused);
    await supabase.from("store_settings")
      .upsert({ key: "store_paused", value: String(paused), updated_at: new Date().toISOString() });
  }

  async function toggleItem(id) {
    const item = menuItems.find(i => i.id === id);
    if (!item) return;
    const newAvail = !item.available;
    setMenuItems(items => items.map(i => i.id === id ? {...i, available: newAvail} : i));
    await supabase.from("menu_items").update({ available: newAvail }).eq("id", id);
  }

  async function addMenuItem(newItem, imageFile) {
    let image_url = null;
    // Upload image if provided
    if (imageFile) {
      const ext = imageFile.name.split(".").pop();
      const filename = `${Date.now()}-${Math.random().toString(36).substr(2,6)}.${ext}`;
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from("menu images")
        .upload(filename, imageFile, { contentType: imageFile.type, upsert: true });
      if (!uploadError && uploadData) {
        const { data: urlData } = supabase.storage.from("menu images").getPublicUrl(filename);
        image_url = urlData.publicUrl;
      } else {
        console.error("Image upload error:", uploadError);
      }
    }
    const id = `custom-${Date.now()}`;
    const item = { ...newItem, id, image_url, available: true };
    const { error } = await supabase.from("menu_items").insert({
      id: item.id,
      name: item.name,
      description: item.description,
      price: parseFloat(item.price),
      category: item.category,
      badge: item.badge || null,
      allergens: item.allergens,
      emoji: item.emoji || "🍩",
      bg: item.bg || "#2d1b69",
      available: true,
      options: item.options || {},
      notice: item.notice || null,
      image_url,
    });
    if (!error) setMenuItems(prev => [...prev, item]);
    return !error;
  }

  async function deleteMenuItem(id) {
    const { error } = await supabase.from("menu_items").delete().eq("id", id);
    if (!error) setMenuItems(prev => prev.filter(i => i.id !== id));
    return !error;
  }

  async function updateMenuItemImage(id, imageFile) {
    const ext = imageFile.name.split(".").pop();
    const filename = `${Date.now()}-${id}.${ext}`;
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from("menu images")
      .upload(filename, imageFile, { contentType: imageFile.type, upsert: true });
    if (uploadError) { console.error("Upload error:", uploadError); return false; }
    const { data: urlData } = supabase.storage.from("menu images").getPublicUrl(filename);
    const image_url = urlData.publicUrl;
    await supabase.from("menu_items").update({ image_url }).eq("id", id);
    setMenuItems(items => items.map(i => i.id === id ? {...i, image_url} : i));
    return true;
  }

  const availableItems = menuItems.filter(i => i.available);

  return (
    <MenuStateContext.Provider value={{
      menuItems, availableItems, toggleItem, menuLoading,
      storePaused, setStorePaused,
      addMenuItem, deleteMenuItem, updateMenuItemImage
    }}>
      {children}
    </MenuStateContext.Provider>
  );
}

const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Bangers&family=Nunito:wght@400;600;700;800;900&display=swap');
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  :root {
    --yellow: #f5c542; --yellow-dark: #d4a017;
    --dark: #0f0a1e; --white: #ffffff; --card-bg: #1a1040;
    --green: #4fa84b; --purple: #2d1b69; --red: #e06060;
  }
  body { background: var(--dark); color: var(--white); font-family: 'Nunito', sans-serif; }
  .app { min-height: 100vh; }
  .nav { position: sticky; top: 0; z-index: 100; background: var(--dark); border-bottom: 3px solid var(--yellow); display: flex; align-items: center; justify-content: space-between; padding: 0 1.5rem; height: 64px; }
  .nav-logo { display: flex; align-items: center; gap: 0.75rem; cursor: pointer; }
  .logo-text-block { display: flex; flex-direction: column; gap: 1px; }
  .logo-text { font-family: 'Bangers', cursive; font-size: 1.5rem; letter-spacing: 3px; color: var(--yellow); line-height: 1; }
  .logo-sub { font-size: 0.58rem; font-weight: 800; letter-spacing: 2.5px; text-transform: uppercase; color: rgba(255,255,255,0.35); line-height: 1; }
  .nav-actions { display: flex; gap: 0.5rem; align-items: center; }
  .nav-btn { background: none; border: none; cursor: pointer; color: rgba(255,255,255,0.6); font-family: 'Nunito', sans-serif; font-size: 0.8rem; font-weight: 700; letter-spacing: 1px; text-transform: uppercase; padding: 0.4rem 0.7rem; border-radius: 6px; transition: all 0.2s; }
  .nav-btn:hover, .nav-btn.active { color: var(--yellow); }
  .cart-btn { background: var(--yellow); border: none; cursor: pointer; color: var(--dark); font-family: 'Nunito', sans-serif; font-size: 0.85rem; font-weight: 900; padding: 0.5rem 1.2rem; border-radius: 8px; display: flex; align-items: center; gap: 0.5rem; transition: all 0.2s; }
  .cart-btn:hover { background: var(--yellow-dark); transform: translateY(-1px); }
  .cart-badge { background: var(--dark); color: var(--yellow); width: 20px; height: 20px; border-radius: 50%; font-size: 0.75rem; font-weight: 900; display: flex; align-items: center; justify-content: center; }
  .status-banner { padding: 0.6rem 1.5rem; text-align: center; font-size: 0.82rem; font-weight: 800; letter-spacing: 0.5px; }
  .status-banner.open { background: rgba(79,168,75,0.15); color: var(--green); border-bottom: 1px solid rgba(79,168,75,0.3); }
  .status-banner.closed { background: rgba(245,197,66,0.08); color: rgba(255,255,255,0.4); border-bottom: 1px solid rgba(255,255,255,0.06); }
  .hero { background: var(--dark); padding: 3rem 1.5rem 2.5rem; text-align: center; position: relative; overflow: hidden; }
  .hero::before { content: ''; position: absolute; inset: 0; background: radial-gradient(ellipse at 20% 80%, rgba(245,197,66,0.12) 0%, transparent 50%), radial-gradient(ellipse at 80% 20%, rgba(107,63,160,0.2) 0%, transparent 50%), radial-gradient(ellipse at 50% 50%, rgba(45,27,105,0.4) 0%, transparent 70%); }
  .hero-badge { display: inline-block; background: var(--yellow); color: var(--dark); font-size: 0.7rem; font-weight: 900; letter-spacing: 3px; text-transform: uppercase; padding: 0.3rem 1rem; border-radius: 20px; margin-bottom: 1rem; position: relative; }
  .hero h1 { font-family: 'Bangers', cursive; font-size: clamp(3rem, 8vw, 5.5rem); line-height: 1; color: var(--white); position: relative; margin-bottom: 0.3rem; letter-spacing: 4px; text-shadow: 0 0 40px rgba(245,197,66,0.3); }
  .hero h1 span { color: var(--yellow); }
  .hero-sub { font-family: 'Bangers', cursive; font-size: clamp(1rem, 3vw, 1.5rem); color: rgba(255,255,255,0.5); letter-spacing: 6px; text-transform: uppercase; position: relative; margin-bottom: 1rem; }
  .hero p { color: rgba(255,255,255,0.6); font-size: 0.95rem; max-width: 440px; margin: 0 auto; line-height: 1.6; position: relative; }
  .hero-pills { display: flex; justify-content: center; gap: 0.75rem; margin-top: 1.5rem; flex-wrap: wrap; position: relative; }
  .hero-pill { background: rgba(255,255,255,0.06); border: 1px solid rgba(245,197,66,0.3); color: rgba(255,255,255,0.7); padding: 0.4rem 1rem; border-radius: 20px; font-size: 0.8rem; font-weight: 700; }
  .hours-info { background: rgba(245,197,66,0.07); border: 1px solid rgba(245,197,66,0.2); border-radius: 12px; padding: 1rem; margin-bottom: 1rem; }
  .hours-info-title { font-family: 'Bangers',cursive; font-size: 1rem; color: var(--yellow); letter-spacing: 1px; margin-bottom: 0.6rem; }
  .hours-row { display: flex; justify-content: space-between; font-size: 0.82rem; padding: 0.3rem 0; border-bottom: 1px solid rgba(255,255,255,0.05); color: rgba(255,255,255,0.7); }
  .hours-row:last-child { border-bottom: none; }
  .hours-row span:last-child { color: rgba(255,255,255,0.4); font-weight: 700; }
  .hours-row.open-day span:last-child { color: var(--green); }
  .cat-tabs { display: flex; gap: 0.5rem; padding: 1.5rem 1.5rem 0; max-width: 1100px; margin: 0 auto; border-bottom: 1px solid rgba(255,255,255,0.08); overflow-x: auto; }
  .cat-tab { padding: 0.6rem 1.2rem; border-radius: 8px 8px 0 0; border: none; cursor: pointer; white-space: nowrap; font-family: 'Nunito', sans-serif; font-size: 0.85rem; font-weight: 800; transition: all 0.2s; background: rgba(255,255,255,0.05); color: rgba(255,255,255,0.4); }
  .cat-tab.active { background: var(--yellow); color: var(--dark); }
  .cat-tab:hover:not(.active) { color: var(--yellow); }
  .page { max-width: 1100px; margin: 0 auto; padding: 1.5rem; }
  .menu-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(290px, 1fr)); gap: 1.2rem; }
  .menu-card { border-radius: 16px; overflow: hidden; cursor: pointer; transition: all 0.25s; border: 2px solid rgba(255,255,255,0.06); background: var(--card-bg); }
  .menu-card:hover { transform: translateY(-5px); border-color: var(--yellow); box-shadow: 0 16px 40px rgba(245,197,66,0.15); }
  .card-top { height: 160px; display: flex; align-items: center; justify-content: center; font-size: 3.5rem; position: relative; overflow: hidden; }
  .card-top img { width: 100%; height: 100%; object-fit: cover; }
  .card-top-emoji { position: absolute; font-size: 3.5rem; }
  .card-badge { position: absolute; top: 0.7rem; right: 0.7rem; background: var(--yellow); color: var(--dark); font-size: 0.68rem; font-weight: 900; padding: 0.2rem 0.6rem; border-radius: 20px; text-transform: uppercase; z-index: 2; }
  .card-body { padding: 1.1rem; }
  .card-name { font-family: 'Bangers', cursive; font-size: 1.25rem; color: var(--white); letter-spacing: 1px; margin-bottom: 0.3rem; }
  .card-desc { font-size: 0.8rem; color: rgba(255,255,255,0.5); line-height: 1.5; margin-bottom: 0.8rem; }
  .notice-banner { background: rgba(255,100,50,0.15); border: 1.5px solid rgba(255,100,50,0.4); color: #ff8c5a; font-size: 0.75rem; font-weight: 800; padding: 0.3rem 0.7rem; border-radius: 8px; margin-bottom: 0.6rem; }
  .card-footer { display: flex; align-items: center; justify-content: space-between; }
  .card-price { font-size: 1.2rem; font-weight: 900; color: var(--yellow); }
  .card-allergens { font-size: 0.68rem; color: rgba(255,255,255,0.3); }
  .add-btn { background: var(--yellow); color: var(--dark); border: none; cursor: pointer; padding: 0.5rem 1rem; border-radius: 8px; font-family: 'Nunito', sans-serif; font-size: 0.85rem; font-weight: 900; transition: all 0.2s; }
  .add-btn:hover { background: var(--yellow-dark); transform: scale(1.05); }
  .sticky-cart { position: fixed; bottom: 0; left: 0; right: 0; z-index: 150; background: var(--yellow); color: var(--dark); padding: 0.9rem 1.5rem; display: flex; align-items: center; justify-content: space-between; box-shadow: 0 -4px 20px rgba(0,0,0,0.3); animation: slideUpCart 0.3s ease; cursor: pointer; }
  .sticky-cart:hover { background: var(--yellow-dark); }
  .sticky-cart-left { display: flex; align-items: center; gap: 0.8rem; }
  .sticky-cart-count { background: var(--dark); color: var(--yellow); width: 28px; height: 28px; border-radius: 50%; font-size: 0.85rem; font-weight: 900; display: flex; align-items: center; justify-content: center; }
  .sticky-cart-text { font-weight: 900; font-size: 0.95rem; }
  .sticky-cart-total { font-weight: 900; font-size: 1.1rem; }
  .modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.8); display: flex; align-items: center; justify-content: center; z-index: 200; padding: 1rem; backdrop-filter: blur(6px); animation: fadeIn 0.2s ease; }
  .modal { background: #1a1040; border-radius: 20px; max-width: 460px; width: 100%; border: 2px solid rgba(245,197,66,0.3); box-shadow: 0 24px 80px rgba(0,0,0,0.6); animation: slideUp 0.25s ease; max-height: 90vh; overflow-y: auto; }
  .modal-top { height: 150px; display: flex; align-items: center; justify-content: center; font-size: 4rem; position: relative; border-radius: 18px 18px 0 0; overflow: hidden; }
  .modal-top img { width: 100%; height: 100%; object-fit: cover; }
  .modal-top-emoji { position: absolute; font-size: 4rem; }
  .modal-close { position: absolute; top: 0.8rem; right: 0.8rem; background: rgba(0,0,0,0.5); border: 1px solid rgba(255,255,255,0.2); cursor: pointer; width: 32px; height: 32px; border-radius: 50%; font-size: 1rem; display: flex; align-items: center; justify-content: center; color: white; z-index: 2; }
  .modal-close:hover { background: rgba(255,255,255,0.1); }
  .modal-body { padding: 1.5rem; }
  .modal-name { font-family: 'Bangers', cursive; font-size: 1.8rem; color: var(--white); letter-spacing: 2px; margin-bottom: 0.3rem; }
  .modal-price { font-size: 1.3rem; font-weight: 900; color: var(--yellow); margin-bottom: 0.8rem; }
  .modal-desc { font-size: 0.88rem; color: rgba(255,255,255,0.6); line-height: 1.6; margin-bottom: 1rem; }
  .allergen-tag { display: inline-block; background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.1); padding: 0.2rem 0.6rem; border-radius: 20px; font-size: 0.7rem; color: rgba(255,255,255,0.4); margin: 0.2rem; text-transform: capitalize; }
  .option-group { margin-top: 1rem; }
  .option-label { font-size: 0.75rem; font-weight: 800; text-transform: uppercase; letter-spacing: 1.5px; color: var(--yellow); margin-bottom: 0.5rem; }
  .option-pills { display: flex; flex-wrap: wrap; gap: 0.4rem; }
  .option-pill { padding: 0.4rem 0.9rem; border-radius: 8px; border: 1.5px solid rgba(255,255,255,0.15); cursor: pointer; font-size: 0.82rem; background: rgba(255,255,255,0.04); color: rgba(255,255,255,0.7); transition: all 0.15s; font-family: 'Nunito', sans-serif; font-weight: 700; }
  .option-pill.selected { background: var(--yellow); color: var(--dark); border-color: var(--yellow); }
  .modal-add-btn { width: 100%; margin-top: 1.5rem; padding: 1rem; background: var(--yellow); color: var(--dark); border: none; cursor: pointer; border-radius: 12px; font-family: 'Bangers', cursive; font-size: 1.3rem; letter-spacing: 2px; transition: all 0.2s; }
  .modal-add-btn:hover { background: var(--yellow-dark); }
  .cart-drawer { position: fixed; right: 0; top: 0; bottom: 0; width: 370px; background: #0f0a1e; z-index: 300; border-left: 2px solid rgba(245,197,66,0.3); box-shadow: -8px 0 40px rgba(0,0,0,0.5); display: flex; flex-direction: column; animation: slideLeft 0.25s ease; }
  .drawer-header { padding: 1.2rem 1.5rem; border-bottom: 1px solid rgba(255,255,255,0.08); display: flex; justify-content: space-between; align-items: center; }
  .drawer-title { font-family: 'Bangers', cursive; font-size: 1.4rem; color: var(--yellow); letter-spacing: 2px; }
  .close-btn { background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.1); cursor: pointer; width: 32px; height: 32px; border-radius: 50%; font-size: 1rem; color: white; display: flex; align-items: center; justify-content: center; }
  .close-btn:hover { background: rgba(255,255,255,0.12); }
  .drawer-items { flex: 1; overflow-y: auto; padding: 1rem; }
  .cart-item { display: flex; gap: 1rem; padding: 1rem 0; border-bottom: 1px solid rgba(255,255,255,0.06); align-items: flex-start; }
  .cart-item-emoji { font-size: 2rem; }
  .cart-item-info { flex: 1; }
  .cart-item-name { font-weight: 800; font-size: 0.9rem; color: var(--white); }
  .cart-item-opts { font-size: 0.75rem; color: rgba(255,255,255,0.4); margin-top: 0.2rem; }
  .cart-item-price { font-weight: 900; color: var(--yellow); font-size: 0.95rem; margin-top: 0.2rem; }
  .qty-controls { display: flex; align-items: center; gap: 0.5rem; margin-top: 0.4rem; }
  .qty-btn { width: 26px; height: 26px; border-radius: 6px; border: 1px solid rgba(255,255,255,0.15); background: rgba(255,255,255,0.05); cursor: pointer; font-size: 1rem; color: white; display: flex; align-items: center; justify-content: center; }
  .qty-btn:hover { background: var(--yellow); color: var(--dark); border-color: var(--yellow); }
  .qty-num { font-weight: 800; font-size: 0.9rem; min-width: 20px; text-align: center; }
  .empty-cart { text-align: center; padding: 3rem 1rem; color: rgba(255,255,255,0.3); }
  .empty-cart-emoji { font-size: 3rem; margin-bottom: 1rem; }
  .drawer-footer { padding: 1.2rem 1.5rem; border-top: 1px solid rgba(255,255,255,0.08); }
  .drawer-total { display: flex; justify-content: space-between; font-weight: 900; font-size: 1.1rem; color: var(--white); margin-bottom: 1rem; }
  .drawer-total span:last-child { color: var(--yellow); }
  .checkout-btn { width: 100%; padding: 1rem; background: var(--yellow); color: var(--dark); border: none; cursor: pointer; border-radius: 10px; font-family: 'Bangers', cursive; font-size: 1.2rem; letter-spacing: 2px; transition: all 0.2s; }
  .checkout-btn:hover { background: var(--yellow-dark); }
  .checkout-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem; }
  @media (max-width: 680px) { .checkout-grid { grid-template-columns: 1fr; } }
  .co-section { background: #1a1040; border-radius: 14px; padding: 1.3rem; border: 1px solid rgba(255,255,255,0.06); margin-bottom: 1.2rem; }
  .co-title { font-family: 'Bangers', cursive; font-size: 1.1rem; letter-spacing: 1.5px; color: var(--yellow); margin-bottom: 1rem; }
  .type-toggle { display: flex; gap: 0.75rem; margin-bottom: 1rem; }
  .type-btn { flex: 1; padding: 0.8rem; border-radius: 10px; border: 2px solid rgba(255,255,255,0.1); background: rgba(255,255,255,0.03); cursor: pointer; font-family: 'Nunito', sans-serif; font-size: 0.9rem; font-weight: 800; color: rgba(255,255,255,0.4); transition: all 0.2s; }
  .type-btn.selected { border-color: var(--yellow); background: rgba(245,197,66,0.1); color: var(--yellow); }
  .asap-btn { width: 100%; padding: 1rem; border-radius: 10px; border: 2px solid var(--green); background: rgba(79,168,75,0.12); cursor: pointer; font-family: 'Nunito', sans-serif; font-size: 0.95rem; font-weight: 900; color: var(--green); transition: all 0.2s; margin-bottom: 1rem; display: flex; align-items: center; justify-content: center; gap: 0.5rem; }
  .asap-btn:hover { background: rgba(79,168,75,0.25); }
  .asap-btn.selected { background: var(--green); color: white; border-color: var(--green); }
  .date-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 0.4rem; margin-bottom: 1rem; }
  .date-btn { padding: 0.5rem 0.3rem; border-radius: 8px; border: 1.5px solid rgba(255,255,255,0.1); background: rgba(255,255,255,0.03); cursor: pointer; font-family: 'Nunito', sans-serif; font-size: 0.68rem; font-weight: 700; color: rgba(255,255,255,0.4); text-align: center; transition: all 0.15s; line-height: 1.4; }
  .date-btn.selected { border-color: var(--yellow); background: rgba(245,197,66,0.1); color: var(--yellow); }
  .date-btn.live-day { border-color: rgba(79,168,75,0.3); }
  .date-btn.live-day.selected { border-color: var(--green); background: rgba(79,168,75,0.1); color: var(--green); }
  .date-btn-sub { font-size: 0.6rem; opacity: 0.7; margin-top: 2px; }
  .time-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 0.4rem; }
  .time-btn { padding: 0.45rem; border-radius: 8px; border: 1.5px solid rgba(255,255,255,0.1); background: rgba(255,255,255,0.03); cursor: pointer; font-family: 'Nunito', sans-serif; font-size: 0.78rem; font-weight: 700; color: rgba(255,255,255,0.4); transition: all 0.15s; }
  .time-btn.selected { border-color: var(--yellow); background: rgba(245,197,66,0.1); color: var(--yellow); }
  .preorder-notice { background: rgba(245,197,66,0.08); border: 1px solid rgba(245,197,66,0.25); border-radius: 8px; padding: 0.7rem 0.9rem; font-size: 0.8rem; color: rgba(255,255,255,0.5); margin-bottom: 1rem; line-height: 1.5; }
  .form-group { margin-bottom: 0.9rem; }
  .form-label { display: block; font-size: 0.72rem; font-weight: 800; color: rgba(255,255,255,0.4); text-transform: uppercase; letter-spacing: 1px; margin-bottom: 0.4rem; }
  .form-input { width: 100%; padding: 0.65rem 1rem; border-radius: 8px; border: 1.5px solid rgba(255,255,255,0.1); background: rgba(255,255,255,0.05); font-family: 'Nunito', sans-serif; font-size: 0.9rem; color: white; transition: all 0.2s; outline: none; }
  .form-input:focus { border-color: var(--yellow); background: rgba(245,197,66,0.05); }
  .form-input::placeholder { color: rgba(255,255,255,0.2); }
  .form-select { width: 100%; padding: 0.65rem 1rem; border-radius: 8px; border: 1.5px solid rgba(255,255,255,0.1); background: rgba(255,255,255,0.05); font-family: 'Nunito', sans-serif; font-size: 0.9rem; color: white; transition: all 0.2s; outline: none; cursor: pointer; }
  .summary-item { display: flex; justify-content: space-between; padding: 0.55rem 0; border-bottom: 1px solid rgba(255,255,255,0.06); font-size: 0.85rem; color: rgba(255,255,255,0.7); }
  .summary-total { display: flex; justify-content: space-between; padding-top: 0.8rem; font-weight: 900; font-size: 1rem; }
  .summary-total span:last-child { color: var(--yellow); }
  .place-btn { width: 100%; margin-top: 1.3rem; padding: 1rem; background: var(--yellow); color: var(--dark); border: none; cursor: pointer; border-radius: 10px; font-family: 'Bangers', cursive; font-size: 1.2rem; letter-spacing: 2px; transition: all 0.2s; }
  .place-btn:hover { background: var(--yellow-dark); }
  .place-btn:disabled { background: rgba(255,255,255,0.1); color: rgba(255,255,255,0.3); cursor: not-allowed; }
  .back-nav-btn { background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.1); color: rgba(255,255,255,0.6); font-family: 'Nunito', sans-serif; font-size: 0.85rem; font-weight: 700; padding: 0.5rem 1rem; border-radius: 8px; cursor: pointer; transition: all 0.2s; }
  .back-nav-btn:hover { color: var(--yellow); border-color: var(--yellow); }
  .confirmation { max-width: 520px; margin: 2rem auto; padding: 1.5rem; text-align: center; }
  .confirm-icon { font-size: 4rem; margin-bottom: 1rem; animation: bounce 0.6s ease; }
  .confirm-title { font-family: 'Bangers', cursive; font-size: 2.5rem; color: var(--yellow); letter-spacing: 3px; margin-bottom: 0.5rem; }
  .confirm-sub { color: rgba(255,255,255,0.5); margin-bottom: 1.5rem; line-height: 1.6; }
  .confirm-card { background: #1a1040; border-radius: 16px; padding: 1.5rem; border: 1px solid rgba(245,197,66,0.2); text-align: left; margin-bottom: 1.5rem; }
  .confirm-row { display: flex; justify-content: space-between; padding: 0.6rem 0; border-bottom: 1px solid rgba(255,255,255,0.06); font-size: 0.88rem; }
  .confirm-row:last-child { border-bottom: none; }
  .confirm-label { color: rgba(255,255,255,0.4); font-weight: 600; }
  .confirm-value { font-weight: 800; color: var(--white); }
  .pay-section { background: #1a1040; border-radius: 16px; padding: 1.5rem; border: 2px solid rgba(245,197,66,0.3); margin-bottom: 1.5rem; text-align: center; }
  .pay-title { font-family: 'Bangers', cursive; font-size: 1.4rem; color: var(--yellow); letter-spacing: 2px; margin-bottom: 0.4rem; }
  .pay-amount { font-size: 2rem; font-weight: 900; color: var(--white); margin-bottom: 1rem; }
  .pay-amount span { color: var(--yellow); }
  .pay-now-btn { display: block; width: 100%; padding: 1.1rem; background: var(--yellow); color: var(--dark); border: none; cursor: pointer; border-radius: 12px; font-family: 'Bangers', cursive; font-size: 1.4rem; letter-spacing: 2px; text-decoration: none; margin-bottom: 1.2rem; transition: all 0.2s; }
  .pay-now-btn:hover { background: var(--yellow-dark); transform: translateY(-2px); }
  .pay-divider { display: flex; align-items: center; gap: 1rem; margin-bottom: 1.2rem; }
  .pay-divider-line { flex: 1; height: 1px; background: rgba(255,255,255,0.1); }
  .pay-divider-text { font-size: 0.75rem; color: rgba(255,255,255,0.3); font-weight: 700; }
  .qr-wrap { display: flex; flex-direction: column; align-items: center; gap: 0.6rem; }
  .qr-img { width: 160px; height: 160px; border-radius: 12px; background: white; padding: 8px; }
  .qr-label { font-size: 0.75rem; color: rgba(255,255,255,0.3); }
  .pay-note { font-size: 0.75rem; color: rgba(255,255,255,0.3); margin-top: 1rem; line-height: 1.5; }
  .back-btn { background: rgba(255,255,255,0.06); color: rgba(255,255,255,0.6); border: 1px solid rgba(255,255,255,0.1); cursor: pointer; padding: 0.9rem 2.5rem; border-radius: 10px; font-family: 'Bangers', cursive; font-size: 1.2rem; letter-spacing: 2px; }
  .back-btn:hover { color: var(--yellow); border-color: var(--yellow); }
  .admin-layout { display: flex; min-height: calc(100vh - 64px); }
  .admin-sidebar { width: 210px; background: #0f0a1e; padding: 1.5rem 1rem; border-right: 1px solid rgba(245,197,66,0.15); flex-shrink: 0; }
  .admin-sidebar-label { font-size: 0.65rem; font-weight: 800; letter-spacing: 3px; text-transform: uppercase; color: rgba(255,255,255,0.25); margin-bottom: 1rem; padding: 0 0.5rem; }
  .admin-nav-btn { display: block; width: 100%; text-align: left; background: none; border: none; cursor: pointer; padding: 0.65rem 0.8rem; border-radius: 8px; margin-bottom: 0.3rem; font-family: 'Nunito', sans-serif; font-size: 0.85rem; font-weight: 700; color: rgba(255,255,255,0.4); transition: all 0.15s; }
  .admin-nav-btn:hover { color: var(--yellow); background: rgba(245,197,66,0.06); }
  .admin-nav-btn.active { background: var(--yellow); color: var(--dark); font-weight: 900; }
  .admin-main { flex: 1; padding: 2rem; background: var(--dark); overflow-y: auto; }
  .admin-page-title { font-family: 'Bangers', cursive; font-size: 1.8rem; color: var(--yellow); letter-spacing: 3px; margin-bottom: 1.5rem; }
  .pause-banner { background: rgba(220,50,50,0.1); border: 1.5px solid rgba(220,50,50,0.3); border-radius: 12px; padding: 1rem 1.5rem; margin-bottom: 1.5rem; display: flex; align-items: center; justify-content: space-between; gap: 1rem; }
  .pause-banner.open-state { background: rgba(79,168,75,0.1); border-color: rgba(79,168,75,0.3); }
  .pause-banner-text { font-weight: 800; font-size: 0.9rem; }
  .pause-banner.open-state .pause-banner-text { color: var(--green); }
  .pause-banner:not(.open-state) .pause-banner-text { color: #e06060; }
  .pause-btn { padding: 0.6rem 1.2rem; border-radius: 8px; border: none; cursor: pointer; font-family: 'Nunito', sans-serif; font-size: 0.85rem; font-weight: 900; transition: all 0.2s; }
  .pause-btn.is-paused { background: var(--green); color: white; }
  .pause-btn.is-open { background: #e06060; color: white; }
  .stats-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 1rem; margin-bottom: 2rem; }
  .stat-card { background: #1a1040; border-radius: 12px; padding: 1.2rem; border: 1px solid rgba(245,197,66,0.12); }
  .stat-label { font-size: 0.7rem; font-weight: 800; color: rgba(255,255,255,0.3); text-transform: uppercase; letter-spacing: 1px; margin-bottom: 0.4rem; }
  .stat-value { font-family: 'Bangers', cursive; font-size: 2.2rem; color: var(--yellow); letter-spacing: 2px; }
  .stat-sub { font-size: 0.75rem; color: rgba(255,255,255,0.3); margin-top: 0.2rem; }
  .orders-filter { display: flex; gap: 0.5rem; margin-bottom: 1.2rem; flex-wrap: wrap; }
  .filter-btn { padding: 0.35rem 0.9rem; border-radius: 20px; border: 1.5px solid rgba(255,255,255,0.1); background: rgba(255,255,255,0.03); cursor: pointer; font-family: 'Nunito', sans-serif; font-size: 0.8rem; font-weight: 700; color: rgba(255,255,255,0.4); transition: all 0.15s; }
  .filter-btn.active { background: var(--yellow); color: var(--dark); border-color: var(--yellow); }
  .orders-list { display: flex; flex-direction: column; gap: 0.9rem; }
  .order-card { background: #1a1040; border-radius: 12px; padding: 1.2rem; border: 1px solid rgba(255,255,255,0.06); display: grid; grid-template-columns: 1fr auto; gap: 1rem; align-items: start; }
  .order-id { font-size: 0.7rem; font-weight: 800; color: rgba(255,255,255,0.3); letter-spacing: 1px; margin-bottom: 0.3rem; }
  .order-name { font-weight: 800; font-size: 0.95rem; color: var(--white); margin-bottom: 0.2rem; }
  .order-detail { font-size: 0.8rem; color: rgba(255,255,255,0.4); margin-bottom: 0.15rem; }
  .order-item-chip { display: inline-block; background: rgba(255,255,255,0.05); padding: 0.15rem 0.5rem; border-radius: 4px; font-size: 0.75rem; color: rgba(255,255,255,0.4); margin: 0.15rem 0.15rem 0 0; }
  .status-badge { display: inline-block; padding: 0.25rem 0.7rem; border-radius: 20px; font-size: 0.72rem; font-weight: 800; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 0.5rem; }
  .status-new { background: rgba(245,197,66,0.15); color: var(--yellow); }
  .status-confirmed { background: rgba(74,160,70,0.15); color: #4fa84b; }
  .status-ready { background: rgba(74,120,200,0.15); color: #6ea0d4; }
  .status-completed { background: rgba(255,255,255,0.08); color: rgba(255,255,255,0.3); }
  .status-select { padding: 0.35rem 0.6rem; border-radius: 8px; border: 1px solid rgba(255,255,255,0.1); background: rgba(255,255,255,0.05); font-family: 'Nunito', sans-serif; font-size: 0.8rem; color: white; cursor: pointer; margin-top: 0.4rem; }
  .order-total-badge { font-weight: 900; font-size: 1.1rem; color: var(--yellow); }

  /* ADMIN MENU */
  .admin-menu-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(260px, 1fr)); gap: 0.8rem; }
  .admin-menu-card { background: #1a1040; border-radius: 10px; overflow: hidden; border: 1px solid rgba(255,255,255,0.06); }
  .admin-card-img { height: 100px; display: flex; align-items: center; justify-content: center; font-size: 2.5rem; position: relative; overflow: hidden; }
  .admin-card-img img { width: 100%; height: 100%; object-fit: cover; }
  .admin-card-img-emoji { position: absolute; font-size: 2.5rem; }
  .admin-card-body { padding: 0.8rem; }
  .admin-card-name { font-weight: 800; font-size: 0.88rem; color: var(--white); margin-bottom: 0.2rem; }
  .admin-card-price { font-size: 0.82rem; color: var(--yellow); font-weight: 700; margin-bottom: 0.5rem; }
  .admin-card-actions { display: flex; gap: 0.4rem; flex-wrap: wrap; }
  .toggle-avail { padding: 0.25rem 0.6rem; border-radius: 6px; border: none; font-family: 'Nunito', sans-serif; font-size: 0.72rem; font-weight: 800; cursor: pointer; }
  .toggle-avail.on { background: rgba(74,160,70,0.15); color: #4fa84b; }
  .toggle-avail.off { background: rgba(220,50,50,0.15); color: #e06060; }
  .upload-img-btn { padding: 0.25rem 0.6rem; border-radius: 6px; border: none; background: rgba(245,197,66,0.12); color: var(--yellow); font-family: 'Nunito', sans-serif; font-size: 0.72rem; font-weight: 800; cursor: pointer; }
  .delete-item-btn { padding: 0.25rem 0.6rem; border-radius: 6px; border: none; background: rgba(220,50,50,0.15); color: #e06060; font-family: 'Nunito', sans-serif; font-size: 0.72rem; font-weight: 800; cursor: pointer; }
  .hidden-input { display: none; }

  /* ADD ITEM FORM */
  .add-item-section { background: #1a1040; border-radius: 14px; padding: 1.5rem; border: 1px solid rgba(245,197,66,0.2); margin-bottom: 2rem; }
  .add-item-title { font-family: 'Bangers', cursive; font-size: 1.2rem; color: var(--yellow); letter-spacing: 2px; margin-bottom: 1rem; }
  .add-item-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 0.8rem; }
  @media (max-width: 600px) { .add-item-grid { grid-template-columns: 1fr; } }
  .add-item-btn { margin-top: 1rem; padding: 0.8rem 2rem; background: var(--yellow); color: var(--dark); border: none; border-radius: 10px; font-family: 'Bangers', cursive; font-size: 1.1rem; letter-spacing: 2px; cursor: pointer; transition: all 0.2s; }
  .add-item-btn:hover { background: var(--yellow-dark); }
  .add-item-btn:disabled { background: rgba(255,255,255,0.1); color: rgba(255,255,255,0.3); cursor: not-allowed; }
  .img-preview { width: 80px; height: 80px; object-fit: cover; border-radius: 8px; margin-top: 0.5rem; }
  .upload-zone { border: 2px dashed rgba(245,197,66,0.3); border-radius: 10px; padding: 1rem; text-align: center; cursor: pointer; transition: all 0.2s; }
  .upload-zone:hover { border-color: var(--yellow); background: rgba(245,197,66,0.05); }
  .upload-zone-text { font-size: 0.8rem; color: rgba(255,255,255,0.4); margin-top: 0.4rem; }

  /* STORE CLOSED */
  .store-closed-banner { background: rgba(220,50,50,0.12); border-bottom: 2px solid rgba(220,50,50,0.4); padding: 1rem 1.5rem; text-align: center; }
  .store-closed-title { font-family: 'Bangers', cursive; font-size: 1.4rem; color: #e06060; letter-spacing: 2px; margin-bottom: 0.3rem; }
  .store-closed-sub { font-size: 0.85rem; color: rgba(255,255,255,0.4); }

  /* SUCCESS / ERROR TOAST */
  .toast { position: fixed; bottom: 5rem; left: 50%; transform: translateX(-50%); padding: 0.8rem 1.5rem; border-radius: 10px; font-weight: 800; font-size: 0.9rem; z-index: 999; animation: slideUp 0.3s ease; }
  .toast.success { background: var(--green); color: white; }
  .toast.error { background: #e06060; color: white; }

  @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
  @keyframes slideUp { from { opacity: 0; transform: translateY(20px) translateX(-50%); } to { opacity: 1; transform: translateY(0) translateX(-50%); } }
  @keyframes slideLeft { from { transform: translateX(100%); } to { transform: translateX(0); } }
  @keyframes slideUpCart { from { transform: translateY(100%); } to { transform: translateY(0); } }
  @keyframes bounce { 0%,100% { transform: scale(1); } 50% { transform: scale(1.15); } }
  @media (max-width: 500px) { .cart-drawer { width: 100%; } .admin-layout { flex-direction: column; } .admin-sidebar { width: 100%; } }
`;

let _logoId = 0;
function TeeBakesLogo({ size = 48 }) {
  const [uid] = useState(() => `tb${++_logoId}`);
  const clipId = `${uid}c`, yellowId = `${uid}y`, mintId = `${uid}m`;
  return (
    <svg width={size} height={size} viewBox="0 0 200 200" style={{ display:"block", flexShrink:0 }}>
      <defs>
        <clipPath id={clipId}><circle cx="100" cy="105" r="88" /></clipPath>
        <radialGradient id={yellowId} cx="55%" cy="40%" r="55%"><stop offset="0%" stopColor="#fff176" /><stop offset="100%" stopColor="#f9c900" /></radialGradient>
        <radialGradient id={mintId} cx="50%" cy="50%" r="55%"><stop offset="0%" stopColor="#b2dfce" /><stop offset="100%" stopColor="#7ec8a8" /></radialGradient>
      </defs>
      <circle cx="100" cy="105" r="91" fill="#f48fb1" />
      <circle cx="100" cy="105" r="87" fill="#1a237e" />
      <ellipse cx="115" cy="82" rx="70" ry="60" fill={`url(#${yellowId})`} clipPath={`url(#${clipId})`} />
      <rect x="-10" y="108" width="230" height="52" fill={`url(#${mintId})`} transform="rotate(-8 100 130)" clipPath={`url(#${clipId})`} />
      <rect x="-10" y="118" width="230" height="38" fill="#1a237e" transform="rotate(-8 100 135)" clipPath={`url(#${clipId})`} />
      <ellipse cx="108" cy="174" rx="72" ry="11" fill="#f48fb1" clipPath={`url(#${clipId})`} />
      <ellipse cx="108" cy="172" rx="72" ry="9" fill="#f8bbd0" clipPath={`url(#${clipId})`} />
      <ellipse cx="42" cy="112" rx="28" ry="9" fill="#5d2e0c" /><ellipse cx="42" cy="109" rx="28" ry="9" fill="#a0522d" /><ellipse cx="42" cy="108" rx="28" ry="8.5" fill="#cd853f" />
      <circle cx="32" cy="106" r="3" fill="#3b1a06" opacity="0.85" /><circle cx="43" cy="104" r="3" fill="#3b1a06" opacity="0.85" /><circle cx="54" cy="106" r="2.5" fill="#3b1a06" opacity="0.85" />
      <ellipse cx="40" cy="97" rx="26" ry="8.5" fill="#5d2e0c" /><ellipse cx="40" cy="94" rx="26" ry="8.5" fill="#b8621a" /><ellipse cx="40" cy="93" rx="26" ry="8" fill="#d4832a" />
      <circle cx="30" cy="91" r="2.8" fill="#3b1a06" opacity="0.85" /><circle cx="41" cy="89" r="2.8" fill="#3b1a06" opacity="0.85" /><circle cx="52" cy="91" r="2.5" fill="#3b1a06" opacity="0.85" />
      <ellipse cx="38" cy="82" rx="24" ry="8" fill="#5d2e0c" /><ellipse cx="38" cy="79" rx="24" ry="8" fill="#c97c1e" /><ellipse cx="38" cy="78" rx="24" ry="7.5" fill="#e8a030" />
      <circle cx="29" cy="76" r="2.5" fill="#3b1a06" opacity="0.85" /><circle cx="39" cy="74" r="2.5" fill="#3b1a06" opacity="0.85" /><circle cx="50" cy="76" r="2.2" fill="#3b1a06" opacity="0.85" />
      <text x="78" y="122" fontFamily="Georgia, serif" fontSize="32" fontWeight="900" fontStyle="italic" fill="white" stroke="#1a237e" strokeWidth="3" paintOrder="stroke" textAnchor="middle" letterSpacing="-0.5">TeeBakes</text>
      <text x="108" y="150" fontFamily="Georgia, serif" fontSize="22" fontWeight="900" fontStyle="italic" fill="white" stroke="#1a237e" strokeWidth="2.5" paintOrder="stroke" textAnchor="middle">Specialty Bakes</text>
      <circle cx="100" cy="105" r="88" fill="none" stroke="#f48fb1" strokeWidth="5" />
      <circle cx="100" cy="105" r="82" fill="none" stroke="#f8bbd0" strokeWidth="1.5" opacity="0.5" />
    </svg>
  );
}

function playNotificationSound() {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    [523,659,784,1047].forEach((freq,i) => {
      const osc = ctx.createOscillator(), gain = ctx.createGain();
      osc.connect(gain); gain.connect(ctx.destination);
      osc.frequency.value = freq; osc.type = "sine";
      gain.gain.setValueAtTime(0.3, ctx.currentTime + i*0.15);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + i*0.15 + 0.3);
      osc.start(ctx.currentTime + i*0.15); osc.stop(ctx.currentTime + i*0.15 + 0.3);
    });
  } catch(e) {}
}

// Toast notification
function Toast({ msg, type }) {
  if (!msg) return null;
  return <div className={`toast ${type}`}>{msg}</div>;
}

function MenuCard({ item, onOpen }) {
  return (
    <div className="menu-card" onClick={() => onOpen(item)}>
      <div className="card-top" style={{ background:`${item.bg}cc` }}>
        {item.image_url
          ? <img src={item.image_url} alt={item.name} />
          : <span className="card-top-emoji">{item.emoji}</span>
        }
        {item.badge && <span className="card-badge">{item.badge}</span>}
      </div>
      <div className="card-body">
        <div className="card-name">{item.name}</div>
        {item.notice && <div className="notice-banner">{item.notice}</div>}
        <div className="card-desc">{item.description}</div>
        <div className="card-footer">
          <div>
            <div className="card-price">from £{parseFloat(item.price).toFixed(2)}</div>
            <div className="card-allergens">Contains: {Array.isArray(item.allergens) ? item.allergens.join(", ") : item.allergens}</div>
          </div>
          <button className="add-btn" onClick={e => { e.stopPropagation(); onOpen(item); }}>Add +</button>
        </div>
      </div>
    </div>
  );
}

function ProductModal({ item, onClose, onAdd }) {
  const [options, setOptions] = useState(() => {
    const d = {};
    const opts = typeof item.options === "string" ? JSON.parse(item.options || "{}") : (item.options || {});
    Object.keys(opts).forEach(k => d[k] = opts[k][0]);
    return d;
  });
  const opts = typeof item.options === "string" ? JSON.parse(item.options || "{}") : (item.options || {});
  const price = (options["How would you like it?"] || "").includes("£3.50") ? 3.50 : parseFloat(item.price);
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-top" style={{ background:`${item.bg}dd` }}>
          {item.image_url
            ? <img src={item.image_url} alt={item.name} />
            : <span className="modal-top-emoji">{item.emoji}</span>
          }
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>
        <div className="modal-body">
          <div className="modal-name">{item.name}</div>
          <div className="modal-price">£{price.toFixed(2)}</div>
          {item.notice && <div className="notice-banner">{item.notice}</div>}
          <div className="modal-desc">{item.description}</div>
          <div style={{ marginBottom:"0.5rem" }}>
            {(Array.isArray(item.allergens) ? item.allergens : (item.allergens||"").split(",")).map(a => <span key={a} className="allergen-tag">{a.trim()}</span>)}
          </div>
          {opts && Object.entries(opts).map(([key,vals]) => (
            <div key={key} className="option-group">
              <div className="option-label">{key}</div>
              <div className="option-pills">
                {vals.map(v => <button key={v} className={`option-pill ${options[key]===v?"selected":""}`} onClick={() => setOptions(o => ({...o,[key]:v}))}>{v}</button>)}
              </div>
            </div>
          ))}
          <button className="modal-add-btn" onClick={() => { onAdd({...item, price}, options); onClose(); }}>ADD TO ORDER — £{price.toFixed(2)}</button>
        </div>
      </div>
    </div>
  );
}

function CartDrawer({ onClose, onCheckout }) {
  const { cart, dispatch, total, count } = useContext(CartContext);
  return (
    <div className="cart-drawer">
      <div className="drawer-header">
        <div className="drawer-title">YOUR ORDER {count > 0 && `(${count})`}</div>
        <button className="close-btn" onClick={onClose}>✕</button>
      </div>
      <div className="drawer-items">
        {cart.length === 0 ? (
          <div className="empty-cart"><div className="empty-cart-emoji">🛒</div><div style={{fontWeight:700}}>Nothing added yet!</div><div style={{fontSize:"0.82rem",marginTop:"0.4rem"}}>Browse the menu and add your faves.</div></div>
        ) : cart.map((item,idx) => (
          <div key={idx} className="cart-item">
            <div className="cart-item-emoji">{item.emoji}</div>
            <div className="cart-item-info">
              <div className="cart-item-name">{item.name}</div>
              {item.options && <div className="cart-item-opts">{Object.values(item.options).join(" · ")}</div>}
              <div className="cart-item-price">£{(item.price * item.qty).toFixed(2)}</div>
              <div className="qty-controls">
                <button className="qty-btn" onClick={() => dispatch({type:"UPDATE_QTY",idx,qty:item.qty-1})}>−</button>
                <span className="qty-num">{item.qty}</span>
                <button className="qty-btn" onClick={() => dispatch({type:"UPDATE_QTY",idx,qty:item.qty+1})}>+</button>
              </div>
            </div>
          </div>
        ))}
      </div>
      {cart.length > 0 && (
        <div className="drawer-footer">
          <div className="drawer-total"><span>Total</span><span>£{total.toFixed(2)}</span></div>
          <button className="checkout-btn" onClick={onCheckout}>CHECKOUT →</button>
        </div>
      )}
    </div>
  );
}

function MenuPage() {
  const { dispatch, count, total } = useContext(CartContext);
  const { availableItems, storePaused, menuLoading } = useContext(MenuStateContext);
  const [selectedItem, setSelectedItem] = useState(null);
  const [activeTab, setActiveTab] = useState("all");
  const todayLive = isTodayLive();
  const tabs = [
    { id:"all", label:"🍽️ Everything" },
    { id:"donut", label:"🍩 Donuts" },
    { id:"cookie_pie", label:"🥧 Cookie Pies" },
    { id:"cookie_cup", label:"🍪 Cookie Cups" },
  ];
  const filtered = activeTab === "all" ? availableItems : availableItems.filter(i => i.category === activeTab);
  return (
    <>
      {storePaused && (
        <div className="store-closed-banner">
          <div className="store-closed-title">🔴 NOT TAKING ORDERS RIGHT NOW</div>
          <div className="store-closed-sub">We'll be back soon — check our socials for updates</div>
        </div>
      )}
      <div className={`status-banner ${todayLive && !storePaused ? "open" : "closed"}`}>
        {todayLive && !storePaused ? "🟢 We're OPEN — order for collection or delivery today!" : "⏰ Pre-orders welcome — we're open Friday, Saturday & Sunday 1pm–11pm"}
      </div>
      <div className="hero">
        <div className="hero-badge">🔥 Fresh Made to Order · Walsall</div>
        <div style={{display:"flex",justifyContent:"center",marginBottom:"1rem",position:"relative"}}><TeeBakesLogo size={110} /></div>
        <h1>TEE<span>BAKES</span></h1>
        <div className="hero-sub">Specialty Bakes</div>
        <p>Fresh fried donuts and warm gooey cookie pies. Order for collection or delivery — Friday, Saturday & Sunday 1pm–11pm.</p>
        <div className="hero-pills">
          <span className="hero-pill">🍩 Loaded Donuts</span>
          <span className="hero-pill">🥧 Cookie Pies</span>
          <span className="hero-pill">🍪 Cookie Cups</span>
          <span className="hero-pill">🚗 Delivery Available</span>
        </div>
      </div>
      <div style={{maxWidth:"1100px",margin:"1.5rem auto 0",padding:"0 1.5rem"}}>
        <div className="hours-info">
          <div className="hours-info-title">🕐 OPENING HOURS</div>
          <div className="hours-row open-day"><span>Friday</span><span>1:00pm – 11:00pm ✅</span></div>
          <div className="hours-row open-day"><span>Saturday</span><span>1:00pm – 11:00pm ✅</span></div>
          <div className="hours-row open-day"><span>Sunday</span><span>1:00pm – 11:00pm ✅</span></div>
          <div className="hours-row"><span>Monday – Thursday</span><span>Pre-order only (24hr notice)</span></div>
          <div className="hours-row"><span>Delivery fee</span><span>£2.50 · Min order £10 (delivery only)</span></div>
          <div className="hours-row"><span>Whole pies</span><span>⚠️ 24hr notice required</span></div>
        </div>
      </div>
      <div className="cat-tabs">
        {tabs.map(t => <button key={t.id} className={`cat-tab ${activeTab===t.id?"active":""}`} onClick={() => setActiveTab(t.id)}>{t.label}</button>)}
      </div>
      <div className="page" style={{paddingBottom:count>0?"5rem":"1.5rem"}}>
        {menuLoading
          ? <div style={{textAlign:"center",padding:"3rem",color:"rgba(255,255,255,0.4)"}}>Loading menu...</div>
          : filtered.length === 0
            ? <div style={{textAlign:"center",padding:"3rem",color:"rgba(255,255,255,0.3)"}}>No items available in this category right now.</div>
            : <div className="menu-grid">{filtered.map(item => <MenuCard key={item.id} item={item} onOpen={setSelectedItem} />)}</div>
        }
      </div>
      {selectedItem && <ProductModal item={selectedItem} onClose={() => setSelectedItem(null)} onAdd={(item,options) => dispatch({type:"ADD",item:{...item,options}})} />}
      {count > 0 && (
        <div className="sticky-cart" onClick={() => window.dispatchEvent(new CustomEvent("openCart"))}>
          <div className="sticky-cart-left"><div className="sticky-cart-count">{count}</div><div className="sticky-cart-text">View your order</div></div>
          <div className="sticky-cart-total">£{total.toFixed(2)} →</div>
        </div>
      )}
    </>
  );
}

function CheckoutPage({ onBack, onConfirm }) {
  const { cart, total } = useContext(CartContext);
  const { storePaused } = useContext(MenuStateContext);
  const availableDays = useState(() => getAvailableDays(12))[0];
  const [type, setType] = useState("collection");
  const [selDateLabel, setSelDateLabel] = useState(null);
  const [selDayType, setSelDayType] = useState(null);
  const [selTime, setSelTime] = useState(null);
  const [asap, setAsap] = useState(false);
  const [form, setForm] = useState({ name:"", email:"", phone:"", address:"", notes:"" });
  const [submitting, setSubmitting] = useState(false);

  const deliveryFee = type === "delivery" ? 2.50 : 0;
  const orderTotal = total + deliveryFee;
  const showAsap = selDayType === "live" && type === "collection";
  const canSubmit = form.name && form.email && form.phone && selDateLabel && (asap || selTime) && (type === "collection" || form.address) && !submitting && !storePaused;

  function selectDate(day) { setSelDateLabel(day.label); setSelDayType(day.type); setSelTime(null); setAsap(false); }

  async function handleSubmit() {
    setSubmitting(true);
    const orderId = "TB-" + Math.random().toString(36).substr(2,6).toUpperCase();
    const timeLabel = asap ? "ASAP" : selTime;
    const { error } = await supabase.from("orders").insert({
      id: orderId, customer_name: form.name, customer_email: form.email,
      customer_phone: form.phone, items: cart, total: orderTotal, type,
      delivery_address: form.address || null, date: selDateLabel, time: timeLabel,
      payment_method: "sumup", order_status: "new", notes: form.notes || null,
    });
    if (error) console.error("Supabase error:", error);
    try {
      await fetch("https://api.web3forms.com/submit", {
        method:"POST", headers:{"Content-Type":"application/json"},
        body: JSON.stringify({
          access_key: "77ce4f8c-6a71-484d-908c-0ae1e5318610",
          subject: `📦 New TeeBakes Order — ${orderId}`,
          name: form.name, email: form.email,
          message: `New order!\n\nID: ${orderId}\nName: ${form.name}\nEmail: ${form.email}\nPhone: ${form.phone}\nType: ${type}\n${type==="delivery"?`Address: ${form.address}\n`:""}\nDate: ${selDateLabel}\nTime: ${timeLabel}\nItems: ${cart.map(i=>`${i.qty}x ${i.name}`).join(", ")}\nNotes: ${form.notes||"None"}\nTotal: £${orderTotal.toFixed(2)}`
        })
      });
    } catch(e) { console.error("Email error:", e); }
    setSubmitting(false);
    onConfirm({ orderId, ...form, type, date: selDateLabel, time: timeLabel, isAsap: asap, items: cart, total: orderTotal });
  }

  if (storePaused) {
    return (
      <div className="page" style={{textAlign:"center",padding:"4rem 1.5rem"}}>
        <div style={{fontSize:"3rem",marginBottom:"1rem"}}>🔴</div>
        <div style={{fontFamily:"'Bangers',cursive",fontSize:"2rem",color:"#e06060",letterSpacing:"2px",marginBottom:"0.5rem"}}>NOT TAKING ORDERS</div>
        <div style={{color:"rgba(255,255,255,0.4)",marginBottom:"1.5rem"}}>We're not accepting orders right now. Check back soon!</div>
        <button className="back-nav-btn" onClick={onBack}>← Back to Menu</button>
      </div>
    );
  }

  return (
    <div className="page">
      <div style={{display:"flex",alignItems:"center",gap:"1rem",marginBottom:"1.5rem"}}>
        <button className="back-nav-btn" onClick={onBack}>← Back to Menu</button>
        <h2 style={{fontFamily:"'Bangers',cursive",fontSize:"1.6rem",color:"var(--yellow)",letterSpacing:"2px"}}>CHECKOUT</h2>
      </div>
      <div className="checkout-grid">
        <div>
          <div className="co-section">
            <div className="co-title">📦 COLLECTION OR DELIVERY?</div>
            <div className="type-toggle">
              <button className={`type-btn ${type==="collection"?"selected":""}`} onClick={() => { setType("collection"); setAsap(false); }}>🏪 Collection</button>
              <button className={`type-btn ${type==="delivery"?"selected":""}`} onClick={() => { setType("delivery"); setAsap(false); }}>🚗 Delivery (+£2.50)</button>
            </div>
            <div className="co-title" style={{fontSize:"0.8rem",marginBottom:"0.6rem"}}>📅 PICK A DATE</div>
            <div className="date-grid">
              {availableDays.map(day => (
                <button key={day.label} className={`date-btn ${day.type==="live"?"live-day":""} ${selDateLabel===day.label?"selected":""}`} onClick={() => selectDate(day)}>
                  {day.label}<div className="date-btn-sub">{day.type==="live"?"🟢 Open":"📅 Pre-order"}</div>
                </button>
              ))}
            </div>
            {selDayType === "preorder" && <div className="preorder-notice">📋 <strong>Pre-order day</strong> — your order will be made fresh and ready for your chosen time. We'll confirm by email.</div>}
            {selDateLabel && (
              <>
                <div className="co-title" style={{fontSize:"0.8rem",margin:"1rem 0 0.6rem"}}>⏰ PICK A TIME</div>
                {showAsap && <button className={`asap-btn ${asap?"selected":""}`} onClick={() => { setAsap(true); setSelTime(null); }}>⚡ Collection ASAP — I'll be there soon!</button>}
                <div className="time-grid">
                  {TIME_SLOTS.map(t => <button key={t} className={`time-btn ${selTime===t?"selected":""}`} onClick={() => { setSelTime(t); setAsap(false); }}>{t}</button>)}
                </div>
              </>
            )}
          </div>
          <div className="co-section">
            <div className="co-title">👤 YOUR DETAILS</div>
            {[{k:"name",l:"Full Name",p:"Your name"},{k:"email",l:"Email",p:"email@example.com"},{k:"phone",l:"Phone",p:"+44 7700 000000"}].map(f => (
              <div key={f.k} className="form-group">
                <label className="form-label">{f.l}</label>
                <input className="form-input" type="text" placeholder={f.p} value={form[f.k]} onChange={e => setForm(p => ({...p,[f.k]:e.target.value}))} />
              </div>
            ))}
            {type === "delivery" && (
              <div className="form-group">
                <label className="form-label">Delivery Address</label>
                <input className="form-input" type="text" placeholder="Full delivery address" value={form.address} onChange={e => setForm(p => ({...p,address:e.target.value}))} />
              </div>
            )}
            <div className="form-group">
              <label className="form-label">Order Notes (optional)</label>
              <input className="form-input" type="text" placeholder="Any special requests..." value={form.notes} onChange={e => setForm(p => ({...p,notes:e.target.value}))} />
            </div>
          </div>
          <div className="co-section">
            <div className="co-title">💳 PAYMENT</div>
            <div style={{background:"rgba(245,197,66,0.07)",border:"2px solid rgba(245,197,66,0.3)",borderRadius:"10px",padding:"1rem",display:"flex",alignItems:"center",gap:"1rem"}}>
              <div style={{fontSize:"1.5rem"}}>💳</div>
              <div>
                <div style={{fontWeight:800,fontSize:"0.9rem",color:"var(--white)"}}>Pay by Card via SumUp</div>
                <div style={{fontSize:"0.78rem",color:"rgba(255,255,255,0.4)"}}>You'll be shown a secure payment link after placing your order</div>
              </div>
            </div>
          </div>
        </div>
        <div>
          <div className="co-section" style={{position:"sticky",top:"80px"}}>
            <div className="co-title">🧾 ORDER SUMMARY</div>
            {cart.map((item,idx) => <div key={idx} className="summary-item"><span>{item.qty}× {item.name}</span><span>£{(item.price*item.qty).toFixed(2)}</span></div>)}
            {type === "delivery" && <div className="summary-item"><span>Delivery fee</span><span>£2.50</span></div>}
            <div className="summary-total"><span>Total</span><span>£{orderTotal.toFixed(2)}</span></div>
            {selDateLabel && (asap || selTime) && (
              <div style={{marginTop:"1rem",padding:"0.8rem",background:"rgba(245,197,66,0.07)",borderRadius:"8px",fontSize:"0.82rem",color:"rgba(255,255,255,0.5)",border:"1px solid rgba(245,197,66,0.2)"}}>
                📅 {selDateLabel} {asap?"— ASAP ⚡":`at ${selTime}`}<br />
                {type==="collection"?"🏪 Collection":"🚗 Delivery"}
                {selDayType==="preorder" && <><br />📋 Pre-order — we'll confirm by email</>}
              </div>
            )}
            <button className="place-btn" onClick={handleSubmit} disabled={!canSubmit}>{submitting?"SAVING ORDER...":"PLACE ORDER →"}</button>
            {!canSubmit && !submitting && <div style={{textAlign:"center",fontSize:"0.75rem",color:"rgba(255,255,255,0.3)",marginTop:"0.5rem"}}>Fill in your details and select a date & time</div>}
          </div>
        </div>
      </div>
    </div>
  );
}

function ConfirmationPage({ order, onBackToMenu }) {
  const paymentLink = getSumUpPaymentLink(order.total, order.orderId);
  const qrUrl = getQRCodeUrl(paymentLink);
  return (
    <div className="confirmation">
      <div className="confirm-icon">🎉</div>
      <div className="confirm-title">ORDER PLACED!</div>
      <div className="confirm-sub">
        Thanks {order.name.split(" ")[0]}! Your order is confirmed.<br />
        <span style={{color:"var(--yellow)",fontWeight:700}}>Now complete your payment below to secure it.</span>
      </div>
      <div className="confirm-card">
        {[["Order ID",order.orderId],["Type",order.type==="collection"?"🏪 Collection":"🚗 Delivery"],["Date",order.date],["Time",order.isAsap?"⚡ ASAP":order.time],["Total",`£${order.total.toFixed(2)}`]].map(([l,v]) => (
          <div key={l} className="confirm-row"><span className="confirm-label">{l}</span><span className="confirm-value">{v}</span></div>
        ))}
      </div>
      <div className="pay-section">
        <div className="pay-title">💳 COMPLETE PAYMENT</div>
        <div className="pay-amount">£<span>{order.total.toFixed(2)}</span></div>
        <div style={{fontSize:"0.82rem",color:"#888",margin:"12px 0",textAlign:"center"}}>
          When SumUp opens, enter <strong>the full amount shown here</strong> to complete your order.
        </div>
        <a href={paymentLink} className="pay-now-btn" target="_blank" rel="noopener noreferrer">
          PAY £{order.total.toFixed(2)} ON SUMUP →
        </a>
        <div className="pay-divider">
          <div className="pay-divider-line"></div>
          <div className="pay-divider-text">OR SCAN QR CODE</div>
          <div className="pay-divider-line"></div>
        </div>
        <div className="qr-wrap">
          <img src={qrUrl} alt="Scan to pay" className="qr-img" />
          <div className="qr-label">Scan with your phone camera to pay</div>
        </div>
        <div className="pay-note">🔒 Secure payment powered by SumUp<br />Your order reference: {order.orderId}</div>
      </div>
      <button className="back-btn" onClick={onBackToMenu}>ORDER MORE 🍩</button>
    </div>
  );
}

// ============================================================
// ADMIN DASHBOARD
// ============================================================
function AdminDashboard({ storePaused, setStorePaused }) {
  const [orders, setOrders] = useState([]);
  const [filter, setFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const prevCount = React.useRef(0);

  useEffect(() => { loadOrders(); const iv = setInterval(loadOrders,30000); return () => clearInterval(iv); }, []);

  async function loadOrders() {
    const { data, error } = await supabase.from("orders").select("*").order("created_at",{ascending:false});
    if (data) {
      if (prevCount.current>0&&data.length>prevCount.current) playNotificationSound();
      prevCount.current=data.length;
      setOrders(data);
    }
    if (error) console.error(error);
    setLoading(false);
  }

  async function updateStatus(id,status) {
    await supabase.from("orders").update({order_status:status}).eq("id",id);
    setOrders(os => os.map(o => o.id===id?{...o,order_status:status}:o));
  }

  async function handlePauseToggle() {
    await setStorePaused(!storePaused);
  }

  const filtered = filter==="all" ? orders : orders.filter(o => o.order_status===filter);

  return (
    <div>
      <div className={`pause-banner ${storePaused?"":"open-state"}`}>
        <div>
          <div className="pause-banner-text">{storePaused ? "🔴 Orders are PAUSED — customers cannot order" : "🟢 Store is OPEN — accepting orders"}</div>
          <div style={{fontSize:"0.75rem",color:"rgba(255,255,255,0.3)",marginTop:"0.3rem"}}>Saved permanently — survives page refresh</div>
        </div>
        <button className={`pause-btn ${storePaused?"is-paused":"is-open"}`} onClick={handlePauseToggle}>
          {storePaused ? "▶ Resume Orders" : "⏸ Pause Orders"}
        </button>
      </div>
      <div className="stats-grid">
        {[
          {label:"Total Orders",value:orders.length,sub:`${orders.filter(o=>o.order_status==="new").length} new`},
          {label:"Revenue",value:`£${orders.reduce((s,o)=>s+(o.total||0),0).toFixed(2)}`,sub:"all time"},
          {label:"Collections",value:orders.filter(o=>o.type==="collection").length,sub:"total"},
          {label:"Deliveries",value:orders.filter(o=>o.type==="delivery").length,sub:"total"},
        ].map(s => (
          <div key={s.label} className="stat-card"><div className="stat-label">{s.label}</div><div className="stat-value">{s.value}</div><div className="stat-sub">{s.sub}</div></div>
        ))}
      </div>
      <div className="orders-filter">
        {["all","new","confirmed","ready","completed"].map(f =>
          <button key={f} className={`filter-btn ${filter===f?"active":""}`} onClick={() => setFilter(f)}>{f.charAt(0).toUpperCase()+f.slice(1)}</button>
        )}
      </div>
      {loading
        ? <div style={{color:"rgba(255,255,255,0.4)",padding:"2rem",textAlign:"center"}}>Loading orders...</div>
        : filtered.length===0
          ? <div style={{color:"rgba(255,255,255,0.4)",padding:"2rem",textAlign:"center"}}>No orders yet 👀</div>
          : <div className="orders-list">{filtered.map(o => (
              <div key={o.id} className="order-card">
                <div>
                  <div className="order-id">{o.id}</div>
                  <div className="order-name">{o.customer_name}</div>
                  <div className="order-detail">📧 {o.customer_email}</div>
                  <div className="order-detail">📱 {o.customer_phone}</div>
                  <div className="order-detail">{o.type==="collection"?"🏪 Collection":"🚗 Delivery"} · {o.date} at {o.time}</div>
                  {o.delivery_address && <div className="order-detail">📍 {o.delivery_address}</div>}
                  {o.notes && <div className="order-detail">📝 {o.notes}</div>}
                  <div style={{marginTop:"0.4rem"}}>{o.items&&o.items.map((item,i) => <span key={i} className="order-item-chip">{item.qty}× {item.name}</span>)}</div>
                </div>
                <div style={{textAlign:"right"}}>
                  <div className="order-total-badge">£{(o.total||0).toFixed(2)}</div>
                  <div><span className={`status-badge status-${o.order_status}`}>{o.order_status}</span></div>
                  <select className="status-select" value={o.order_status} onChange={e => updateStatus(o.id,e.target.value)}>
                    <option value="new">New</option>
                    <option value="confirmed">Confirmed</option>
                    <option value="ready">Ready</option>
                    <option value="completed">Completed</option>
                  </select>
                </div>
              </div>
            ))}</div>
      }
    </div>
  );
}

// ============================================================
// ADMIN MENU — with Add Item, Upload Image, Delete
// ============================================================
function AdminMenu() {
  const { menuItems, toggleItem, addMenuItem, deleteMenuItem, updateMenuItemImage } = useContext(MenuStateContext);
  const [toast, setToast] = useState(null);
  const [adding, setAdding] = useState(false);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [newItem, setNewItem] = useState({
    name:"", price:"", category:"donut", description:"",
    allergens:"gluten, eggs, dairy", emoji:"🍩", badge:"", bg:"#2d1b69",
  });

  function showToast(msg, type="success") {
    setToast({msg,type});
    setTimeout(() => setToast(null), 3000);
  }

  function handleImagePick(e) {
    const file = e.target.files[0];
    if (!file) return;
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  }

  async function handleAddItem() {
    if (!newItem.name || !newItem.price) return showToast("Name and price required", "error");
    setAdding(true);
    const itemToAdd = {
      ...newItem,
      price: parseFloat(newItem.price),
      allergens: newItem.allergens.split(",").map(a=>a.trim()),
      options: {},
    };
    const ok = await addMenuItem(itemToAdd, imageFile);
    if (ok) {
      showToast("✅ Item added successfully!");
      setNewItem({ name:"", price:"", category:"donut", description:"", allergens:"gluten, eggs, dairy", emoji:"🍩", badge:"", bg:"#2d1b69" });
      setImageFile(null);
      setImagePreview(null);
    } else {
      showToast("❌ Failed to add item", "error");
    }
    setAdding(false);
  }

  async function handleDelete(id, name) {
    if (!window.confirm(`Delete "${name}"? This cannot be undone.`)) return;
    const ok = await deleteMenuItem(id);
    ok ? showToast(`🗑️ "${name}" deleted`) : showToast("❌ Delete failed", "error");
  }

  async function handleImageUpload(id, e) {
    const file = e.target.files[0];
    if (!file) return;
    showToast("Uploading image...");
    const ok = await updateMenuItemImage(id, file);
    ok ? showToast("✅ Image updated!") : showToast("❌ Upload failed", "error");
  }

  const cats = [{id:"donut",label:"🍩 Donuts"},{id:"cookie_pie",label:"🥧 Cookie Pies"},{id:"cookie_cup",label:"🍪 Cookie Cups"}];

  return (
    <div>
      {toast && <Toast msg={toast.msg} type={toast.type} />}

      {/* ADD NEW ITEM */}
      <div className="add-item-section">
        <div className="add-item-title">➕ ADD NEW MENU ITEM</div>
        <div className="add-item-grid">
          <div className="form-group">
            <label className="form-label">Item Name *</label>
            <input className="form-input" placeholder="e.g. Kinder Donut Box" value={newItem.name} onChange={e => setNewItem(p=>({...p,name:e.target.value}))} />
          </div>
          <div className="form-group">
            <label className="form-label">Price (£) *</label>
            <input className="form-input" type="number" step="0.50" placeholder="3.00" value={newItem.price} onChange={e => setNewItem(p=>({...p,price:e.target.value}))} />
          </div>
          <div className="form-group">
            <label className="form-label">Category</label>
            <select className="form-select" value={newItem.category} onChange={e => setNewItem(p=>({...p,category:e.target.value}))}>
              <option value="donut">🍩 Donut</option>
              <option value="cookie_pie">🥧 Cookie Pie</option>
              <option value="cookie_cup">🍪 Cookie Cup</option>
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Emoji</label>
            <input className="form-input" placeholder="🍩" value={newItem.emoji} onChange={e => setNewItem(p=>({...p,emoji:e.target.value}))} />
          </div>
          <div className="form-group" style={{gridColumn:"1/-1"}}>
            <label className="form-label">Description</label>
            <input className="form-input" placeholder="Describe the item..." value={newItem.description} onChange={e => setNewItem(p=>({...p,description:e.target.value}))} />
          </div>
          <div className="form-group">
            <label className="form-label">Allergens (comma separated)</label>
            <input className="form-input" placeholder="gluten, eggs, dairy" value={newItem.allergens} onChange={e => setNewItem(p=>({...p,allergens:e.target.value}))} />
          </div>
          <div className="form-group">
            <label className="form-label">Badge (optional)</label>
            <input className="form-input" placeholder="e.g. New, Hot, Fan Fave" value={newItem.badge} onChange={e => setNewItem(p=>({...p,badge:e.target.value}))} />
          </div>
        </div>

        {/* IMAGE UPLOAD */}
        <div className="form-group" style={{marginTop:"0.5rem"}}>
          <label className="form-label">Product Photo (optional)</label>
          <label className="upload-zone" style={{display:"block",cursor:"pointer"}}>
            <input type="file" accept="image/*"  className="hidden-input" onChange={handleImagePick} />
            {imagePreview
              ? <img src={imagePreview} alt="Preview" className="img-preview" />
              : <><div style={{fontSize:"2rem"}}>📸</div><div className="upload-zone-text">Tap to take a photo or choose from camera roll</div></>
            }
          </label>
        </div>

        <button className="add-item-btn" onClick={handleAddItem} disabled={adding}>
          {adding ? "ADDING..." : "➕ ADD TO MENU"}
        </button>
      </div>

      {/* EXISTING ITEMS */}
      {cats.map(cat => (
        <div key={cat.id} style={{marginBottom:"2rem"}}>
          <div style={{fontFamily:"'Bangers',cursive",fontSize:"1.1rem",color:"var(--yellow)",letterSpacing:"2px",marginBottom:"0.8rem"}}>{cat.label}</div>
          <div className="admin-menu-grid">
            {menuItems.filter(i => i.category===cat.id).map(item => (
              <div key={item.id} className="admin-menu-card" style={{opacity:item.available?1:0.6}}>
                <div className="admin-card-img" style={{background:`${item.bg}cc`}}>
                  {item.image_url
                    ? <img src={item.image_url} alt={item.name} />
                    : <span className="admin-card-img-emoji">{item.emoji}</span>
                  }
                </div>
                <div className="admin-card-body">
                  <div className="admin-card-name">{item.name}</div>
                  <div className="admin-card-price">£{parseFloat(item.price).toFixed(2)}</div>
                  <div className="admin-card-actions">
                    <button className={`toggle-avail ${item.available?"on":"off"}`} onClick={() => toggleItem(item.id)}>
                      {item.available?"● Available":"✗ Hidden"}
                    </button>
                    <label className="upload-img-btn" style={{cursor:"pointer"}}>
                      📸 Photo
                      <input type="file" accept="image/*"  className="hidden-input" onChange={e => handleImageUpload(item.id, e)} />
                    </label>
                    <button className="delete-item-btn" onClick={() => handleDelete(item.id, item.name)}>🗑️ Delete</button>
                  </div>
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
  const { storePaused, setStorePaused } = useContext(MenuStateContext);
  return (
    <div className="admin-layout">
      <div className="admin-sidebar">
        <div className="admin-sidebar-label">Admin Panel</div>
        {[{id:"orders",label:"📋 Orders"},{id:"menu",label:"🍩 Menu"}].map(t =>
          <button key={t.id} className={`admin-nav-btn ${tab===t.id?"active":""}`} onClick={() => setTab(t.id)}>{t.label}</button>
        )}
      </div>
      <div className="admin-main">
        <div className="admin-page-title">{tab==="orders"?"ORDERS":"MENU MANAGER"}</div>
        {tab==="orders" && <AdminDashboard storePaused={storePaused} setStorePaused={setStorePaused} />}
        {tab==="menu" && <AdminMenu />}
      </div>
    </div>
  );
}

const ADMIN_PIN = "0408";
function AdminPinLock({ onUnlock }) {
  const [pin, setPin] = useState("");
  const [error, setError] = useState(false);
  function handleSubmit() { if (pin===ADMIN_PIN) { onUnlock(); } else { setError(true); setPin(""); setTimeout(()=>setError(false),2000); } }
  return (
    <div style={{minHeight:"100vh",background:"var(--dark)",display:"flex",alignItems:"center",justifyContent:"center"}}>
      <div style={{background:"#1a1040",borderRadius:"20px",padding:"2.5rem",border:"2px solid rgba(245,197,66,0.3)",width:"320px",textAlign:"center"}}>
        <div style={{fontSize:"3rem",marginBottom:"1rem"}}>🔒</div>
        <div style={{fontFamily:"'Bangers',cursive",fontSize:"1.8rem",color:"var(--yellow)",letterSpacing:"2px",marginBottom:"0.5rem"}}>ADMIN ACCESS</div>
        <div style={{color:"rgba(255,255,255,0.4)",fontSize:"0.85rem",marginBottom:"1.5rem"}}>Enter your PIN to continue</div>
        <input type="password" inputMode="numeric" maxLength={6} value={pin} onChange={e=>setPin(e.target.value)} onKeyDown={e=>e.key==="Enter"&&handleSubmit()} placeholder="••••"
          style={{width:"100%",padding:"0.9rem",borderRadius:"10px",textAlign:"center",border:`2px solid ${error?"#e06060":"rgba(255,255,255,0.15)"}`,background:"rgba(255,255,255,0.05)",color:"white",fontFamily:"'Nunito',sans-serif",fontSize:"1.5rem",letterSpacing:"0.5rem",outline:"none",marginBottom:"1rem"}} />
        {error && <div style={{color:"#e06060",fontSize:"0.85rem",marginBottom:"0.8rem"}}>❌ Wrong PIN, try again</div>}
        <button onClick={handleSubmit} style={{width:"100%",padding:"0.9rem",background:"var(--yellow)",color:"var(--dark)",border:"none",borderRadius:"10px",cursor:"pointer",fontFamily:"'Bangers',cursive",fontSize:"1.2rem",letterSpacing:"2px"}}>UNLOCK</button>
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
  const showAdminBtn = typeof window !== "undefined" && window.location.search.includes("admin");

  useEffect(() => { const h = () => setCartOpen(true); window.addEventListener("openCart",h); return () => window.removeEventListener("openCart",h); }, []);
  useEffect(() => { document.title = "TeeBakes — Fresh Donuts & Cookie Pies | Walsall"; }, []);

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
          {showAdminBtn && <button className={`nav-btn ${page==="admin"?"active":""}`} onClick={() => setPage("admin")}>Admin</button>}
          {page !== "admin" && <button className="cart-btn" onClick={() => setCartOpen(true)}>🛒 Cart {count>0&&<span className="cart-badge">{count}</span>}</button>}
        </div>
      </nav>
      {page==="menu" && <MenuPage />}
      {page==="checkout" && (
        <CheckoutPage onBack={() => setPage("menu")} onConfirm={(order) => {
          setConfirmedOrder(order);
          dispatch({ type:"CLEAR" });
          setPage("confirmation");
          setCartOpen(false);
        }} />
      )}
      {page==="confirmation" && confirmedOrder && (
        <ConfirmationPage order={confirmedOrder} onBackToMenu={() => { setPage("menu"); setConfirmedOrder(null); }} />
      )}
      {page==="admin" && (adminUnlocked ? <AdminPage /> : <AdminPinLock onUnlock={() => setAdminUnlocked(true)} />)}
      {cartOpen && (
        <>
          <div className="modal-overlay" onClick={() => setCartOpen(false)} style={{zIndex:250}} />
          <CartDrawer onClose={() => setCartOpen(false)} onCheckout={() => { setCartOpen(false); setPage("checkout"); }} />
        </>
      )}
    </div>
  );
}

export default function WrappedApp() {
  return (
    <MenuStateProvider>
      <CartProvider>
        <App />
      </CartProvider>
    </MenuStateProvider>
  );
}
