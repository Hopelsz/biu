import React, { useCallback, useState, useEffect } from "react";

import { Input } from "@heroui/react";
import { RiSearchLine } from "@remixicon/react";

interface SearchInputProps {
  value?: string;
  placeholder?: string;
  onChange?: (value: string) => void;
  onSearch?: (value: string) => void;
  debounceDelay?: number;
  className?: string;
  maxWidth?: number;
}

const SearchInput: React.FC<SearchInputProps> = ({
  value = "",
  placeholder = "搜索",
  onChange,
  onSearch,
  debounceDelay = 300,
  className = "",
  maxWidth = 300,
}) => {
  const [inputValue, setInputValue] = useState(value);
  const [debounceTimer, setDebounceTimer] = useState<NodeJS.Timeout | null>(null);

  useEffect(() => {
    setInputValue(value);
  }, [value]);

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = e.target.value;
      setInputValue(newValue);
      onChange?.(newValue);

      if (debounceTimer) {
        clearTimeout(debounceTimer);
      }

      const timer = setTimeout(() => {
        onSearch?.(newValue);
      }, debounceDelay);

      setDebounceTimer(timer);
    },
    [onChange, onSearch, debounceDelay, debounceTimer],
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Enter") {
        onSearch?.(inputValue);
      }
    },
    [inputValue, onSearch],
  );

  useEffect(() => {
    return () => {
      if (debounceTimer) {
        clearTimeout(debounceTimer);
      }
    };
  }, [debounceTimer]);

  return (
    <div style={{ maxWidth }} className={className}>
      <Input
        value={inputValue}
        onChange={handleInputChange}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        className="w-full"
        startContent={<RiSearchLine className="text-foreground-400" size={16} />}
      />
    </div>
  );
};

export default SearchInput;
