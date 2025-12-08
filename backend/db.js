// db.js
const { createClient } = require('@supabase/supabase-js');
const bcrypt = require('bcryptjs');

// Supabase configuration
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

// For backward compatibility with existing code
const query = async (text, params) => {
  console.warn('Using legacy query method. Consider updating to direct Supabase calls.');
  
  try {
    // Simple mapping for common queries (you might need to extend this)
    if (text.startsWith('SELECT')) {
      const tableMatch = text.match(/FROM\s+(\w+)/i);
      if (tableMatch) {
        const table = tableMatch[1];
        const { data, error } = await supabase.from(table).select('*');
        if (error) throw error;
        return { rows: data, rowCount: data.length };
      }
    }
    
    // Handle INSERT queries
    if (text.startsWith('INSERT')) {
      const tableMatch = text.match(/INSERT\s+INTO\s+(\w+)/i);
      if (tableMatch) {
        const table = tableMatch[1];
        // Extract values from params
        const insertData = {};
        // This is a simplified approach - you might need to adjust based on your query structure
        const { data, error } = await supabase.from(table).insert([params]).select();
        if (error) throw error;
        return { rows: data, rowCount: data.length };
      }
    }
    
    return { rows: [], rowCount: 0 };
  } catch (error) {
    throw error;
  }
};

module.exports = {
  client: supabase,
  bcrypt,
  query,
  supabase
};