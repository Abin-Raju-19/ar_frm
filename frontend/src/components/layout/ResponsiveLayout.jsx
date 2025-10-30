import React from 'react';
import Container from '../ui/Container';

export default function ResponsiveLayout({ 
  children, 
  sidebar, 
  header, 
  footer,
  sidebarWidth = 'w-64',
  collapsible = true
}) {
  const [collapsed, setCollapsed] = React.useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  // Handle responsive behavior
  React.useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setCollapsed(true);
      } else {
        setCollapsed(false);
      }
    };

    window.addEventListener('resize', handleResize);
    handleResize();
    
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const toggleSidebar = () => {
    if (window.innerWidth < 768) {
      setMobileMenuOpen(!mobileMenuOpen);
    } else {
      setCollapsed(!collapsed);
    }
  };

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
      {/* Sidebar - desktop */}
      <div 
        className={`
          hidden md:block
          ${collapsed ? 'w-16' : sidebarWidth} 
          transition-all duration-300 ease-in-out
          bg-white dark:bg-gray-800 shadow-md
        `}
      >
        {sidebar && (
          <div className="h-full overflow-y-auto">
            {sidebar}
          </div>
        )}
      </div>

      {/* Mobile sidebar overlay */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-40 md:hidden">
          <div className="fixed inset-0 bg-gray-600 bg-opacity-75" onClick={() => setMobileMenuOpen(false)}></div>
          <div className={`fixed inset-y-0 left-0 flex flex-col z-40 ${sidebarWidth} bg-white dark:bg-gray-800 shadow-xl`}>
            {sidebar}
          </div>
        </div>
      )}

      {/* Main content */}
      <div className="flex flex-col flex-1 overflow-hidden">
        {/* Header */}
        {header && (
          <header className="bg-white dark:bg-gray-800 shadow-sm z-10">
            <div className="px-4 sm:px-6 lg:px-8 py-4 flex items-center">
              {collapsible && (
                <button 
                  onClick={toggleSidebar}
                  className="mr-4 text-gray-500 hover:text-gray-700 focus:outline-none"
                >
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                </button>
              )}
              {header}
            </div>
          </header>
        )}

        {/* Main content */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <Container>
            {children}
          </Container>
        </main>

        {/* Footer */}
        {footer && (
          <footer className="bg-white dark:bg-gray-800 shadow-inner">
            <Container>
              <div className="py-4">
                {footer}
              </div>
            </Container>
          </footer>
        )}
      </div>
    </div>
  );
}