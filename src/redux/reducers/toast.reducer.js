// The message shown in the pop-up notification at the bottom of the screen.
// Dispatch { type: 'SHOW_TOAST', payload: { message, type: 'success' | 'error' } }
const toastReducer = (state = null, action) => {
  switch (action.type) {
    case 'SHOW_TOAST':
      // id lets the Toast component restart its timer when the same message is shown twice
      return { type: 'success', ...action.payload, id: Date.now() };
    case 'HIDE_TOAST':
      return null;
    default:
      return state;
  }
};

export default toastReducer;
