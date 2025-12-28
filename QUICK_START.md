# 🚀 QUICK START GUIDE - Stock Opname Turbo

## ⏱️ 5-Minute Setup

### 1️⃣ Install Dependencies
```bash
cd stock-opname
pnpm install
```

### 2️⃣ Setup Supabase

**a) Create Supabase Project**
- Go to [supabase.com](https://supabase.com)
- Create new project
- Go to **Project Settings** → **API** 
- Copy `Project URL` dan `anon public key`

**b) Create Database Tables** (Copy-paste SQL to SQL Editor)

```sql
-- 1. Products Table
CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  barcode TEXT NOT NULL,
  name TEXT NOT NULL,
  category TEXT,
  initial_stock INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT now()
);
CREATE INDEX idx_products_barcode ON products(barcode);

-- 2. Teams Table
CREATE TABLE teams (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_name TEXT NOT NULL UNIQUE,
  created_at TIMESTAMP DEFAULT now()
);

-- 3. Stock Counts Table
CREATE TABLE stock_counts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
  location TEXT NOT NULL CHECK (location IN ('TOKO', 'GUDANG')),
  qty INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP DEFAULT now()
);
CREATE INDEX idx_stock_counts_product ON stock_counts(product_id);
CREATE INDEX idx_stock_counts_team ON stock_counts(team_id);

-- 4. Stock Summary View
CREATE VIEW stock_summary AS
SELECT 
  p.id,
  p.barcode,
  p.name,
  p.category,
  p.initial_stock,
  COALESCE(SUM(CASE WHEN sc.location = 'TOKO' THEN sc.qty ELSE 0 END), 0) as stok_toko,
  COALESCE(SUM(CASE WHEN sc.location = 'GUDANG' THEN sc.qty ELSE 0 END), 0) as stok_gudang,
  (COALESCE(SUM(CASE WHEN sc.location = 'TOKO' THEN sc.qty ELSE 0 END), 0) + 
   COALESCE(SUM(CASE WHEN sc.location = 'GUDANG' THEN sc.qty ELSE 0 END), 0)) - p.initial_stock as selisih
FROM products p
LEFT JOIN stock_counts sc ON p.id = sc.product_id
GROUP BY p.id;

-- 5. Insert Sample Teams
INSERT INTO teams (team_name) VALUES ('Tim A'), ('Tim B'), ('Tim C');

-- 6. Insert Sample Products (5 items)
INSERT INTO products (barcode, name, category, initial_stock) VALUES
('BAR001', 'Produk A', 'Kategori 1', 100),
('BAR002', 'Produk B', 'Kategori 1', 150),
('BAR003', 'Produk C', 'Kategori 2', 200),
('BAR004', 'Produk D', 'Kategori 2', 75),
('BAR005', 'Produk E', 'Kategori 3', 300);
```

**c) Enable Realtime** (Optional)
- Go to Supabase Dashboard → Replication
- Enable for `stock_counts` table

### 3️⃣ Setup Environment Variables

Create `.env.local`:
```bash
cp .env.example .env.local
```

Edit `.env.local`:
```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_KEY=your-anon-public-key
```

### 4️⃣ Run Development Server
```bash
pnpm dev
```

Open browser: **http://localhost:5173**

### 5️⃣ Test the App

**Login:**
- Team: Select "Tim A"
- Location: Select "TOKO"
- Click "Mulai Opname"

**Input Data:**
1. Type "BAR001" in search
2. Click the product card
3. Enter quantity (e.g., 95)
4. Press Enter
5. Repeat for other products

**Export:**
1. Click "Rekapitulasi" tab
2. Click "Export Excel"
3. Check the downloaded file

---

## 📊 Database Tips

### Insert More Products via SQL
```sql
-- For testing with more data
INSERT INTO products (barcode, name, category, initial_stock)
SELECT 
  'BAR' || LPAD((row_number() OVER ())::text, 5, '0'),
  'Produk ' || (row_number() OVER ())::text,
  'Category ' || ((row_number() OVER () % 5) + 1)::text,
  FLOOR(RANDOM() * 500 + 50)::int
FROM generate_series(1, 100);
```

### Check Data Quality
```sql
-- Find duplicate barcodes
SELECT barcode, COUNT(*) FROM products GROUP BY barcode HAVING COUNT(*) > 1;

-- View all stock counts
SELECT * FROM stock_counts LIMIT 10;

-- View summary
SELECT * FROM stock_summary LIMIT 10;
```

---

## 🎨 Customization

### Change Colors
Edit `tailwind.config.js`:
```js
colors: {
  pastel: {
    sky: "#Your-Color-Hex",
    green: "#Your-Color-Hex",
    // ...
  }
}
```

### Change App Title
Edit `index.html`:
```html
<title>Your App Title</title>
```

---

## 🔧 Troubleshooting

| Issue | Solution |
|-------|----------|
| **Env variables not loading** | Restart dev server: `pnpm dev` |
| **404 on Supabase** | Check URL & key in `.env.local` |
| **No data showing** | Check Supabase dashboard for tables |
| **Slow search** | Products not loaded - check browser console |

---

## 📱 Keyboard Shortcuts

| Key | Action |
|-----|--------|
| `Enter` | Select first search result OR Save quantity |
| `Esc` | Cancel & return to search |
| `Tab` | Move to next input field |

---

## 🎯 Next Steps

1. **Load Real Data**: Use Import Excel feature to upload your product list
2. **Configure Teams**: Add actual teams to database
3. **Customize Theme**: Edit colors & branding
4. **Deploy**: `pnpm build` → Deploy `dist/` folder

---

**Ready to go! 🎉 Start opname now!**
