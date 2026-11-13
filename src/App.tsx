/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { 
  ShoppingBag, 
  Star, 
  ArrowRight, 
  X, 
  Plus, 
  Minus, 
  CheckCircle2, 
  Truck, 
  Gift, 
  MessageCircle, 
  Menu,
  ShieldAlert,
  BarChart3,
  Package,
  Trash2,
  Edit,
  Lock,
  UserCheck,
  Eye,
  DollarSign
} from "lucide-react";

interface Product {
  id: string;
  name: string;
  category: string;
  price: number; // in Naira (₦)
  rating: number;
  reviewsCount: number;
  image: string;
  description: string;
  details: string[];
}

interface CartItem extends Product {
  quantity: number;
}

interface Order {
  id: string;
  name: string;
  phone: string;
  state: string;
  address: string;
  city: string;
  total: number;
  date: string;
}

const INITIAL_PRODUCTS: Product[] = [
  {
    id: "niff-1",
    name: "Princess Luxury Perfume Gift Box",
    category: "Gift Boxes",
    price: 35000,
    rating: 5.0,
    reviewsCount: 84,
    image: "/public/assets/aistudio/Screenshot_20261113-100028_a56bae77.png",
    description: "Our signature pink presentation box filled with shredded paper, handwritten 'Thank You' card, and 3 luxury designer miniature perfumes (YSL, Dior & Chanel).",
    details: ["Includes 3 designer mini perfumes", "Signature pink unboxing box with shredded paper", "Personalized handwritten thank you card", "Nationwide delivery across Nigeria"]
  },
  {
    id: "niff-2",
    name: "Dainty Floral Charm Bracelet Set",
    category: "Jewelry",
    price: 18500,
    rating: 4.9,
    reviewsCount: 62,
    image: "/public/assets/aistudio/Screenshot_20261113-100028_a56bae77.png",
    description: "Exquisite adjustable gold-plated charm bracelets adorned with delicate enamel flowers and crystal accents. Perfect gift for your princess.",
    details: ["18k Gold plated finish", "Adjustable slider chain for all wrist sizes", "Tarnish resistant coating", "Presented in a velvet gift pouch"]
  },
  {
    id: "niff-3",
    name: "Silicone Brick Texture Phone Case & Grip",
    category: "Phone Accessories",
    price: 12000,
    rating: 4.8,
    reviewsCount: 145,
    image: "/public/assets/aistudio/Screenshot_20261113-100028_a56bae77.png",
    description: "Vibrant pastel silicone phone cases with textured brick grip backs. Available in 15+ gorgeous shades for all iPhone & Samsung models.",
    details: ["Soft-touch liquid silicone", "Shock-absorbent drop protection", "Raised bezel screen & camera guard", "Easy click tactile buttons"]
  },
  {
    id: "niff-4",
    name: "Rhode Lip Tint & Glow Gift Box",
    category: "Gift Boxes",
    price: 24000,
    rating: 5.0,
    reviewsCount: 93,
    image: "/public/assets/aistudio/Screenshot_20261113-100028_a56bae77.png",
    description: "Curated gift box featuring nourishing peptide lip tints and glosses nestled in signature pink crinkle paper with custom gift tag.",
    details: ["Includes 2 bestselling lip tint shades", "Deeply nourishing peptide formula", "Gorgeous pink presentation box", "Free nationwide delivery bonus eligible"]
  },
  {
    id: "niff-5",
    name: "Vintage Tortoiseshell Sunglasses",
    category: "Sunglasses",
    price: 15000,
    rating: 4.7,
    reviewsCount: 41,
    image: "/public/assets/aistudio/Screenshot_20261113-100028_a56bae77.png",
    description: "Chic retro tortoiseshell frames with UV400 gradient lenses. Packaged in a white gift box with signature ribbon.",
    details: ["UV400 sun protection", "Sturdy acetate frames", "Scratch-resistant lenses", "Includes microfiber cleaning pouch"]
  },
  {
    id: "niff-6",
    name: "Mimi Designer Perfume Trio Set",
    category: "Perfumes",
    price: 42000,
    rating: 4.9,
    reviewsCount: 77,
    image: "/public/assets/aistudio/Screenshot_20261113-100028_a56bae77.png",
    description: "An exquisite trio of long-lasting floral and fruity designer fragrances in an opulent gift box with gold foil thank you card.",
    details: ["Long-lasting 24hr fragrance projection", "Top notes of jasmine, peach & bergamot", "Luxurious glass bottles", "Perfect gift for birthdays & anniversaries"]
  }
];

export default function App() {
  // Persistent State for Products
  const [products, setProducts] = useState<Product[]>(() => {
    const saved = localStorage.getItem("niffs_products");
    return saved ? JSON.parse(saved) : INITIAL_PRODUCTS;
  });

  // Persistent State for Analytics & Orders
  const [siteViews, setSiteViews] = useState<number>(() => {
    const views = localStorage.getItem("niffs_views");
    const count = views ? parseInt(views, 10) + 1 : 1240;
    localStorage.setItem("niffs_views", count.toString());
    return count;
  });

  const [orders, setOrders] = useState<Order[]>(() => {
    const saved = localStorage.getItem("niffs_orders");
    return saved ? JSON.parse(saved) : [
      { id: "NIFF-94812", name: "Zainab Bello", phone: "08031234567", state: "Abuja", address: "14 Gwarimpa Estate", city: "Abuja", total: 35000, date: "2026-11-12" },
      { id: "NIFF-32145", name: "Chiamaka Okoro", phone: "08098765432", state: "Lagos", address: "8 Admiralty Way, Lekki", city: "Lagos", total: 30500, date: "2026-11-12" }
    ];
  });

  // Admin Auth State
  const [adminEmail, setAdminEmail] = useState<string>(() => {
    return localStorage.getItem("niffs_admin_email") || "";
  });
  const [ownerEmail, setOwnerEmail] = useState<string>(() => {
    return localStorage.getItem("niffs_owner_email") || "";
  });
  const [isAdminModalOpen, setIsAdminModalOpen] = useState(false);
  const [loginEmailInput, setLoginEmailInput] = useState("");
  const [loginPasswordInput, setLoginPasswordInput] = useState("");
  const [loginError, setLoginError] = useState("");
  const [failedAttempts, setFailedAttempts] = useState(0);

  // Product Management State
  const [isEditingProduct, setIsEditingProduct] = useState<Product | null>(null);
  const [isAddingProduct, setIsAddingProduct] = useState(false);
  const [productForm, setProductForm] = useState({
    name: "",
    category: "Gift Boxes",
    price: "",
    image: "",
    description: "",
    details: ""
  });

  const [activeCategory, setActiveCategory] = useState<string>("All");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [orderComplete, setOrderComplete] = useState<{ id: string; name: string } | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Checkout form state
  const [formData, setFormData] = useState({
    name: "",
    phone: "09135894717",
    state: "Lagos",
    address: "",
    city: "",
    paymentMethod: "transfer"
  });

  useEffect(() => {
    localStorage.setItem("niffs_products", JSON.stringify(products));
  }, [products]);

  useEffect(() => {
    localStorage.setItem("niffs_orders", JSON.stringify(orders));
  }, [orders]);

  const categories = ["All", "Gift Boxes", "Perfumes", "Jewelry", "Phone Accessories", "Sunglasses"];

  const filteredProducts = activeCategory === "All" 
    ? products 
    : products.filter(p => p.category === activeCategory);

  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const deliveryFee = subtotal > 50000 || subtotal === 0 ? 0 : 3500;
  const total = subtotal + deliveryFee;

  const addToCart = (product: Product, quantity = 1) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        return prev.map(item => 
          item.id === product.id ? { ...item, quantity: item.quantity + quantity } : item
        );
      }
      return [...prev, { ...product, quantity }];
    });
    setIsCartOpen(true);
  };

  const updateQuantity = (id: string, delta: number) => {
    setCart(prev => prev.map(item => {
      if (item.id === id) {
        const newQty = item.quantity + delta;
        return newQty > 0 ? { ...item, quantity: newQty } : null;
      }
      return item;
    }).filter(Boolean) as CartItem[]);
  };

  const removeFromCart = (id: string) => {
    setCart(prev => prev.filter(item => item.id !== id));
  };

  const handleCheckoutSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const orderId = "NIFF-" + Math.floor(100000 + Math.random() * 900000);
    const newOrder: Order = {
      id: orderId,
      name: formData.name,
      phone: formData.phone,
      state: formData.state,
      address: formData.address,
      city: formData.city,
      total: total,
      date: new Date().toISOString().split('T')[0]
    };
    setOrders(prev => [newOrder, ...prev]);
    setOrderComplete({ id: orderId, name: formData.name });
    setCart([]);
  };

  // Admin Authentication Handler
  const handleAdminLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginEmailInput.trim() || !loginPasswordInput) return;

    if (failedAttempts >= 3) {
      setLoginError("Too many failed attempts. Security lock engaged for 30s.");
      return;
    }

    const email = loginEmailInput.trim().toLowerCase();
    
    // Secure Admin Passcode check (Passcode: niffs2026)
    if (loginPasswordInput !== "niffs2026") {
      setFailedAttempts(prev => prev + 1);
      setLoginError("Invalid security passcode. Access denied.");
      return;
    }

    setLoginError("");
    setFailedAttempts(0);

    // Check if owner is already set
    let currentOwner = ownerEmail;
    if (!currentOwner) {
      currentOwner = email;
      setOwnerEmail(email);
      localStorage.setItem("niffs_owner_email", email);
    }

    setAdminEmail(email);
    localStorage.setItem("niffs_admin_email", email);
  };

  const handleAdminLogout = () => {
    setAdminEmail("");
    localStorage.removeItem("niffs_admin_email");
  };

  // Product CRUD Handlers
  const handleSaveProduct = (e: React.FormEvent) => {
    e.preventDefault();
    const detailsArray = productForm.details.split("\n").filter(Boolean);

    if (isEditingProduct) {
      setProducts(prev => prev.map(p => p.id === isEditingProduct.id ? {
        ...p,
        name: productForm.name,
        category: productForm.category,
        price: parseFloat(productForm.price) || 0,
        image: productForm.image || p.image,
        description: productForm.description,
        details: detailsArray.length > 0 ? detailsArray : p.details
      } : p));
      setIsEditingProduct(null);
    } else {
      const newProd: Product = {
        id: "niff-" + Date.now(),
        name: productForm.name,
        category: productForm.category,
        price: parseFloat(productForm.price) || 15000,
        rating: 5.0,
        reviewsCount: 1,
        image: productForm.image || "/public/assets/aistudio/Screenshot_20261113-100028_a56bae77.png",
        description: productForm.description,
        details: detailsArray.length > 0 ? detailsArray : ["Handcrafted with love", "Nationwide delivery"]
      };
      setProducts(prev => [newProd, ...prev]);
      setIsAddingProduct(false);
    }

    setProductForm({ name: "", category: "Gift Boxes", price: "", image: "", description: "", details: "" });
  };

  const handleDeleteProduct = (id: string) => {
    if (window.confirm("Are you sure you want to delete this product?")) {
      setProducts(prev => prev.filter(p => p.id !== id));
    }
  };

  const startEditProduct = (p: Product) => {
    setIsEditingProduct(p);
    setProductForm({
      name: p.name,
      category: p.category,
      price: p.price.toString(),
      image: p.image,
      description: p.description,
      details: p.details.join("\n")
    });
    setIsAddingProduct(true);
  };

  const totalRevenue = orders.reduce((sum, o) => sum + o.total, 0);

  return (
    <div className="min-h-screen bg-[#fff5f7] text-[#2d1e2f] flex flex-col selection:bg-[#ffb3c6]/30 font-sans">
      
      {/* Top Banner */}
      <div className="bg-[#ff4d80] text-white text-xs py-2 px-4 text-center font-medium tracking-wide flex items-center justify-center gap-2">
        <span>Girls shop made with love 💕 · NATION WIDE DELIVERY 🎀 · DM / WhatsApp: 09135894717</span>
      </div>

      {/* Top Navigation Bar */}
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-[#ffd1dc] px-6 lg:px-12 py-4 shadow-xs">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-8">
          
          {/* Brand Logo */}
          <a href="#" className="flex items-center gap-2.5">
            <img 
              src="/assets/aistudio/file_00000000e2888246b7b646b7e9f89c92_57089bc1.png" 
              alt="niffs.ng logo"
              className="h-11 w-auto object-contain"
              referrerPolicy="no-referrer"
            />
          </a>

          {/* Navigation Links */}
          <nav className="hidden lg:flex items-center gap-8 text-sm font-medium text-[#6b5b6e]">
            <a href="#catalog" className="hover:text-[#ff4d80] transition-colors whitespace-nowrap">Shop Catalog</a>
            <a href="#about" className="hover:text-[#ff4d80] transition-colors whitespace-nowrap">About Hanifa</a>
            <a href="#faq" className="hover:text-[#ff4d80] transition-colors whitespace-nowrap">FAQ</a>
            <a href="#reviews" className="hover:text-[#ff4d80] transition-colors whitespace-nowrap">Customer Love</a>
          </nav>

          {/* Right Actions */}
          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={() => setIsAdminModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-2 bg-[#2d1e2f] text-white rounded-full text-xs font-semibold hover:bg-[#432d45] transition-colors shadow-xs"
            >
              <BarChart3 className="w-3.5 h-3.5" />
              <span>Admin Dashboard</span>
            </button>

            <button 
              onClick={() => setIsCartOpen(true)}
              className="relative flex items-center gap-2 px-5 py-2.5 bg-[#ff4d80] text-white rounded-full text-xs font-semibold hover:bg-[#e03b6e] transition-all shadow-md whitespace-nowrap"
            >
              <ShoppingBag className="w-4 h-4" />
              <span>Cart</span>
              {cart.reduce((sum, i) => sum + i.quantity, 0) > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-[#2d1e2f] text-white text-[10px] w-5 h-5 rounded-full flex items-center justify-center font-bold">
                  {cart.reduce((sum, i) => sum + i.quantity, 0)}
                </span>
              )}
            </button>

            <button 
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 text-[#2d1e2f]"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {mobileMenuOpen && (
          <div className="lg:hidden absolute top-full left-0 w-full bg-white border-b border-[#ffd1dc] shadow-xl py-6 px-6 flex flex-col gap-4 animate-fade-in">
            <a href="#catalog" onClick={() => setMobileMenuOpen(false)} className="text-base font-medium text-[#2d1e2f]">Shop Catalog</a>
            <a href="#about" onClick={() => setMobileMenuOpen(false)} className="text-base font-medium text-[#2d1e2f]">About Hanifa</a>
            <a href="#faq" onClick={() => setMobileMenuOpen(false)} className="text-base font-medium text-[#2d1e2f]">FAQ</a>
            <a href="#reviews" onClick={() => setMobileMenuOpen(false)} className="text-base font-medium text-[#2d1e2f]">Customer Love</a>
            <button onClick={() => { setMobileMenuOpen(false); setIsAdminModalOpen(true); }} className="flex items-center gap-2 text-base font-medium text-[#ff4d80]">
              <BarChart3 className="w-5 h-5" />
              <span>Admin Dashboard</span>
            </button>
          </div>
        )}
      </header>

      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-[#fff0f3] via-[#ffe6ed] to-[#fff5f7] border-b border-[#ffd1dc] overflow-hidden py-16 lg:py-28">
        {/* Floating decorative gradient circles */}
        <div className="absolute top-10 left-10 w-72 h-72 bg-pink-300/20 rounded-full blur-3xl pointer-events-none animate-pulse" />
        <div className="absolute bottom-10 right-10 w-96 h-96 bg-rose-200/30 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-6 lg:px-12 relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          
          <div className="lg:col-span-7 flex flex-col gap-6 animate-fade-in">
            <div className="inline-flex items-center gap-2 text-xs uppercase tracking-widest text-[#ff4d80] font-black bg-white/90 backdrop-blur-md px-5 py-2.5 rounded-full w-fit shadow-md border border-[#ffd1dc]">
              <span className="tracking-[0.25em] bg-gradient-to-r from-[#ff4d80] to-[#ff7597] bg-clip-text text-transparent">✨ Girls shop made with love</span>
            </div>
            
            <h1 className="text-4xl sm:text-5xl lg:text-7xl font-serif font-bold text-[#2d1e2f] leading-[1.1] tracking-tight" style={{ textWrap: 'balance' }}>
              Gift ideas crafted for your princess <span className="text-[#ff4d80] inline-block animate-bounce">💕</span>
            </h1>
            
            <p className="text-base lg:text-lg text-[#6b5b6e] max-w-xl leading-relaxed font-light">
              Welcome to <span className="font-semibold text-[#ff4d80]">niffs.ng</span> by Hanifa! Explore exquisite luxury curated gift boxes, designer perfumes, chic phone accessories, and dazzling jewelry delivered with love across Nigeria.
            </p>
            
            <div className="flex flex-wrap items-center gap-4 pt-2">
              <a 
                href="#catalog"
                className="px-8 py-4 bg-[#ff4d80] text-white rounded-full text-sm font-semibold hover:bg-[#e03b6e] transition-all shadow-xl hover:shadow-pink-500/20 flex items-center gap-2 transform hover:-translate-y-0.5"
              >
                <span>Shop Cute Collections</span>
                <ArrowRight className="w-4 h-4" />
              </a>

              <a 
                href="https://wa.me/2349135894717"
                target="_blank"
                rel="noreferrer"
                className="px-8 py-4 bg-white text-[#ff4d80] border border-[#ffb3c6] rounded-full text-sm font-semibold hover:bg-[#fff0f3] transition-all flex items-center gap-2 shadow-md transform hover:-translate-y-0.5"
              >
                <MessageCircle className="w-4 h-4 text-[#25d366]" />
                <span>Chat on WhatsApp</span>
              </a>
            </div>

            <div className="grid grid-cols-3 gap-6 pt-8 border-t border-[#ffd1dc]">
              <div>
                <p className="font-serif text-3xl font-bold text-[#2d1e2f]">100%</p>
                <p className="text-xs text-[#6b5b6e] mt-1 font-medium">Made with Love</p>
              </div>
              <div>
                <p className="font-serif text-3xl font-bold text-[#2d1e2f]">Nationwide</p>
                <p className="text-xs text-[#6b5b6e] mt-1 font-medium">Fast Delivery</p>
              </div>
              <div>
                <p className="font-serif text-3xl font-bold text-[#2d1e2f]">09135894717</p>
                <p className="text-xs text-[#6b5b6e] mt-1 font-medium">Direct Orders</p>
              </div>
            </div>
          </div>

          <div className="lg:col-span-5 relative flex justify-center">
            <div className="relative w-full max-w-md rounded-3xl overflow-hidden shadow-2xl aspect-[4/5] bg-[#ffd1dc] border-4 border-white transform hover:scale-[1.02] transition-transform duration-500">
              <img 
                src="/src/assets/images/hanifa_illustration_portrait_1794565487776.jpg" 
                alt="Hanifa - Founder of niffs.ng"
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent pointer-events-none" />
              <div className="absolute bottom-6 left-6 right-6 bg-white/95 backdrop-blur-md p-5 rounded-2xl shadow-xl border border-[#ffd1dc] animate-fade-in">
                <p className="text-xs font-bold text-[#ff4d80] uppercase tracking-wider mb-1">Meet Hanifa · Founder</p>
                <p className="text-base font-serif font-bold text-[#2d1e2f]">Girls shop made with love 💕</p>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* Main Catalog */}
      <main id="catalog" className="flex-1 max-w-7xl mx-auto px-6 lg:px-12 py-16 w-full">
        
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div>
            <p className="text-xs uppercase tracking-widest text-[#ff4d80] font-bold mb-2">Explore Catalog</p>
            <h2 className="text-3xl lg:text-4xl font-serif font-bold text-[#2d1e2f]">
              Cute Essentials & Gift Boxes 🛍️
            </h2>
          </div>

          {/* Category Filter Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-4 py-2 text-xs font-semibold rounded-full transition-all whitespace-nowrap shrink-0 ${
                  activeCategory === cat 
                    ? "bg-[#ff4d80] text-white shadow-md" 
                    : "bg-white text-[#6b5b6e] border border-[#ffd1dc] hover:bg-[#fff0f3] hover:text-[#2d1e2f]"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Product Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredProducts.map((product) => (
            <div 
              key={product.id}
              className="group bg-white rounded-3xl overflow-hidden border border-[#ffd1dc] hover:border-[#ff4d80] transition-all duration-300 flex flex-col shadow-xs hover:shadow-xl"
            >
              <div 
                className="relative aspect-[4/3] bg-[#ffe6ed] overflow-hidden cursor-pointer"
                onClick={() => setSelectedProduct(product)}
              >
                <img 
                  src={product.image} 
                  alt={product.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-[10px] uppercase font-bold text-[#ff4d80] tracking-wide shadow-xs">
                  {product.category}
                </div>
              </div>

              <div className="p-6 flex flex-col flex-1 justify-between gap-4">
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <div className="flex items-center gap-1 text-xs text-[#6b5b6e]">
                      <Star className="w-3.5 h-3.5 fill-[#ff4d80] text-[#ff4d80]" />
                      <span className="font-bold text-[#2d1e2f]">{product.rating}</span>
                      <span>({product.reviewsCount})</span>
                    </div>
                    <span className="text-xs text-emerald-600 font-semibold bg-emerald-50 px-2 py-0.5 rounded-full">In Stock</span>
                  </div>

                  <h3 
                    onClick={() => setSelectedProduct(product)}
                    className="font-serif text-lg font-bold text-[#2d1e2f] hover:text-[#ff4d80] transition-colors cursor-pointer line-clamp-1"
                  >
                    {product.name}
                  </h3>

                  <p className="text-xs text-[#6b5b6e] mt-2 line-clamp-2 leading-relaxed">
                    {product.description}
                  </p>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-[#ffe6ed]">
                  <span className="font-serif text-xl font-bold text-[#ff4d80] tabular-nums">
                    ₦{product.price.toLocaleString()}
                  </span>

                  <button
                    onClick={() => addToCart(product)}
                    className="px-4 py-2.5 bg-[#ff4d80] text-white rounded-full text-xs font-semibold hover:bg-[#e03b6e] transition-colors flex items-center gap-1.5 shadow-sm"
                  >
                    <ShoppingBag className="w-3.5 h-3.5" />
                    <span>Add to Cart</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* About Hanifa Section */}
        <div id="about" className="mt-28 py-16 bg-white rounded-3xl border border-[#ffd1dc] px-8 lg:px-16 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center shadow-xs">
          <div className="lg:col-span-5 relative rounded-2xl overflow-hidden aspect-[4/5] bg-[#ffe6ed]">
            <img 
              src="/public/assets/aistudio/Screenshot_20261113-100028_a56bae77.png" 
              alt="Hanifa founder"
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
          </div>

          <div className="lg:col-span-7 flex flex-col gap-6">
            <div className="inline-flex items-center gap-2 text-xs uppercase tracking-widest text-[#ff4d80] font-bold">
              <span>@HⒶN🥏IFA🦩💕</span>
            </div>
            
            <h2 className="text-3xl lg:text-4xl font-serif font-bold text-[#2d1e2f]">
              Girls shop made with love, right here in Nigeria.
            </h2>

            <p className="text-sm lg:text-base text-[#6b5b6e] font-light leading-relaxed">
              Hello gorgeous! I'm Hanifa, the creator behind <span className="font-semibold text-[#ff4d80]">niffs.ng</span>. Every single gift box, perfume set, and accessory is thoughtfully curated and packed with pink love to make you or your special someone feel like absolute royalty.
            </p>

            <div className="grid grid-cols-2 gap-6 pt-4">
              <div className="flex gap-3">
                <div className="w-10 h-10 rounded-full bg-[#ffe6ed] flex items-center justify-center shrink-0">
                  <Truck className="w-5 h-5 text-[#ff4d80]" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-[#2d1e2f]">Nationwide Delivery</h4>
                  <p className="text-xs text-[#6b5b6e] mt-0.5">Prompt delivery across Lagos, Abuja, PH & all states.</p>
                </div>
              </div>

              <div className="flex gap-3">
                <div className="w-10 h-10 rounded-full bg-[#ffe6ed] flex items-center justify-center shrink-0">
                  <Gift className="w-5 h-5 text-[#ff4d80]" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-[#2d1e2f]">Custom Gift Boxes</h4>
                  <p className="text-xs text-[#6b5b6e] mt-0.5">Personalized notes and pink unboxing experience.</p>
                </div>
              </div>
            </div>

            <div className="pt-4">
              <a 
                href="https://wa.me/2349135894717" 
                target="_blank" 
                rel="noreferrer"
                className="inline-flex items-center gap-2 px-6 py-3.5 bg-[#25d366] text-white rounded-full text-xs font-semibold hover:bg-[#20ba5a] transition-colors shadow-sm"
              >
                <MessageCircle className="w-4 h-4" />
                <span>Chat Direct on WhatsApp (09135894717)</span>
              </a>
            </div>
          </div>
        </div>

        {/* FAQ Section */}
        <section id="faq" className="mt-28">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <p className="text-xs uppercase tracking-widest text-[#ff4d80] font-bold mb-2">Got Questions?</p>
            <h2 className="text-3xl lg:text-4xl font-serif font-bold text-[#2d1e2f]">
              Frequently Asked Questions 🎀
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-5xl mx-auto">
            <div className="bg-white p-8 rounded-3xl border border-[#ffd1dc] shadow-xs flex flex-col gap-3">
              <h3 className="font-serif text-lg font-bold text-[#2d1e2f]">How long does nationwide delivery take?</h3>
              <p className="text-xs text-[#6b5b6e] leading-relaxed">
                We deliver across all Nigerian states! Standard delivery takes 1-3 business days within Lagos and Abuja, and 3-5 business days for other states across Nigeria. Express dispatch is also available via WhatsApp (09135894717).
              </p>
            </div>

            <div className="bg-white p-8 rounded-3xl border border-[#ffd1dc] shadow-xs flex flex-col gap-3">
              <h3 className="font-serif text-lg font-bold text-[#2d1e2f]">Are gift boxes custom-wrapped?</h3>
              <p className="text-xs text-[#6b5b6e] leading-relaxed">
                Yes! Every single gift set is lovingly arranged in our signature pink unboxing boxes with shredded crinkle paper, secure bubble padding, and a personalized handwritten thank-you note or custom gift card.
              </p>
            </div>

            <div className="bg-white p-8 rounded-3xl border border-[#ffd1dc] shadow-xs flex flex-col gap-3">
              <h3 className="font-serif text-lg font-bold text-[#2d1e2f]">What is your return & exchange policy?</h3>
              <p className="text-xs text-[#6b5b6e] leading-relaxed">
                Due to the delicate nature of our gift items, jewelry, and cosmetics, we accept returns or exchanges only for items reported damaged upon arrival within 48 hours, accompanied by an unboxing video proof.
              </p>
            </div>

            <div className="bg-white p-8 rounded-3xl border border-[#ffd1dc] shadow-xs flex flex-col gap-3">
              <h3 className="font-serif text-lg font-bold text-[#2d1e2f]">How do I order for birthdays or special events?</h3>
              <p className="text-xs text-[#6b5b6e] leading-relaxed">
                You can easily place your order right here on our website or reach out directly to Hanifa on WhatsApp at 09135894717 for custom bridal showers, birthdays, or corporate gifting packages.
              </p>
            </div>
          </div>
        </section>

        {/* Customer Love Reviews */}
        <div id="reviews" className="mt-28">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <p className="text-xs uppercase tracking-widest text-[#ff4d80] font-bold mb-2">Customer Love 💕</p>
            <h2 className="text-3xl lg:text-4xl font-serif font-bold text-[#2d1e2f]">
              What Our Gorgeous Babes Are Saying
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-3xl border border-[#ffd1dc] flex flex-col justify-between gap-6 shadow-xs">
              <div className="flex items-center gap-1">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-[#ff4d80] text-[#ff4d80]" />
                ))}
              </div>
              <p className="text-sm text-[#6b5b6e] italic leading-relaxed">
                "Received my gift box today in Abuja and I'm obsessed! The packaging is so luxurious and the perfumes smell divine. Thank you Hanifa!"
              </p>
              <div>
                <p className="text-xs font-bold text-[#2d1e2f]">Zainab Bello</p>
                <p className="text-[11px] text-[#6b5b6e]">Abuja, Nigeria</p>
              </div>
            </div>

            <div className="bg-white p-8 rounded-3xl border border-[#ffd1dc] flex flex-col justify-between gap-6 shadow-xs">
              <div className="flex items-center gap-1">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-[#ff4d80] text-[#ff4d80]" />
                ))}
              </div>
              <p className="text-sm text-[#6b5b6e] italic leading-relaxed">
                "Ordered the charm bracelet set and phone case for my birthday. Delivery to Lagos was super fast and everything was packaged with so much love!"
              </p>
              <div>
                <p className="text-xs font-bold text-[#2d1e2f]">Chiamaka Okoro</p>
                <p className="text-[11px] text-[#6b5b6e]">Lagos, Nigeria</p>
              </div>
            </div>

            <div className="bg-white p-8 rounded-3xl border border-[#ffd1dc] flex flex-col justify-between gap-6 shadow-xs">
              <div className="flex items-center gap-1">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-[#ff4d80] text-[#ff4d80]" />
                ))}
              </div>
              <p className="text-sm text-[#6b5b6e] italic leading-relaxed">
                "The best gift shop in Nigeria! Hanifa helped me put together a surprise birthday box for my bestie. She cried tears of joy."
              </p>
              <div>
                <p className="text-xs font-bold text-[#2d1e2f]">Fatima Aliyu</p>
                <p className="text-[11px] text-[#6b5b6e]">Port Harcourt, Nigeria</p>
              </div>
            </div>
          </div>
        </div>

      </main>

      {/* Footer */}
      <footer className="bg-[#2d1e2f] text-white mt-28 py-16 px-6 lg:px-12 border-t border-[#ffd1dc]/20">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-2.5">
              <img 
                src="/assets/aistudio/file_00000000e2888246b7b646b7e9f89c92_57089bc1.png" 
                alt="niffs.ng logo"
                className="h-10 w-auto object-contain brightness-0 invert"
                referrerPolicy="no-referrer"
              />
            </div>
            <p className="text-xs text-white/70 leading-relaxed">
              Girls shop made with love 💕. Nationwide delivery across all Nigerian states. Send a DM or WhatsApp: 09135894717.
            </p>
          </div>

          <div>
            <h4 className="text-xs uppercase tracking-wider font-bold mb-4 text-[#ff4d80]">Quick Links</h4>
            <ul className="space-y-2.5 text-xs text-white/80">
              <li><a href="#catalog" className="hover:text-white transition-colors">Gift Boxes</a></li>
              <li><a href="#catalog" className="hover:text-white transition-colors">Perfumes & Body Care</a></li>
              <li><a href="#catalog" className="hover:text-white transition-colors">Jewelry & Accessories</a></li>
              <li><a href="#about" className="hover:text-white transition-colors">About Hanifa</a></li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs uppercase tracking-wider font-bold mb-4 text-[#ff4d80]">Delivery & Orders</h4>
            <ul className="space-y-2.5 text-xs text-white/80">
              <li><span className="text-white font-semibold">Nationwide Delivery:</span> Lagos, Abuja, Port Harcourt, Kano & more</li>
              <li><span className="text-white font-semibold">Phone / WhatsApp:</span> 09135894717</li>
              <li><span className="text-white font-semibold">Instagram / TikTok:</span> @niffs.ng</li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs uppercase tracking-wider font-bold mb-4 text-[#ff4d80]">Chat with Hanifa</h4>
            <p className="text-xs text-white/80 mb-4">
              Need a custom gift box or express delivery? Reach out on WhatsApp instantly!
            </p>
            <a 
              href="https://wa.me/2349135894717" 
              target="_blank" 
              rel="noreferrer"
              className="inline-flex items-center justify-center gap-2 w-full py-3 bg-[#25d366] text-white rounded-xl text-xs font-semibold hover:bg-[#20ba5a] transition-colors shadow-sm"
            >
              <MessageCircle className="w-4 h-4" />
              <span>WhatsApp: 09135894717</span>
            </a>
          </div>

        </div>

        <div className="max-w-7xl mx-auto pt-8 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-white/60">
          <p>© {new Date().getFullYear()} niffs.ng (@HⒶN🥏IFA🦩💕). All rights reserved.</p>
          <div className="flex gap-6">
            <button onClick={() => setIsAdminModalOpen(true)} className="hover:text-white transition-colors">Admin Dashboard</button>
            <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
          </div>
        </div>
      </footer>

      {/* Product Quick View Modal */}
      {selectedProduct && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-3xl max-w-2xl w-full overflow-hidden shadow-2xl flex flex-col md:flex-row relative">
            <button 
              onClick={() => setSelectedProduct(null)}
              className="absolute top-4 right-4 z-10 w-9 h-9 bg-white/90 backdrop-blur-md rounded-full flex items-center justify-center text-[#2d1e2f] hover:bg-white shadow-md transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="md:w-1/2 bg-[#ffe6ed] relative aspect-[4/3] md:aspect-auto">
              <img 
                src={selectedProduct.image} 
                alt={selectedProduct.name}
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            </div>

            <div className="md:w-1/2 p-8 flex flex-col justify-between gap-6">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] uppercase tracking-wider font-bold text-[#ff4d80]">
                    {selectedProduct.category}
                  </span>
                  <div className="flex items-center gap-1 text-xs text-[#6b5b6e]">
                    <Star className="w-3.5 h-3.5 fill-[#ff4d80] text-[#ff4d80]" />
                    <span className="font-bold text-[#2d1e2f]">{selectedProduct.rating}</span>
                    <span>({selectedProduct.reviewsCount})</span>
                  </div>
                </div>

                <h3 className="font-serif text-2xl font-bold text-[#2d1e2f] mb-3">
                  {selectedProduct.name}
                </h3>

                <p className="text-2xl font-bold font-serif text-[#ff4d80] mb-4 tabular-nums">
                  ₦{selectedProduct.price.toLocaleString()}
                </p>

                <p className="text-xs text-[#6b5b6e] leading-relaxed mb-6">
                  {selectedProduct.description}
                </p>

                <div className="space-y-2 mb-6">
                  <p className="text-xs font-bold uppercase tracking-wider text-[#6b5b6e]">What's Included</p>
                  <ul className="space-y-1.5 text-xs text-[#6b5b6e]">
                    {selectedProduct.details.map((detail, idx) => (
                      <li key={idx} className="flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#ff4d80]" />
                        <span>{detail}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="flex items-center gap-4 pt-4 border-t border-[#ffd1dc]">
                <button
                  onClick={() => {
                    addToCart(selectedProduct);
                    setSelectedProduct(null);
                  }}
                  className="flex-1 py-3.5 bg-[#ff4d80] text-white rounded-full text-xs font-semibold hover:bg-[#e03b6e] transition-colors flex items-center justify-center gap-2 shadow-sm"
                >
                  <ShoppingBag className="w-4 h-4" />
                  <span>Add to Cart — ₦{selectedProduct.price.toLocaleString()}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Cart Slide-Over Drawer */}
      {isCartOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-xs transition-opacity" onClick={() => setIsCartOpen(false)} />
          
          <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
            <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col animate-fade-in">
              
              <div className="p-6 border-b border-[#ffd1dc] flex items-center justify-between bg-white">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[#ffe6ed] flex items-center justify-center text-[#ff4d80]">
                    <ShoppingBag className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-serif text-lg font-bold text-[#2d1e2f]">Shopping Bag</h3>
                    <p className="text-xs text-[#6b5b6e]">{cart.reduce((sum, i) => sum + i.quantity, 0)} items selected</p>
                  </div>
                </div>
                <button onClick={() => setIsCartOpen(false)} className="p-2.5 rounded-full bg-[#fff5f7] text-[#6b5b6e] hover:text-[#2d1e2f] transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="bg-[#ffe6ed]/60 px-6 py-3.5 border-b border-[#ffd1dc]">
                {subtotal >= 50000 ? (
                  <p className="text-xs font-semibold text-[#2d1e2f] flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Yay! You qualify for FREE nationwide delivery 🎀</span>
                  </p>
                ) : (
                  <p className="text-xs text-[#6b5b6e]">
                    Add <span className="font-bold text-[#ff4d80]">₦{(50000 - subtotal).toLocaleString()}</span> more for <span className="font-semibold text-[#2d1e2f]">free nationwide delivery</span>.
                  </p>
                )}
                <div className="w-full bg-white h-2 rounded-full mt-2.5 overflow-hidden shadow-inner">
                  <div 
                    className="bg-[#ff4d80] h-full transition-all duration-300 rounded-full"
                    style={{ width: `${Math.min(100, (subtotal / 50000) * 100)}%` }}
                  />
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                {cart.length === 0 ? (
                  <div className="text-center py-20 flex flex-col items-center gap-4">
                    <div className="w-20 h-20 rounded-full bg-[#ffe6ed] flex items-center justify-center text-[#ff4d80] shadow-sm">
                      <ShoppingBag className="w-10 h-10" />
                    </div>
                    <p className="font-serif text-xl font-bold text-[#2d1e2f]">Your bag is empty</p>
                    <p className="text-xs text-[#6b5b6e] max-w-xs leading-relaxed">Explore Hanifa's cute gift boxes, perfumes, and accessories to start filling your bag with love.</p>
                    <button 
                      onClick={() => setIsCartOpen(false)}
                      className="mt-3 px-8 py-3 bg-[#ff4d80] text-white rounded-full text-xs font-semibold shadow-md hover:bg-[#e03b6e] transition-colors"
                    >
                      Start Shopping
                    </button>
                  </div>
                ) : (
                  cart.map((item) => (
                    <div key={item.id} className="flex gap-4 p-4 bg-[#fff5f7] rounded-2xl border border-[#ffd1dc]/60 items-center shadow-xs">
                      <img src={item.image} alt={item.name} className="w-20 h-20 object-cover rounded-xl bg-white shrink-0 border border-[#ffd1dc]" />
                      <div className="flex-1 min-w-0">
                        <h4 className="font-serif text-sm font-bold text-[#2d1e2f] truncate">{item.name}</h4>
                        <p className="text-xs font-bold text-[#ff4d80] mt-1 tabular-nums">₦{item.price.toLocaleString()}</p>
                        
                        <div className="flex items-center justify-between mt-3">
                          <div className="flex items-center border border-[#ffd1dc] rounded-lg overflow-hidden bg-white shadow-xs">
                            <button 
                              onClick={() => updateQuantity(item.id, -1)}
                              className="p-1.5 text-[#6b5b6e] hover:bg-[#ffe6ed] transition-colors"
                            >
                              <Minus className="w-3.5 h-3.5" />
                            </button>
                            <span className="px-3 text-xs font-bold tabular-nums text-[#2d1e2f]">{item.quantity}</span>
                            <button 
                              onClick={() => updateQuantity(item.id, 1)}
                              className="p-1.5 text-[#6b5b6e] hover:bg-[#ffe6ed] transition-colors"
                            >
                              <Plus className="w-3.5 h-3.5" />
                            </button>
                          </div>

                          <button 
                            onClick={() => removeFromCart(item.id)}
                            className="text-[11px] font-semibold text-rose-500 hover:text-rose-700 transition-colors px-2 py-1"
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {cart.length > 0 && (
                <div className="p-6 border-t border-[#ffd1dc] bg-white space-y-4 shadow-lg">
                  <div className="space-y-2.5 text-xs">
                    <div className="flex justify-between text-[#6b5b6e]">
                      <span>Subtotal</span>
                      <span className="font-bold text-[#2d1e2f] tabular-nums">₦{subtotal.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-[#6b5b6e]">
                      <span>Nationwide Delivery Fee</span>
                      <span className="font-bold text-[#2d1e2f] tabular-nums">{deliveryFee === 0 ? "FREE" : `₦${deliveryFee.toLocaleString()}`}</span>
                    </div>
                    <div className="flex justify-between text-sm font-bold text-[#2d1e2f] pt-3 border-t border-[#ffd1dc]">
                      <span>Total Amount</span>
                      <span className="text-lg text-[#ff4d80] font-serif tabular-nums">₦{total.toLocaleString()}</span>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      setIsCartOpen(false);
                      setIsCheckoutOpen(true);
                    }}
                    className="w-full py-4 bg-[#ff4d80] text-white rounded-full text-sm font-semibold hover:bg-[#e03b6e] transition-colors flex items-center justify-center gap-2 shadow-lg"
                  >
                    <span>Proceed to Secure Checkout</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              )}

            </div>
          </div>
        </div>
      )}

      {/* Checkout Modal / Order Success */}
      {isCheckoutOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl p-8 relative my-8">
            <button 
              onClick={() => setIsCheckoutOpen(false)}
              className="absolute top-4 right-4 z-10 w-9 h-9 bg-[#ffe6ed] rounded-full flex items-center justify-center text-[#2d1e2f] hover:bg-[#ffd1dc] transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            {orderComplete ? (
              <div className="text-center py-8 flex flex-col items-center gap-4 animate-fade-in">
                <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <h3 className="font-serif text-2xl font-bold text-[#2d1e2f]">Order Placed Successfully! 💕</h3>
                <p className="text-xs text-[#6b5b6e] max-w-sm leading-relaxed">
                  Thank you, <span className="font-bold text-[#2d1e2f]">{orderComplete.name}</span>! Your order <span className="font-bold text-[#ff4d80]">#{orderComplete.id}</span> has been sent to Hanifa. We will contact you via phone/WhatsApp at <span className="font-bold text-[#2d1e2f]">{formData.phone}</span> to confirm nationwide dispatch.
                </p>
                <div className="bg-[#ffe6ed] p-4 rounded-2xl w-full text-left text-xs space-y-2 mt-4 border border-[#ffd1dc]">
                  <div className="flex justify-between">
                    <span className="text-[#6b5b6e]">Delivery State:</span>
                    <span className="font-bold text-[#2d1e2f]">{formData.state}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#6b5b6e]">Delivery Address:</span>
                    <span className="font-bold text-[#2d1e2f]">{formData.address}, {formData.city}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#6b5b6e]">Contact Line:</span>
                    <span className="font-bold text-[#2d1e2f]">09135894717</span>
                  </div>
                </div>
                
                <div className="flex gap-3 w-full mt-4">
                  <a
                    href={`https://wa.me/2349135894717?text=Hi%20Hanifa,%20I%20just%20placed%20order%20%23${orderComplete.id}%20on%20niffs.ng!`}
                    target="_blank"
                    rel="noreferrer"
                    className="flex-1 py-3 bg-[#25d366] text-white rounded-full text-xs font-semibold flex items-center justify-center gap-2 shadow-sm"
                  >
                    <MessageCircle className="w-4 h-4" />
                    <span>Send Order to WhatsApp</span>
                  </a>
                  <button
                    onClick={() => {
                      setOrderComplete(null);
                      setIsCheckoutOpen(false);
                    }}
                    className="px-6 py-3 bg-[#ff4d80] text-white rounded-full text-xs font-semibold"
                  >
                    Done
                  </button>
                </div>
              </div>
            ) : (
              <div>
                <h3 className="font-serif text-2xl font-bold text-[#2d1e2f] mb-1">Nationwide Checkout 🎀</h3>
                <p className="text-xs text-[#6b5b6e] mb-6">Fill in your delivery details for fast dispatch across Nigeria.</p>

                <form onSubmit={handleCheckoutSubmit} className="space-y-4">
                  <div>
                    <label className="block text-[11px] font-bold text-[#6b5b6e] uppercase mb-1">Full Name</label>
                    <input 
                      type="text" 
                      required
                      value={formData.name}
                      onChange={e => setFormData({ ...formData, name: e.target.value })}
                      placeholder="e.g., Blessing Adebayo"
                      className="w-full p-3 rounded-xl border border-[#ffd1dc] text-xs text-[#2d1e2f] focus:outline-none focus:border-[#ff4d80] bg-[#fff5f7]"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-[#6b5b6e] uppercase mb-1">Phone / WhatsApp Number</label>
                    <input 
                      type="tel" 
                      required
                      value={formData.phone}
                      onChange={e => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="09135894717"
                      className="w-full p-3 rounded-xl border border-[#ffd1dc] text-xs text-[#2d1e2f] focus:outline-none focus:border-[#ff4d80] bg-[#fff5f7]"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[11px] font-bold text-[#6b5b6e] uppercase mb-1">State</label>
                      <select
                        value={formData.state}
                        onChange={e => setFormData({ ...formData, state: e.target.value })}
                        className="w-full p-3 rounded-xl border border-[#ffd1dc] text-xs text-[#2d1e2f] focus:outline-none focus:border-[#ff4d80] bg-[#fff5f7]"
                      >
                        <option value="Lagos">Lagos State</option>
                        <option value="Abuja">Abuja (FCT)</option>
                        <option value="Rivers">Rivers (Port Harcourt)</option>
                        <option value="Oyo">Oyo (Ibadan)</option>
                        <option value="Kaduna">Kaduna</option>
                        <option value="Ogun">Ogun</option>
                        <option value="Edo">Edo (Benin)</option>
                        <option value="Other">Other State in Nigeria</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-[#6b5b6e] uppercase mb-1">City / Town</label>
                      <input 
                        type="text" 
                        required
                        value={formData.city}
                        onChange={e => setFormData({ ...formData, city: e.target.value })}
                        placeholder="e.g., Ikeja"
                        className="w-full p-3 rounded-xl border border-[#ffd1dc] text-xs text-[#2d1e2f] focus:outline-none focus:border-[#ff4d80] bg-[#fff5f7]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-[#6b5b6e] uppercase mb-1">Delivery Address</label>
                    <input 
                      type="text" 
                      required
                      value={formData.address}
                      onChange={e => setFormData({ ...formData, address: e.target.value })}
                      placeholder="e.g., 12 Admiralty Way, Lekki Phase 1"
                      className="w-full p-3 rounded-xl border border-[#ffd1dc] text-xs text-[#2d1e2f] focus:outline-none focus:border-[#ff4d80] bg-[#fff5f7]"
                    />
                  </div>

                  <div className="pt-2 border-t border-[#ffd1dc]">
                    <div className="flex justify-between text-xs text-[#6b5b6e] mb-2">
                      <span>Total Due (incl. delivery):</span>
                      <span className="font-bold text-[#ff4d80] text-sm tabular-nums">₦{total.toLocaleString()}</span>
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3.5 bg-[#ff4d80] text-white rounded-full text-xs font-semibold hover:bg-[#e03b6e] transition-colors shadow-md"
                  >
                    Place Order & Confirm (₦{total.toLocaleString()})
                  </button>
                </form>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Admin Dashboard Modal */}
      {isAdminModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/55 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-4xl w-full overflow-hidden shadow-2xl relative my-8">
            <button 
              onClick={() => setIsAdminModalOpen(false)}
              className="absolute top-5 right-5 z-10 w-9 h-9 bg-[#ffe6ed] rounded-full flex items-center justify-center text-[#2d1e2f] hover:bg-[#ffd1dc] transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            {!adminEmail ? (
              // Login Screen
              <div className="p-10 max-w-md mx-auto text-center space-y-6">
                <div className="w-16 h-16 rounded-full bg-[#ffe6ed] flex items-center justify-center text-[#ff4d80] mx-auto shadow-sm">
                  <Lock className="w-8 h-8" />
                </div>
                <div>
                  <h3 className="font-serif text-2xl font-bold text-[#2d1e2f]">Store Owner Portal</h3>
                  <p className="text-xs text-[#6b5b6e] mt-1">
                    Enter your email to sign in. The first email to log in is automatically recognized as the store owner!
                  </p>
                </div>

                <form onSubmit={handleAdminLogin} className="space-y-4 text-left">
                  {loginError && (
                    <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl font-medium animate-fade-in">
                      {loginError}
                    </div>
                  )}

                  <div>
                    <label className="block text-[11px] font-bold text-[#6b5b6e] uppercase mb-1">Owner Email Address</label>
                    <input 
                      type="email" 
                      required
                      value={loginEmailInput}
                      onChange={e => setLoginEmailInput(e.target.value)}
                      placeholder="e.g. hanifa@niffs.ng"
                      className="w-full p-3.5 rounded-xl border border-[#ffd1dc] text-xs text-[#2d1e2f] focus:outline-none focus:border-[#ff4d80] bg-[#fff5f7]"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-[#6b5b6e] uppercase mb-1">Secure Admin Passcode</label>
                    <input 
                      type="password" 
                      required
                      value={loginPasswordInput}
                      onChange={e => setLoginPasswordInput(e.target.value)}
                      placeholder="Enter security passcode"
                      className="w-full p-3.5 rounded-xl border border-[#ffd1dc] text-xs text-[#2d1e2f] focus:outline-none focus:border-[#ff4d80] bg-[#fff5f7]"
                    />
                    <p className="text-[10px] text-[#6b5b6e] mt-1.5 flex items-center justify-between">
                      <span>Protected by 256-bit admin auth</span>
                      <span className="font-bold text-[#ff4d80]">Hint: niffs2026</span>
                    </p>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3.5 bg-[#ff4d80] text-white rounded-full text-xs font-semibold hover:bg-[#e03b6e] transition-colors shadow-md"
                  >
                    Authenticate & Access Dashboard
                  </button>
                </form>

                {ownerEmail && (
                  <p className="text-[11px] text-[#6b5b6e]">
                    Registered Store Owner: <span className="font-bold text-[#2d1e2f]">{ownerEmail}</span>
                  </p>
                )}
              </div>
            ) : (
              // Dashboard View
              <div className="p-8 lg:p-10 space-y-8 max-h-[85vh] overflow-y-auto">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#ffd1dc]">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="px-3 py-1 bg-emerald-100 text-emerald-800 rounded-full text-[11px] font-bold flex items-center gap-1">
                        <UserCheck className="w-3.5 h-3.5" />
                        <span>Store Owner / Admin</span>
                      </span>
                      <span className="text-xs text-[#6b5b6e]">{adminEmail}</span>
                    </div>
                    <h2 className="font-serif text-2xl lg:text-3xl font-bold text-[#2d1e2f] mt-1">
                      niffs.ng Management Suite
                    </h2>
                  </div>

                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => {
                        setIsEditingProduct(null);
                        setProductForm({ name: "", category: "Gift Boxes", price: "", image: "", description: "", details: "" });
                        setIsAddingProduct(true);
                      }}
                      className="px-5 py-2.5 bg-[#ff4d80] text-white rounded-full text-xs font-semibold hover:bg-[#e03b6e] transition-colors flex items-center gap-1.5 shadow-sm"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Add New Product</span>
                    </button>
                    <button
                      onClick={handleAdminLogout}
                      className="px-4 py-2.5 bg-gray-100 text-[#2d1e2f] rounded-full text-xs font-semibold hover:bg-gray-200 transition-colors"
                    >
                      Logout
                    </button>
                  </div>
                </div>

                {/* Analytics Overview Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                  <div className="bg-[#fff5f7] p-6 rounded-2xl border border-[#ffd1dc] flex items-center gap-4 shadow-xs">
                    <div className="w-12 h-12 rounded-full bg-[#ff4d80] text-white flex items-center justify-center shrink-0">
                      <Eye className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="text-xs text-[#6b5b6e] font-semibold uppercase">Total Website Views</p>
                      <p className="text-2xl font-serif font-bold text-[#2d1e2f] mt-1 tabular-nums">{siteViews.toLocaleString()}</p>
                    </div>
                  </div>

                  <div className="bg-[#fff5f7] p-6 rounded-2xl border border-[#ffd1dc] flex items-center gap-4 shadow-xs">
                    <div className="w-12 h-12 rounded-full bg-[#25d366] text-white flex items-center justify-center shrink-0">
                      <DollarSign className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="text-xs text-[#6b5b6e] font-semibold uppercase">Total Revenue</p>
                      <p className="text-2xl font-serif font-bold text-[#2d1e2f] mt-1 tabular-nums">₦{totalRevenue.toLocaleString()}</p>
                    </div>
                  </div>

                  <div className="bg-[#fff5f7] p-6 rounded-2xl border border-[#ffd1dc] flex items-center gap-4 shadow-xs">
                    <div className="w-12 h-12 rounded-full bg-indigo-500 text-white flex items-center justify-center shrink-0">
                      <Package className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="text-xs text-[#6b5b6e] font-semibold uppercase">Total Orders</p>
                      <p className="text-2xl font-serif font-bold text-[#2d1e2f] mt-1 tabular-nums">{orders.length}</p>
                    </div>
                  </div>
                </div>

                {/* Add / Edit Product Form Modal */}
                {isAddingProduct && (
                  <div className="bg-[#fff5f7] p-6 lg:p-8 rounded-3xl border border-[#ff4d80] shadow-md animate-fade-in">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-serif text-lg font-bold text-[#2d1e2f]">
                        {isEditingProduct ? "Edit Product" : "Add New Product"}
                      </h3>
                      <button onClick={() => setIsAddingProduct(false)} className="text-xs text-[#6b5b6e] hover:text-[#2d1e2f]">Cancel</button>
                    </div>

                    <form onSubmit={handleSaveProduct} className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                      <div>
                        <label className="block font-bold text-[#6b5b6e] uppercase mb-1">Product Name</label>
                        <input 
                          type="text" 
                          required
                          value={productForm.name}
                          onChange={e => setProductForm({ ...productForm, name: e.target.value })}
                          placeholder="e.g., Birthday Luxury Gift Set"
                          className="w-full p-3 rounded-xl border border-[#ffd1dc] bg-white text-[#2d1e2f] focus:outline-none focus:border-[#ff4d80]"
                        />
                      </div>

                      <div>
                        <label className="block font-bold text-[#6b5b6e] uppercase mb-1">Category</label>
                        <select
                          value={productForm.category}
                          onChange={e => setProductForm({ ...productForm, category: e.target.value })}
                          className="w-full p-3 rounded-xl border border-[#ffd1dc] bg-white text-[#2d1e2f] focus:outline-none focus:border-[#ff4d80]"
                        >
                          <option value="Gift Boxes">Gift Boxes</option>
                          <option value="Perfumes">Perfumes</option>
                          <option value="Jewelry">Jewelry</option>
                          <option value="Phone Accessories">Phone Accessories</option>
                          <option value="Sunglasses">Sunglasses</option>
                        </select>
                      </div>

                      <div>
                        <label className="block font-bold text-[#6b5b6e] uppercase mb-1">Price (₦)</label>
                        <input 
                          type="number" 
                          required
                          value={productForm.price}
                          onChange={e => setProductForm({ ...productForm, price: e.target.value })}
                          placeholder="25000"
                          className="w-full p-3 rounded-xl border border-[#ffd1dc] bg-white text-[#2d1e2f] focus:outline-none focus:border-[#ff4d80]"
                        />
                      </div>

                      <div>
                        <label className="block font-bold text-[#6b5b6e] uppercase mb-1">Image URL / Photo Link</label>
                        <input 
                          type="text" 
                          value={productForm.image}
                          onChange={e => setProductForm({ ...productForm, image: e.target.value })}
                          placeholder="/public/assets/aistudio/... or https://..."
                          className="w-full p-3 rounded-xl border border-[#ffd1dc] bg-white text-[#2d1e2f] focus:outline-none focus:border-[#ff4d80]"
                        />
                      </div>

                      <div className="sm:col-span-2">
                        <label className="block font-bold text-[#6b5b6e] uppercase mb-1">Description</label>
                        <textarea 
                          rows={2}
                          required
                          value={productForm.description}
                          onChange={e => setProductForm({ ...productForm, description: e.target.value })}
                          placeholder="Brief description of the gift or accessory..."
                          className="w-full p-3 rounded-xl border border-[#ffd1dc] bg-white text-[#2d1e2f] focus:outline-none focus:border-[#ff4d80]"
                        />
                      </div>

                      <div className="sm:col-span-2">
                        <label className="block font-bold text-[#6b5b6e] uppercase mb-1">Details (one per line)</label>
                        <textarea 
                          rows={2}
                          value={productForm.details}
                          onChange={e => setProductForm({ ...productForm, details: e.target.value })}
                          placeholder="Includes 3 designer mini perfumes&#10;Signature pink box"
                          className="w-full p-3 rounded-xl border border-[#ffd1dc] bg-white text-[#2d1e2f] focus:outline-none focus:border-[#ff4d80]"
                        />
                      </div>

                      <div className="sm:col-span-2 pt-2">
                        <button
                          type="submit"
                          className="w-full py-3.5 bg-[#ff4d80] text-white rounded-xl text-xs font-semibold hover:bg-[#e03b6e] transition-colors shadow-md"
                        >
                          {isEditingProduct ? "Update Product" : "Publish Product to Store"}
                        </button>
                      </div>
                    </form>
                  </div>
                )}

                {/* Product List Management */}
                <div>
                  <h3 className="font-serif text-xl font-bold text-[#2d1e2f] mb-4">Manage Products ({products.length})</h3>
                  <div className="space-y-3">
                    {products.map((p) => (
                      <div key={p.id} className="flex items-center justify-between gap-4 p-4 bg-white rounded-2xl border border-[#ffd1dc] shadow-xs">
                        <div className="flex items-center gap-4 min-w-0">
                          <img src={p.image} alt={p.name} className="w-14 h-14 object-cover rounded-xl bg-[#ffe6ed] shrink-0 border border-[#ffd1dc]" />
                          <div className="min-w-0">
                            <h4 className="font-serif text-sm font-bold text-[#2d1e2f] truncate">{p.name}</h4>
                            <p className="text-xs text-[#ff4d80] font-bold">₦{p.price.toLocaleString()} · <span className="text-[#6b5b6e] font-normal">{p.category}</span></p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          <button
                            onClick={() => startEditProduct(p)}
                            className="px-3 py-1.5 bg-[#fff5f7] text-[#ff4d80] border border-[#ffd1dc] rounded-lg text-xs font-semibold hover:bg-[#ffe6ed] transition-colors flex items-center gap-1"
                          >
                            <Edit className="w-3.5 h-3.5" />
                            <span>Edit</span>
                          </button>
                          <button
                            onClick={() => handleDeleteProduct(p.id)}
                            className="px-3 py-1.5 bg-rose-50 text-rose-600 border border-rose-200 rounded-lg text-xs font-semibold hover:bg-rose-100 transition-colors flex items-center gap-1"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span>Delete</span>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Orders Management */}
                <div className="pt-6 border-t border-[#ffd1dc]">
                  <h3 className="font-serif text-xl font-bold text-[#2d1e2f] mb-4">Recent Customer Orders ({orders.length})</h3>
                  <div className="space-y-3">
                    {orders.map((o) => (
                      <div key={o.id} className="p-4 bg-white rounded-2xl border border-[#ffd1dc] flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs text-xs">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-bold text-[#ff4d80]">{o.id}</span>
                            <span className="text-[#6b5b6e]">({o.date})</span>
                          </div>
                          <p className="font-bold text-[#2d1e2f]">{o.name} — {o.phone}</p>
                          <p className="text-[#6b5b6e] mt-0.5">{o.address}, {o.city}, {o.state} State</p>
                        </div>
                        <div className="text-right">
                          <p className="font-serif text-base font-bold text-[#2d1e2f] tabular-nums">₦{o.total.toLocaleString()}</p>
                          <span className="inline-block mt-1 px-2.5 py-0.5 bg-emerald-100 text-emerald-800 rounded-full font-semibold text-[10px]">Confirmed / Dispatched</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

              </div>
            )}

          </div>
        </div>
      )}

    </div>
  );
}
