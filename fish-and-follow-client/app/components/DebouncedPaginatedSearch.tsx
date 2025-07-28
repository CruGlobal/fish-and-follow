import React, { useState, useRef, useEffect } from "react";
import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandLoading,
} from "./ui/command";
import { AnimatedHeight } from "./AnimatedHeight";
import { useDebounceSearch } from "~/hooks/useDebounce";

function DebouncedPaginatedSearch({
  items,
  onSearch,
  onSelect,
  selectedItems = [],
}: {
  items: any[];
  onSearch: (query: string) => void | Promise<void>;
  onSelect?: (key: string) => void;
  selectedItems?: string[]; // Array of selected item keys to filter out
}) {
  const [userSearch, setUserSearch] = useState("");
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Handle item selection
  const handleSelect = (value: string) => {
    onSelect?.(value);
    setUserSearch("");
  };

  // Use the debounce search hook
  const { isSearching } = useDebounceSearch(
    userSearch,
    async (query) => {
      try {
        await onSearch(query);
      } catch (error) {
        console.error('Search error:', error);
      }
    },
    300, // 300ms delay
    0 // Minimum length (0 means search even with empty string)
  );

  function handleInputChange(value: string) {
    setUserSearch(value);
    // The debounced search will be handled by the useDebounceSearch hook
  }

  // Filter out already selected items
  const availableItems = items.filter(([key]) => !selectedItems.includes(key));

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    };

    // Only add listener when dropdown is open
    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [open]);

  return (
    <div ref={containerRef} className="relative">
      <Command 
        className="border" 
        loop
        shouldFilter={false}
        value=""
      >
        <CommandInput
          placeholder="Search contacts..."
          value={userSearch}
          onValueChange={handleInputChange}
          onFocus={() => setOpen(true)}
        />
        
        {/* Dropdown section - absolutely positioned */}
        <AnimatedHeight
          isOpen={open}
          duration={300}
          maxHeight={400}
          easing="ease-in-out"
          onEscapePress={() => setOpen(false)}
          enableEscapeClose={true}
          absolute={true}
          fadeContent={true}
          className="bg-white border border-t-0 rounded-b-md shadow-lg"
        >
          <CommandList>
            {isSearching ? (
              <CommandLoading>Searching...</CommandLoading>
            ) : (
              <>
                {availableItems.length === 0 && userSearch && (
                  <CommandEmpty>No results found.</CommandEmpty>
                )}
                {availableItems.length === 0 && !userSearch && selectedItems.length > 0 && (
                  <CommandEmpty>All contacts have been selected.</CommandEmpty>
                )}
                {availableItems.length === 0 && !userSearch && selectedItems.length === 0 && (
                  <CommandEmpty>Start typing to search contacts...</CommandEmpty>
                )}
                {availableItems.length > 0 && (
                  <CommandGroup heading="Contacts">
                    {availableItems.map(([key, name]) => {
                      return (
                        <CommandItem
                          onSelect={handleSelect}
                          key={key}
                          value={key}
                        >
                          {name}
                        </CommandItem>
                      );
                    })}
                  </CommandGroup>
                )}
              </>
            )}
          </CommandList>
        </AnimatedHeight>
      </Command>
    </div>
  );
}

export default DebouncedPaginatedSearch;
