import './App.css'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { Landing } from './screens/Landing'
import { Game } from './screens/Game'

function App() {
  return (
    <div className='sm-sm:h-fit h-full md-lg:h-screen bg-dark-gray'>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/play" element={<Game />} />
      </Routes>
    </BrowserRouter>
    </div>
  )
}

export default App
