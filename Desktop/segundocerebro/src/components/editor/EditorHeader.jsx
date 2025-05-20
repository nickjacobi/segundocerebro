import React from 'react';
import { Button } from '@/components/ui/button';
import { Check } from 'lucide-react';

const EditorHeader = ({ title, onTitleChange, onSaveAndCancel, initialDocument }) => {
  return (
    <div className="flex justify-between items-center mb-4">
      <input
        type="text"
        value={title}
        onChange={onTitleChange}
        className="text-2xl md:text-3xl font-bold bg-transparent border-none outline-none w-full text-foreground placeholder-muted-foreground"
        placeholder="Título do documento"
      />
      <div className="flex gap-2">
        <Button variant="outline" onClick={onSaveAndCancel}>
          <Check size={16} className="mr-2" />
          Concluído
        </Button>
      </div>
    </div>
  );
};

export default EditorHeader;
