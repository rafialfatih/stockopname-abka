import * as XLSX from 'xlsx'

export const parseExcelFile = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    
    reader.onload = (event) => {
      try {
        const workbook = XLSX.read(event.target.result, { type: 'array' })
        const worksheet = workbook.Sheets[workbook.SheetNames[0]]
        const data = XLSX.utils.sheet_to_json(worksheet, { defval: '' })
        
        // Get headers to detect column mapping
        const headers = Object.keys(data[0] || {})
        
        // Flexible column mapping - try different variations
        const findColumn = (names) => {
          for (let i = 0; i < headers.length; i++) {
            const header = headers[i].toLowerCase().trim()
            if (names.some(name => header.includes(name.toLowerCase()))) {
              return headers[i]
            }
          }
          return names[0] // fallback to first option
        }
        
        const barcodeCol = findColumn(['barcode', 'kode', 'sku'])
        const nameCol = findColumn(['nama barang', 'nama', 'produk', 'item'])
        const categoryCol = findColumn(['kategori', 'category', 'jenis'])
        const stockCol = findColumn(['stok awal', 'stok', 'initial'])
        const costCol = findColumn(['harga beli', 'cost', 'harga', 'price'])
        
        // Map columns
        const products = data
          .filter(row => row[barcodeCol] || row[nameCol]) // Filter empty rows
          .map(row => ({
            barcode: (row[barcodeCol] || '').toString().trim(),
            name: (row[nameCol] || '').toString().trim(),
            category: (row[categoryCol] || '').toString().trim(),
            initial_stock: parseInt(row[stockCol] || 0) || 0,
            cost: parseInt(row[costCol] || 0) || 0
          }))
          .filter(p => p.barcode || p.name) // Remove completely empty rows
        
        if (products.length === 0) {
          throw new Error('File tidak mengandung data produk. Pastikan format kolom benar.')
        }
        
        resolve(products)
      } catch (error) {
        reject(new Error('Gagal membaca file Excel: ' + error.message))
      }
    }
    
    reader.onerror = () => {
      reject(new Error('Gagal membaca file'))
    }
    
    reader.readAsArrayBuffer(file)
  })
}

export const exportToExcel = (data, filename = 'stock_opname.xlsx', dashboardData = null) => {
  const workbook = XLSX.utils.book_new()
  
  // Main data sheet
  const worksheet = XLSX.utils.json_to_sheet(data)
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Stock Opname')
  
  // Style columns for main sheet
  worksheet['!cols'] = [
    { wch: 12 }, // Barcode
    { wch: 25 }, // Nama Barang
    { wch: 15 }, // Kategori
    { wch: 12 }, // Stok Awal
    { wch: 10 }, // Stok Toko
    { wch: 10 }, // Stok Gudang
    { wch: 10 }, // Selisih
    { wch: 12 }, // Status
    { wch: 15 }, // Harga Beli
    { wch: 18 }  // Persediaan Barang Dagang
  ]
  
  // Add dashboard sheet if data provided
  if (dashboardData) {
    const dashboardWorksheet = XLSX.utils.json_to_sheet(dashboardData)
    XLSX.utils.book_append_sheet(workbook, dashboardWorksheet, 'Dashboard')
    
    // Style dashboard sheet
    dashboardWorksheet['!cols'] = [
      { wch: 25 },
      { wch: 20 }
    ]
  }
  
  XLSX.writeFile(workbook, filename)
}
