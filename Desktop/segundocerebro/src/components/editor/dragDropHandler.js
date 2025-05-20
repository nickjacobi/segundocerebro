
export const handleDragStart = (event, editorRef, draggedElementRef) => {
  let targetElement = event.target;
  while (targetElement && targetElement !== editorRef.current) {
    if (targetElement.classList && targetElement.classList.contains('image-placeholder-wrapper')) {
      draggedElementRef.current = targetElement;
      event.dataTransfer.setData('text/plain', targetElement.id);
      
      const htmlContent = targetElement.getAttribute('data-html-content');
      if (htmlContent) {
        event.dataTransfer.setData('text/html', htmlContent);
      } else {
        event.dataTransfer.setData('text/html', targetElement.outerHTML);
      }
      event.dataTransfer.effectAllowed = 'move';
      targetElement.style.opacity = '0.5';
      return;
    }
    targetElement = targetElement.parentNode;
  }
  event.preventDefault(); 
};

export const handleDragOver = (event) => {
  event.preventDefault();
  event.dataTransfer.dropEffect = 'move';
};

export const handleDrop = (event, editorRef, draggedElementRef, triggerComplexUpdate, setCurrentContentDirectly, setEditorKeyDirectly) => {
  event.preventDefault();
  if (!editorRef.current) return;

  const draggedElementHtml = event.dataTransfer.getData('text/html');
  const draggedElementId = event.dataTransfer.getData('text/plain');

  if (!draggedElementHtml || !draggedElementId) {
    if (draggedElementRef.current) draggedElementRef.current.style.opacity = '1';
    draggedElementRef.current = null;
    return;
  }

  if (draggedElementRef.current) {
    draggedElementRef.current.style.opacity = '1';
  }
  
  const elementToRemoveInDOM = editorRef.current.querySelector(`#${draggedElementId}`);
  if (elementToRemoveInDOM) {
    let siblingToRemove = null;
    if (elementToRemoveInDOM.nextSibling && elementToRemoveInDOM.nextSibling.nodeType === Node.TEXT_NODE && elementToRemoveInDOM.nextSibling.textContent === '\xA0') { // &nbsp;
      siblingToRemove = elementToRemoveInDOM.nextSibling;
    }
    elementToRemoveInDOM.remove();
    if (siblingToRemove) {
      siblingToRemove.remove();
    }
  } else {
    console.warn(`Element with id ${draggedElementId} not found in DOM for removal.`);
  }
  
  let range;
  if (document.caretRangeFromPoint) {
    range = document.caretRangeFromPoint(event.clientX, event.clientY);
  } else {
    const selection = window.getSelection();
    if (selection.getRangeAt && selection.rangeCount) {
      range = selection.getRangeAt(0);
    } else {
       range = document.createRange();
       range.selectNodeContents(editorRef.current);
       range.collapse(false); 
    }
  }
  
  if (!editorRef.current.contains(range.commonAncestorContainer)) {
    range.selectNodeContents(editorRef.current);
    range.collapse(false); 
  }

  range.deleteContents();
  
  try {
    const tempFragment = range.createContextualFragment(draggedElementHtml);
    range.insertNode(tempFragment);
    range.collapse(false); 
  } catch (e) {
    console.error("Error inserting dragged HTML:", e);
    editorRef.current.innerHTML = editorRef.current.innerHTML + draggedElementHtml;
  }

  const newContent = editorRef.current.innerHTML;
  // setCurrentContentDirectly(newContent); // The triggerComplexUpdate will handle setting content
  // setEditorKeyDirectly(); // The triggerComplexUpdate will handle setting editorKey

  triggerComplexUpdate(); // This will read innerHTML, set currentContent, and set editorKey
  
  setTimeout(() => {
    if (editorRef.current) {
      const newElement = editorRef.current.querySelector(`#${draggedElementId}`);
      if (newElement) {
        const newRange = document.createRange();
        let nodeToSetStartAfter = newElement;
        
        if(newElement.nextSibling && newElement.nextSibling.nodeType === Node.TEXT_NODE && newElement.nextSibling.textContent === '\xA0'){
            nodeToSetStartAfter = newElement.nextSibling;
        }

        newRange.setStartAfter(nodeToSetStartAfter);
        newRange.collapse(true);
        const selection = window.getSelection();
        if (selection) {
          selection.removeAllRanges();
          selection.addRange(newRange);
        }
        editorRef.current.focus();
      }
    }
    // REMOVED: triggerComplexUpdate(); was here, likely causing double update or incorrect timing
  }, 0);

  if (draggedElementRef.current) {
    draggedElementRef.current.style.opacity = '1';
  }
  draggedElementRef.current = null;
};
  
export const handleDragEnd = (event, draggedElementRef) => {
  if (draggedElementRef.current) {
    draggedElementRef.current.style.opacity = '1';
  }
  draggedElementRef.current = null;
};
