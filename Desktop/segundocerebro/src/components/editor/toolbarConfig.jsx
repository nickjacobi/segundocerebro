import React from 'react';
import { 
  Bold, 
  Italic, 
  List, 
  ListOrdered, 
  Quote, 
  Heading1, 
  Heading2, 
  Heading3,
  Code,
  Link,
  Image as ImageIcon,
  Wand2
} from 'lucide-react';

export const getToolbarButtons = (insertLinkFunction, openSupabaseImageUploadFunction, openAiAssistantFunction) => [
  { cmd: 'bold', icon: <Bold size={16} />, label: 'Negrito' },
  { cmd: 'italic', icon: <Italic size={16} />, label: 'Itálico' },
  { cmd: 'insertUnorderedList', icon: <List size={16} />, label: 'Lista não ordenada' },
  { cmd: 'insertOrderedList', icon: <ListOrdered size={16} />, label: 'Lista ordenada' },
  { cmd: 'formatBlock', value: '<blockquote>', formatKey: 'blockquote', icon: <Quote size={16} />, label: 'Citação' },
  { cmd: 'formatBlock', value: '<h1>', formatKey: 'h1', icon: <Heading1 size={16} />, label: 'Título 1' },
  { cmd: 'formatBlock', value: '<h2>', formatKey: 'h2', icon: <Heading2 size={16} />, label: 'Título 2' },
  { cmd: 'formatBlock', value: '<h3>', formatKey: 'h3', icon: <Heading3 size={16} />, label: 'Título 3' },
  { cmd: 'formatBlock', value: '<pre>', formatKey: 'pre', icon: <Code size={16} />, label: 'Bloco de Código' },
  { action: insertLinkFunction, icon: <Link size={16} />, label: 'Inserir Link' },
  { action: openSupabaseImageUploadFunction, icon: <ImageIcon size={16} />, label: 'Fazer Upload de Imagem (Supabase)' },
  { action: openAiAssistantFunction, icon: <Wand2 size={16} />, label: 'Assistente IA', isPrimary: true },
];