import React, { useState, useCallback, useEffect, useRef } from 'react';

export const useEditorFormatting = (editorRef, onFormatApplied) => {
  const [activeFormats, setActiveFormats] = useState({});
  const selectionRef = useRef(null); 
  const editorHasFocus = useRef(false);

  const updateActiveFormats = useCallback(() => {
    if (!editorRef.current || typeof window.document.queryCommandState !== 'function') return;
    
    const formats = {
      bold: window.document.queryCommandState('bold'),
      italic: window.document.queryCommandState('italic'),
      insertUnorderedList: window.document.queryCommandState('insertUnorderedList'),
      insertOrderedList: window.document.queryCommandState('insertOrderedList'),
    };
    
    const selection = window.getSelection();
    if (selection && selection.rangeCount > 0) {
      const currentRange = selection.getRangeAt(0);
      if (editorRef.current.contains(currentRange.commonAncestorContainer)) {
        selectionRef.current = currentRange.cloneRange();
      }
      let parentNode = currentRange.commonAncestorContainer;
      if (parentNode.nodeType !== Node.ELEMENT_NODE) {
        parentNode = parentNode.parentNode;
      }
      if (parentNode && editorRef.current.contains(parentNode)) {
        const tagName = parentNode.tagName.toLowerCase();
        formats.h1 = tagName === 'h1';
        formats.h2 = tagName === 'h2';
        formats.h3 = tagName === 'h3';
        formats.blockquote = tagName === 'blockquote';
        formats.pre = tagName === 'pre';
      }
    }
    setActiveFormats(formats);
  }, [editorRef]);

  useEffect(() => {
    const editorElement = editorRef.current;
    if (editorElement) {
      const handleActivity = () => {
        const selection = window.getSelection();
        if (selection && selection.rangeCount > 0) {
           const currentRange = selection.getRangeAt(0);
            if (editorElement.contains(currentRange.commonAncestorContainer)) {
              selectionRef.current = currentRange.cloneRange();
            }
        }
        updateActiveFormats();
      };

      document.addEventListener('selectionchange', handleActivity);
      editorElement.addEventListener('mouseup', handleActivity);
      editorElement.addEventListener('keyup', handleActivity);
      
      const handleFocus = () => {
        editorHasFocus.current = true;
        handleActivity();
      };
      const handleBlur = () => {
        editorHasFocus.current = false;
      };

      editorElement.addEventListener('focus', handleFocus);
      editorElement.addEventListener('blur', handleBlur);
      
      const observer = new MutationObserver(() => {
        updateActiveFormats();
      });
      observer.observe(editorElement, { attributes: true, childList: true, subtree: true, characterData: true });
      
      return () => {
        document.removeEventListener('selectionchange', handleActivity);
        editorElement.removeEventListener('mouseup', handleActivity);
        editorElement.removeEventListener('keyup', handleActivity);
        editorElement.removeEventListener('focus', handleFocus);
        editorElement.removeEventListener('blur', handleBlur);
        observer.disconnect();
      };
    }
  }, [editorRef, updateActiveFormats]);

  const formatDoc = useCallback((command, value = null) => {
    if (!editorRef.current || typeof window.document.execCommand !== 'function') {
      console.warn('Editor not available or execCommand not supported.');
      return;
    }
    editorRef.current.focus(); 
    window.document.execCommand(command, false, value);
    if (onFormatApplied) onFormatApplied(); 
    updateActiveFormats();
  }, [editorRef, onFormatApplied, updateActiveFormats]);

  const insertHtmlContent = useCallback((htmlContent) => {
    if (!editorRef.current) return;
    
    editorRef.current.focus();
    const selection = window.getSelection();

    if (!selection) return;

    let range;
    if (selectionRef.current && editorRef.current.contains(selectionRef.current.commonAncestorContainer)) {
      range = selectionRef.current;
      selection.removeAllRanges();
      selection.addRange(range);
    } else if (selection.rangeCount > 0 && editorRef.current.contains(selection.anchorNode)) {
      range = selection.getRangeAt(0);
    } else {
      selection.removeAllRanges();
      range = document.createRange();
      range.selectNodeContents(editorRef.current);
      range.collapse(false); 
      selection.addRange(range);
    }
    
    range.deleteContents(); 

    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = htmlContent;
    
    const fragment = document.createDocumentFragment();
    let node, lastNode = null;
    while ((node = tempDiv.firstChild)) {
      lastNode = fragment.appendChild(node);
    }
    
    range.insertNode(fragment);

    if (lastNode) {
      range.setStartAfter(lastNode);
      range.collapse(true);
      selection.removeAllRanges();
      selection.addRange(range);
      selectionRef.current = range.cloneRange();
    }
    
    if (onFormatApplied) {
      onFormatApplied();
    }
    updateActiveFormats();

  }, [editorRef, onFormatApplied, updateActiveFormats]);

  return { activeFormats, formatDoc, insertHtmlContent, selectionRef, editorHasFocus };
};
