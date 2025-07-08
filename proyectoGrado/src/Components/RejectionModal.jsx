
import React, { useState } from 'react';

import "./RejectionModal.css";

const RejectionModal = ({ isOpen, onClose, onConfirm }) => {
  const [comment, setComment] = useState('');

  const handleConfirm = () => {
    onConfirm(comment);
    setComment('');
  };

  if (!isOpen) return null;
return (
  <div className="rejection-modal-overlay">
    <div className="rejection-modal-box">
      <h2>¿Estás seguro de rechazar esta versión?</h2>
      <textarea
        placeholder="Escribe un comentario para el doctor..."
        value={comment}
        onChange={(e) => setComment(e.target.value)}
      />
      <div className="rejection-modal-actions">
        <button onClick={onClose} className="cancel-button">
          Cancelar
        </button>
        <button onClick={handleConfirm} className="confirm-button">
          Rechazar con comentario
        </button>
      </div>
    </div>
  </div>
);

};

export default RejectionModal;
