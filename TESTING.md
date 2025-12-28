# 🧪 TESTING GUIDE - Stock Opname Turbo

## Quick Test Checklist

Use this after setup to verify everything works.

---

## ✅ Phase 1: Environment & Setup (5 min)

### Test: Dependencies Installed
```bash
pnpm list
# Should show: vue, pinia, @supabase/supabase-js, tailwindcss, xlsx
```
**Expected:** No errors, all packages listed

---

### Test: Environment Variables
```bash
cat .env.local
# Should show your Supabase URL and key
```
**Expected:** 
```env
VITE_SUPABASE_URL=https://xxxx.supabase.co
VITE_SUPABASE_KEY=your-key-here
```

---

### Test: Dev Server Starts
```bash
pnpm dev
```
**Expected:** 
- No errors in console
- Browser opens to http://localhost:5173
- Loading spinner then app appears

---

## ✅ Phase 2: Database Setup (5 min)

### Test: Supabase Connection
In browser console:
```js
import supabase from './src/services/supabaseClient'
supabase.auth.getSession().then(console.log)
```
**Expected:** No errors, session object returned

---

### Test: Products Table Populated
Go to Supabase Dashboard → Products table
**Expected:** 
- At least 5 products visible
- Columns: id, barcode, name, category, initial_stock, created_at

---

### Test: Teams Table Populated
**Expected:** 
- At least 3 teams (Tim A, Tim B, Tim C)

---

## ✅ Phase 3: Login & Navigation (2 min)

### Test: Login Page Loads
**Expected:**
- See title "Stock Opname Turbo"
- Team dropdown with teams listed
- Location toggle (TOKO / GUDANG)
- "Mulai Opname" button

---

### Test: Successful Login
1. Select "Tim A"
2. Select "TOKO"
3. Click "Mulai Opname"

**Expected:**
- Products loaded from database
- See dashboard with search bar
- See "Opname", "Rekapitulasi", "Import Excel" tabs
- Stats cards showing progress

---

## ✅ Phase 4: Search & Input (5 min)

### Test: Search Products
Type "BAR001" in search box

**Expected:**
- Results appear instantly (<0.1s)
- Product card shows: Barcode, Name, Category, Initial Stock
- Results update as you type

---

### Test: Search by Name
Type "Produk" in search box

**Expected:**
- Returns all products with "Produk" in name
- Shows filtered count in header

---

### Test: Click Product
Click on "Produk A" from results

**Expected:**
- Modal opens (InputModal)
- Shows: Barcode, Name, Category, Initial Stock
- Qty input field has focus (cursor visible)

---

### Test: Input Quantity
1. Type "95"
2. Press Enter

**Expected:**
- Modal closes
- Data saved to database
- Search bar refocuses
- Stats updated (counted +1)
- Can see entry in browser console (if DevTools open)

---

### Test: Multiple Products Same Barcode (if exist)
1. Create duplicate barcode in database
2. Search and click that product

**Expected:**
- DuplicateModal shows both products
- Can select which one to count
- Proceeds to input after selection

---

## ✅ Phase 5: Recap & Export (3 min)

### Test: Recap Tab Shows Data
Click "Rekapitulasi" tab

**Expected:**
- Table shows all counted items
- Columns: Barcode, Nama, Kategori, Stok Awal, Stok Toko, Stok Gudang, Selisih
- Stats cards show totals
- Color-coded discrepancies (Red/Green)

---

### Test: Excel Export
Click "Export Excel" button

**Expected:**
- File downloads: `stock_opname_YYYY-MM-DD.xlsx`
- Open in Excel to verify formatting
- Contains: Barcode, Nama Barang, Kategori, Stok Awal, Stok Toko, Stok Gudang, Selisih

---

## ✅ Phase 6: Excel Import (3 min)

### Test: Create Sample Excel File
1. Open Excel
2. Create sheet with:
   ```
   Barcode          | Nama Barang  | Kategori    | Stok Awal
   BAR101           | Test Prod 1  | Test Cat    | 500
   BAR102           | Test Prod 2  | Test Cat    | 300
   ```
3. Save as `test.xlsx`

---

### Test: Import Tab
Click "Import Excel" tab

**Expected:**
- Upload area shows drag-drop zone
- Instructions visible
- Emoji icons present

---

### Test: Upload File
Drag `test.xlsx` to upload area

**Expected:**
- Preview shows 2 rows
- Table displays imported data
- "Siap untuk di-import" message
- Import button enabled

---

### Test: Execute Import
Click "Import ke Database"

**Expected:**
- Loading spinner briefly
- Success message: "✅ X produk berhasil diimpor!"
- New products appear in search

---

## ✅ Phase 7: UI/UX Features (3 min)

### Test: Color Scheme
Navigate around app

**Expected:**
- Sky blue primary colors
- Green for positive/success
- Red for negative
- Pastel pink and yellow accents
- Rounded corners (rounded-xl) on all elements
- Smooth transitions when hovering

---

### Test: Responsive Design
Resize browser window

**Expected:**
- App remains functional at:
  - Mobile: 375px wide
  - Tablet: 768px wide
  - Desktop: 1920px wide
- No horizontal scroll
- Buttons remain clickable

---

### Test: Keyboard Navigation
Use only keyboard (no mouse):
1. Tab through elements
2. Use Enter to select
3. Use Esc to cancel

**Expected:**
- All buttons reachable via Tab
- Enter activates focused button
- Esc cancels modals

---

### Test: Focus States
Hover over buttons

**Expected:**
- Clear hover state change
- Shadow effect appears
- Color changes slightly
- Scale up slightly (transform)

---

## ✅ Phase 8: Performance Tests (2 min)

### Test: Search Speed
Press F12 to open DevTools → Performance tab

1. Search for "BAR"
2. Check performance timeline

**Expected:**
- Search completes in <100ms
- No network requests during search
- Smooth scrolling of results

---

### Test: Page Load Time
1. Hard refresh (Ctrl+Shift+R)
2. Check Network tab

**Expected:**
- index.html loads first
- Total page load <2 seconds
- No failed requests
- Gzip compression active

---

### Test: Memory Usage
1. Open DevTools → Memory tab
2. Take heap snapshot before and after searching

**Expected:**
- Heap size reasonable (~10-50 MB)
- No memory leaks
- Products remain in RAM after loaded

---

## ✅ Phase 9: Data Integrity (2 min)

### Test: Duplicate Count Prevention
1. Count same product twice with different qty
2. Check recap

**Expected:**
- Both entries recorded separately
- Totals correct (sum both counts)
- Each has own timestamp

---

### Test: Location Tracking
1. Logout (click Logout button)
2. Login as GUDANG location
3. Count some products
4. Logout, login as TOKO location
5. Count different products

Go to Recap

**Expected:**
- Stok Toko and Stok Gudang separated correctly
- Totals calculated per location

---

### Test: Data Persistence
1. Count some products
2. Refresh page (F5)
3. Login again

**Expected:**
- Previous counts still visible
- Data persisted to database
- Stats updated correctly

---

## ✅ Phase 10: Error Handling (2 min)

### Test: Invalid Data
Try to import Excel with:
- Empty cells
- Non-numeric stock
- Duplicate barcodes

**Expected:**
- App handles gracefully
- Error message shown
- Doesn't crash

---

### Test: Network Error
1. Go offline (DevTools → Network tab → Offline)
2. Try to save count
3. Go online again

**Expected:**
- App shows error or loading state
- No data loss
- Can retry when online

---

### Test: Invalid Supabase Key
1. Edit `.env.local` with fake key
2. Restart dev server
3. Try to login and use app

**Expected:**
- Error message appears
- Doesn't crash
- Clear indication something is wrong

---

## 📊 Test Results Template

Use this to document your testing:

```markdown
# Test Results - [Date]

## Environment
- [ ] Dependencies installed
- [ ] Env variables set
- [ ] Dev server running

## Database
- [ ] Supabase connected
- [ ] Products loaded
- [ ] Teams loaded

## Login & Navigation
- [ ] Login page loads
- [ ] Can login successfully
- [ ] Dashboard appears

## Search & Input
- [ ] Search works instantly
- [ ] Product selection works
- [ ] Input modal appears
- [ ] Data saves to database

## Recap & Export
- [ ] Recap tab shows data
- [ ] Export creates Excel file
- [ ] Discrepancies calculated

## Import
- [ ] Import tab loads
- [ ] Can upload Excel file
- [ ] Preview shows data
- [ ] Import to database works

## UI/UX
- [ ] Colors display correctly
- [ ] Responsive on mobile
- [ ] Keyboard navigation works
- [ ] Transitions smooth

## Performance
- [ ] Search <0.1s
- [ ] Page load <2s
- [ ] No memory leaks

## Data Integrity
- [ ] Duplicates tracked
- [ ] Locations separated
- [ ] Data persists

## Error Handling
- [ ] Graceful error display
- [ ] Network errors handled
- [ ] Invalid data rejected

## Overall Result
- [ ] **PASS** - All tests passed
- [ ] **FAIL** - Issues found (list below)

### Issues Found
1. ...
2. ...
```

---

## 🐛 Common Issues & Fixes

| Issue | Cause | Fix |
|-------|-------|-----|
| **Blank page after login** | Products not loading | Check Supabase connection & products table |
| **Search is slow** | Network latency | Verify products loaded to Pinia store |
| **Import doesn't work** | Wrong column names | Use exact headers: Barcode, Nama Barang, Kategori, Stok Awal |
| **Duplicate button doesn't appear** | Only one product with that barcode | Create duplicate in database to test |
| **Export file is empty** | No counts recorded yet | Count some products first |
| **Env variables not loading** | Restart needed | Run `pnpm dev` again after editing .env.local |

---

## 📱 Browser Compatibility Test

Test on these browsers:

| Browser | Version | Expected |
|---------|---------|----------|
| Chrome | Latest | ✅ Full support |
| Firefox | Latest | ✅ Full support |
| Safari | Latest | ✅ Full support |
| Edge | Latest | ✅ Full support |
| Mobile Safari | iOS 14+ | ✅ Responsive |
| Chrome Mobile | Latest | ✅ Responsive |

---

## ⏱️ Performance Benchmarks

Run this in browser console after login:

```js
console.time('search')
productStore.setSearchQuery('BAR')
console.timeEnd('search')
// Should show: search: 0.XXms
```

**Expected Results:**
- Search with 5000 items: <100ms
- Filter 100 results: <10ms
- Input lag: <50ms
- Export generation: <500ms

---

## 🎬 Full Workflow Test (End-to-End)

Complete workflow taking ~5 minutes:

1. ✅ Login
2. ✅ Search for product
3. ✅ Input quantity
4. ✅ Repeat 5 times
5. ✅ View recap
6. ✅ Export to Excel
7. ✅ Logout

**Success Criteria:**
- All steps complete without errors
- Data visible in all places
- No console errors
- Performance is snappy

---

**Happy Testing! 🧪✨**
