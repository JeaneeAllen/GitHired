import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import './Toast.css';

// Shows the current toast message, then hides it after a few seconds
function Toast() {
  const toast = useSelector((store) => store.toast);
  const dispatch = useDispatch();

  useEffect(() => {
    if (!toast) {
      return;
    }
    const timer = setTimeout(() => dispatch({ type: 'HIDE_TOAST' }), 3000);
    return () => clearTimeout(timer);
  }, [toast?.id, dispatch]);

  if (!toast) {
    return null;
  }

  return (
    <div className={`toast toast-${toast.type}`} role="status">
      {toast.message}
    </div>
  );
}

export default Toast;
