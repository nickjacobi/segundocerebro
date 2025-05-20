import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';

const ImagePopup = ({ open, onOpenChange, src, alt }) => {
  if (!src) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[90vw] md:max-w-[80vw] lg:max-w-[70vw] xl:max-w-[60vw] w-auto bg-card text-foreground p-0">
        <DialogHeader className="p-4 border-b">
          <DialogTitle className="text-lg">{alt || 'Visualização da Imagem'}</DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground">
            {alt ? `Visualizando: ${alt}` : 'Imagem do documento'}
          </DialogDescription>
        </DialogHeader>
        
        <div className="p-4 flex justify-center items-center max-h-[80vh] overflow-auto">
          <img 
            src={src} 
            alt={alt || 'Imagem em pop-up'} 
            className="max-w-full max-h-[calc(80vh-120px)] object-contain rounded-md" 
          />
        </div>

        <DialogFooter className="p-4 border-t">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            <X className="mr-2 h-4 w-4" /> Fechar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ImagePopup;