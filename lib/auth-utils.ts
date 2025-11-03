'use client';

/**
 * Clears all client-side data (localStorage, sessionStorage, etc.)
 */
export const clearClientData = () => {
  try {
    // Clear all items from localStorage
    localStorage.clear();
    
    // Clear all items from sessionStorage
    sessionStorage.clear();
    
    // Clear any IndexedDB databases (if used)
    if (window.indexedDB) {
      const dbs = window.indexedDB.databases();
      dbs.then((dbs) => {
        dbs.forEach(db => {
          if (db.name) {
            window.indexedDB.deleteDatabase(db.name);
          }
        });
      }).catch(console.error);
    }
    
    // Clear any service worker caches (if used)
    if ('caches' in window) {
      caches.keys().then(cacheNames => {
        cacheNames.forEach(cacheName => {
          caches.delete(cacheName);
        });
      }).catch(console.error);
    }
    
    // Clear form data (works for forms with data-form attribute)
    document.querySelectorAll('form[data-form]').forEach(form => {
      (form as HTMLFormElement).reset();
    });
    
    return true;
  } catch (error) {
    console.error('Error clearing client data:', error);
    return false;
  }
};

/**
 * Performs a complete logout by:
 * 1. Calling the server logout endpoint
 * 2. Clearing all client-side data
 * 3. Redirecting to the home page
 */
export const performLogout = async (redirectPath = '/') => {
  try {
    // Call the server logout endpoint
    const response = await fetch('/api/auth/logout', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    if (!response.ok) {
      throw new Error('Logout failed');
    }
    
    // Clear client-side data
    clearClientData();
    
    // Clear any existing intervals or timeouts
    // @ts-ignore - TypeScript doesn't like us clearing all timeouts, but it's safe
    const highestTimeoutId = window.setTimeout(() => {}, 0);
    // @ts-ignore - TypeScript doesn't like us clearing all timeouts, but it's safe
    for (let i = highestTimeoutId; i >= 0; i--) {
      clearTimeout(i);
      clearInterval(i);
    }
    
    // Force a hard redirect to ensure all state is cleared
    if (typeof window !== 'undefined') {
      window.location.href = redirectPath;
    }
    
    return { success: true };
  } catch (error) {
    console.error('Error during logout:', error);
    return { success: false, error };
  }
};
