import React, { useState, useMemo } from 'react';
import {
  Box,
  Card,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  TableSortLabel,
  Toolbar,
  Typography,
  TextField,
  InputAdornment,
  IconButton,
  Checkbox,
  Menu,
  MenuItem,
  Chip,
  Avatar,
  Button,
  alpha,
  useTheme,
} from '@mui/material';
import {
  Search as SearchIcon,
  FilterList as FilterIcon,
  MoreVert as MoreVertIcon,
  GetApp as ExportIcon,
  Add as AddIcon,
  Refresh as RefreshIcon,
} from '@mui/icons-material';

export interface TableColumn<T = any> {
  id: keyof T;
  label: string;
  align?: 'left' | 'center' | 'right';
  width?: number | string;
  sortable?: boolean;
  render?: (value: any, row: T) => React.ReactNode;
  format?: (value: any) => string;
}

export interface DataTableProps<T = any> {
  title?: string;
  data: T[];
  columns: TableColumn<T>[];
  loading?: boolean;
  searchable?: boolean;
  selectable?: boolean;
  pagination?: boolean;
  onRowClick?: (row: T) => void;
  onAdd?: () => void;
  onRefresh?: () => void;
  onExport?: () => void;
  onDelete?: (rows: T[]) => void;
  actions?: {
    label: string;
    icon?: React.ReactNode;
    onClick: (row: T) => void;
    color?: 'primary' | 'secondary' | 'error' | 'warning' | 'info' | 'success';
  }[];
  searchPlaceholder?: string;
  emptyMessage?: string;
  dense?: boolean;
  stickyHeader?: boolean;
}

type Order = 'asc' | 'desc';

export function DataTable<T extends Record<string, any>>({
  title,
  data,
  columns,
  loading = false,
  searchable = true,
  selectable = false,
  pagination = true,
  onRowClick,
  onAdd,
  onRefresh,
  onExport,
  onDelete,
  actions = [],
  searchPlaceholder = 'Search...',
  emptyMessage = 'No data available',
  dense = false,
  stickyHeader = false,
}: DataTableProps<T>) {
  const theme = useTheme();
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [orderBy, setOrderBy] = useState<keyof T>('');
  const [order, setOrder] = useState<Order>('asc');
  const [searchQuery, setSearchQuery] = useState('');
  const [selected, setSelected] = useState<T[]>([]);
  const [actionMenuAnchor, setActionMenuAnchor] = useState<null | HTMLElement>(null);
  const [actionMenuRow, setActionMenuRow] = useState<T | null>(null);

  const handleRequestSort = (property: keyof T) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  const handleSelectAllClick = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.checked) {
      setSelected(filteredData);
    } else {
      setSelected([]);
    }
  };

  const handleClick = (row: T) => {
    if (selectable) {
      const selectedIndex = selected.findIndex(item => JSON.stringify(item) === JSON.stringify(row));
      let newSelected: T[] = [];

      if (selectedIndex === -1) {
        newSelected = newSelected.concat(selected, row);
      } else if (selectedIndex === 0) {
        newSelected = newSelected.concat(selected.slice(1));
      } else if (selectedIndex === selected.length - 1) {
        newSelected = newSelected.concat(selected.slice(0, -1));
      } else if (selectedIndex > 0) {
        newSelected = newSelected.concat(
          selected.slice(0, selectedIndex),
          selected.slice(selectedIndex + 1)
        );
      }
      setSelected(newSelected);
    }
    
    if (onRowClick) {
      onRowClick(row);
    }
  };

  const handleActionMenuOpen = (event: React.MouseEvent<HTMLElement>, row: T) => {
    event.stopPropagation();
    setActionMenuAnchor(event.currentTarget);
    setActionMenuRow(row);
  };

  const handleActionMenuClose = () => {
    setActionMenuAnchor(null);
    setActionMenuRow(null);
  };

  const handleActionClick = (action: any) => {
    if (actionMenuRow) {
      action.onClick(actionMenuRow);
    }
    handleActionMenuClose();
  };

  const isSelected = (row: T) => selected.findIndex(item => JSON.stringify(item) === JSON.stringify(row)) !== -1;

  const filteredData = useMemo(() => {
    if (!searchQuery) return data;
    
    return data.filter((row) =>
      columns.some((column) => {
        const value = row[column.id];
        if (value == null) return false;
        return String(value).toLowerCase().includes(searchQuery.toLowerCase());
      })
    );
  }, [data, searchQuery, columns]);

  const sortedData = useMemo(() => {
    if (!orderBy) return filteredData;

    return [...filteredData].sort((a, b) => {
      const aValue = a[orderBy];
      const bValue = b[orderBy];
      
      if (aValue == null && bValue == null) return 0;
      if (aValue == null) return 1;
      if (bValue == null) return -1;
      
      const comparison = aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
      return order === 'desc' ? -comparison : comparison;
    });
  }, [filteredData, order, orderBy]);

  const paginatedData = pagination 
    ? sortedData.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
    : sortedData;

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const renderCellContent = (column: TableColumn<T>, row: T) => {
    const value = row[column.id];
    
    if (column.render) {
      return column.render(value, row);
    }
    
    if (column.format) {
      return column.format(value);
    }
    
    return value;
  };

  return (
    <Card sx={{ width: '100%' }}>
      {/* Toolbar */}
      <Toolbar
        sx={{
          pl: { sm: 2 },
          pr: { xs: 1, sm: 1 },
          ...(selected.length > 0 && {
            bgcolor: alpha(theme.palette.primary.main, 0.08),
          }),
        }}
      >
        {selected.length > 0 ? (
          <Typography
            sx={{ flex: '1 1 100%' }}
            color="inherit"
            variant="subtitle1"
            component="div"
          >
            {selected.length} selected
          </Typography>
        ) : (
          <Typography
            sx={{ flex: '1 1 100%' }}
            variant="h6"
            component="div"
          >
            {title}
          </Typography>
        )}

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {selected.length > 0 ? (
            <>
              {onDelete && (
                <Button
                  variant="outlined"
                  color="error"
                  size="small"
                  onClick={() => onDelete(selected)}
                >
                  Delete Selected
                </Button>
              )}
            </>
          ) : (
            <>
              {searchable && (
                <TextField
                  size="small"
                  placeholder={searchPlaceholder}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon fontSize="small" />
                      </InputAdornment>
                    ),
                  }}
                  sx={{ minWidth: 200 }}
                />
              )}
              
              {onRefresh && (
                <IconButton onClick={onRefresh} size="small">
                  <RefreshIcon />
                </IconButton>
              )}
              
              {onExport && (
                <IconButton onClick={onExport} size="small">
                  <ExportIcon />
                </IconButton>
              )}
              
              {onAdd && (
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={onAdd}
                  size="small"
                >
                  Add New
                </Button>
              )}
            </>
          )}
        </Box>
      </Toolbar>

      {/* Table */}
      <TableContainer>
        <Table
          sx={{ minWidth: 750 }}
          aria-labelledby="tableTitle"
          size={dense ? 'small' : 'medium'}
          stickyHeader={stickyHeader}
        >
          <TableHead>
            <TableRow>
              {selectable && (
                <TableCell padding="checkbox">
                  <Checkbox
                    color="primary"
                    indeterminate={selected.length > 0 && selected.length < filteredData.length}
                    checked={filteredData.length > 0 && selected.length === filteredData.length}
                    onChange={handleSelectAllClick}
                  />
                </TableCell>
              )}
              
              {columns.map((column) => (
                <TableCell
                  key={String(column.id)}
                  align={column.align || 'left'}
                  style={{ width: column.width }}
                  sortDirection={orderBy === column.id ? order : false}
                >
                  {column.sortable !== false ? (
                    <TableSortLabel
                      active={orderBy === column.id}
                      direction={orderBy === column.id ? order : 'asc'}
                      onClick={() => handleRequestSort(column.id)}
                    >
                      {column.label}
                    </TableSortLabel>
                  ) : (
                    column.label
                  )}
                </TableCell>
              ))}
              
              {actions.length > 0 && (
                <TableCell align="right" width={60}>
                  Actions
                </TableCell>
              )}
            </TableRow>
          </TableHead>
          
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell 
                  colSpan={columns.length + (selectable ? 1 : 0) + (actions.length > 0 ? 1 : 0)}
                  align="center"
                  sx={{ py: 8 }}
                >
                  Loading...
                </TableCell>
              </TableRow>
            ) : paginatedData.length === 0 ? (
              <TableRow>
                <TableCell 
                  colSpan={columns.length + (selectable ? 1 : 0) + (actions.length > 0 ? 1 : 0)}
                  align="center"
                  sx={{ py: 8 }}
                >
                  {emptyMessage}
                </TableCell>
              </TableRow>
            ) : (
              paginatedData.map((row, index) => {
                const isItemSelected = isSelected(row);
                const labelId = `enhanced-table-checkbox-${index}`;

                return (
                  <TableRow
                    hover
                    onClick={() => handleClick(row)}
                    role="checkbox"
                    aria-checked={isItemSelected}
                    tabIndex={-1}
                    key={index}
                    selected={isItemSelected}
                    sx={{ cursor: onRowClick || selectable ? 'pointer' : 'default' }}
                  >
                    {selectable && (
                      <TableCell padding="checkbox">
                        <Checkbox
                          color="primary"
                          checked={isItemSelected}
                          inputProps={{
                            'aria-labelledby': labelId,
                          }}
                        />
                      </TableCell>
                    )}
                    
                    {columns.map((column) => (
                      <TableCell
                        key={String(column.id)}
                        align={column.align || 'left'}
                      >
                        {renderCellContent(column, row)}
                      </TableCell>
                    ))}
                    
                    {actions.length > 0 && (
                      <TableCell align="right">
                        <IconButton
                          size="small"
                          onClick={(e) => handleActionMenuOpen(e, row)}
                        >
                          <MoreVertIcon />
                        </IconButton>
                      </TableCell>
                    )}
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Pagination */}
      {pagination && !loading && (
        <TablePagination
          rowsPerPageOptions={[5, 10, 25, 50]}
          component="div"
          count={sortedData.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      )}

      {/* Actions Menu */}
      <Menu
        anchorEl={actionMenuAnchor}
        open={Boolean(actionMenuAnchor)}
        onClose={handleActionMenuClose}
      >
        {actions.map((action, index) => (
          <MenuItem key={index} onClick={() => handleActionClick(action)}>
            {action.icon && <Box sx={{ mr: 2 }}>{action.icon}</Box>}
            {action.label}
          </MenuItem>
        ))}
      </Menu>
    </Card>
  );
}