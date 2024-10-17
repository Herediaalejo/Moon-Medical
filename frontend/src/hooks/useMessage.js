import { useState } from 'react';

const useMessage = () => {
  const [message, setMessage] = useState('');
  const [type, setType] = useState('');
  const [visible, setVisible] = useState(false);

  const showMessage = (msg, msgType) => {
    setMessage(msg);
    setType(msgType);
    setVisible(true);
    setTimeout(() => setVisible(false), 2000);
  };

  return { message, type, visible, showMessage };
};

export default useMessage;
