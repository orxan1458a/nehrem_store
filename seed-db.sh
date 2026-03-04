#!/usr/bin/env bash
# =============================================================
#  Nehrem Store – Database Seeder (calls REST API endpoints)
#  Usage: bash seed-db.sh
#  Requires: curl, jq
# =============================================================

BASE="http://localhost:8080/api"
RED='\033[0;31m'; GREEN='\033[0;32m'; CYAN='\033[0;36m'; NC='\033[0m'

ok()   { echo -e "${GREEN}[OK]${NC}  $*"; }
info() { echo -e "${CYAN}[--]${NC}  $*"; }
err()  { echo -e "${RED}[ERR]${NC} $*"; }

# Helper: POST JSON, return the "id" field from data
post_json() {
  local url=$1 body=$2
  local resp
  resp=$(curl -s -X POST "$url" \
    -H "Content-Type: application/json" \
    -d "$body")
  echo "$resp" | jq -r '.data.id // empty'
}

check_server() {
  if ! curl -s --max-time 3 "$BASE/categories" > /dev/null 2>&1; then
    err "Backend not reachable at $BASE – is the Spring Boot server running?"
    exit 1
  fi
}

# ── 1. CATEGORIES ─────────────────────────────────────────────
seed_categories() {
  info "Seeding categories…"

  declare -A CATS
  while IFS='|' read -r name desc; do
    id=$(post_json "$BASE/categories" "{\"name\":\"$name\",\"description\":\"$desc\"}")
    if [[ -n "$id" ]]; then
      CATS[$name]=$id
      ok "Category '$name' → id=$id"
    else
      err "Failed to create category '$name'"
    fi
  done <<'EOF'
Electronics|Smartphones, laptops, tablets and all electronic gadgets
Clothing|Men and women fashion, shoes and accessories
Home & Garden|Furniture, decor, kitchen tools and garden supplies
Sports & Outdoors|Fitness equipment, outdoor gear and sportswear
Books|Novels, textbooks, comics and e-books
Beauty & Health|Skincare, makeup, vitamins and wellness products
Toys & Games|Board games, action figures and educational toys
Food & Beverages|Snacks, beverages, organic and specialty food items
EOF

  # Export ids for use in product seeding
  export CAT_ELECTRONICS=${CATS[Electronics]}
  export CAT_CLOTHING=${CATS[Clothing]}
  export CAT_HOME=${CATS["Home & Garden"]}
  export CAT_SPORTS=${CATS["Sports & Outdoors"]}
  export CAT_BOOKS=${CATS[Books]}
  export CAT_BEAUTY=${CATS["Beauty & Health"]}
  export CAT_TOYS=${CATS["Toys & Games"]}
  export CAT_FOOD=${CATS["Food & Beverages"]}
}

# ── 2. PRODUCTS ───────────────────────────────────────────────
seed_products() {
  info "Seeding products…"

  # Format: name|description|price|discountPrice|stock|categoryId
  declare -a PRODUCTS=(
    # Electronics
    "iPhone 15 Pro|Latest Apple flagship with titanium frame and A17 Pro chip|1299.99|1199.99|50|$CAT_ELECTRONICS"
    "Samsung Galaxy S24|Android flagship with Snapdragon 8 Gen 3 and 200MP camera|1099.99|999.99|45|$CAT_ELECTRONICS"
    "MacBook Air M3|Ultra-thin laptop with Apple M3 chip and 18-hour battery|1499.99||30|$CAT_ELECTRONICS"
    "Sony WH-1000XM5|Industry-leading noise cancelling wireless headphones|349.99|299.99|80|$CAT_ELECTRONICS"
    "iPad Pro 12.9|Professional tablet with M2 chip and Liquid Retina display|1099.99||25|$CAT_ELECTRONICS"
    "Dell XPS 15|High-performance Windows laptop with OLED display|1799.99|1649.99|20|$CAT_ELECTRONICS"

    # Clothing
    "Classic White T-Shirt|100% organic cotton crew neck tee, available in all sizes|29.99|19.99|200|$CAT_CLOTHING"
    "Slim Fit Jeans|Stretch denim jeans with modern slim fit cut|79.99|59.99|150|$CAT_CLOTHING"
    "Leather Jacket|Genuine leather biker jacket with quilted lining|299.99|249.99|40|$CAT_CLOTHING"
    "Running Sneakers|Lightweight breathable running shoes with foam sole|119.99|89.99|100|$CAT_CLOTHING"
    "Floral Summer Dress|Lightweight chiffon midi dress perfect for warm weather|89.99|69.99|75|$CAT_CLOTHING"

    # Home & Garden
    "Ergonomic Office Chair|Adjustable lumbar support mesh chair for long work sessions|449.99|389.99|35|$CAT_HOME"
    "Instant Pot Duo 7-in-1|Pressure cooker, slow cooker, rice cooker and more|99.99|79.99|60|$CAT_HOME"
    "Robot Vacuum Cleaner|Smart mapping robot vacuum with mopping function|399.99|349.99|40|$CAT_HOME"
    "Bamboo Bed Sheet Set|Silky soft 100% bamboo queen size sheet set|89.99|69.99|90|$CAT_HOME"
    "Indoor Herb Garden Kit|Self-watering LED grow light herb garden for kitchen|59.99|49.99|55|$CAT_HOME"

    # Sports & Outdoors
    "Yoga Mat Pro|Extra thick non-slip TPE yoga mat with alignment lines|59.99|44.99|120|$CAT_SPORTS"
    "Adjustable Dumbbells|Space-saving adjustable 5-52.5 lb dumbbell set|349.99|299.99|30|$CAT_SPORTS"
    "Hiking Backpack 50L|Waterproof trekking backpack with hydration bladder pocket|149.99|119.99|50|$CAT_SPORTS"
    "Cycling Helmet|Lightweight MIPS certified road cycling helmet|89.99|74.99|65|$CAT_SPORTS"

    # Books
    "Atomic Habits|An easy and proven way to build good habits by James Clear|19.99|14.99|200|$CAT_BOOKS"
    "The Psychology of Money|Timeless lessons on wealth greed and happiness|17.99|12.99|180|$CAT_BOOKS"
    "Clean Code|A handbook of agile software craftsmanship by Robert C. Martin|49.99|39.99|100|$CAT_BOOKS"
    "Dune|Epic science fiction novel by Frank Herbert|16.99|12.99|150|$CAT_BOOKS"

    # Beauty & Health
    "Vitamin C Serum|Brightening 20% vitamin C face serum with hyaluronic acid|39.99|29.99|150|$CAT_BEAUTY"
    "Electric Toothbrush|Sonic toothbrush with 5 modes and 3-month battery life|79.99|59.99|80|$CAT_BEAUTY"
    "Collagen Face Cream|Anti-aging moisturizer with retinol and collagen peptides|54.99|44.99|100|$CAT_BEAUTY"
    "Multivitamin Daily Pack|Complete daily nutrition pack with 30 essential vitamins|34.99|27.99|200|$CAT_BEAUTY"

    # Toys & Games
    "LEGO Technic Set|1500-piece advanced LEGO Technic building set|129.99|99.99|60|$CAT_TOYS"
    "Monopoly Classic|The classic property trading family board game|34.99|24.99|90|$CAT_TOYS"
    "Remote Control Car|Professional 4WD off-road RC truck 1:10 scale|149.99|119.99|45|$CAT_TOYS"

    # Food & Beverages
    "Organic Green Tea|Premium Japanese matcha and sencha green tea variety pack|29.99|22.99|200|$CAT_FOOD"
    "Dark Chocolate Collection|Artisanal 70% cacao dark chocolate assortment box|39.99|32.99|120|$CAT_FOOD"
    "Cold Brew Coffee Kit|DIY cold brew kit with Ethiopian and Colombian blends|44.99|36.99|80|$CAT_FOOD"
  )

  PRODUCT_IDS=()
  for entry in "${PRODUCTS[@]}"; do
    IFS='|' read -r name desc price discountPrice stock catId <<< "$entry"

    # Build JSON – omit discountPrice if empty
    if [[ -n "$discountPrice" ]]; then
      body="{\"name\":\"$name\",\"description\":\"$desc\",\"price\":$price,\"discountPrice\":$discountPrice,\"stockQuantity\":$stock,\"categoryId\":$catId}"
    else
      body="{\"name\":\"$name\",\"description\":\"$desc\",\"price\":$price,\"stockQuantity\":$stock,\"categoryId\":$catId}"
    fi

    # Products endpoint uses multipart; send as form fields (no image)
    resp=$(curl -s -X POST "$BASE/products" \
      -F "name=$name" \
      -F "description=$desc" \
      -F "price=$price" \
      $([ -n "$discountPrice" ] && echo "-F discountPrice=$discountPrice") \
      -F "stockQuantity=$stock" \
      -F "categoryId=$catId")

    id=$(echo "$resp" | jq -r '.data.id // empty')
    if [[ -n "$id" ]]; then
      PRODUCT_IDS+=("$id")
      ok "Product '$name' → id=$id"
    else
      err "Failed to create product '$name' – $(echo "$resp" | jq -r '.message // .')"
    fi
  done

  # Export some product IDs for orders and reviews
  export PRODUCT_IDS_EXPORT="${PRODUCT_IDS[*]}"
}

# ── 3. ORDERS ─────────────────────────────────────────────────
seed_orders() {
  info "Seeding orders…"
  read -ra PID <<< "$PRODUCT_IDS_EXPORT"

  # Guard: need at least 6 products
  if [[ ${#PID[@]} -lt 6 ]]; then
    err "Not enough product IDs to create orders (got ${#PID[@]})"
    return
  fi

  declare -a ORDERS=(
    # firstName|lastName|phone|deliveryMethod|address|notes|items JSON
    "Ahmed|Hassan|+213555123456|DELIVERY|12 Rue Didouche Mourad Alger|Please ring the bell twice|[{\"productId\":${PID[0]},\"quantity\":1},{\"productId\":${PID[3]},\"quantity\":2}]"
    "Fatima|Benali|+213661987654|PICKUP|||[{\"productId\":${PID[1]},\"quantity\":1}]"
    "Youcef|Khelil|+213770456789|DELIVERY|5 Bd Colonel Amirouche Oran|Leave at door|[{\"productId\":${PID[4]},\"quantity\":1},{\"productId\":${PID[11]},\"quantity\":1}]"
    "Meriem|Boudiaf|+213561234567|DELIVERY|78 Rue Ben Mhidi Constantine|Fragile items inside|[{\"productId\":${PID[20]},\"quantity\":2},{\"productId\":${PID[21]},\"quantity\":1}]"
    "Karim|Aissaoui|+213699876543|PICKUP|||[{\"productId\":${PID[6]},\"quantity\":3},{\"productId\":${PID[7]},\"quantity\":1}]"
    "Nour|Tlemcani|+213554321098|DELIVERY|33 Avenue de l'Independance Annaba||[{\"productId\":${PID[16]},\"quantity\":1},{\"productId\":${PID[17]},\"quantity\":1}]"
    "Rania|Cherifi|+213662109876|DELIVERY|Lotissement Les Pins Blida|Call before delivery|[{\"productId\":${PID[5]},\"quantity\":1}]"
    "Sofiane|Medjdoub|+213771234098|PICKUP|||[{\"productId\":${PID[28]},\"quantity\":2},{\"productId\":${PID[29]},\"quantity\":1}]"
    "Lina|Hamidou|+213555678901|DELIVERY|24 Rue Larbi Ben Mhidi Setif||[{\"productId\":${PID[24]},\"quantity\":1},{\"productId\":${PID[26]},\"quantity\":2}]"
    "Omar|Bensaid|+213660543210|DELIVERY|7 Cité des Frères Gherouf Batna|Evening delivery preferred|[{\"productId\":${PID[31]},\"quantity\":3},{\"productId\":${PID[32]},\"quantity\":2}]"
  )

  for entry in "${ORDERS[@]}"; do
    IFS='|' read -r firstName lastName phone deliveryMethod address notes items <<< "$entry"

    body=$(jq -n \
      --arg fn "$firstName" \
      --arg ln "$lastName" \
      --arg ph "$phone" \
      --arg dm "$deliveryMethod" \
      --arg ad "$address" \
      --arg no "$notes" \
      --argjson it "$items" \
      '{firstName:$fn,lastName:$ln,phone:$ph,deliveryMethod:$dm,address:$ad,notes:$no,items:$it}')

    id=$(post_json "$BASE/orders" "$body")
    if [[ -n "$id" ]]; then
      ok "Order for '$firstName $lastName' → id=$id"
    else
      err "Failed to create order for '$firstName $lastName'"
    fi
  done
}

# ── 4. REVIEWS ────────────────────────────────────────────────
seed_reviews() {
  info "Seeding reviews…"
  read -ra PID <<< "$PRODUCT_IDS_EXPORT"

  [[ ${#PID[@]} -lt 5 ]] && { err "Not enough products for reviews"; return; }

  # productIndex|rating|comment|reviewerName
  declare -a REVIEWS=(
    "0|5|Absolutely love this phone! Camera quality is stunning and battery lasts all day.|Ahmed K."
    "0|4|Great phone overall, a bit pricey but worth it for the build quality.|Sara M."
    "1|5|Switched from iPhone and couldn't be happier. Android flexibility is amazing.|Youcef B."
    "2|5|Best laptop I have ever owned. So fast and the battery life is incredible!|Meriem T."
    "3|4|Sound quality is top notch. ANC works perfectly on metro commutes.|Karim L."
    "3|5|These headphones changed how I enjoy music. Absolutely worth every dinar.|Nour A."
    "6|5|Super comfortable shirt. The organic cotton feels so soft on skin.|Fatima C."
    "7|4|Good jeans, fits perfectly. Waist sizing runs slightly large.|Omar S."
    "11|5|My back pain disappeared after one week using this chair. Ergonomics done right.|Rania H."
    "12|5|The Instant Pot is a game changer! Made dinner in 20 minutes.|Lina B."
    "16|5|Perfect yoga mat. Non-slip surface is excellent even when sweaty.|Sofiane M."
    "20|5|This book completely changed my perspective on habits. Must read!|Ahmed K."
    "21|5|Best personal finance book ever written. Simple yet profound.|Sara M."
    "24|5|Skin has been glowing ever since I started using this serum. Love it!|Fatima C."
    "28|5|Built it with my son and we had a blast. Very detailed and challenging.|Youcef B."
    "31|4|Smooth taste, not too bitter. Great for afternoon pick-me-up.|Meriem T."
    "32|5|Best chocolate I have tasted outside Europe. Highly recommend!|Karim L."
  )

  for entry in "${REVIEWS[@]}"; do
    IFS='|' read -r pidx rating comment reviewerName <<< "$entry"
    productId="${PID[$pidx]}"

    [[ -z "$productId" ]] && { err "No product at index $pidx – skipping review"; continue; }

    body=$(jq -n \
      --argjson r "$rating" \
      --arg c "$comment" \
      --arg rn "$reviewerName" \
      '{rating:$r,comment:$c,reviewerName:$rn}')

    id=$(post_json "$BASE/products/$productId/reviews" "$body")
    if [[ -n "$id" ]]; then
      ok "Review by '$reviewerName' on product $productId → id=$id"
    else
      err "Failed to create review by '$reviewerName' on product $productId"
    fi
  done
}

# ── MAIN ──────────────────────────────────────────────────────
echo ""
echo "========================================"
echo "  Nehrem Store – Database Seeder"
echo "========================================"
echo ""

check_server
seed_categories
echo ""
seed_products
echo ""
seed_orders
echo ""
seed_reviews
echo ""
ok "Seeding complete!"
