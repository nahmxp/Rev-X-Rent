import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';

export default function CategoryTabs({ 
  categories, 
  activeCategory, 
  onSelectCategory, 
  type = 'category',
  multiSelect = false,
  selectedItems = ['all']
}) {
  const [isScrollable, setIsScrollable] = useState(false);
  const [scrollPosition, setScrollPosition] = useState(0);
  const router = useRouter();
  
  // Reference to the tabs container
  const tabsRef = useRef(null);
  
  // Check if tabs are scrollable
  useEffect(() => {
    const checkScrollable = () => {
      if (tabsRef.current) {
        const { scrollWidth, clientWidth } = tabsRef.current;
        setIsScrollable(scrollWidth > clientWidth);
      }
    };
    
    checkScrollable();
    window.addEventListener('resize', checkScrollable);
    
    return () => {
      window.removeEventListener('resize', checkScrollable);
    };
  }, [categories]);
  
  // Scroll tabs left
  const scrollLeft = () => {
    if (tabsRef.current) {
      const newPosition = Math.max(0, scrollPosition - 200);
      tabsRef.current.scrollTo({ left: newPosition, behavior: 'smooth' });
      setScrollPosition(newPosition);
    }
  };
  
  // Scroll tabs right
  const scrollRight = () => {
    if (tabsRef.current) {
      const { scrollWidth, clientWidth } = tabsRef.current;
      const maxScrollPosition = scrollWidth - clientWidth;
      const newPosition = Math.min(maxScrollPosition, scrollPosition + 200);
      tabsRef.current.scrollTo({ left: newPosition, behavior: 'smooth' });
      setScrollPosition(newPosition);
    }
  };
  
  // Handle tab scroll
  const handleScroll = () => {
    if (tabsRef.current) {
      setScrollPosition(tabsRef.current.scrollLeft);
    }
  };

  // Check if an item is selected (for multi-select)
  const isSelected = (value) => {
    if (!multiSelect) {
      return activeCategory === value;
    }
    return selectedItems.includes(value);
  };

  // Handle tab click for single or multi-select
  const handleTabClick = (value) => {
    if (!multiSelect) {
      // Single select mode
      onSelectCategory(value);
      
      // If we're on the dashboard, just update the filter
      if (router.pathname === '/') {
        return;
      }

      // If we're already on a catalog page, navigate to the appropriate one
      const path = `/${type}/${value}`;
      router.push(path);
    } else {
      // Multi-select mode
      let newSelection;
      
      if (value === 'all') {
        // If "All" is clicked, deselect everything else
        newSelection = ['all'];
      } else if (selectedItems.includes(value)) {
        // If already selected, remove it (unless it's the last one)
        if (selectedItems.length > 1) {
          newSelection = selectedItems.filter(item => item !== value);
          // If we're removing all non-"all" items, select "all"
          if (newSelection.length === 0 || (newSelection.length === 1 && newSelection[0] === 'all')) {
            newSelection = ['all'];
          }
          // If "all" is in the selection along with other items, remove "all"
          if (newSelection.includes('all') && newSelection.length > 1) {
            newSelection = newSelection.filter(item => item !== 'all');
          }
        } else {
          // Can't deselect the last item
          newSelection = selectedItems;
        }
      } else {
        // If not selected, add it and remove "all" if it's there
        if (selectedItems.includes('all')) {
          newSelection = [value];
        } else {
          newSelection = [...selectedItems, value];
        }
      }
      
      // Update the parent component with new selection
      onSelectCategory(newSelection);
    }
  };

  // Generate the URL for a tab (only used in single-select mode)
  const getTabUrl = (value) => {
    if (multiSelect) return '#';
    return `/${type}/${value}`;
  };
  
  return (
    <div 
      className="category-tabs-container" 
      data-multi-select={multiSelect ? "true" : "false"}
    >
      {isScrollable && (
        <button 
          className="tab-scroll-button left" 
          onClick={scrollLeft}
          disabled={scrollPosition === 0}
          aria-label={`Scroll ${type}s left`}
        >
          &lt;
        </button>
      )}
      
      <div 
        className="category-tabs" 
        ref={tabsRef}
        onScroll={handleScroll}
      >
        {multiSelect ? (
          // Multi-select mode: render buttons without links
          <>
            <button
              className={`category-tab ${isSelected('all') ? 'active' : ''}`}
              onClick={() => handleTabClick('all')}
            >
              {type === 'category' ? 'All Categories' : 'All Brands'}
            </button>
            
            {categories.map(category => (
              <button
                key={category}
                className={`category-tab ${isSelected(category) ? 'active' : ''}`}
                onClick={() => handleTabClick(category)}
              >
                {category}
              </button>
            ))}
          </>
        ) : (
          // Single-select mode: render buttons with links
          <>
            <Link href={getTabUrl('all')}>
              <button
                className={`category-tab ${activeCategory === 'all' ? 'active' : ''}`}
                onClick={() => handleTabClick('all')}
              >
                {type === 'category' ? 'All Categories' : 'All Brands'}
              </button>
            </Link>
            
            {categories.map(category => (
              <Link href={getTabUrl(category)} key={category}>
                <button
                  className={`category-tab ${activeCategory === category ? 'active' : ''}`}
                  onClick={() => handleTabClick(category)}
                >
                  {category}
                </button>
              </Link>
            ))}
          </>
        )}
      </div>
      
      {isScrollable && (
        <button 
          className="tab-scroll-button right" 
          onClick={scrollRight}
          disabled={tabsRef.current && scrollPosition >= tabsRef.current.scrollWidth - tabsRef.current.clientWidth}
          aria-label={`Scroll ${type}s right`}
        >
          &gt;
        </button>
      )}
    </div>
  );
} 