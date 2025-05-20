import { useState } from 'react';

export const useEditorDialogs = () => {
  const [isAiAssistantOpen, setIsAiAssistantOpen] = useState(false);
  const [isSupabaseImageUploadOpen, setIsSupabaseImageUploadOpen] = useState(false);
  const [popupImage, setPopupImage] = useState({ src: null, alt: null });
  const [isImagePopupOpen, setIsImagePopupOpen] = useState(false);

  return {
    isAiAssistantOpen,
    setIsAiAssistantOpen,
    isSupabaseImageUploadOpen,
    setIsSupabaseImageUploadOpen,
    popupImage,
    setPopupImage,
    isImagePopupOpen,
    setIsImagePopupOpen,
  };
};
