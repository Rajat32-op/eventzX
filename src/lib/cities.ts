import { supabase } from "@/integrations/supabase/client";

export interface City {
  id: string;
  name: string;
}

/**
 * Fetch all cities from the database
 */
export async function fetchCities(): Promise<City[]> {
  try {
    const { data, error } = await (supabase as any)
      .from('cities')
      .select('id, name')
      .order('name', { ascending: true });

    if (error) {
      console.error('Error fetching cities:', error);
      return [];
    }

    return (data as City[]) || [];
  } catch (error) {
    console.error('Error fetching cities:', error);
    return [];
  }
}

/**
 * Add a new city to the database
 */
export async function addCity(name: string): Promise<City | null> {
  try {
    const { data, error } = await (supabase.rpc as any)('add_city', {
      p_name: name.trim()
    }) as { data: City[] | null; error: any };

    if (error) {
      console.error('Error adding city:', error);
      return null;
    }

    if (data && data.length > 0) {
      return data[0];
    }

    return null;
  } catch (error) {
    console.error('Error adding city:', error);
    return null;
  }
}

/**
 * Search cities by name (case-insensitive)
 */
export async function searchCities(query: string): Promise<City[]> {
  if (!query.trim()) {
    return fetchCities();
  }

  try {
    const { data, error } = await (supabase as any)
      .from('cities')
      .select('id, name')
      .ilike('name', `%${query.trim()}%`)
      .order('name', { ascending: true })
      .limit(20);

    if (error) {
      console.error('Error searching cities:', error);
      return [];
    }

    return (data as City[]) || [];
  } catch (error) {
    console.error('Error searching cities:', error);
    return [];
  }
}
