import './App.css';
import EmpDetail from './components/EmpDetail';
import LeaveApplicationForm from './components/LeaveApplicationForm';
import Login from './components/Login';
import {BrowserRouter, Routes, Route} from "react-router-dom";
import ManagerDetail from './components/ManagerDetail';
import Admin from './components/Admin';

function App() {
  return (
    <div className="App">

<BrowserRouter>
<Routes>
  
  <Route path="/" element={<Login/>} />
  <Route path="/detail" element={<EmpDetail />} />
  <Route path="/leave" element={<LeaveApplicationForm/>} />
  <Route path = "/manager-dashboard" element={<ManagerDetail/>}/>
  <Route path ="/admin" element={<Admin/>} />
</Routes>
</BrowserRouter>
     
    </div>
  );
}

export default App;
