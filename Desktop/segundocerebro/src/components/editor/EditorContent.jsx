import React from 'react';

const EditorContent = React.forwardRef(({
  editorKey,
  currentContent,
  onInput,
  onClick,
  onFocus,
  onBlur,
  onKeyUp,
  onKeyDown,
  onDragStart,
  onDragOver,
  onDrop,
  onDragEnd
}, ref) => {
  return (
    <div
      key={editorKey}
      ref={ref}
      className="editor-content p-4 flex-grow focus:outline-none text-foreground overflow-y-auto"
      style={{ minHeight: 'calc(100vh - 300px)' }}
      contentEditable
      suppressContentEditableWarning
      onInput={onInput}
      onClick={onClick}
      onFocus={onFocus}
      onBlur={onBlur}
      onKeyUp={onKeyUp}
      onKeyDown={onKeyDown}
      onDragStart={onDragStart}
      onDragOver={onDragOver}
      onDrop={onDrop}
      onDragEnd={onDragEnd}
      dangerouslySetInnerHTML={{ __html: currentContent }}
    />
  );
});

EditorContent.displayName = 'EditorContent';

export default EditorContent;
