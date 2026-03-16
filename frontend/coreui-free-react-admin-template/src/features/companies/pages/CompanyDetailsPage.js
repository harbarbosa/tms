import React, { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useDispatch } from 'react-redux'
import {
  CAlert,
  CButton,
  CCard,
  CCardBody,
  CCardHeader,
  CCol,
  CListGroup,
  CListGroupItem,
  CRow,
} from '@coreui/react'
import useAuthorization from '../../../hooks/useAuthorization'
import CrudStatusBadge from '../../../components/crud/CrudStatusBadge'
import companyService from '../services/companyService'

const typeLabelMap = {
  embarcador: 'Embarcador',
  transportadora: 'Transportadora',
  operador_logistico: 'Operador logistico',
  hibrida: 'Hibrida',
}

const CompanyDetailsPage = () => {
  const { id } = useParams()
  const dispatch = useDispatch()
  const { hasPermission } = useAuthorization()
  const [company, setCompany] = useState(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const loadCompany = async () => {
      try {
        const data = await companyService.findById(id)
        setCompany(data)
      } catch (error) {
        dispatch({ type: 'app/setError', payload: error.message })
      } finally {
        setIsLoading(false)
      }
    }

    loadCompany()
  }, [dispatch, id])

  if (isLoading) {
    return <CAlert color="info">Carregando detalhes da empresa...</CAlert>
  }

  if (!company) {
    return <CAlert color="warning">Empresa nao encontrada.</CAlert>
  }

  return (
    <>
      <div className="mb-3 d-flex gap-2 flex-wrap">
        <CButton color="secondary" variant="outline" as={Link} to="/admin/companies">
          Voltar
        </CButton>
        {hasPermission('companies.manage') ? (
          <CButton color="info" variant="outline" as={Link} to={`/admin/companies/${company.id}/edit`}>
            Editar empresa
          </CButton>
        ) : null}
      </div>
      <CRow className="g-4">
        <CCol lg={8}>
          <CCard className="shadow-sm border-0">
            <CCardHeader className="d-flex justify-content-between align-items-center">
              <span>{company.razao_social}</span>
              <CrudStatusBadge status={company.status} />
            </CCardHeader>
            <CCardBody>
              <CRow className="g-3">
                <CCol md={6}>
                  <strong>Nome fantasia</strong>
                  <div>{company.nome_fantasia || '-'}</div>
                </CCol>
                <CCol md={6}>
                  <strong>Tipo da empresa</strong>
                  <div>{typeLabelMap[company.tipo_empresa] || company.tipo_empresa || '-'}</div>
                </CCol>
                <CCol md={4}>
                  <strong>CNPJ</strong>
                  <div>{company.cnpj || '-'}</div>
                </CCol>
                <CCol md={4}>
                  <strong>E-mail</strong>
                  <div>{company.email || '-'}</div>
                </CCol>
                <CCol md={4}>
                  <strong>Telefone</strong>
                  <div>{company.telefone || '-'}</div>
                </CCol>
                <CCol md={12}>
                  <strong>Endereco</strong>
                  <div>
                    {[company.endereco, company.numero, company.complemento].filter(Boolean).join(', ') || '-'}
                  </div>
                </CCol>
                <CCol md={4}>
                  <strong>Bairro</strong>
                  <div>{company.bairro || '-'}</div>
                </CCol>
                <CCol md={4}>
                  <strong>Cidade</strong>
                  <div>{company.cidade || '-'}</div>
                </CCol>
                <CCol md={4}>
                  <strong>UF / CEP</strong>
                  <div>{[company.estado, company.cep].filter(Boolean).join(' - ') || '-'}</div>
                </CCol>
              </CRow>
            </CCardBody>
          </CCard>
        </CCol>
        <CCol lg={4}>
          <CCard className="shadow-sm border-0">
            <CCardHeader>Limites do plano</CCardHeader>
            <CCardBody>
              <CListGroup flush>
                <CListGroupItem className="px-0 d-flex justify-content-between">
                  <span>Usuarios</span>
                  <span>{company.limite_usuarios}</span>
                </CListGroupItem>
                <CListGroupItem className="px-0 d-flex justify-content-between">
                  <span>Transportadoras</span>
                  <span>{company.limite_transportadoras}</span>
                </CListGroupItem>
                <CListGroupItem className="px-0 d-flex justify-content-between">
                  <span>Veiculos</span>
                  <span>{company.limite_veiculos}</span>
                </CListGroupItem>
                <CListGroupItem className="px-0 d-flex justify-content-between">
                  <span>Motoristas</span>
                  <span>{company.limite_motoristas}</span>
                </CListGroupItem>
              </CListGroup>
            </CCardBody>
          </CCard>
        </CCol>
      </CRow>
    </>
  )
}

export default CompanyDetailsPage
