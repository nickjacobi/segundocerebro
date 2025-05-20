import { supabase } from '@/lib/supabaseClient';

export const fetchDocumentsFromSupabase = async () => {
  const { data, error } = await supabase
    .from('documents')
    .select('*')
    .order('updated_at', { ascending: false });

  if (error) {
    console.error('Error fetching documents from Supabase:', error);
    throw error;
  }
  return data || [];
};

export const createDocumentInSupabase = async (documentData) => {
  const { data, error } = await supabase
    .from('documents')
    .insert(documentData)
    .select()
    .single();

  if (error) {
    console.error('Error creating document in Supabase:', error);
    throw error;
  }
  return data;
};

export const updateDocumentInSupabase = async (id, documentData) => {
  const { data, error } = await supabase
    .from('documents')
    .update({ ...documentData, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Error updating document in Supabase:', error);
    throw error;
  }
  return data;
};

export const deleteDocumentFromSupabase = async (id) => {
  const { error } = await supabase
    .from('documents')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting document from Supabase:', error);
    throw error;
  }
};