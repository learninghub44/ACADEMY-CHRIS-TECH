// ChrisTech Academy - Supabase Client Initialization

let supabaseClient = null;

function initSupabase() {
  if (supabaseClient) return supabaseClient;

  if (!CONFIG.SUPABASE_URL || CONFIG.SUPABASE_URL === 'YOUR_SUPABASE_URL') {
    console.error('Supabase URL not configured. Please update js/config.js');
    return null;
  }

  if (!CONFIG.SUPABASE_ANON_KEY || CONFIG.SUPABASE_ANON_KEY === 'YOUR_SUPABASE_ANON_KEY') {
    console.error('Supabase Anon Key not configured. Please update js/config.js');
    return null;
  }

  supabaseClient = supabase.createClient(CONFIG.SUPABASE_URL, CONFIG.SUPABASE_ANON_KEY);
  return supabaseClient;
}

function getSupabase() {
  if (!supabaseClient) {
    initSupabase();
  }
  return supabaseClient;
}

// Auth helpers
const auth = {
  async signUp(email, password, metadata = {}) {
    const client = getSupabase();
    if (!client) throw new Error('Supabase not configured');

    const { data, error } = await client.auth.signUp({
      email,
      password,
      options: { data: metadata }
    });

    if (error) throw error;
    return data;
  },

  async signIn(email, password) {
    const client = getSupabase();
    if (!client) throw new Error('Supabase not configured');

    const { data, error } = await client.auth.signInWithPassword({
      email,
      password
    });

    if (error) throw error;
    return data;
  },

  async signOut() {
    const client = getSupabase();
    if (!client) throw new Error('Supabase not configured');

    const { error } = await client.auth.signOut();
    if (error) throw error;
  },

  async resetPassword(email) {
    const client = getSupabase();
    if (!client) throw new Error('Supabase not configured');

    const { data, error } = await client.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password.html`
    });

    if (error) throw error;
    return data;
  },

  async getSession() {
    const client = getSupabase();
    if (!client) return null;

    const { data: { session }, error } = await client.auth.getSession();
    if (error) throw error;
    return session;
  },

  async getUser() {
    const client = getSupabase();
    if (!client) return null;

    const { data: { user }, error } = await client.auth.getUser();
    if (error) throw error;
    return user;
  },

  onAuthStateChange(callback) {
    const client = getSupabase();
    if (!client) return null;

    return client.auth.onAuthStateChange(callback);
  }
};

// Database helpers
const db = {
  async select(table, filters = {}, options = {}) {
    const client = getSupabase();
    if (!client) throw new Error('Supabase not configured');

    let query = client.from(table).select(options.select || '*');

    // Apply filters
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        query = query.eq(key, value);
      }
    });

    // Apply ordering
    if (options.order) {
      query = query.order(options.order.column, { ascending: options.order.ascending ?? false });
    }

    // Apply pagination
    if (options.from !== undefined && options.to !== undefined) {
      query = query.range(options.from, options.to);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data;
  },

  async selectSingle(table, filters = {}) {
    const client = getSupabase();
    if (!client) throw new Error('Supabase not configured');

    let query = client.from(table).select('*');

    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        query = query.eq(key, value);
      }
    });

    const { data, error } = await query.single();
    if (error) throw error;
    return data;
  },

  async insert(table, record) {
    const client = getSupabase();
    if (!client) throw new Error('Supabase not configured');

    const { data, error } = await client.from(table).insert(record).select();
    if (error) throw error;
    return data[0];
  },

  async update(table, filters, updates) {
    const client = getSupabase();
    if (!client) throw new Error('Supabase not configured');

    let query = client.from(table).update(updates);

    Object.entries(filters).forEach(([key, value]) => {
      query = query.eq(key, value);
    });

    const { data, error } = await query.select();
    if (error) throw error;
    return data;
  },

  async delete(table, filters) {
    const client = getSupabase();
    if (!client) throw new Error('Supabase not configured');

    let query = client.from(table).delete();

    Object.entries(filters).forEach(([key, value]) => {
      query = query.eq(key, value);
    });

    const { error } = await query;
    if (error) throw error;
  },

  async rpc(functionName, params = {}) {
    const client = getSupabase();
    if (!client) throw new Error('Supabase not configured');

    const { data, error } = await client.rpc(functionName, params);
    if (error) throw error;
    return data;
  }
};

// Storage helpers
const storage = {
  async upload(bucket, path, file, options = {}) {
    const client = getSupabase();
    if (!client) throw new Error('Supabase not configured');

    const { data, error } = await client.storage
      .from(bucket)
      .upload(path, file, options);

    if (error) throw error;
    return data;
  },

  async getPublicUrl(bucket, path) {
    const client = getSupabase();
    if (!client) throw new Error('Supabase not configured');

    const { data } = client.storage
      .from(bucket)
      .getPublicUrl(path);

    return data.publicUrl;
  },

  async createSignedUrl(bucket, path, expiresIn = 3600) {
    const client = getSupabase();
    if (!client) throw new Error('Supabase not configured');

    const { data, error } = await client.storage
      .from(bucket)
      .createSignedUrl(path, expiresIn);

    if (error) throw error;
    return data.signedUrl;
  },

  async remove(bucket, paths) {
    const client = getSupabase();
    if (!client) throw new Error('Supabase not configured');

    const { data, error } = await client.storage
      .from(bucket)
      .remove(paths);

    if (error) throw error;
    return data;
  }
};
