import './App.css';
import Router from './Components/Router';
import { useState,createContext } from 'react';
export let loginpassData = createContext()
function App() {
  const[loginUser, setLoginUser] = useState({
    email: '',
    Password: '',
  })
  return (
    <div className="App">
      <loginpassData.Provider value={{loginUser,setLoginUser}} >
        <Router />
      </loginpassData.Provider>
    </div>
  );
}

export default App;
