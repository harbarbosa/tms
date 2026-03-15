import React from 'react'
import { CPagination, CPaginationItem } from '@coreui/react'

const CrudPagination = ({ page, pageCount, onPageChange }) => {
  if (pageCount <= 1) {
    return null
  }

  const pages = Array.from({ length: pageCount }, (_, index) => index + 1)

  return (
    <CPagination align="end" className="mb-0">
      <CPaginationItem disabled={page <= 1} onClick={() => onPageChange(page - 1)}>
        Anterior
      </CPaginationItem>
      {pages.map((item) => (
        <CPaginationItem active={item === page} key={item} onClick={() => onPageChange(item)}>
          {item}
        </CPaginationItem>
      ))}
      <CPaginationItem disabled={page >= pageCount} onClick={() => onPageChange(page + 1)}>
        Proxima
      </CPaginationItem>
    </CPagination>
  )
}

export default CrudPagination
