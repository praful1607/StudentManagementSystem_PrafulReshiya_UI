import './TableComponent.css';

const TableComponent = ({
    columns,
    data,
    loading,
    sortColumn,
    sortDirection,
    onSort,
    page,
    pageSize,
    totalCount,
    totalPages,
    onPageChange,
    emptyMessage = "No records found"
}) => {
    const handleSort = (columnKey) => {
        if (!onSort) return;
        onSort(columnKey);
    };

    const renderSortIcon = (columnKey) => {
        if (sortColumn !== columnKey) return <span className="sort-icon invisible">↕</span>;
        return <span className="sort-icon">{sortDirection === 'asc' ? '↑' : '↓'}</span>;
    };

    return (
        <div>
            <div className="grid-container">
                <table className="data-grid">
                    <thead>
                        <tr>
                            {columns.map((col, idx) => (
                                <th 
                                    key={idx} 
                                    onClick={() => col.sortable && handleSort(col.key)}
                                    className={col.sortable ? "sortable-col" : ""}
                                    style={col.style || {}}
                                >
                                    {col.label} {col.sortable && renderSortIcon(col.key)}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr><td colSpan={columns.length} className="text-center">Loading...</td></tr>
                        ) : data.length === 0 ? (
                            <tr><td colSpan={columns.length} className="text-center">{emptyMessage}</td></tr>
                        ) : (
                            data.map((row, rowIdx) => (
                                <tr key={row.id || rowIdx}>
                                    {columns.map((col, colIdx) => (
                                        <td key={colIdx} className={col.className || ""}>
                                            {col.render ? col.render(row) : row[col.key]}
                                        </td>
                                    ))}
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Pagination */}
            {onPageChange && totalPages > 0 && (
                <div className="pagination">
                    <div className="page-info">
                        Showing {data.length > 0 ? ((page - 1) * pageSize) + 1 : 0} to {Math.min(page * pageSize, totalCount)} of {totalCount} records
                    </div>
                    <div className="page-controls">
                        <button
                            disabled={page === 1}
                            onClick={() => onPageChange(page - 1)}
                            className="btn-page"
                            title="Previous Page"
                        >
                            &lt;
                        </button>
                        <span className="page-current">Page {page} of {totalPages || 1}</span>
                        <button
                            disabled={page === totalPages || totalPages === 0}
                            onClick={() => onPageChange(page + 1)}
                            className="btn-page"
                            title="Next Page"
                        >
                            &gt;
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default TableComponent;
