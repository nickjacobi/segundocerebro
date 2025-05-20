import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { format, isValid, parseISO } from 'date-fns';
import { 
  FileText, 
  Plus, 
  Trash2, 
  Search,
  FolderOpen
} from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';

const Sidebar = ({ 
  documents, 
  activeDocument, 
  onSelectDocument, 
  onCreateDocument,
  onDeleteDocument,
  setIsEditing
}) => {
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
    <div className="h-full flex flex-col bg-background">
      <div className="p-4 border-b">
        <Button 
          onClick={onCreateDocument} 
          className="w-full flex items-center justify-center gap-2"
        >
          <Plus size={16} />
          <span>Novo documento</span>
        </Button>
      </div>
      
      <div className="p-4 border-b">
        <div className="relative">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Buscar documentos..."
            className="w-full pl-8 py-2 bg-muted rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>
      
      <ScrollArea className="flex-1">
        <div className="p-2">
          {filteredDocuments.length > 0 ? (
            <div className="space-y-1">
              {filteredDocuments.map(doc => (
                <motion.div
                  key={doc.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2 }}
                  className={cn(
                    "flex items-center justify-between p-2 rounded-md cursor-pointer sidebar-item group",
                    activeDocument?.id === doc.id ? "bg-muted text-primary" : "hover:bg-muted/50"
                  )}
                  onClick={() => {
                    onSelectDocument(doc);
                    setIsEditing(false);
                  }}
                >
                  <div className="flex items-center gap-2 overflow-hidden">
                    <FileText size={16} className={cn(activeDocument?.id === doc.id ? "text-primary" : "text-muted-foreground")} />
                    <div className="truncate">
                      <div className={cn("font-medium truncate", activeDocument?.id === doc.id ? "text-primary" : "text-foreground")}>{doc.title}</div>
                      <div className="text-xs text-muted-foreground">
                        {formatDate(doc.updated_at)}
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteDocument(doc.id);
                    }}
                    className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive transition-opacity p-1"
                  >
                    <Trash2 size={14} />
                  </button>
                </motion.div>
              ))}
            </div>
          ) : searchTerm ? (
            <div className="flex flex-col items-center justify-center py-10 text-center">
              <Search className="h-10 w-10 text-muted-foreground mb-2" />
              <h3 className="font-medium">Nenhum resultado</h3>
              <p className="text-sm text-muted-foreground">
                Não encontramos documentos com "{searchTerm}"
              </p>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-10 text-center">
              <FolderOpen className="h-10 w-10 text-muted-foreground mb-2" />
              <h3 className="font-medium">Nenhum documento</h3>
              <p className="text-sm text-muted-foreground">
                Crie seu primeiro documento para começar
              </p>
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
};

export default Sidebar;