import { useRef, useCallback } from 'react';

export const useEditorCursorManager = (editorRef) => {
  const lastCursorPositionRef = useRef(null);

  const saveCursorPosition = useCallback(() => {
    if (!editorRef.current) return;
    const selection = window.getSelection();
    if (selection && selection.rangeCount > 0) {
      const range = selection.getRangeAt(0);
      if (editorRef.current.contains(range.commonAncestorContainer)) {
        lastCursorPositionRef.current = range.cloneRange();
      }
    }
  }, [editorRef]);

  const restoreCursorPosition = useCallback(() => {
    if (lastCursorPositionRef.current && editorRef.current) {
      const selection = window.getSelection();
      if (selection) {
        editorRef.current.focus();
        selection.removeAllRanges();
        selection.addRange(lastCursorPositionRef.current);
      }
    }
  }, [editorRef]);
  
  const focusEditorAtEnd = useCallback(() => {
    if (editorRef.current) {
        editorRef.current.focus();
        const range = document.createRange();
        range.selectNodeContents(editorRef.current);
        range.collapse(false); 
        const selection = window.getSelection();
        if(selection) {
            selection.removeAllRanges();
            selection.addRange(range);
        }
    }
  }, [editorRef]);

  return {
    saveCursorPosition,
    restoreCursorPosition,
    focusEditorAtEnd,
    lastCursorPositionRef 
  };
};
