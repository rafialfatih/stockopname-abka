# 🔌 API & Store Documentation

## Pinia Stores

### 1. `productStore.js` - Products Management

**State:**
```js
{
  products: [],        // All 5000+ products cached in RAM
  searchQuery: '',     // Current search input
}
```

**Computed:**
```js
filteredProducts  // Real-time filtered list based on searchQuery
```

**Actions:**
```js
loadProducts(data: Product[])        // Load all products from API
setSearchQuery(q: string)             // Update search query
getProductsByBarcode(barcode: string) // Get all products with same barcode
```

**Usage:**
```js
import { useProductStore } from '@/stores/productStore'

const store = useProductStore()

// Load products
store.loadProducts(products)

// Search
store.setSearchQuery('BAR001')
console.log(store.filteredProducts) // Returns matching products

// Check duplicates
const duplicates = store.getProductsByBarcode('BAR001')
```

---

### 2. `stockCountStore.js` - Stock Count Entries

**State:**
```js
{
  counts: []  // Array of { id, product_id, team_id, location, qty, created_at }
}
```

**Actions:**
```js
addCount(count)                  // Add new stock count entry
updateCount(id, count)           // Update existing entry
getCountsByProduct(productId)    // Get all counts for a product
clearCounts()                    // Clear all counts (reset)
```

**Usage:**
```js
import { useStockCountStore } from '@/stores/stockCountStore'

const store = useStockCountStore()

// Add count
store.addCount({
  product_id: 'uuid-1',
  team_id: 'uuid-2',
  location: 'TOKO',
  qty: 95
})

// Get counts for product
const counts = store.getCountsByProduct('uuid-1')
```

---

### 3. `teamStore.js` - Teams Management

**State:**
```js
{
  teams: [],           // All teams
  currentTeam: null    // Selected team
}
```

**Actions:**
```js
loadTeams(data: Team[])    // Load teams from API
setCurrentTeam(team: Team) // Set active team
```

**Usage:**
```js
import { useTeamStore } from '@/stores/teamStore'

const store = useTeamStore()

// Load teams
store.loadTeams(teamsData)

// Select team
store.setCurrentTeam(team)
console.log(store.currentTeam.team_name) // "Tim A"
```

---

### 4. `uiStore.js` - UI State Management

**State:**
```js
{
  isAuthenticated: false,        // Login state
  showDuplicateModal: false,     // Show duplicate selector
  duplicateProducts: [],         // Products with same barcode
  selectedDuplicateProduct: null,// Selected product
  inputQty: '',                  // Quantity input (not in use, kept for future)
  focusedProductId: null,        // Currently editing product
  currentLocation: 'TOKO',       // TOKO or GUDANG
  showMenu: false                // Mobile menu toggle
}
```

**Actions:**
```js
setAuthenticated(auth: boolean)
showDuplicate(products: Product[])
hideDuplicate()
setFocusedProduct(id: string)
setLocation(loc: 'TOKO' | 'GUDANG')
toggleMenu()
```

**Usage:**
```js
import { useUIStore } from '@/stores/uiStore'

const store = useUIStore()

// Login
store.setAuthenticated(true)

// Show duplicate modal
store.showDuplicate([product1, product2])

// Focus on product for input
store.setFocusedProduct('product-uuid')

// Change location
store.setLocation('GUDANG')
```

---

## API Service Functions

### `api.js` - Database Operations

#### `loadAllProducts()`
**Description:** Load all products from database into Pinia store
**Returns:** `Promise<Product[]>`

```js
const products = await loadAllProducts()
// Auto-updates productStore with data
```

**SQL:**
```sql
SELECT * FROM products LIMIT 5000
```

---

#### `loadTeams()`
**Description:** Load teams from database
**Returns:** `Promise<Team[]>`

```js
const teams = await loadTeams()
// Auto-updates teamStore with data
```

---

#### `addStockCount(productId, teamId, location, qty)`
**Description:** Save a stock count entry
**Parameters:**
- `productId`: UUID
- `teamId`: UUID
- `location`: 'TOKO' | 'GUDANG'
- `qty`: number

**Returns:** `Promise<StockCount>`

```js
const result = await addStockCount(
  '123e4567-e89b-12d3-a456-426614174000',
  'abc123...',
  'TOKO',
  95
)
```

**SQL:**
```sql
INSERT INTO stock_counts (product_id, team_id, location, qty)
VALUES ($1, $2, $3, $4)
```

---

#### `getStockSummary()`
**Description:** Get pre-computed summary data
**Returns:** `Promise<StockSummaryView[]>`

```js
const summary = await getStockSummary()
// Returns array of items with selisih calculation
```

**View SQL:**
```sql
SELECT * FROM stock_summary
```

---

## Excel Service Functions

### `excelService.js` - Excel Import/Export

#### `parseExcelFile(file: File)`
**Description:** Parse Excel file and extract product data
**Returns:** `Promise<Product[]>`

```js
const file = document.querySelector('input[type=file]').files[0]
const products = await parseExcelFile(file)
// Returns [{barcode, name, category, initial_stock}, ...]
```

**Expected Columns:**
- Column A: Barcode
- Column B: Nama Barang
- Column C: Kategori
- Column D: Stok Awal

---

#### `exportToExcel(data, filename)`
**Description:** Export data to Excel file
**Parameters:**
- `data`: Array of objects
- `filename`: Output filename (default: 'stock_opname.xlsx')

```js
const recapData = [
  {
    Barcode: 'BAR001',
    'Nama Barang': 'Produk A',
    'Stok Awal': 100,
    'Stok Toko': 95,
    Selisih: -5
  },
  // ...
]

exportToExcel(recapData, 'recap_2025-01-01.xlsx')
```

**Output Columns:**
- Barcode
- Nama Barang
- Kategori
- Stok Awal
- Stok Toko
- Stok Gudang
- Selisih

---

## Database Schema

### Tables

#### `products`
```sql
CREATE TABLE products (
  id UUID PRIMARY KEY,
  barcode TEXT NOT NULL,
  name TEXT NOT NULL,
  category TEXT,
  initial_stock INTEGER,
  created_at TIMESTAMP
);
```

**Indexes:**
- `idx_products_barcode` on barcode (fast lookup)

---

#### `teams`
```sql
CREATE TABLE teams (
  id UUID PRIMARY KEY,
  team_name TEXT NOT NULL UNIQUE,
  created_at TIMESTAMP
);
```

---

#### `stock_counts`
```sql
CREATE TABLE stock_counts (
  id UUID PRIMARY KEY,
  product_id UUID NOT NULL REFERENCES products(id),
  team_id UUID NOT NULL REFERENCES teams(id),
  location TEXT NOT NULL CHECK (location IN ('TOKO', 'GUDANG')),
  qty INTEGER NOT NULL,
  created_at TIMESTAMP
);
```

**Indexes:**
- `idx_stock_counts_product` on product_id
- `idx_stock_counts_team` on team_id

---

#### `stock_summary` (VIEW)
```sql
CREATE VIEW stock_summary AS
SELECT 
  p.id,
  p.barcode,
  p.name,
  p.category,
  p.initial_stock,
  COALESCE(SUM(CASE WHEN sc.location = 'TOKO' THEN sc.qty ELSE 0 END), 0) as stok_toko,
  COALESCE(SUM(CASE WHEN sc.location = 'GUDANG' THEN sc.qty ELSE 0 END), 0) as stok_gudang,
  (COALESCE(...) - p.initial_stock) as selisih
FROM products p
LEFT JOIN stock_counts sc ON p.id = sc.product_id
GROUP BY p.id;
```

---

## Component Props & Events

### OpnamePanel.vue
**No props/emits - Standalone component**

**Features:**
- Search input (auto-focus)
- Product list display
- Quick stats
- Product selection trigger

---

### InputModal.vue
**Props:** None (uses UIStore)

**Behavior:**
- Auto-focus on qty input
- Enter to save
- Esc to cancel
- Auto-save to database

---

### DuplicateModal.vue
**Props:** None (uses UIStore)

**Behavior:**
- Shows duplicate products with same barcode
- Click to select one
- Proceeds to InputModal

---

### RecapPanel.vue
**No props/emits**

**Features:**
- Real-time recap table
- Filter by team/location
- Stats cards
- Excel export

---

### ImportPanel.vue
**No props/emits**

**Features:**
- File upload/drag-drop
- Excel preview
- Batch import
- Error handling

---

## Real-time Subscriptions

Supabase Realtime is configured but not fully implemented. To enable:

```js
// In api.js
const subscription = supabase
  .on('postgres_changes', 
    { event: 'INSERT', schema: 'public', table: 'stock_counts' },
    (payload) => {
      stockCountStore.addCount(payload.new)
    }
  )
  .subscribe()

// Cleanup
subscription.unsubscribe()
```

---

## Error Handling

All API calls include try-catch:

```js
try {
  const result = await addStockCount(...)
  // Success
} catch (error) {
  console.error('Error:', error)
  // Show user-friendly message
}
```

---

## Performance Tips

### Search Optimization
- Products cached in Pinia on login (0 network calls)
- Filter done locally (JavaScript filter array)
- Target: <0.1s for 5000 items

### Database Optimization
- Index on `barcode` for fast duplicate detection
- Index on `product_id` for aggregations
- View `stock_summary` pre-computed in database

### UI Optimization
- Isolated input modal (single product focus)
- Virtual scrolling for large lists (optional future enhancement)
- Lazy-loaded components

---

## Testing API Calls

### Test loadProducts
```js
import { loadAllProducts } from '@/services/api'
const products = await loadAllProducts()
console.log(products.length) // Should be 5000+
```

### Test addStockCount
```js
import { addStockCount } from '@/services/api'
const result = await addStockCount(
  '550e8400-e29b-41d4-a716-446655440000',
  '550e8400-e29b-41d4-a716-446655440001',
  'TOKO',
  100
)
console.log(result.id) // UUID of new entry
```

### Test Excel Export
```js
import { exportToExcel } from '@/services/excelService'
exportToExcel([
  { Barcode: 'TEST', Name: 'Test Product', qty: 100 },
], 'test.xlsx')
// Downloads file
```

---

**📚 End of API Documentation**
