import supabase from './supabaseClient'
import { useProductStore } from '../stores/productStore'
import { useTeamStore } from '../stores/teamStore'

export const loadAllProducts = async () => {
  try {
    // Check if we have cached data in localStorage
    const cachedData = localStorage.getItem('cached_products')
    if (cachedData) {
      const products = JSON.parse(cachedData)
      const productStore = useProductStore()
      productStore.loadProducts(products)
      return products
    }

    // Fetch all products with pagination (1000 at a time)
    let allProducts = []
    let page = 0
    const pageSize = 1000
    let hasMore = true

    while (hasMore) {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .range(page * pageSize, (page + 1) * pageSize - 1)
      
      if (error) throw error
      
      if (!data || data.length === 0) {
        hasMore = false
      } else {
        allProducts = [...allProducts, ...data]
        page++
      }
    }
    
    const productStore = useProductStore()
    productStore.loadProducts(allProducts)
    
    // Cache in localStorage
    localStorage.setItem('cached_products', JSON.stringify(allProducts))
    
    return allProducts
  } catch (error) {
    // Try to load from cache if fetch fails
    const cachedData = localStorage.getItem('cached_products')
    if (cachedData) {
      const products = JSON.parse(cachedData)
      const productStore = useProductStore()
      productStore.loadProducts(products)
      return products
    }
    return []
  }
}

export const loadTeams = async () => {
  try {
    const { data, error } = await supabase
      .from('teams')
      .select('*')
    
    if (error) throw error
    
    const teamStore = useTeamStore()
    teamStore.loadTeams(data || [])
    
    return data || []
  } catch (error) {
    return []
  }
}

export const addStockCount = async (productId, teamId, location, qty) => {
  try {
    const { data, error } = await supabase
      .from('stock_counts')
      .insert([{
        product_id: productId,
        team_id: teamId,
        location: location,
        qty: qty
      }])
      .select()
    
    if (error) throw error
    return data?.[0] || null
  } catch (error) {
    throw error
  }
}

export const getStockSummary = async () => {
  try {
    const { data, error } = await supabase
      .from('stock_summary')
      .select('*')
    
    if (error) throw error
    return data || []
  } catch (error) {
    return null
  }
}

export const loadAllStockCounts = async () => {
  try {
    const { data, error } = await supabase
      .from('stock_counts')
      .select('*')
      .order('created_at', { ascending: false })
    
    if (error) throw error
    return data || []
  } catch (error) {
    return []
  }
}

export const subscribeToStockCounts = (callback) => {
  const subscription = supabase
    .channel('stock_counts_realtime')
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'stock_counts'
      },
      (payload) => {
        callback(payload)
      }
    )
    .subscribe()
  
  return subscription
}

// Polling function - lebih stabil dan traditional
export const startPollingStockCounts = (callback, intervalMs = 3000) => {
  let isRunning = true
  
  const poll = async () => {
    while (isRunning) {
      try {
        const data = await loadAllStockCounts()
        callback(data)
      } catch (error) {
        // Silent error handling for polling
      }
      await new Promise(resolve => setTimeout(resolve, intervalMs))
    }
  }
  
  poll()
  
  // Return stop function
  return () => {
    isRunning = false
  }
}

export const clearCache = () => {
  localStorage.removeItem('cached_products')
  localStorage.removeItem('stock_counts_session')
}

export const getStockCountsHistory = async () => {
  try {
    const { data, error } = await supabase
      .from('stock_counts')
      .select(`
        id,
        qty,
        location,
        created_at,
        products(id, name, barcode),
        teams(id, team_name)
      `)
      .order('created_at', { ascending: false })
    
    if (error) throw error
    
    return data || []
  } catch (error) {
    return []
  }
}

export const updateStockCount = async (id, newQty) => {
  try {
    const { data, error } = await supabase
      .from('stock_counts')
      .update({ qty: newQty })
      .eq('id', id)
      .select()
    
    if (error) throw error
    return data?.[0] || null
  } catch (error) {
    throw error
  }
}

export const deleteStockCount = async (id) => {
  try {
    const { error } = await supabase
      .from('stock_counts')
      .delete()
      .eq('id', id)
    
    if (error) throw error
    return true
  } catch (error) {
    throw error
  }
}
