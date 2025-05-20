import React from 'react';

export const insertImagePlaceholder = (
  imageUrl,
  altText,
  originalFileName,
  editorRef,
  selectionRef,
  setCurrentContent,
  setEditorKey,
  triggerContentChange
) => {
  if (!imageUrl || typeof imageUrl !== 'string' || imageUrl.trim() === '') {
    console.error('Image URL is invalid:', imageUrl);
    return;
  }

  const description = (altText && typeof altText === 'string' && altText.trim() !== '') 
    ? altText.trim() 
    : (originalFileName && typeof originalFileName === 'string' && originalFileName.trim() !== '') 
      ? originalFileName.trim() 
      : 'Imagem';

  const uniqueId = `image-placeholder-${Date.now()}`;
  
  const placeholderContent = `
    <div style="display: flex; align-items: center; pointer-events: none;">
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-image" style="margin-right: 8px; color: #555;">
        <rect width="18" height="18" x="3" y="3" rx="2" ry="2"></rect>
        <circle cx="9" cy="9" r="2"></circle>
        <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"></path>
      </svg>
      <span style="color: #333; font-style: italic; pointer-events: none;">${description}</span>
    </div>
  `;

  const placeholderWrapperHtml = `
    <div 
      id="${uniqueId}"
      class="image-placeholder-wrapper" 
      contenteditable="false" 
      draggable="true"
      style="display: inline-block; padding: 10px; border: 1px dashed #ccc; border-radius: 4px; cursor: grab; margin: 10px 0; background-color: #f9f9f9; user-select: none;"
      data-src="${imageUrl}" 
      data-alt="${description}"
    >
      ${placeholderContent}
    </div>&nbsp;
  `;
  
  const tempDiv = document.createElement('div');
  tempDiv.innerHTML = placeholderWrapperHtml;
  
  const wrapperElement = tempDiv.querySelector('.image-placeholder-wrapper');

  if (wrapperElement) {
    wrapperElement.setAttribute('data-html-content', placeholderWrapperHtml.replace(/'/g, "&apos;"));
    const finalPlaceholderHtml = wrapperElement.outerHTML + (tempDiv.querySelector('.image-placeholder-wrapper + text') ? tempDiv.querySelector('.image-placeholder-wrapper + text').textContent : (tempDiv.childNodes[1] && tempDiv.childNodes[1].nodeType === Node.TEXT_NODE ? tempDiv.childNodes[1].textContent : ''));

    if (selectionRef.current && editorRef.current && editorRef.current.contains(selectionRef.current.commonAncestorContainer)) {
      const range = selectionRef.current.cloneRange();
      range.deleteContents();
      const frag = range.createContextualFragment(finalPlaceholderHtml);
      range.insertNode(frag);
      range.collapse(false); 
      selectionRef.current = range;
      triggerContentChange();
    } else {
      setCurrentContent(prevContent => (prevContent || '') + finalPlaceholderHtml);
      setEditorKey(prevKey => prevKey + 1);
    }
  } else {
    console.error('Could not find .image-placeholder-wrapper in tempDiv');
  }
};