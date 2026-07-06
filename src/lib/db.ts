import { supabase } from './supabase';
import { Contact, Property, Deal, Activity, Settings } from '@/types';

// --- SETTINGS ---
export async function fetchSettings(): Promise<Settings | null> {
  const { data, error } = await supabase
    .from('settings')
    .select('*')
    .limit(1)
    .maybeSingle();

  if (error) {
    console.error('Error fetching settings:', error);
    return null;
  }
  return data;
}

export async function saveSettings(settings: Omit<Settings, 'id'> & { id?: string }): Promise<Settings | null> {
  if (settings.id) {
    const { data, error } = await supabase
      .from('settings')
      .update(settings)
      .eq('id', settings.id)
      .select()
      .single();

    if (error) {
      console.error('Error updating settings:', error);
      throw error;
    }
    return data;
  } else {
    const { data, error } = await supabase
      .from('settings')
      .insert([settings])
      .select()
      .single();

    if (error) {
      console.error('Error inserting settings:', error);
      throw error;
    }
    return data;
  }
}

// --- CONTACTS ---
export async function fetchContacts(): Promise<Contact[]> {
  const { data, error } = await supabase
    .from('contacts')
    .select('*')
    .order('full_name', { ascending: true });

  if (error) {
    console.error('Error fetching contacts:', error);
    return [];
  }
  return data || [];
}

export async function checkContactDuplicate(phone?: string | null, email?: string | null): Promise<Contact | null> {
  if (!phone && !email) return null;
  
  let query = supabase.from('contacts').select('*');
  
  if (phone && email) {
    query = query.or(`phone.eq."${phone}",email.eq."${email}"`);
  } else if (phone) {
    query = query.eq('phone', phone);
  } else if (email) {
    query = query.eq('email', email);
  }

  const { data, error } = await query.limit(1).maybeSingle();
  if (error) {
    console.error('Error checking duplicate:', error);
    return null;
  }
  return data;
}

export async function createContact(contact: Omit<Contact, 'id' | 'created_at'>): Promise<Contact> {
  // Deduplicate before create:
  const duplicate = await checkContactDuplicate(contact.phone, contact.email);
  if (duplicate) {
    // If contact exists, update roles by adding any new ones, status, temperature, note
    const mergedRoles = Array.from(new Set([...duplicate.roles, ...contact.roles]));
    const updatedFields: Partial<Contact> = {
      roles: mergedRoles,
    };
    
    // Override status/temperature if provided and not empty
    if (contact.status) updatedFields.status = contact.status;
    if (contact.temperature) updatedFields.temperature = contact.temperature;
    if (contact.note) {
      updatedFields.note = duplicate.note 
        ? `${duplicate.note}\n[Aktualizace role]: ${contact.note}` 
        : contact.note;
    }
    
    const { data, error } = await supabase
      .from('contacts')
      .update(updatedFields)
      .eq('id', duplicate.id)
      .select()
      .single();

    if (error) {
      console.error('Error updating existing contact on duplicate:', error);
      throw error;
    }
    return data;
  }

  // Create new contact
  const { data, error } = await supabase
    .from('contacts')
    .insert([contact])
    .select()
    .single();

  if (error) {
    console.error('Error creating contact:', error);
    throw error;
  }
  return data;
}

export async function updateContact(id: string, contact: Partial<Contact>): Promise<Contact> {
  const { data, error } = await supabase
    .from('contacts')
    .update(contact)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Error updating contact:', error);
    throw error;
  }
  return data;
}

// --- PROPERTIES ---
export async function fetchProperties(): Promise<Property[]> {
  const { data, error } = await supabase
    .from('properties')
    .select('*, owner:contacts(*)')
    .order('address', { ascending: true });

  if (error) {
    console.error('Error fetching properties:', error);
    return [];
  }
  return data || [];
}

export async function createProperty(property: Omit<Property, 'id'>): Promise<Property> {
  const { data, error } = await supabase
    .from('properties')
    .insert([property])
    .select()
    .single();

  if (error) {
    console.error('Error creating property:', error);
    throw error;
  }
  return data;
}

export async function updateProperty(id: string, property: Partial<Property>): Promise<Property> {
  const { data, error } = await supabase
    .from('properties')
    .update(property)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Error updating property:', error);
    throw error;
  }
  return data;
}

export async function deleteProperty(id: string): Promise<void> {
  const { error } = await supabase
    .from('properties')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting property:', error);
    throw error;
  }
}

// --- DEALS ---
export async function fetchDeals(): Promise<Deal[]> {
  const { data, error } = await supabase
    .from('deals')
    .select('*, buyer:contacts(*), property:properties(*, owner:contacts(*))')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching deals:', error);
    return [];
  }
  return data || [];
}

export async function createDeal(deal: Omit<Deal, 'id' | 'created_at' | 'deal_name'>): Promise<Deal> {
  const { data, error } = await supabase
    .from('deals')
    .insert([deal])
    .select('*, buyer:contacts(*), property:properties(*)')
    .single();

  if (error) {
    console.error('Error creating deal:', error);
    throw error;
  }
  return data;
}

export async function updateDeal(id: string, deal: Partial<Deal>): Promise<Deal> {
  const { data, error } = await supabase
    .from('deals')
    .update(deal)
    .eq('id', id)
    .select('*, buyer:contacts(*), property:properties(*)')
    .single();

  if (error) {
    console.error('Error updating deal:', error);
    throw error;
  }
  return data;
}

// --- ACTIVITIES ---
export async function fetchActivities(): Promise<Activity[]> {
  const { data, error } = await supabase
    .from('activities')
    .select('*, contact:contacts(*), deal:deals(*)')
    .order('when', { ascending: false });

  if (error) {
    console.error('Error fetching activities:', error);
    return [];
  }
  return data || [];
}

export async function createActivity(activity: Omit<Activity, 'id'>): Promise<Activity> {
  const { data, error } = await supabase
    .from('activities')
    .insert([activity])
    .select('*, contact:contacts(*), deal:deals(*)')
    .single();

  if (error) {
    console.error('Error creating activity:', error);
    throw error;
  }
  return data;
}

export async function updateActivity(id: string, activity: Partial<Activity>): Promise<Activity> {
  const { data, error } = await supabase
    .from('activities')
    .update(activity)
    .eq('id', id)
    .select('*, contact:contacts(*), deal:deals(*)')
    .single();

  if (error) {
    console.error('Error updating activity:', error);
    throw error;
  }
  return data;
}
