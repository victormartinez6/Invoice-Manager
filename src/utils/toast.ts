import { toast as toastify } from 'react-toastify';

export const toast = {
  success: (message: string) => {
    toastify.success(message, {
      position: "top-right",
      autoClose: 3000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
    });
  },
  
  error: (message: string) => {
    toastify.error(message, {
      position: "top-right",
      autoClose: 5000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
    });
  },
  
  loading: (message: string) => {
    return toastify.loading(message, {
      position: "top-right",
      closeOnClick: false,
      pauseOnHover: true,
      draggable: false,
      closeButton: false,
    });
  },
  
  dismiss: () => {
    toastify.dismiss();
  }
};
