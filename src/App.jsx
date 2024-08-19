import './App.css'
import Navbar from "./components/Navbar"
import Galaga from './components/Galaga'

function App() {

  return (
    
    <>
      <div className='pageContainer'>
        <div className='backgroundGrid'/>
            <div className='content'>
            <Navbar />
            <h1 className='title'>Galaga</h1> 
            <Galaga />
            </div>
      </div>
    </>
  )
}

export default App
