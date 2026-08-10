import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import MainLayout from './layouts/MainLayout';
import Home from './pages/Home';
import Docs from './pages/Docs';
import Installation from './pages/Installation';
import Security from './pages/Security';
import Changelog from './pages/Changelog';

const router = createBrowserRouter([
  {
    path: '/',
    element: <MainLayout />,
    children: [
      { index: true,            element: <Home /> },
      { path: 'docs',           element: <Docs /> },
      { path: 'installation',   element: <Installation /> },
      { path: 'security',       element: <Security /> },
      { path: 'changelog',      element: <Changelog /> },
    ],
  },
]);

export default function App() {
  return <RouterProvider router={router} />;
}
