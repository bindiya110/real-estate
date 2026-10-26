import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/** Scrolls to the top on route changes (but not when only the query string changes). */
export default function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}
