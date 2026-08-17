import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import GlobalPopup from './components/GlobalPopup';

function App() {
  return (
    <BrowserRouter>
      <GlobalPopup />
      <Routes>
        <Route path="/" element={<Home />} />
      </Routes>
    </BrowserRouter>
  );
}
export default App;