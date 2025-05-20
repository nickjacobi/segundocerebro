import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useDebounce } from '@/hooks/useDebounce';
import AiAssistantDialog from '@/components/AiAssistantDialog';
import Toolbar from '@/components/editor/Toolbar';
import { getToolbarButtons } from '@/components/editor/toolbarConfig';
import { useEditorFormatting } from '@/hooks/useEditorFormatting';
import SupabaseImageUploadDialog from '@/components/SupabaseImageUploadDialog';
import ImagePopup from '@/components/ImagePopup';
import EditorHeader from '@/components/editor/EditorHeader';
import EditorContent from '@/components/editor/EditorContent';
import { handleDragStart, handleDragOver, handleDrop, handleDragEnd } from '@/components/editor/dragDropHandler';
import { insertImagePlaceholder } from '@/components/editor/imageHandler';
import { useEditorCursorManager } from '@/hooks/useEditorCursorManager';
import { useEditorDialogs } from '@/hooks/useEditorDialogs';

const DocumentEditor = ({ document: initialDocument, onSave, onCancel }) => {
  const [title, setTitle] = useState(initialDocument.title);
  const editorRef = useRef(null);
  const [currentContent, setCurrentContent] = useState('');
  const [editorKey, setEditorKey] = useState(0); 
  const draggedElementRef = useRef(null);
  
  const { focusEditorAtEnd, lastCursorPositionRef, saveCursorPosition, restoreCursorPosition } = useEditorCursorManager(editorRef);

  const {
    isAiAssistantOpen, setIsAiAssistantOpen,
    isSupabaseImageUploadOpen, setIsSupabaseImageUploadOpen,
    popupImage, setPopupImage,
    isImagePopupOpen, setIsImagePopupOpen,
  } = useEditorDialogs();

  const onEditorInput = useCallback(() => {
    if (editorRef.current) {
      const newContentFromDOM = editorRef.current.innerHTML;
      setCurrentContent(newContentFromDOM);
    }
  }, []);

  const handleFormattingCompletion = useCallback(() => {
    if (editorRef.current) {
      const newContentFromDOM = editorRef.current.innerHTML;
      setCurrentContent(newContentFromDOM);
      // DO NOT change editorKey for simple formatting from toolbar
    }
  }, []);

  const handleComplexUpdateCompletion = useCallback(() => {
    if (editorRef.current) {
      const newContentFromDOM = editorRef.current.innerHTML;
      setCurrentContent(newContentFromDOM);
      setEditorKey(prevKey => prevKey + 1); // Change key for complex updates like AI insert, image, drop
    }
  }, []);


  const { activeFormats, formatDoc, insertHtmlContent, selectionRef } = useEditorFormatting(
    editorRef,
    (isComplexHtmlInsertion) => { // Pass a more descriptive callback
      if (isComplexHtmlInsertion) {
        handleComplexUpdateCompletion();
      } else {
        handleFormattingCompletion();
      }
    }
  );

  const debouncedSave = useDebounce(() => {
    if (initialDocument.title !== title || initialDocument.content !== currentContent) {
      onSave({
        ...initialDocument,
        title,
        content: currentContent
      });
    }
  }, 1000);

  useEffect(() => {
    setTitle(initialDocument.title);
    const initialHTML = initialDocument.content || '';
    setCurrentContent(initialHTML);
    setEditorKey(prevKey => prevKey + 1); 
  }, [initialDocument]);
  
  useEffect(() => {
    if (editorKey > 0 && editorRef.current) { 
      focusEditorAtEnd();
    }
  }, [editorKey, focusEditorAtEnd]);
  
  useEffect(() => {
    if (currentContent !== (initialDocument.content || '') || title !== initialDocument.title) {
      debouncedSave();
    }
  }, [title, currentContent, debouncedSave, initialDocument]);

  const insertLink = () => {
    saveCursorPosition(); 
    const url = prompt('Insira a URL do link:');
    if (url) {
      restoreCursorPosition(); 
      formatDoc('createLink', url); // formatDoc will call handleFormattingCompletion
    } else {
      editorRef.current?.focus(); 
    }
  };

  const openSupabaseImageUpload = () => {
    saveCursorPosition(); 
    selectionRef.current = lastCursorPositionRef.current ? lastCursorPositionRef.current.cloneRange() : null;
    setIsSupabaseImageUploadOpen(true);
  };

  const handleSupabaseImageInsertCallback = (imageUrl, altText, originalFileName = 'Imagem') => {
    insertImagePlaceholder(
      imageUrl, altText, originalFileName, editorRef, selectionRef, 
      (newContent) => { setCurrentContent(newContent); }, 
      () => { setEditorKey(k => k + 1); } 
    );
    setIsSupabaseImageUploadOpen(false);
  };
  
  const onEditorDragStart = (event) => handleDragStart(event, editorRef, draggedElementRef);
  const onEditorDragOver = (event) => handleDragOver(event);
  const onEditorDrop = (event) => {
    handleDrop(event, editorRef, draggedElementRef, 
      handleComplexUpdateCompletion, 
      setCurrentContent, 
      () => setEditorKey(k => k + 1) 
    );
  }
  const onEditorDragEnd = (event) => handleDragEnd(event, draggedElementRef);

  const handleEditorClick = (event) => {
    let targetElement = event.target;
    while (targetElement && targetElement !== editorRef.current) {
      if (targetElement.classList && targetElement.classList.contains('image-placeholder-wrapper')) {
        if (draggedElementRef.current && draggedElementRef.current === targetElement) return;
        const src = targetElement.getAttribute('data-src');
        const alt = targetElement.getAttribute('data-alt');
        if (src) {
          setPopupImage({ src, alt });
          setIsImagePopupOpen(true);
        }
        return;
      }
      targetElement = targetElement.parentNode;
    }
  };

  const handleTitleChange = (e) => setTitle(e.target.value);

  const handleAiAssistantOpen = () => {
    saveCursorPosition(); 
    selectionRef.current = lastCursorPositionRef.current ? lastCursorPositionRef.current.cloneRange() : null;
    setIsAiAssistantOpen(true);
  };
  
  const toolbarButtons = getToolbarButtons(insertLink, openSupabaseImageUpload, handleAiAssistantOpen);

  const handleSaveAndCancel = () => {
    onSave({ ...initialDocument, title, content: currentContent }, true);
    onCancel();
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
        className="p-6 max-w-4xl mx-auto flex flex-col h-full"
      >
        <EditorHeader 
          title={title} 
          onTitleChange={handleTitleChange}
          onSaveAndCancel={handleSaveAndCancel}
          initialDocument={initialDocument}
        />

        <div className="border rounded-md overflow-hidden mb-4 bg-card flex flex-col flex-grow">
          <Toolbar 
            buttons={toolbarButtons}
            onFormat={(command, value) => {
              saveCursorPosition(); 
              restoreCursorPosition(); 
              formatDoc(command, value); // This will use handleFormattingCompletion
            }}
            activeFormats={activeFormats}
          />
          
          <EditorContent
            ref={editorRef}
            editorKey={editorKey}
            currentContent={currentContent}
            onInput={onEditorInput}
            onClick={handleEditorClick}
            onFocus={() => { /* No saveCursorPosition here for now */ }}
            onBlur={() => { /* No saveCursorPosition here for now */ }}
            onKeyUp={() => { /* No saveCursorPosition here for now */ }}
            onKeyDown={() => { /* No saveCursorPosition here for now */ }}
            onDragStart={onEditorDragStart}
            onDragOver={onEditorDragOver}
            onDrop={onEditorDrop}
            onDragEnd={onEditorDragEnd}
          />
        </div>
      </motion.div>
      <AiAssistantDialog
        open={isAiAssistantOpen}
        onOpenChange={setIsAiAssistantOpen}
        editorRef={editorRef}
        onInsertContent={(html) => {
          insertHtmlContent(html, true); // Pass true for complex insertion
        }}
        initialSelectionRef={selectionRef}
      />
      <SupabaseImageUploadDialog
        open={isSupabaseImageUploadOpen}
        onOpenChange={setIsSupabaseImageUploadOpen}
        onImageUploaded={handleSupabaseImageInsertCallback}
      />
      <ImagePopup
        open={isImagePopupOpen}
        onOpenChange={setIsImagePopupOpen}
        src={popupImage.src}
        alt={popupImage.alt}
      />
    </>
  );
};

export default DocumentEditor;