import { lazy } from 'react';

import { Navigate } from 'react-router-dom';

const Logout = lazy(() => import('@/pages/Logout.jsx'));
const NotFound = lazy(() => import('@/pages/NotFound.jsx'));


const Customer = lazy(() => import('@/pages/Customer'));
const Product = lazy(() => import('@/pages/Product')); 
const Inventory = lazy(() => import('@/pages/Inventory')); 
const Order = lazy(() => import('@/pages/Order'));
const OrderCreate = lazy(() => import('@/pages/Order/OrderCreate'));
const OrderRead = lazy(() => import('@/pages/Order/OrderRead'));
const OrderUpdate = lazy(() => import('@/pages/Order/OrderUpdate'));
const Supplier = lazy(() => import('@/pages/Customer')); // using dummy components for now, ideally user hooks up new Pages
const Category = lazy(() => import('@/pages/Category'));
const Brand = lazy(() => import('@/pages/Brand'));
const Reports = lazy(() => import('@/pages/Reports'));

const Settings = lazy(() => import('@/pages/Settings/Settings'));

const Expense = lazy(() => import('@/pages/Expense'));
const InventoryLog = lazy(() => import('@/pages/InventoryLog'));
const Dashboard = lazy(() => import('@/pages/Dashboard'));

let routes = {
  expense: [],
  default: [
    {
      path: '/login',
      element: <Navigate to="/" />,
    },
    {
      path: '/logout',
      element: <Logout />,
    },
    {
      path: '/',
      element: <Dashboard />,
    },
    {
      path: '/inventorylog',
      element: <InventoryLog />,
    },
    {
      path: '/customer',
      element: <Customer />,
    },
    {
      path: '/order',
      element: <Order />,
    },
    {
       path: '/reports',
       element: <Reports />,
    },
    {
       path: '/expense',
       element: <Expense />,
    },
    {
      path: '/order/create',
      element: <OrderCreate />,
    },
    {
      path: '/order/read/:id',
      element: <OrderRead />,
    },
    {
      path: '/order/update/:id',
      element: <OrderUpdate />,
    },
    {
      path: '/product',
      element: <Product />,
    },
    {
      path: '/inventory',
      element: <Inventory />,
    },
    {
      path: '/supplier',
      element: <Supplier />,
    },
    {
      path: '/category',
      element: <Category />,
    },
    {
      path: '/brand',
      element: <Brand />,
    },
    {
      path: '/settings',
      element: <Settings />,
    },
    {
      path: '/settings/edit/:settingsKey',
      element: <Settings />,
    },
    {
      path: '*',
      element: <NotFound />,
    },
  ],
};

export default routes;
