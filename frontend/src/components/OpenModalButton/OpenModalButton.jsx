// frontend/src/components/OpenModalButton/OpenModalButton.jsx

import { useModal } from '../../context/Modal';

function OpenModalButton({
  modalComponent,    
  buttonText,        
  onButtonClick,     
  onModalClose      
}) {
  const { setModalContent, setOnModalClose } = useModal();

  const handleClick = () => {
    if (typeof onButtonClick === "function") onButtonClick();
    if (typeof onModalClose === "function") setOnModalClose(onModalClose);
    setModalContent(modalComponent);
  };

  return <button onClick={handleClick}>{buttonText}</button>;
}

export default OpenModalButton;
