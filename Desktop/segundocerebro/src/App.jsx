
import React, { useState, useEffect, useRef } from 'react';
import { Toaster } from '@/components/ui/toaster';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import DocumentEditor from '@/components/DocumentEditor';
import DocumentList from '@/components/DocumentList';
import Layout from '@/components/Layout';
import { useDocuments } from '@/hooks/useDocuments';
import ImagePopup from '@/components/ImagePopup';

const App = () => {
  const { 
    documents, 
    loading, 
    error, 
    fetchDocuments, 
    createNewDocument, 
    updateDocument, 
    deleteDocument,
    setDocuments 
  } = useDocuments();
  
  const [activeDocument, setActiveDocument] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [popupImage, setPopupImage] = useState({ src: null, alt: null });
  const [isImagePopupOpen, setIsImagePopupOpen] = useState(false);
  const previewRef = useRef(null);

  const handleCreateDocument = async () => {
    const newDoc = await createNewDocument();
    if (newDoc) {
      setActiveDocument(newDoc);
      setIsEditing(true);
    }
  };

  const handleDeleteDocument = async (id) => {
    const success = await deleteDocument(id);
    if (success && activeDocument && activeDocument.id === id) {
      setActiveDocument(null);
      setIsEditing(false);
    }
  };

  const handleSelectDocument = (doc) => {
    setActiveDocument(doc);
    setIsEditing(false);
  };
  
  useEffect(() => {
    if (activeDocument && documents) {
      const currentDocInList = documents.find(d => d.id === activeDocument.id);
      if (currentDocInList && currentDocInList.updated_at !== activeDocument.updated_at) {
        setActiveDocument(currentDocInList);
      }
    }
  }, [documents, activeDocument]);

  const handlePreviewClick = (event) => {
    let targetElement = event.target;
    
    while (targetElement && targetElement !== previewRef.current && targetElement.parentNode) {
      if (targetElement.classList && targetElement.classList.contains('image-placeholder-wrapper')) {
        const src = targetElement.getAttribute('data-src');
        const alt = targetElement.getAttribute('data-alt');
        if (src) {
          setPopupImage({ src, alt });
          setIsImagePopupOpen(true);
        }
        event.stopPropagation(); 
        return;
      }
      targetElement = targetElement.parentNode;
    }
  };


  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-background">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-background p-4">
        <p className="text-destructive text-xl mb-4">{error}</p>
        <Button onClick={fetchDocuments}>Tentar Novamente</Button>
      </div>
    );
  }

  return (
    <>
      <Layout
        documents={documents}
        activeDocument={activeDocument}
        onSelectDocument={handleSelectDocument}
        onCreateDocument={handleCreateDocument}
        onDeleteDocument={handleDeleteDocument}
        setIsEditing={setIsEditing}
      >
        {activeDocument && isEditing ? (
          <DocumentEditor 
            key={activeDocument.id}
            document={activeDocument} 
            onSave={updateDocument}
            onCancel={() => {
              setIsEditing(false);
            }}
          />
        ) : activeDocument ? (
          <div className="p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">{activeDocument.title}</h2>
              <Button
                onClick={() => setIsEditing(true)}
                className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
              >
                Editar
              </Button>
            </div>
            <div 
              ref={previewRef}
              className="prose dark:prose-invert max-w-none editor-content"
              dangerouslySetInnerHTML={{ __html: activeDocument.content }}
              onClick={handlePreviewClick}
            />
          </div>
        ) : (
          <DocumentList 
            documents={documents}
            onSelectDocument={handleSelectDocument}
            onCreateDocument={handleCreateDocument}
            onDeleteDocument={handleDeleteDocument}
          />
        )}
      </Layout>
      <Toaster />
      <ImagePopup
        open={isImagePopupOpen}
        onOpenChange={setIsImagePopupOpen}
        src={popupImage.src}
        alt={popupImage.alt}
      />
    </>
  );
};

export default App;
