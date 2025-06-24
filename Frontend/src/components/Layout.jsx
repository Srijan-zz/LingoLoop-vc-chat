import React from 'react'
import Sidebar from './Sidebar'
import Navbar from './Navbar'
import { useLocation } from 'react-router';

function Layout({children, showSidebar}) {
    const location = useLocation();
    console.log("NotificationsPage rendered 1")
  return (
    <div key={location.pathname} className="min-h-screen">
      <div className="flex">
        {showSidebar && <Sidebar />}
{console.log("NotificationsPage rendered 2")
}
        <div className="flex-1 flex flex-col">
          <Navbar />

          <main className="flex-1 overflow-y-auto">{children}</main>
        </div>
      </div>
    </div>
  )
}

export default Layout