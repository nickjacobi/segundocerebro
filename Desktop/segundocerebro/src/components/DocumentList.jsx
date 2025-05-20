import React from 'react';
import { motion } from 'framer-motion';
import { format, isValid, parseISO } from 'date-fns';
import { 
  FileText, 
  Plus, 
  Trash2, 
  Search,
  FolderOpen
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const DocumentList = ({ documents, onSelectDocument, onCreateDocument, onDeleteDocument }) => {
  const [searchTerm, setSearchTerm] = React.useState('');
  
  const filteredDocuments = documents.filter(doc => 
    doc.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatDate = (dateString) => {
    if (!dateString) return 'Data inválida';
    const date = parseISO(dateString);
    return isValid(date) ? format(date, 'dd/MM/yyyy HH:mm') : 'Data inválida';
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Seus documentos</h1>
        <Button onClick={onCreateDocument} className="flex items-center gap-2">
          <Plus size={16} />
          <span>Novo documento</span>
        </Button>
      </div>
      
      <div className="relative mb-6 max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <input
          type="text"
          placeholder="Buscar documentos..."
          className="w-full pl-10 py-2 pr-4 border rounded-md bg-card focus:outline-none focus:ring-2 focus:ring-primary"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>
      
      {filteredDocuments.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredDocuments.map(doc => (
            <motion.div
              key={doc.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="border bg-card rounded-lg overflow-hidden shadow-sm hover:shadow-lg transition-shadow document-card group"
            >
              <div 
                className="p-4 cursor-pointer h-full flex flex-col"
                onClick={() => onSelectDocument(doc)}
              >
                <div className="flex justify-between items-start mb-2">
                  <div className="flex items-center gap-2 overflow-hidden">
                    <FileText size={18} className="text-primary flex-shrink-0" />
                    <h3 className="font-medium truncate text-foreground">{doc.title}</h3>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteDocument(doc.id);
                    }}
                    className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive transition-opacity h-7 w-7"
                  >
                    <Trash2 size={14} />
                  </Button>
                </div>
                
                <div className="text-sm text-muted-foreground mb-2">
                  Atualizado em {formatDate(doc.updated_at)}
                </div>
                
                <div className="text-sm line-clamp-3 text-muted-foreground flex-1">
                  {doc.content ? (
                    <div dangerouslySetInnerHTML={{ 
                      __html: doc.content.replace(/<[^>]*>/g, ' ').substring(0, 150) + (doc.content.length > 150 ? '...' : '')
                    }} />
                  ) : (
                    <span className="italic">Documento vazio</span>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      ) : searchTerm ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <Search className="h-16 w-16 text-muted-foreground mb-4" />
          <h2 className="text-xl font-medium mb-2">Nenhum resultado encontrado</h2>
          <p className="text-muted-foreground max-w-md">
            Não encontramos documentos com "{searchTerm}". Tente buscar com outros termos ou crie um novo documento.
          </p>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <FolderOpen className="h-16 w-16 text-muted-foreground mb-4" />
          <h2 className="text-xl font-medium mb-2">Nenhum documento criado</h2>
          <p className="text-muted-foreground max-w-md mb-6">
            Você ainda não tem documentos. Crie seu primeiro documento para começar a organizar suas ideias.
          </p>
          <Button onClick={onCreateDocument} className="flex items-center gap-2">
            <Plus size={16} />
            <span>Criar primeiro documento</span>
          </Button>
        </div>
      )}
    </div>
  );
};

export default DocumentList;