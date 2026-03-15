import React, { useEffect, useMemo, useState } from 'react'
import {
  CAlert,
  CButton,
  CCard,
  CCardBody,
  CCardHeader,
  CFormCheck,
  CListGroup,
  CListGroupItem,
} from '@coreui/react'

const formatCurrency = (value) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(value || 0))

const LoadOrderAssignment = ({ load, isSaving, onSave }) => {
  const initialSelection = useMemo(
    () => (load?.orders || []).map((order) => Number(order.id)),
    [load?.orders],
  )
  const [selectedIds, setSelectedIds] = useState(initialSelection)

  useEffect(() => {
    setSelectedIds(initialSelection)
  }, [initialSelection])

  const allOrders = useMemo(() => {
    const assigned = load?.orders || []
    const available = load?.available_orders || []
    const map = new Map()

    assigned.forEach((item) => map.set(Number(item.id), item))
    available.forEach((item) => map.set(Number(item.id), item))

    return Array.from(map.values())
  }, [load?.available_orders, load?.orders])

  const toggleOrder = (orderId) => {
    setSelectedIds((current) =>
      current.includes(orderId) ? current.filter((id) => id !== orderId) : [...current, orderId],
    )
  }

  return (
    <CCard className="shadow-sm border-0">
      <CCardHeader className="d-flex justify-content-between align-items-center">
        <span>Pedidos vinculados a carga</span>
        <CButton color="primary" size="sm" disabled={isSaving} onClick={() => onSave(selectedIds)}>
          {isSaving ? 'Salvando...' : 'Salvar vinculacao'}
        </CButton>
      </CCardHeader>
      <CCardBody>
        <CAlert color="light" className="border">
          Selecione os pedidos que devem compor esta carga. Os totais de peso, volume e valor serao recalculados ao salvar.
        </CAlert>
        <CListGroup flush>
          {allOrders.length === 0 ? (
            <CListGroupItem className="text-body-secondary px-0">
              Nao ha pedidos disponiveis para esta carga no momento.
            </CListGroupItem>
          ) : (
            allOrders.map((order) => {
              const orderId = Number(order.id)
              const checked = selectedIds.includes(orderId)

              return (
                <CListGroupItem
                  key={order.id}
                  className="px-0 d-flex justify-content-between align-items-start gap-3"
                >
                  <div className="d-flex gap-3">
                    <CFormCheck checked={checked} onChange={() => toggleOrder(orderId)} />
                    <div>
                      <div className="fw-semibold">{order.numero_pedido}</div>
                      <div>{order.cliente_nome}</div>
                      <small className="text-body-secondary">
                        {order.cidade_entrega}/{order.estado_entrega}
                      </small>
                    </div>
                  </div>
                  <div className="text-end">
                    <div>{order.peso_total || 0} kg</div>
                    <small className="text-body-secondary">{formatCurrency(order.valor_mercadoria)}</small>
                  </div>
                </CListGroupItem>
              )
            })
          )}
        </CListGroup>
      </CCardBody>
    </CCard>
  )
}

export default LoadOrderAssignment
