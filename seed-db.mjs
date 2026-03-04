// Nehrem Store – Database Seeder (Node.js, no dependencies)
const BASE = "http://localhost:8080/api";

async function post(url, body, isForm = false) {
  const opts = isForm
    ? { method: "POST", body }
    : {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      };
  const res = await fetch(url, opts);
  const json = await res.json();
  return json;
}

// ── 1. CATEGORIES ────────────────────────────────────────────
const CATEGORIES = [
  { name: "Electronics",      description: "Smartphones, laptops, tablets and all electronic gadgets" },
  { name: "Clothing",         description: "Men and women fashion, shoes and accessories" },
  { name: "Home & Garden",    description: "Furniture, decor, kitchen tools and garden supplies" },
  { name: "Sports & Outdoors",description: "Fitness equipment, outdoor gear and sportswear" },
  { name: "Books",            description: "Novels, textbooks, comics and e-books" },
  { name: "Beauty & Health",  description: "Skincare, makeup, vitamins and wellness products" },
  { name: "Toys & Games",     description: "Board games, action figures and educational toys" },
  { name: "Food & Beverages", description: "Snacks, beverages, organic and specialty food items" },
];

// ── 2. PRODUCTS (categoryName used to resolve ID after category creation)
const PRODUCTS = [
  // Electronics
  { name: "iPhone 15 Pro",          description: "Latest Apple flagship with titanium frame and A17 Pro chip",               price: 1299.99, discountPrice: 1199.99, stockQuantity: 50, category: "Electronics" },
  { name: "Samsung Galaxy S24",      description: "Android flagship with Snapdragon 8 Gen 3 and 200MP camera",               price: 1099.99, discountPrice:  999.99, stockQuantity: 45, category: "Electronics" },
  { name: "MacBook Air M3",          description: "Ultra-thin laptop with Apple M3 chip and 18-hour battery",                price: 1499.99,                         stockQuantity: 30, category: "Electronics" },
  { name: "Sony WH-1000XM5",        description: "Industry-leading noise cancelling wireless headphones",                    price:  349.99, discountPrice:  299.99, stockQuantity: 80, category: "Electronics" },
  { name: "iPad Pro 12.9",           description: "Professional tablet with M2 chip and Liquid Retina display",              price: 1099.99,                         stockQuantity: 25, category: "Electronics" },
  { name: "Dell XPS 15",             description: "High-performance Windows laptop with OLED display",                       price: 1799.99, discountPrice: 1649.99, stockQuantity: 20, category: "Electronics" },
  { name: "Apple Watch Series 9",    description: "Advanced smartwatch with health monitoring and crash detection",           price:  499.99, discountPrice:  429.99, stockQuantity: 60, category: "Electronics" },
  { name: "GoPro HERO12 Black",      description: "Waterproof 5.3K action camera with HyperSmooth stabilisation",           price:  399.99, discountPrice:  349.99, stockQuantity: 40, category: "Electronics" },

  // Clothing
  { name: "Classic White T-Shirt",   description: "100% organic cotton crew neck tee, available in all sizes",              price:   29.99, discountPrice:   19.99, stockQuantity: 200, category: "Clothing" },
  { name: "Slim Fit Jeans",          description: "Stretch denim jeans with modern slim fit cut",                           price:   79.99, discountPrice:   59.99, stockQuantity: 150, category: "Clothing" },
  { name: "Leather Jacket",          description: "Genuine leather biker jacket with quilted lining",                       price:  299.99, discountPrice:  249.99, stockQuantity:  40, category: "Clothing" },
  { name: "Running Sneakers",        description: "Lightweight breathable running shoes with foam sole",                    price:  119.99, discountPrice:   89.99, stockQuantity: 100, category: "Clothing" },
  { name: "Floral Summer Dress",     description: "Lightweight chiffon midi dress perfect for warm weather",                price:   89.99, discountPrice:   69.99, stockQuantity:  75, category: "Clothing" },
  { name: "Wool Winter Coat",        description: "Double-breasted wool blend coat for cold weather",                       price:  249.99, discountPrice:  199.99, stockQuantity:  55, category: "Clothing" },

  // Home & Garden
  { name: "Ergonomic Office Chair",  description: "Adjustable lumbar support mesh chair for long work sessions",            price:  449.99, discountPrice:  389.99, stockQuantity: 35, category: "Home & Garden" },
  { name: "Instant Pot Duo 7-in-1",  description: "Pressure cooker, slow cooker, rice cooker and more",                    price:   99.99, discountPrice:   79.99, stockQuantity: 60, category: "Home & Garden" },
  { name: "Robot Vacuum Cleaner",    description: "Smart mapping robot vacuum with mopping function",                       price:  399.99, discountPrice:  349.99, stockQuantity: 40, category: "Home & Garden" },
  { name: "Bamboo Bed Sheet Set",    description: "Silky soft 100% bamboo queen size sheet set",                           price:   89.99, discountPrice:   69.99, stockQuantity: 90, category: "Home & Garden" },
  { name: "Indoor Herb Garden Kit",  description: "Self-watering LED grow light herb garden for kitchen",                  price:   59.99, discountPrice:   49.99, stockQuantity: 55, category: "Home & Garden" },
  { name: "Air Purifier HEPA",       description: "True HEPA air purifier covers up to 500 sq ft, ultra quiet",            price:  149.99, discountPrice:  124.99, stockQuantity: 45, category: "Home & Garden" },

  // Sports & Outdoors
  { name: "Yoga Mat Pro",            description: "Extra thick non-slip TPE yoga mat with alignment lines",                 price:   59.99, discountPrice:   44.99, stockQuantity: 120, category: "Sports & Outdoors" },
  { name: "Adjustable Dumbbells",    description: "Space-saving adjustable 5–52.5 lb dumbbell set",                        price:  349.99, discountPrice:  299.99, stockQuantity:  30, category: "Sports & Outdoors" },
  { name: "Hiking Backpack 50L",     description: "Waterproof trekking backpack with hydration bladder pocket",            price:  149.99, discountPrice:  119.99, stockQuantity:  50, category: "Sports & Outdoors" },
  { name: "Cycling Helmet",          description: "Lightweight MIPS certified road cycling helmet",                        price:   89.99, discountPrice:   74.99, stockQuantity:  65, category: "Sports & Outdoors" },
  { name: "Jump Rope Speed Cable",   description: "Adjustable steel cable jump rope for HIIT and boxing training",         price:   24.99, discountPrice:   18.99, stockQuantity: 150, category: "Sports & Outdoors" },

  // Books
  { name: "Atomic Habits",           description: "An easy and proven way to build good habits by James Clear",            price:   19.99, discountPrice:   14.99, stockQuantity: 200, category: "Books" },
  { name: "The Psychology of Money", description: "Timeless lessons on wealth, greed and happiness by Morgan Housel",     price:   17.99, discountPrice:   12.99, stockQuantity: 180, category: "Books" },
  { name: "Clean Code",              description: "A handbook of agile software craftsmanship by Robert C. Martin",        price:   49.99, discountPrice:   39.99, stockQuantity: 100, category: "Books" },
  { name: "Dune",                    description: "Epic science fiction novel by Frank Herbert",                           price:   16.99, discountPrice:   12.99, stockQuantity: 150, category: "Books" },
  { name: "Deep Work",               description: "Rules for focused success in a distracted world by Cal Newport",        price:   18.99, discountPrice:   13.99, stockQuantity: 160, category: "Books" },

  // Beauty & Health
  { name: "Vitamin C Serum",         description: "Brightening 20% vitamin C face serum with hyaluronic acid",            price:   39.99, discountPrice:   29.99, stockQuantity: 150, category: "Beauty & Health" },
  { name: "Electric Toothbrush",     description: "Sonic toothbrush with 5 modes and 3-month battery life",              price:   79.99, discountPrice:   59.99, stockQuantity:  80, category: "Beauty & Health" },
  { name: "Collagen Face Cream",     description: "Anti-aging moisturizer with retinol and collagen peptides",            price:   54.99, discountPrice:   44.99, stockQuantity: 100, category: "Beauty & Health" },
  { name: "Multivitamin Daily Pack", description: "Complete daily nutrition pack with 30 essential vitamins and minerals", price:   34.99, discountPrice:   27.99, stockQuantity: 200, category: "Beauty & Health" },
  { name: "Beard Grooming Kit",      description: "Premium beard oil, balm, comb and scissors grooming set",              price:   44.99, discountPrice:   36.99, stockQuantity:  90, category: "Beauty & Health" },

  // Toys & Games
  { name: "LEGO Technic Set",        description: "1500-piece advanced LEGO Technic building set for ages 10+",           price:  129.99, discountPrice:   99.99, stockQuantity:  60, category: "Toys & Games" },
  { name: "Monopoly Classic",        description: "The classic property trading family board game",                       price:   34.99, discountPrice:   24.99, stockQuantity:  90, category: "Toys & Games" },
  { name: "Remote Control Car",      description: "Professional 4WD off-road RC truck 1:10 scale 40 km/h",               price:  149.99, discountPrice:  119.99, stockQuantity:  45, category: "Toys & Games" },
  { name: "Puzzle 1000 Pieces",      description: "Scenic landscape jigsaw puzzle, high-quality print on thick board",    price:   24.99, discountPrice:   18.99, stockQuantity: 110, category: "Toys & Games" },

  // Food & Beverages
  { name: "Organic Green Tea",       description: "Premium Japanese matcha and sencha green tea variety pack 50 bags",    price:   29.99, discountPrice:   22.99, stockQuantity: 200, category: "Food & Beverages" },
  { name: "Dark Chocolate Collection",description:"Artisanal 70% cacao dark chocolate assortment box 500g",              price:   39.99, discountPrice:   32.99, stockQuantity: 120, category: "Food & Beverages" },
  { name: "Cold Brew Coffee Kit",    description: "DIY cold brew kit with Ethiopian and Colombian blends",                price:   44.99, discountPrice:   36.99, stockQuantity:  80, category: "Food & Beverages" },
  { name: "Almond Butter Jar 500g",  description: "Natural unsweetened almond butter, no added oil or sugar",            price:   19.99, discountPrice:   15.99, stockQuantity: 150, category: "Food & Beverages" },
];

// ── 3. ORDERS ────────────────────────────────────────────────
// Defined after product IDs are resolved
function buildOrders(pidMap) {
  const p = (name) => pidMap[name];
  return [
    {
      firstName: "Ahmed",   lastName: "Hassan",   phone: "+213555123456",
      deliveryMethod: "DELIVERY", address: "12 Rue Didouche Mourad Alger",
      notes: "Please ring the bell twice",
      items: [{ productId: p("iPhone 15 Pro"), quantity: 1 }, { productId: p("Sony WH-1000XM5"), quantity: 2 }],
    },
    {
      firstName: "Fatima",  lastName: "Benali",   phone: "+213661987654",
      deliveryMethod: "PICKUP", address: "", notes: "",
      items: [{ productId: p("Samsung Galaxy S24"), quantity: 1 }],
    },
    {
      firstName: "Youcef",  lastName: "Khelil",   phone: "+213770456789",
      deliveryMethod: "DELIVERY", address: "5 Bd Colonel Amirouche Oran",
      notes: "Leave at door",
      items: [{ productId: p("iPad Pro 12.9"), quantity: 1 }, { productId: p("Ergonomic Office Chair"), quantity: 1 }],
    },
    {
      firstName: "Meriem",  lastName: "Boudiaf",  phone: "+213561234567",
      deliveryMethod: "DELIVERY", address: "78 Rue Ben Mhidi Constantine",
      notes: "Fragile items",
      items: [{ productId: p("Atomic Habits"), quantity: 2 }, { productId: p("The Psychology of Money"), quantity: 1 }],
    },
    {
      firstName: "Karim",   lastName: "Aissaoui", phone: "+213699876543",
      deliveryMethod: "PICKUP", address: "", notes: "",
      items: [{ productId: p("Classic White T-Shirt"), quantity: 3 }, { productId: p("Slim Fit Jeans"), quantity: 1 }],
    },
    {
      firstName: "Nour",    lastName: "Tlemcani", phone: "+213554321098",
      deliveryMethod: "DELIVERY", address: "33 Avenue de l'Independance Annaba", notes: "",
      items: [{ productId: p("Yoga Mat Pro"), quantity: 1 }, { productId: p("Adjustable Dumbbells"), quantity: 1 }],
    },
    {
      firstName: "Rania",   lastName: "Cherifi",  phone: "+213662109876",
      deliveryMethod: "DELIVERY", address: "Lotissement Les Pins Blida",
      notes: "Call before delivery",
      items: [{ productId: p("Dell XPS 15"), quantity: 1 }],
    },
    {
      firstName: "Sofiane", lastName: "Medjdoub", phone: "+213771234098",
      deliveryMethod: "PICKUP", address: "", notes: "",
      items: [{ productId: p("LEGO Technic Set"), quantity: 2 }, { productId: p("Monopoly Classic"), quantity: 1 }],
    },
    {
      firstName: "Lina",    lastName: "Hamidou",  phone: "+213555678901",
      deliveryMethod: "DELIVERY", address: "24 Rue Larbi Ben Mhidi Setif", notes: "",
      items: [{ productId: p("Vitamin C Serum"), quantity: 1 }, { productId: p("Collagen Face Cream"), quantity: 2 }],
    },
    {
      firstName: "Omar",    lastName: "Bensaid",  phone: "+213660543210",
      deliveryMethod: "DELIVERY", address: "7 Cite des Freres Gherouf Batna",
      notes: "Evening delivery preferred",
      items: [{ productId: p("Organic Green Tea"), quantity: 3 }, { productId: p("Dark Chocolate Collection"), quantity: 2 }],
    },
  ];
}

// ── 4. REVIEWS ───────────────────────────────────────────────
function buildReviews(pidMap) {
  return [
    { product: "iPhone 15 Pro",          rating: 5, comment: "Absolutely love this phone! Camera quality is stunning.",                     reviewerName: "Ahmed K." },
    { product: "iPhone 15 Pro",          rating: 4, comment: "Great phone overall, a bit pricey but worth the build quality.",              reviewerName: "Sara M." },
    { product: "Samsung Galaxy S24",     rating: 5, comment: "Switched from iPhone and couldn't be happier. Android flexibility is amazing.", reviewerName: "Youcef B." },
    { product: "MacBook Air M3",         rating: 5, comment: "Best laptop I have ever owned. So fast and battery life is incredible!",      reviewerName: "Meriem T." },
    { product: "Sony WH-1000XM5",       rating: 4, comment: "Sound quality is top notch. ANC works perfectly on metro commutes.",          reviewerName: "Karim L." },
    { product: "Sony WH-1000XM5",       rating: 5, comment: "These headphones changed how I enjoy music. Absolutely worth it!",            reviewerName: "Nour A." },
    { product: "Classic White T-Shirt",  rating: 5, comment: "Super comfortable. The organic cotton feels so soft on skin.",               reviewerName: "Fatima C." },
    { product: "Slim Fit Jeans",         rating: 4, comment: "Good jeans, fits perfectly. Waist sizing runs slightly large.",              reviewerName: "Omar S." },
    { product: "Ergonomic Office Chair", rating: 5, comment: "My back pain disappeared after one week. Ergonomics done right.",            reviewerName: "Rania H." },
    { product: "Instant Pot Duo 7-in-1", rating: 5, comment: "The Instant Pot is a game changer! Made dinner in 20 minutes.",             reviewerName: "Lina B." },
    { product: "Yoga Mat Pro",           rating: 5, comment: "Perfect yoga mat. Non-slip surface is excellent even when sweaty.",          reviewerName: "Sofiane M." },
    { product: "Atomic Habits",          rating: 5, comment: "This book completely changed my perspective on habits. Must read!",          reviewerName: "Ahmed K." },
    { product: "The Psychology of Money",rating: 5, comment: "Best personal finance book ever written. Simple yet profound.",              reviewerName: "Sara M." },
    { product: "Vitamin C Serum",        rating: 5, comment: "Skin has been glowing since I started using this serum. Love it!",          reviewerName: "Fatima C." },
    { product: "LEGO Technic Set",       rating: 5, comment: "Built it with my son and we had a blast. Very detailed and challenging.",    reviewerName: "Youcef B." },
    { product: "Organic Green Tea",      rating: 4, comment: "Smooth taste, not too bitter. Great for afternoon pick-me-up.",              reviewerName: "Meriem T." },
    { product: "Dark Chocolate Collection",rating:5, comment: "Best chocolate I have tasted. Highly recommend!",                          reviewerName: "Karim L." },
    { product: "Dell XPS 15",            rating: 4, comment: "Incredible display and performance. A bit heavy for travel but worth it.",   reviewerName: "Rania H." },
    { product: "Hiking Backpack 50L",    rating: 5, comment: "Used it on a 3-day trek. Waterproofing held up perfectly in rain.",          reviewerName: "Nour A." },
    { product: "Deep Work",              rating: 5, comment: "Changed how I structure my work day. Productivity doubled.",                  reviewerName: "Omar S." },
  ];
}

// ── RUNNER ───────────────────────────────────────────────────
async function main() {
  console.log("\n========================================");
  console.log("  Nehrem Store – Database Seeder");
  console.log("========================================\n");

  // Check server
  try {
    await fetch(`${BASE}/categories`);
  } catch {
    console.error("ERROR: Backend not reachable at", BASE);
    process.exit(1);
  }

  // 1. Seed categories
  console.log("── Seeding categories…");
  const catIdMap = {};
  for (const cat of CATEGORIES) {
    const res = await post(`${BASE}/categories`, cat);
    if (res.success && res.data?.id) {
      catIdMap[cat.name] = res.data.id;
      console.log(`  [OK] Category '${cat.name}' → id=${res.data.id}`);
    } else {
      console.error(`  [ERR] Category '${cat.name}':`, res.message ?? res);
    }
  }

  // 2. Seed products (multipart form)
  console.log("\n── Seeding products…");
  const productIdMap = {};
  for (const product of PRODUCTS) {
    const catId = catIdMap[product.category];
    if (!catId) { console.error(`  [ERR] No category ID for '${product.category}'`); continue; }

    const productJson = {
      name:          product.name,
      description:   product.description,
      price:         product.price,
      stockQuantity: product.stockQuantity,
      categoryId:    catId,
      ...(product.discountPrice !== undefined ? { discountPrice: product.discountPrice } : {}),
    };
    const form = new FormData();
    form.append("product", new Blob([JSON.stringify(productJson)], { type: "application/json" }), "product.json");

    const res = await post(`${BASE}/products`, form, true);
    if (res.success && res.data?.id) {
      productIdMap[product.name] = res.data.id;
      console.log(`  [OK] Product '${product.name}' → id=${res.data.id}`);
    } else {
      console.error(`  [ERR] Product '${product.name}':`, res.message ?? res);
    }
  }

  // 3. Seed orders
  console.log("\n── Seeding orders…");
  const orders = buildOrders(productIdMap);
  for (const order of orders) {
    const res = await post(`${BASE}/orders`, order);
    if (res.success && res.data?.id) {
      console.log(`  [OK] Order for '${order.firstName} ${order.lastName}' → id=${res.data.id}`);
    } else {
      console.error(`  [ERR] Order '${order.firstName} ${order.lastName}':`, res.message ?? res);
    }
  }

  // 4. Seed reviews
  console.log("\n── Seeding reviews…");
  const reviews = buildReviews(productIdMap);
  for (const review of reviews) {
    const productId = productIdMap[review.product];
    if (!productId) { console.error(`  [ERR] No product ID for '${review.product}'`); continue; }

    const res = await post(`${BASE}/products/${productId}/reviews`, {
      rating: review.rating,
      comment: review.comment,
      reviewerName: review.reviewerName,
    });
    if (res.success && res.data?.id) {
      console.log(`  [OK] Review by '${review.reviewerName}' on '${review.product}' → id=${res.data.id}`);
    } else {
      console.error(`  [ERR] Review '${review.reviewerName}':`, res.message ?? res);
    }
  }

  console.log("\n[DONE] Seeding complete!\n");
}

main().catch(console.error);
