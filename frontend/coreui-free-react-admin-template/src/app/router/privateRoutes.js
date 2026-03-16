import React from 'react'

const DashboardPage = React.lazy(() => import('../../features/dashboard/pages/DashboardPage'))
const CarrierPortalDashboardPage = React.lazy(
  () => import('../../features/carrier-portal/pages/CarrierPortalDashboardPage'),
)
const DriverPortalDashboardPage = React.lazy(
  () => import('../../features/driver-portal/pages/DriverPortalDashboardPage'),
)
const CompanyListPage = React.lazy(() => import('../../features/companies/pages/CompanyListPage'))
const CompanyFormPage = React.lazy(() => import('../../features/companies/pages/CompanyFormPage'))
const CompanyDetailsPage = React.lazy(() => import('../../features/companies/pages/CompanyDetailsPage'))
const UserListPage = React.lazy(() => import('../../features/users/pages/UserListPage'))
const UserFormPage = React.lazy(() => import('../../features/users/pages/UserFormPage'))
const UserDetailsPage = React.lazy(() => import('../../features/users/pages/UserDetailsPage'))
const RoleListPage = React.lazy(() => import('../../features/roles/pages/RoleListPage'))
const RoleFormPage = React.lazy(() => import('../../features/roles/pages/RoleFormPage'))
const PermissionMatrixPage = React.lazy(() => import('../../features/permissions/pages/PermissionMatrixPage'))
const CarrierListPage = React.lazy(() => import('../../features/carriers/pages/CarrierListPage'))
const CarrierFormPage = React.lazy(() => import('../../features/carriers/pages/CarrierFormPage'))
const DriverListPage = React.lazy(() => import('../../features/drivers/pages/DriverListPage'))
const DriverFormPage = React.lazy(() => import('../../features/drivers/pages/DriverFormPage'))
const VehicleListPage = React.lazy(() => import('../../features/vehicles/pages/VehicleListPage'))
const VehicleFormPage = React.lazy(() => import('../../features/vehicles/pages/VehicleFormPage'))
const TransportOrderListPage = React.lazy(
  () => import('../../features/transport-orders/pages/TransportOrderListPage'),
)
const TransportOrderFormPage = React.lazy(
  () => import('../../features/transport-orders/pages/TransportOrderFormPage'),
)
const TransportOrderDetailsPage = React.lazy(
  () => import('../../features/transport-orders/pages/TransportOrderDetailsPage'),
)
const LoadListPage = React.lazy(() => import('../../features/loads/pages/LoadListPage'))
const LoadFormPage = React.lazy(() => import('../../features/loads/pages/LoadFormPage'))
const LoadDetailsPage = React.lazy(() => import('../../features/loads/pages/LoadDetailsPage'))
const FreightQuotationListPage = React.lazy(
  () => import('../../features/freight-quotations/pages/FreightQuotationListPage'),
)
const FreightQuotationFormPage = React.lazy(
  () => import('../../features/freight-quotations/pages/FreightQuotationFormPage'),
)
const FreightQuotationDetailsPage = React.lazy(
  () => import('../../features/freight-quotations/pages/FreightQuotationDetailsPage'),
)
const FreightHiringListPage = React.lazy(
  () => import('../../features/freight-hirings/pages/FreightHiringListPage'),
)
const FreightHiringFormPage = React.lazy(
  () => import('../../features/freight-hirings/pages/FreightHiringFormPage'),
)
const FreightHiringDetailsPage = React.lazy(
  () => import('../../features/freight-hirings/pages/FreightHiringDetailsPage'),
)
const TransportDocumentListPage = React.lazy(
  () => import('../../features/transport-documents/pages/TransportDocumentListPage'),
)
const TransportDocumentFormPage = React.lazy(
  () => import('../../features/transport-documents/pages/TransportDocumentFormPage'),
)
const TransportDocumentDetailsPage = React.lazy(
  () => import('../../features/transport-documents/pages/TransportDocumentDetailsPage'),
)
const PickupScheduleListPage = React.lazy(
  () => import('../../features/pickup-schedules/pages/PickupScheduleListPage'),
)
const PickupScheduleFormPage = React.lazy(
  () => import('../../features/pickup-schedules/pages/PickupScheduleFormPage'),
)
const PickupScheduleDetailsPage = React.lazy(
  () => import('../../features/pickup-schedules/pages/PickupScheduleDetailsPage'),
)
const VehicleCheckinListPage = React.lazy(
  () => import('../../features/vehicle-checkins/pages/VehicleCheckinListPage'),
)
const VehicleCheckinFormPage = React.lazy(
  () => import('../../features/vehicle-checkins/pages/VehicleCheckinFormPage'),
)
const VehicleCheckinDetailsPage = React.lazy(
  () => import('../../features/vehicle-checkins/pages/VehicleCheckinDetailsPage'),
)
const DeliveryTrackingListPage = React.lazy(
  () => import('../../features/delivery-tracking/pages/DeliveryTrackingListPage'),
)
const DeliveryTrackingDetailsPage = React.lazy(
  () => import('../../features/delivery-tracking/pages/DeliveryTrackingDetailsPage'),
)
const IncidentListPage = React.lazy(() => import('../../features/incidents/pages/IncidentListPage'))
const IncidentFormPage = React.lazy(() => import('../../features/incidents/pages/IncidentFormPage'))
const TripDocumentListPage = React.lazy(
  () => import('../../features/trip-documents/pages/TripDocumentListPage'),
)
const TripDocumentUploadPage = React.lazy(
  () => import('../../features/trip-documents/pages/TripDocumentUploadPage'),
)
const ProofOfDeliveryListPage = React.lazy(
  () => import('../../features/proof-of-deliveries/pages/ProofOfDeliveryListPage'),
)
const ProofOfDeliveryFormPage = React.lazy(
  () => import('../../features/proof-of-deliveries/pages/ProofOfDeliveryFormPage'),
)
const FreightAuditListPage = React.lazy(
  () => import('../../features/freight-audits/pages/FreightAuditListPage'),
)
const FreightAuditFormPage = React.lazy(
  () => import('../../features/freight-audits/pages/FreightAuditFormPage'),
)
const FreightAuditDetailsPage = React.lazy(
  () => import('../../features/freight-audits/pages/FreightAuditDetailsPage'),
)
const FinancialDashboardPage = React.lazy(
  () => import('../../features/financial/pages/FinancialDashboardPage'),
)
const FinancialFormPage = React.lazy(
  () => import('../../features/financial/pages/FinancialFormPage'),
)
const FinancialDetailsPage = React.lazy(
  () => import('../../features/financial/pages/FinancialDetailsPage'),
)
const ReportsPage = React.lazy(() => import('../../features/reports/pages/ReportsPage'))
const SettingsPage = React.lazy(() => import('../../features/settings/pages/SettingsPage'))
const ModulePlaceholderPage = React.lazy(() => import('../../features/shared/pages/ModulePlaceholderPage'))

const createPlaceholderElement = (title, description) => {
  const PlaceholderRoute = () => <ModulePlaceholderPage title={title} description={description} />
  PlaceholderRoute.displayName = `${title.replace(/\s+/g, '')}PlaceholderRoute`
  return PlaceholderRoute
}

const privateRoutes = [
  { path: '/', exact: true, name: 'Home' },
  { path: '/dashboard', name: 'Dashboard', element: DashboardPage, permission: 'dashboard.view' },
  { path: '/carrier/dashboard', name: 'Portal da Transportadora', element: CarrierPortalDashboardPage, permission: 'freight_quotations.view' },
  { path: '/driver/dashboard', name: 'Portal do Motorista', element: DriverPortalDashboardPage, permission: 'dashboard.view' },
  { path: '/admin/companies', name: 'Empresas', permission: 'companies.view', element: CompanyListPage },
  { path: '/admin/companies/new', name: 'Nova Empresa', permission: 'companies.manage', element: CompanyFormPage },
  { path: '/admin/companies/:id', name: 'Detalhes da Empresa', permission: 'companies.view', element: CompanyDetailsPage },
  { path: '/admin/companies/:id/edit', name: 'Editar Empresa', permission: 'companies.manage', element: CompanyFormPage },
  { path: '/admin/users', name: 'Usuarios', permission: 'users.view', element: UserListPage },
  { path: '/admin/users/new', name: 'Novo Usuario', permission: 'users.manage', element: UserFormPage },
  { path: '/admin/users/:id', name: 'Detalhes do Usuario', permission: 'users.view', element: UserDetailsPage },
  { path: '/admin/users/:id/edit', name: 'Editar Usuario', permission: 'users.manage', element: UserFormPage },
  { path: '/admin/roles', name: 'Perfis', permission: 'roles.view', element: RoleListPage },
  { path: '/admin/roles/new', name: 'Novo Perfil', permission: 'roles.manage', element: RoleFormPage },
  { path: '/admin/roles/:id/edit', name: 'Editar Perfil', permission: 'roles.manage', element: RoleFormPage },
  { path: '/admin/permissions', name: 'Permissoes', permission: 'permissions.view', element: PermissionMatrixPage },
  {
    path: '/registry/shippers',
    name: 'Embarcadores',
    element: createPlaceholderElement(
      'Embarcadores',
      'Espaco reservado para o cadastro de embarcadores e seus contatos operacionais.',
    ),
  },
  { path: '/registry/carriers', name: 'Transportadoras', element: CarrierListPage, permission: 'carriers.view' },
  { path: '/registry/carriers/new', name: 'Nova Transportadora', element: CarrierFormPage, permission: 'carriers.create' },
  { path: '/registry/carriers/:id/edit', name: 'Editar Transportadora', element: CarrierFormPage, permission: 'carriers.update' },
  { path: '/registry/drivers', name: 'Motoristas', element: DriverListPage, permission: 'drivers.view' },
  { path: '/registry/drivers/new', name: 'Novo Motorista', element: DriverFormPage, permission: 'drivers.create' },
  { path: '/registry/drivers/:id/edit', name: 'Editar Motorista', element: DriverFormPage, permission: 'drivers.update' },
  { path: '/registry/vehicles', name: 'Veiculos', element: VehicleListPage, permission: 'vehicles.view' },
  { path: '/registry/vehicles/new', name: 'Novo Veiculo', element: VehicleFormPage, permission: 'vehicles.create' },
  { path: '/registry/vehicles/:id/edit', name: 'Editar Veiculo', element: VehicleFormPage, permission: 'vehicles.update' },
  { path: '/operations/transport-orders', name: 'Pedidos de Transporte', element: TransportOrderListPage, permission: 'transport_orders.view' },
  { path: '/operations/transport-orders/new', name: 'Novo Pedido de Transporte', element: TransportOrderFormPage, permission: 'transport_orders.create' },
  { path: '/operations/transport-orders/:id', name: 'Detalhes do Pedido', element: TransportOrderDetailsPage, permission: 'transport_orders.view' },
  { path: '/operations/transport-orders/:id/edit', name: 'Editar Pedido de Transporte', element: TransportOrderFormPage, permission: 'transport_orders.update' },
  { path: '/operations/loads', name: 'Cargas', element: LoadListPage, permission: 'loads.view' },
  { path: '/operations/loads/new', name: 'Nova Carga', element: LoadFormPage, permission: 'loads.create' },
  { path: '/operations/loads/:id', name: 'Detalhes da Carga', element: LoadDetailsPage, permission: 'loads.view' },
  { path: '/operations/loads/:id/edit', name: 'Editar Carga', element: LoadFormPage, permission: 'loads.update' },
  { path: '/operations/freight-quotations', name: 'Cotacao de Frete', element: FreightQuotationListPage, permission: 'freight_quotations.view' },
  { path: '/operations/freight-quotations/new', name: 'Nova Cotacao de Frete', element: FreightQuotationFormPage, permission: 'freight_quotations.create' },
  { path: '/operations/freight-quotations/:id', name: 'Detalhes da Cotacao', element: FreightQuotationDetailsPage, permission: 'freight_quotations.view' },
  { path: '/operations/freight-quotations/:id/edit', name: 'Editar Cotacao', element: FreightQuotationFormPage, permission: 'freight_quotations.update' },
  { path: '/operations/freight-hirings', name: 'Contratacao de Frete', element: FreightHiringListPage, permission: 'freight_hirings.view' },
  { path: '/operations/freight-hirings/new', name: 'Nova Contratacao de Frete', element: FreightHiringFormPage, permission: 'freight_hirings.create' },
  { path: '/operations/freight-hirings/:id', name: 'Detalhes da Contratacao', element: FreightHiringDetailsPage, permission: 'freight_hirings.view' },
  { path: '/operations/freight-hirings/:id/edit', name: 'Editar Contratacao de Frete', element: FreightHiringFormPage, permission: 'freight_hirings.update' },
  { path: '/operations/transport-documents', name: 'Ordem de Transporte', element: TransportDocumentListPage, permission: 'transport_documents.view' },
  { path: '/operations/transport-documents/new', name: 'Nova Ordem de Transporte', element: TransportDocumentFormPage, permission: 'transport_documents.create' },
  { path: '/operations/transport-documents/:id', name: 'Detalhes da OT', element: TransportDocumentDetailsPage, permission: 'transport_documents.view' },
  { path: '/operations/transport-documents/:id/edit', name: 'Editar OT', element: TransportDocumentFormPage, permission: 'transport_documents.update' },
  { path: '/execution/pickup-schedules', name: 'Agendamento de Coleta', element: PickupScheduleListPage, permission: 'pickup_schedules.view' },
  { path: '/execution/pickup-schedules/new', name: 'Novo Agendamento de Coleta', element: PickupScheduleFormPage, permission: 'pickup_schedules.create' },
  { path: '/execution/pickup-schedules/:id', name: 'Detalhes do Agendamento', element: PickupScheduleDetailsPage, permission: 'pickup_schedules.view' },
  { path: '/execution/pickup-schedules/:id/edit', name: 'Editar Agendamento de Coleta', element: PickupScheduleFormPage, permission: 'pickup_schedules.update' },
  { path: '/execution/vehicle-checkins', name: 'Check-in de Veiculo', element: VehicleCheckinListPage, permission: 'vehicle_checkins.view' },
  { path: '/execution/vehicle-checkins/new', name: 'Novo Check-in de Veiculo', element: VehicleCheckinFormPage, permission: 'vehicle_checkins.create' },
  { path: '/execution/vehicle-checkins/:id', name: 'Detalhes do Check-in', element: VehicleCheckinDetailsPage, permission: 'vehicle_checkins.view' },
  { path: '/execution/vehicle-checkins/:id/edit', name: 'Editar Check-in de Veiculo', element: VehicleCheckinFormPage, permission: 'vehicle_checkins.update' },
  { path: '/execution/delivery-tracking', name: 'Rastreamento de Entrega', element: DeliveryTrackingListPage, permission: 'delivery_tracking.view' },
  { path: '/execution/delivery-tracking/:id', name: 'Detalhes do Rastreamento', element: DeliveryTrackingDetailsPage, permission: 'delivery_tracking.view' },
  { path: '/execution/incidents', name: 'Ocorrencias', element: IncidentListPage, permission: 'incidents.view' },
  { path: '/execution/incidents/new', name: 'Nova Ocorrencia', element: IncidentFormPage, permission: 'incidents.create' },
  { path: '/execution/incidents/:id/edit', name: 'Editar Ocorrencia', element: IncidentFormPage, permission: 'incidents.update' },
  { path: '/execution/trip-documents', name: 'Documentos da Viagem', element: TripDocumentListPage, permission: 'trip_documents.view' },
  { path: '/execution/trip-documents/new', name: 'Novo Documento da Viagem', element: TripDocumentUploadPage, permission: 'trip_documents.create' },
  { path: '/execution/proof-of-deliveries', name: 'Comprovante de Entrega', element: ProofOfDeliveryListPage, permission: 'proof_of_deliveries.view' },
  { path: '/execution/proof-of-deliveries/new', name: 'Novo Comprovante de Entrega', element: ProofOfDeliveryFormPage, permission: 'proof_of_deliveries.create' },
  { path: '/execution/proof-of-deliveries/:id/edit', name: 'Editar Comprovante de Entrega', element: ProofOfDeliveryFormPage, permission: 'proof_of_deliveries.update' },
  { path: '/control/freight-audits', name: 'Auditoria de Frete', element: FreightAuditListPage, permission: 'freight_audits.view' },
  { path: '/control/freight-audits/new', name: 'Nova Auditoria de Frete', element: FreightAuditFormPage, permission: 'freight_audits.create' },
  { path: '/control/freight-audits/:id', name: 'Detalhes da Auditoria', element: FreightAuditDetailsPage, permission: 'freight_audits.view' },
  { path: '/control/freight-audits/:id/edit', name: 'Editar Auditoria', element: FreightAuditFormPage, permission: 'freight_audits.update' },
  { path: '/financial', name: 'Financeiro', permission: 'financial.view', element: FinancialDashboardPage },
  { path: '/financial/new', name: 'Novo Lancamento Financeiro', permission: 'financial.create', element: FinancialFormPage },
  { path: '/financial/:id', name: 'Detalhe Financeiro', permission: 'financial.view', element: FinancialDetailsPage },
  { path: '/financial/:id/edit', name: 'Editar Lancamento Financeiro', permission: 'financial.update', element: FinancialFormPage },
  {
    path: '/reports',
    name: 'Relatorios',
    permission: 'reports.view',
    element: ReportsPage,
  },
  {
    path: '/settings',
    name: 'Configuracoes do Sistema',
    permission: 'settings.view',
    element: SettingsPage,
  },
]

export default privateRoutes
