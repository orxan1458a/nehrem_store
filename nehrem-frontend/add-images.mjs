// ================================================================
//  Nehrem Store – Product Image Seeder
//  Downloads a matching image per product and uploads it via API.
//  Source: loremflickr.com (free, no API key needed)
//  Usage: node add-images.mjs
// ================================================================

const BASE = "http://localhost:8080/api";
const IMG_W = 400;
const IMG_H = 400;
const DELAY_MS = 300;

// ── Keyword map ──────────────────────────────────────────────
function keywords(name, category) {
  const n = name.toLowerCase();
  const c = (category || "").toLowerCase();

  // Electronics
  if (n.includes("iphone"))                              return "iphone,smartphone";
  if (n.includes("samsung galaxy"))                      return "samsung,android,smartphone";
  if (n.includes("macbook"))                             return "macbook,laptop,apple";
  if (n.includes("sony wh") || n.includes("headphone")) return "headphones,wireless,audio";
  if (n.includes("ipad"))                                return "ipad,tablet";
  if (n.includes("dell xps") || (n.includes("dell") && n.includes("laptop"))) return "laptop,computer,dell";
  if (n.includes("apple watch"))                         return "smartwatch,wearable";
  if (n.includes("gopro"))                               return "action camera,gopro";

  // Clothing
  if (n.includes("t-shirt") || n.includes("tshirt"))    return "tshirt,white,clothing";
  if (n.includes("jeans"))                               return "jeans,denim";
  if (n.includes("leather jacket"))                      return "leather jacket,fashion";
  if (n.includes("sneakers") || n.includes("running shoe")) return "sneakers,running shoes";
  if (n.includes("dress"))                               return "summer dress,fashion";
  if (n.includes("coat"))                                return "winter coat,fashion";

  // Home & Garden
  if (n.includes("office chair") || n.includes("ergonomic")) return "office chair,ergonomic";
  if (n.includes("instant pot"))                         return "instant pot,kitchen,cooking";
  if (n.includes("robot vacuum"))                        return "robot vacuum,smart home";
  if (n.includes("bed sheet"))                           return "bed sheets,bedroom";
  if (n.includes("herb garden"))                         return "herb garden,indoor plants";
  if (n.includes("air purifier"))                        return "air purifier,appliance";

  // Sports & Outdoors
  if (n.includes("yoga mat"))                            return "yoga mat,fitness";
  if (n.includes("dumbbell"))                            return "dumbbells,weights,gym";
  if (n.includes("hiking backpack") || (n.includes("backpack") && n.includes("50"))) return "hiking backpack,outdoor";
  if (n.includes("cycling helmet") || n.includes("helmet")) return "cycling helmet,bike";
  if (n.includes("jump rope"))                           return "jump rope,fitness";

  // Books
  if (n.includes("atomic habits"))                       return "book,habits,reading";
  if (n.includes("psychology of money"))                 return "book,finance,money";
  if (n.includes("clean code"))                          return "programming,code,book";
  if (n.includes("dune"))                                return "book,novel,fantasy";
  if (n.includes("deep work"))                           return "book,productivity,focus";

  // Beauty & Health
  if (n.includes("vitamin c serum"))                     return "face serum,skincare,beauty";
  if (n.includes("electric toothbrush"))                 return "electric toothbrush,dental";
  if (n.includes("collagen"))                            return "face cream,skincare";
  if (n.includes("multivitamin"))                        return "vitamins,supplements,health";
  if (n.includes("beard"))                               return "beard grooming,man";

  // Toys & Games
  if (n.includes("lego"))                                return "lego,building blocks,toys";
  if (n.includes("monopoly"))                            return "board game,monopoly";
  if (n.includes("remote control car") || n.includes("rc car")) return "remote control car,toy";
  if (n.includes("puzzle"))                              return "jigsaw puzzle,game";

  // Food & Beverages
  if (n.includes("green tea"))                           return "green tea,tea,drink";
  if (n.includes("chocolate"))                           return "dark chocolate,chocolate";
  if (n.includes("cold brew") || n.includes("coffee"))  return "cold brew coffee,coffee";
  if (n.includes("almond butter"))                       return "almond butter,food,healthy";

  // Category fallbacks
  if (c.includes("electronics"))   return "electronics,gadget,technology";
  if (c.includes("clothing"))      return "fashion,clothing,apparel";
  if (c.includes("home"))          return "home decor,interior,house";
  if (c.includes("sports"))        return "sports,fitness,workout";
  if (c.includes("books"))         return "book,reading,library";
  if (c.includes("beauty"))        return "beauty,skincare,cosmetics";
  if (c.includes("toys"))          return "toys,games,fun";
  if (c.includes("food"))          return "food,organic,healthy";

  return "product,shop";
}

// ── Helpers ──────────────────────────────────────────────────
const sleep = (ms) => new Promise(r => setTimeout(r, ms));

async function downloadImage(productId, kw) {
  // 1st try: loremflickr (keyword-relevant photos)
  try {
    const url = `https://loremflickr.com/${IMG_W}/${IMG_H}/${encodeURIComponent(kw)}?lock=${productId}`;
    const res = await fetch(url, { redirect: "follow" });
    if (res.ok) {
      const buf = await res.arrayBuffer();
      return { buf, ext: ".jpg", source: "loremflickr" };
    }
  } catch { /* fall through */ }

  // 2nd try: picsum.photos (seed = productId → deterministic beautiful photo)
  const url = `https://picsum.photos/seed/${productId}/${IMG_W}/${IMG_H}`;
  const res = await fetch(url, { redirect: "follow" });
  if (!res.ok) throw new Error(`Both image sources failed (picsum ${res.status})`);
  const buf = await res.arrayBuffer();
  return { buf, ext: ".jpg", source: "picsum" };
}

async function uploadImage(product, imageBuf, ext) {
  const productJson = {
    name:          product.name,
    description:   product.description   || "",
    price:         product.price,
    stockQuantity: product.stockQuantity,
    categoryId:    product.categoryId    || undefined,
    ...(product.discountPrice ? { discountPrice: product.discountPrice } : {}),
  };

  const form = new FormData();
  form.append(
    "product",
    new Blob([JSON.stringify(productJson)], { type: "application/json" }),
    "product.json"
  );
  form.append(
    "image",
    new Blob([imageBuf], { type: "image/jpeg" }),
    `product-${product.id}${ext}`
  );

  const res = await fetch(`${BASE}/products/${product.id}`, {
    method: "PUT",
    body: form,
  });
  const json = await res.json();
  return json;
}

// ── Main ─────────────────────────────────────────────────────
async function main() {
  console.log("\n========================================");
  console.log("  Nehrem Store – Image Seeder");
  console.log("========================================\n");

  // 1. Load all products
  const res = await fetch(`${BASE}/products?size=100&page=0`);
  const data = await res.json();
  const products = data.data?.content ?? [];
  console.log(`Found ${products.length} products.\n`);

  const pending = products.filter(p => !p.imageUrl);
  console.log(`${products.length - pending.length} already have images. Processing ${pending.length} without images.\n`);

  let ok = 0, fail = 0;

  for (const product of pending) {
    const kw = keywords(product.name, product.categoryName);
    process.stdout.write(`[${product.id.toString().padStart(2)}] ${product.name.padEnd(32)} → `);

    try {
      const { buf, ext, source } = await downloadImage(product.id, kw);
      const result = await uploadImage(product, buf, ext);

      if (result.success && result.data?.imageUrl) {
        console.log(`✓  [${source}] ${result.data.imageUrl}`);
        ok++;
      } else {
        console.log(`✗  Upload failed: ${result.message}`);
        fail++;
      }
    } catch (err) {
      console.log(`✗  Error: ${err.message}`);
      fail++;
    }

    await sleep(DELAY_MS);
  }

  console.log(`\n[DONE] ${ok} images uploaded, ${fail} failed.\n`);
}

main().catch(console.error);
