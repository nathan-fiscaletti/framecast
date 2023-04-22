import './App.css';

import Viewer from './Viewer';
import Selector from './Selector';
import Settings from './Settings';

const App = () => {
  const urlParams = new URLSearchParams(window.location.search);
  const content = urlParams.get('content');
  if (content === "viewer") {
    return (<Viewer />);
  } else if (content === "selector") {
    return (<Selector />);
  } else if (content === "settings") {
    return (<Settings />);
  }

  return (<div>Invalid content</div>);
};

export default App;
