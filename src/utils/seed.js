// Database initialization helper
// Use this if you want to seed the database programmatically

export const seedDatabase = async (supabase) => {
  try {
    // Seed teams
    const { data: teams, error: teamsError } = await supabase
      .from('teams')
      .insert([
        { team_name: 'Tim Audit A' },
        { team_name: 'Tim Audit B' },
        { team_name: 'Tim Audit C' },
        { team_name: 'Tim Audit D' },
      ])
      .select()

    if (teamsError) throw teamsError

    // Seed sample products
    const sampleProducts = Array.from({ length: 50 }, (_, i) => ({
      barcode: `SKU${String(i + 1).padStart(5, '0')}`,
      name: `Produk ${i + 1}`,
      category: `Kategori ${(i % 5) + 1}`,
      initial_stock: Math.floor(Math.random() * 500) + 50,
    }))

    const { error: productsError } = await supabase
      .from('products')
      .insert(sampleProducts)

    if (productsError) throw productsError

    return { teams, success: true }
  } catch (error) {
    return { error, success: false }
  }
}
