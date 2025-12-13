import { supabase } from "@/integrations/supabase/client";

export interface College {
  id: string;
  name: string;
  city: string;
  type: string;
}

export interface AddCollegeResponse {
  success: boolean;
  message: string;
  college?: College;
}

/**
 * Fetch all colleges from database
 */
export async function fetchColleges(): Promise<College[]> {
  const { data, error } = await supabase
    .from('colleges' as any)
    .select('id, name, city, type')
    .order('name');

  if (error) {
    console.error('Error fetching colleges:', error);
    return [];
  }

  return (data || []) as unknown as College[];
}

/**
 * Add a new college to the database
 */
export async function addCollege(
  name: string,
  city: string,
  type: string = 'Other'
): Promise<AddCollegeResponse> {
  try {
    const { data, error } = await (supabase.rpc as any)('add_college', {
      p_name: name.trim(),
      p_city: city.trim(),
      p_type: type
    }) as { data: College[] | null; error: any };

    if (error) {
      // Check if it's a duplicate
      if (error.message.includes('duplicate') || error.code === '23505') {
        return {
          success: false,
          message: 'This college already exists in the database.'
        };
      }
      
      console.error('Error adding college:', error);
      return {
        success: false,
        message: error.message || 'Failed to add college'
      };
    }

    if (data && data.length > 0) {
      return {
        success: true,
        message: 'College added successfully!',
        college: data[0]
      };
    }

    return {
      success: false,
      message: 'Failed to add college'
    };
  } catch (error: any) {
    console.error('Error adding college:', error);
    return {
      success: false,
      message: error.message || 'An unexpected error occurred'
    };
  }
}

/**
 * Search colleges by name
 */
export async function searchColleges(searchTerm: string): Promise<College[]> {
  if (!searchTerm.trim()) {
    return fetchColleges();
  }

  const { data, error } = await supabase
    .from('colleges' as any)
    .select('id, name, city, type')
    .or(`name.ilike.%${searchTerm}%,city.ilike.%${searchTerm}%,type.ilike.%${searchTerm}%`)
    .order('name')
    .limit(50);

  if (error) {
    console.error('Error searching colleges:', error);
    return [];
  }

  return (data || []) as unknown as College[];
}
