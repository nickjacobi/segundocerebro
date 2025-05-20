import { useState, useEffect, useCallback } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { 
  fetchDocumentsFromSupabase, 
  createDocumentInSupabase, 
  updateDocumentInSupabase, 
  deleteDocumentFromSupabase 
} from '@/services/documentService';

export const useDocuments = () => {
  const { toast } = useToast();
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchDocuments = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchDocumentsFromSupabase();
      setDocuments(data);
    } catch (err) {
      setError('Não foi possível carregar os documentos.');
      toast({
        title: 'Erro ao carregar documentos',
        description: err.message || 'Ocorreu um erro desconhecido.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchDocuments();
  }, [fetchDocuments]);

  const createNewDocument = async () => {
    const newDocumentData = {
      title: 'Novo Documento',
      content: '<p><br></p>',
    };
    try {
      const data = await createDocumentInSupabase(newDocumentData);
      setDocuments(prevDocs => [data, ...prevDocs]);
      toast({
        title: 'Documento criado',
        description: 'Um novo documento foi criado com sucesso.',
      });
      return data; 
    } catch (err) {
      toast({
        title: 'Erro ao criar documento',
        description: err.message || 'Não foi possível criar o documento.',
        variant: 'destructive',
      });
      return null;
    }
  };

  const updateDocument = async (updatedDocData, showToast = false) => {
    const { id, title, content } = updatedDocData;
    try {
      const data = await updateDocumentInSupabase(id, { title, content });
      setDocuments(prevDocs => 
        prevDocs.map(doc => (doc.id === data.id ? data : doc))
      );
      if (showToast) {
        toast({
          title: 'Documento salvo',
          description: 'As alterações foram salvas com sucesso no servidor.',
        });
      }
      return data;
    } catch (err) {
      toast({
        title: 'Erro ao salvar documento',
        description: err.message || 'Não foi possível salvar as alterações.',
        variant: 'destructive',
      });
      return null;
    }
  };

  const deleteDocument = async (id) => {
    try {
      await deleteDocumentFromSupabase(id);
      setDocuments(prevDocs => prevDocs.filter(doc => doc.id !== id));
      toast({
        title: 'Documento excluído',
        description: 'O documento foi excluído permanentemente do servidor.',
      });
      return true;
    } catch (err) {
      toast({
        title: 'Erro ao excluir documento',
        description: err.message || 'Não foi possível excluir o documento.',
        variant: 'destructive',
      });
      return false;
    }
  };

  return {
    documents,
    loading,
    error,
    fetchDocuments,
    createNewDocument,
    updateDocument,
    deleteDocument,
    setDocuments
  };
};