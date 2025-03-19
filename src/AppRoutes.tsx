import {
    BrowserRouter,
    Route,
    Routes
  } from "react-router-dom";
  import App from './App';
  import S3 from './S3';
import Face from "./Face";
  
  const AppRoutes = () => {
    return (
      <BrowserRouter>
        <Routes>
          <Route path='/' element={<App />} />
          <Route path='/app' element={<S3 />} />
          <Route path='/face' element={<Face />} />
        </Routes>
      </BrowserRouter>
    )
  }
  
  export default AppRoutes;