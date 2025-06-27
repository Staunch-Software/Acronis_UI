import { useState, useMemo } from 'react';

export const useConfigurableColumns = (initialColumns, maxVisible = 4) => {
  const [columns, setColumns] = useState(initialColumns);

  // Calculate the number of currently visible columns.
  // We use useMemo for a small performance boost.
  const visibleColumnCount = useMemo(() => {
    return columns.filter(col => col.isVisible).length;
  }, [columns]);

  // --- THIS IS THE UPDATED LOGIC ---
  const handleColumnToggle = (columnId) => {
    const targetColumn = columns.find(col => col.id === columnId);
    if (!targetColumn) return;

    // THE NEW, SIMPLER RULE:
    // We only block the action if the user tries to *check* a new box
    // when the limit is already reached. Unchecking is always allowed.
    if (!targetColumn.isVisible && visibleColumnCount >= maxVisible) {
      // We do nothing. No alert, no state change.
      // The UI will handle showing the user why they can't click.
      return;
    }

    // If the rule passes, update the state as before.
    setColumns(prevColumns =>
      prevColumns.map(col =>
        col.id === columnId ? { ...col, isVisible: !col.isVisible } : col
      )
    );
  };

  const activeColumns = useMemo(() => {
    return columns.filter(col => col.isVisible);
  }, [columns]);

  // --- We now return an additional piece of information ---
  return {
    columns,
    handleColumnToggle,
    activeColumns,
    isMaxColumnsReached: visibleColumnCount >= maxVisible, // NEW: A boolean flag
  };
};