import React from 'react'
import { CPagination, CPaginationItem } from '@coreui/react'

const CrudPagination = ({ page, pageCount, total = 0, perPage = 0, itemLabel = 'registros', onPageChange }) => {
  if (pageCount <= 1) {
    return null
  }

  const startPage = Math.max(1, page - 2)
  const endPage = Math.min(pageCount, page + 2)
  const pages = Array.from({ length: endPage - startPage + 1 }, (_, index) => startPage + index)
  const startItem = total > 0 && perPage > 0 ? (page - 1) * perPage + 1 : null
  const endItem = total > 0 && perPage > 0 ? Math.min(total, page * perPage) : null

  return (
    <div className="d-flex flex-column flex-md-row justify-content-between align-items-center gap-3 mt-4">
      <div className="small text-body-secondary">
        {startItem && endItem ? `Exibindo ${startItem}-${endItem} de ${total} ${itemLabel}` : `Pagina ${page} de ${pageCount}`}
      </div>
      <CPagination align="end" className="mb-0">
        <CPaginationItem disabled={page <= 1} onClick={() => onPageChange(page - 1)}>
          Anterior
        </CPaginationItem>
        {startPage > 1 ? <CPaginationItem disabled>...</CPaginationItem> : null}
        {pages.map((item) => (
          <CPaginationItem active={item === page} key={item} onClick={() => onPageChange(item)}>
            {item}
          </CPaginationItem>
        ))}
        {endPage < pageCount ? <CPaginationItem disabled>...</CPaginationItem> : null}
        <CPaginationItem disabled={page >= pageCount} onClick={() => onPageChange(page + 1)}>
          Proxima
        </CPaginationItem>
      </CPagination>
    </div>
  )
}

export default CrudPagination
