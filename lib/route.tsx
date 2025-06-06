import {
    MdDashboard,
    MdPeople,
    MdRestaurantMenu,
    MdListAlt,
    MdReceiptLong,
    MdFastfood,
  } from 'react-icons/md';
  
  const routes = [
    {
      name: 'Dashboard',
      layout: '/dashboard',
      path: 'overview',
      icon: <MdDashboard className="h-5 w-5" />,
    },
    {
      name: 'Users',
      layout: '/dashboard',
      path: 'users',
      icon: <MdPeople className="h-5 w-5" />,
    },
    {
      name: 'Employees',
      layout: '/dashboard',
      path: 'employees',
      icon: <MdPeople className="h-5 w-5" />,
    },
    {
      name: 'Orders',
      layout: '/dashboard',
      path: 'orders',
      icon: <MdListAlt className="h-5 w-5" />,
    },
    {
      name: 'Foods',
      layout: '/dashboard',
      path: 'foods',
      icon: <MdFastfood className="h-5 w-5" />,
    },
    {
      name: 'Stock',
      layout: '/dashboard',
      path: 'raw-materials',
      icon: <MdRestaurantMenu className="h-5 w-5" />,
    },
    {
      name: 'Reports',
      layout: '/dashboard',
      path: 'reports',
      icon: <MdReceiptLong className="h-5 w-5" />,
    },
  ];
  
  export default routes;
  