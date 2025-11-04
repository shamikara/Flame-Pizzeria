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
 * 2. Clearing all client-side data including cart
 * 3. Clearing any intervals/timeouts
 * 4. Redirecting to the home page
 */
// Global variable to track logout state
let isLoggingOut = false;

export const performLogout = async (redirectPath = '/', onLogoutStart?: () => void) => {
  // Prevent multiple simultaneous logout attempts
  if (isLoggingOut) return { success: false, error: 'Logout already in progress' };
  
  isLoggingOut = true;
  
  try {
    // Show loading state if callback provided
    if (onLogoutStart) onLogoutStart();
    
    // 1. First, ensure cart is cleared with a small delay to allow UI to update
    if (typeof window !== 'undefined') {
      // Clear cart immediately
      localStorage.removeItem('shopping-cart');
      
      // Dispatch clear-cart event with a unique ID to ensure it's processed
      const clearEvent = new CustomEvent('clear-cart', { 
        detail: { 
          timestamp: Date.now(),
          fromLogout: true 
        } 
      });
      window.dispatchEvent(clearEvent);
      
      // Wait a bit to ensure cart is cleared in the UI
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // 2. Clear all other storage
      localStorage.clear();
      sessionStorage.clear();
      
      // 3. Clear cookies
      document.cookie.split(';').forEach(cookie => {
        const [name] = cookie.trim().split('=');
        document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
      });
      
      // 4. Clear service worker caches
      if ('caches' in window) {
        try {
          const cacheNames = await caches.keys();
          await Promise.all(cacheNames.map(name => caches.delete(name)));
        } catch (e) {
          console.warn('Failed to clear caches:', e);
        }
      }
      
      // 5. Force clear any pending state updates
      if (window.__NEXT_DATA__) {
        window.__NEXT_DATA__.props.pageProps = {};
      }
    }
    
    // Clear any pending timeouts/intervals
    if (typeof window !== 'undefined') {
      const highestTimeoutId = window.setTimeout(() => {}, 0);
      for (let i = highestTimeoutId; i >= 0; i--) {
        clearTimeout(i);
        clearInterval(i);
      }
    }
    
    // Call server logout
    await fetch('/actions/logout', { 
      method: 'POST',
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    });
    
    // Force a complete page reload with cache busting and double refresh
    if (typeof window !== 'undefined') {
      // Add a small delay to ensure all cleanup is done
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // Clear the cart one more time before redirect
      localStorage.removeItem('shopping-cart');
      
      // First refresh - immediate
      const timestamp = Date.now();
      window.location.href = `${redirectPath}?v=${timestamp}&nocache=${timestamp}&refresh=1`;
      
      // Second refresh after a short delay
      setTimeout(() => {
        // Clear everything again before second refresh
        localStorage.removeItem('shopping-cart');
        localStorage.clear();
        sessionStorage.clear();
        
        // Force a hard reload with new cache-busting parameters
        const newTimestamp = Date.now();
        window.location.href = `${redirectPath}?v=${newTimestamp}&nocache=${newTimestamp}&refresh=2`;
        
        // Final reload to ensure clean state
        setTimeout(() => {
          window.location.reload();
        }, 50);
      }, 100);
    }
    
    return { success: true };
  } catch (error) {
    console.error('Error during logout:', error);
    return { success: false, error };
  } finally {
    isLoggingOut = false;
  }
};
