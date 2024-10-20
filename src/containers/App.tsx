import React from 'react';
import ChatButton from '@components/ChatButton';
import { DraggableChat } from '@components/draggable-chat';

const App: React.FC = () => {
  return <div className="midpilot-root"><DraggableChat /></div>;
};

export default App;