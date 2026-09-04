import React, { createContext, useContext, useState, useRef, useCallback } from 'react';
import ConfirmModal from '../components/ConfirmModal';
import SystemAlert from '../components/SystemAlert';

export const DialogContext = createContext();

export const DialogProvider = ({ children }) => {
  // Estado para ConfirmModal
  const [confirmState, setConfirmState] = useState({
    isOpen: false,
    title: '',
    message: '',
    confirmText: 'Confirmar',
    cancelText: 'Cancelar',
    type: 'danger',
    loading: false
  });

  // Ref para resolver la Promesa del confirm
  const confirmResolverRef = useRef(null);

  // Estado para SystemAlert (Toast flotante)
  const [alertState, setAlertState] = useState({
    show: false,
    type: 'info',
    title: '',
    message: ''
  });

  /**
   * Muestra un modal de confirmación con el diseño de EquilibrIA.
   * Devuelve una Promesa que se resuelve con true (si confirmó) o false (si canceló o cerró).
   */
  const confirm = useCallback((options) => {
    return new Promise((resolve) => {
      confirmResolverRef.current = resolve;
      setConfirmState({
        isOpen: true,
        title: options.title || '¿Estás seguro?',
        message: options.message || 'Esta acción no se puede deshacer.',
        confirmText: options.confirmText || 'Confirmar',
        cancelText: options.cancelText !== undefined ? options.cancelText : 'Cancelar',
        type: options.type || 'danger',
        loading: false
      });
    });
  }, []);

  const handleConfirmAction = useCallback(() => {
    setConfirmState(prev => ({ ...prev, isOpen: false }));
    if (confirmResolverRef.current) {
      confirmResolverRef.current(true);
      confirmResolverRef.current = null;
    }
  }, []);

  const handleCancelAction = useCallback(() => {
    setConfirmState(prev => ({ ...prev, isOpen: false }));
    if (confirmResolverRef.current) {
      confirmResolverRef.current(false);
      confirmResolverRef.current = null;
    }
  }, []);

  /**
   * Muestra una notificación Toast glassmórfica del sistema.
   */
  const showAlert = useCallback((type, title, message) => {
    setAlertState({
      show: true,
      type: type || 'info',
      title: title || '',
      message: message || ''
    });
  }, []);

  const closeAlert = useCallback(() => {
    setAlertState(prev => ({ ...prev, show: false }));
  }, []);

  return (
    <DialogContext.Provider value={{ confirm, showAlert, closeAlert }}>
      {children}

      {/* Modal de Confirmación Global de EquilibrIA */}
      <ConfirmModal
        isOpen={confirmState.isOpen}
        title={confirmState.title}
        message={confirmState.message}
        confirmText={confirmState.confirmText}
        cancelText={confirmState.cancelText}
        type={confirmState.type}
        loading={confirmState.loading}
        onConfirm={handleConfirmAction}
        onCancel={handleCancelAction}
      />

      {/* Toast de Alerta Global del Sistema */}
      <SystemAlert
        alert={alertState}
        onClose={closeAlert}
      />
    </DialogContext.Provider>
  );
};

export const useDialog = () => {
  const context = useContext(DialogContext);
  if (!context) {
    throw new Error('useDialog debe ser usado dentro de un DialogProvider');
  }
  return context;
};

export default DialogContext;
