import React, { useState, useRef, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, Wand2, Copy } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/lib/supabaseClient';

const AiAssistantDialog = ({ open, onOpenChange, editorRef, onInsertContent, initialSelectionRef }) => {
  const [prompt, setPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [aiResponse, setAiResponse] = useState('');
  const { toast } = useToast();
  const responseTextRef = useRef(null);

  useEffect(() => {
    if (open) {
      if (editorRef.current && initialSelectionRef && initialSelectionRef.current) {
        const selection = window.getSelection();
        if (selection) {
          try {
            selection.removeAllRanges();
            selection.addRange(initialSelectionRef.current);
          } catch (e) {
            console.warn("Could not restore selection on dialog open:", e);
          }
        }
      }
    }
  }, [open, editorRef, initialSelectionRef]);

  const handleSubmitPrompt = async () => {
    if (!prompt.trim()) {
      toast({
        title: 'Prompt vazio',
        description: 'Por favor, insira suas instruções para a IA.',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);
    setAiResponse('');

    let selectedText = '';
    if (editorRef.current) {
      editorRef.current.focus(); 
      const selection = window.getSelection();
      if (selection && initialSelectionRef && initialSelectionRef.current && editorRef.current.contains(initialSelectionRef.current.commonAncestorContainer)) {
         try {
            selection.removeAllRanges();
            selection.addRange(initialSelectionRef.current);
            selectedText = selection.toString();
         } catch (e) {
            console.warn("Could not restore selection for AI context:", e);
         }
      } else if (selection && selection.rangeCount > 0 && editorRef.current.contains(selection.anchorNode)) {
        selectedText = selection.toString();
      }
    }


    try {
      const requestBody = { 
        prompt,
        currentDocumentContent: selectedText || (editorRef.current ? editorRef.current.innerHTML : '')
      };
      
      const { data, error } = await supabase.functions.invoke('openai-assistant', {
        body: JSON.stringify(requestBody),
      });

      if (error) throw error;

      if (data && data.choices && data.choices[0] && data.choices[0].message) {
        setAiResponse(data.choices[0].message.content);
      } else if (data && data.error) {
        throw new Error(data.error.message || 'Erro desconhecido da API da OpenAI');
      } 
       else {
        console.error('Resposta inesperada da API:', data);
        throw new Error('Resposta inesperada da API da OpenAI.');
      }
    } catch (error) {
      console.error('Erro ao chamar a Edge Function da OpenAI:', error);
      toast({
        title: 'Erro ao contatar a IA',
        description: error.message || 'Não foi possível obter uma resposta da IA.',
        variant: 'destructive',
      });
      setAiResponse('');
    } finally {
      setIsLoading(false);
    }
  };

  const handleInsertResponse = () => {
    if (aiResponse) {
      if(editorRef.current) editorRef.current.focus();
      onInsertContent(aiResponse); 
      onOpenChange(false);
      setPrompt('');
      setAiResponse('');
    }
  };

  const handleCopyResponse = () => {
    if (aiResponse && navigator.clipboard) {
      navigator.clipboard.writeText(aiResponse)
        .then(() => {
          toast({ title: 'Copiado!', description: 'A resposta da IA foi copiada para a área de transferência.' });
        })
        .catch(err => {
          console.error('Erro ao copiar texto: ', err);
          toast({ title: 'Erro ao copiar', description: 'Não foi possível copiar o texto.', variant: 'destructive' });
        });
    }
  };
  
  const handleDialogClose = (isOpen) => {
    if (!isOpen) {
      setPrompt('');
      setAiResponse('');
      setIsLoading(false);
    }
    onOpenChange(isOpen);
  };


  return (
    <Dialog open={open} onOpenChange={handleDialogClose}>
      <DialogContent className="sm:max-w-[525px] bg-card text-foreground">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <Wand2 className="mr-2 h-5 w-5 text-primary" />
            Assistente IA
          </DialogTitle>
          <DialogDescription>
            Descreva o que você gostaria que a IA gerasse, alterasse ou melhorasse no seu documento. Você pode selecionar um trecho do texto antes de abrir o assistente para que a IA o utilize como contexto.
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          <Textarea
            placeholder="Ex: Crie um parágrafo introdutório sobre a importância da IA na educação. Ou, revise o texto selecionado para clareza."
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            rows={4}
            className="bg-background focus-visible:ring-primary"
            disabled={isLoading}
          />
        </div>

        {isLoading && (
          <div className="flex items-center justify-center my-4">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="ml-2">A IA está pensando...</p>
          </div>
        )}

        {aiResponse && !isLoading && (
          <div className="mt-4 space-y-2">
            <h3 className="text-sm font-medium">Resposta da IA:</h3>
            <div ref={responseTextRef} className="prose prose-sm dark:prose-invert max-w-none p-3 border rounded-md bg-muted/50 max-h-60 overflow-y-auto whitespace-pre-wrap">
              {aiResponse}
            </div>
            <div className="flex justify-end gap-2 mt-2">
              <Button variant="outline" size="sm" onClick={handleCopyResponse} title="Copiar resposta">
                <Copy size={14} />
              </Button>
            </div>
          </div>
        )}

        <DialogFooter className="mt-4">
          <Button variant="ghost" onClick={() => handleDialogClose(false)} disabled={isLoading}>
            Cancelar
          </Button>
          {aiResponse && !isLoading ? (
            <Button onClick={handleInsertResponse}>
              Inserir no Documento
            </Button>
          ) : (
            <Button onClick={handleSubmitPrompt} disabled={isLoading || !prompt.trim()}>
              <Wand2 size={16} className="mr-2" />
              Enviar para IA
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AiAssistantDialog;