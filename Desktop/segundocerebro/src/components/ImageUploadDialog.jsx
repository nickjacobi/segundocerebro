import React, { useState, useCallback, useRef } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Loader2, UploadCloud, ImagePlus } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/lib/supabaseClient'; 
import { v4 as uuidv4 } from 'uuid';

const ImageUploadDialog = ({ open, onOpenChange, onImageUploaded }) => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState(null);
  const { toast } = useToast();
  const fileInputRef = useRef(null);

  const BUCKET_NAME = 'document_images';

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { 
        toast({
          title: 'Arquivo muito grande',
          description: 'Por favor, selecione uma imagem com menos de 5MB.',
          variant: 'destructive',
        });
        setSelectedFile(null);
        setPreviewUrl(null);
        return;
      }
      if (!['image/jpeg', 'image/png', 'image/gif', 'image/webp'].includes(file.type)) {
        toast({
          title: 'Tipo de arquivo inválido',
          description: 'Por favor, selecione um arquivo JPG, PNG, GIF ou WEBP.',
          variant: 'destructive',
        });
        setSelectedFile(null);
        setPreviewUrl(null);
        return;
      }
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      toast({
        title: 'Nenhum arquivo selecionado',
        description: 'Por favor, selecione uma imagem para fazer upload.',
        variant: 'destructive',
      });
      return;
    }

    setIsUploading(true);
    
    const fileExt = selectedFile.name.split('.').pop();
    const fileName = `${uuidv4()}.${fileExt}`;
    const filePath = `${fileName}`; 

    try {
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from(BUCKET_NAME)
        .upload(filePath, selectedFile, {
          cacheControl: '3600',
          upsert: false, 
        });

      if (uploadError) {
        throw uploadError;
      }

      const { data: publicUrlData } = supabase.storage
        .from(BUCKET_NAME)
        .getPublicUrl(filePath);

      if (!publicUrlData || !publicUrlData.publicUrl) {
        throw new Error('Não foi possível obter a URL pública da imagem.');
      }
      
      toast({
        title: 'Upload bem-sucedido!',
        description: 'Sua imagem foi enviada.',
      });
      
      if (onImageUploaded) {
        onImageUploaded(publicUrlData.publicUrl, selectedFile.name);
      }
      
      handleDialogClose(false); 

    } catch (error) {
      console.error('Erro no upload para o Supabase Storage:', error);
      toast({
        title: 'Erro no Upload',
        description: error.message || 'Não foi possível enviar a imagem.',
        variant: 'destructive',
      });
    } finally {
      setIsUploading(false);
    }
  };
  
  const handleDialogClose = (isOpen) => {
    if (!isOpen) {
      setSelectedFile(null);
      setPreviewUrl(null);
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = ""; 
      }
    }
    onOpenChange(isOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleDialogClose}>
      <DialogContent className="sm:max-w-[480px] bg-card text-foreground">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <ImagePlus className="mr-2 h-5 w-5 text-primary" />
            Fazer Upload de Imagem
          </DialogTitle>
          <DialogDescription>
            Selecione uma imagem (JPG, PNG, GIF, WEBP) com menos de 5MB.
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          <Input
            id="imageFile"
            type="file"
            accept="image/jpeg,image/png,image/gif,image/webp"
            onChange={handleFileChange}
            ref={fileInputRef}
            className="text-sm file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-primary-foreground hover:file:bg-primary/90"
            disabled={isUploading}
          />
          {previewUrl && (
            <div className="mt-4 border rounded-md p-2 bg-muted/50 flex justify-center max-h-60">
              <img-replace src={previewUrl} alt="Pré-visualização da imagem" className="max-h-56 object-contain rounded" />
            </div>
          )}
        </div>

        <DialogFooter className="mt-4">
          <Button variant="ghost" onClick={() => handleDialogClose(false)} disabled={isUploading}>
            Cancelar
          </Button>
          <Button onClick={handleUpload} disabled={isUploading || !selectedFile}>
            {isUploading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <UploadCloud className="mr-2 h-4 w-4" />
            )}
            Enviar Imagem
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ImageUploadDialog;