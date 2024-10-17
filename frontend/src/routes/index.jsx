import {
  createBrowserRouter,
  RouterProvider,
  Navigate,
} from "react-router-dom";
import Login from "../pages/Login/Login";
import Register from "../pages/Register/Register";
import Error404 from "../pages/Error404/Error404";
import Recovery from "../pages/Recovery/Recovery";
import ProtectedRoute from "../components/auth/protectedRoute/ProtectedRoute";
import Main from "../components/Main/Main";
import Home from "../pages/Home/Home";

const router = createBrowserRouter([
  {
    path: "/",
    element: <Navigate to="moon-medical" />,
    errorElement: <Error404 />,
  },
  {
    path: "/moon-medical",
    children: [
      {
        index: true,
        element: <Navigate to="login" />, // Redirección a /gerente/empleados
      },
      {
        path: "login",
        element: <Login />,
      },
      {
        path: "register",
        element: <Register />,
      },
      {
        path: "recuperar-cuenta",
        element: <Recovery />,
      },
      {
        path: "app",
        element: (
          <ProtectedRoute>
            <Main />
          </ProtectedRoute>
        ),
        children: [
          {
            index: true,
            element: <Navigate to="home" />, // Redirección a /gerente/empleados
          },
          {
            path: "home",
            element: <Home />,
          },
        ],
      },
    ],
  },
]);

const MyRoutes = () => <RouterProvider router={router} />;

export default MyRoutes;
