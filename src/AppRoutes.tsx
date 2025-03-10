import {
    BrowserRouter,
    Route,
    Routes
  } from "react-router-dom";
  import App from './App';
  import S3 from './S3';
  
  const AppRoutes = () => {
    return (
      <BrowserRouter>
        <Routes>
          <Route path='/' element={<App />} />
          <Route path='/app' element={<S3 />} />
        </Routes>
      </BrowserRouter>
    )
  }
  
  export default AppRoutes;