<?php

namespace App\Controllers\Api\V1;

use App\Models\DeliveryReceiptModel;
use App\Models\FreightAuditModel;
use App\Models\IncidentModel;
use App\Models\LoadModel;
use App\Models\TransportDocumentModel;
use App\Models\TransportOrderModel;
use CodeIgniter\Database\BaseBuilder;
use CodeIgniter\I18n\Time;

class DashboardController extends BaseApiController
{
    private LoadModel $loads;

    private TransportDocumentModel $transportDocuments;

    private DeliveryReceiptModel $deliveryReceipts;

    private IncidentModel $incidents;

    private FreightAuditModel $freightAudits;

    public function __construct(private readonly TransportOrderModel $orders = new TransportOrderModel())
    {
        $this->loads = new LoadModel();
        $this->transportDocuments = new TransportDocumentModel();
        $this->deliveryReceipts = new DeliveryReceiptModel();
        $this->incidents = new IncidentModel();
        $this->freightAudits = new FreightAuditModel();
    }

    public function summary()
    {
        $this->requirePermission('dashboard.view');
        [$companyId, $startDate, $endDate] = $this->resolvePeriod();

        $openOrders = $this->orders
            ->where('company_id', $companyId)
            ->whereNotIn('status', ['entregue', 'cancelado'])
            ->countAllResults();

        $loadsInProgress = $this->loads
            ->where('company_id', $companyId)
            ->whereIn('status', ['planejada', 'em_montagem', 'pronta', 'em_transporte'])
            ->countAllResults();

        $contractedFreights = (float) ($this->transportDocuments
            ->selectSum('valor_frete_contratado', 'total')
            ->where('company_id', $companyId)
            ->where('data_coleta_prevista >=', $startDate)
            ->where('data_coleta_prevista <=', $endDate)
            ->first()['total'] ?? 0);

        $completedDeliveries = $this->deliveryReceipts
            ->where('company_id', $companyId)
            ->where('DATE(data_entrega_real) >=', $startDate)
            ->where('DATE(data_entrega_real) <=', $endDate)
            ->countAllResults();

        $openIncidents = $this->incidents
            ->where('company_id', $companyId)
            ->whereIn('status', ['aberta', 'em_tratativa'])
            ->countAllResults();

        $pendingAudits = $this->freightAudits
            ->where('company_id', $companyId)
            ->where('status_auditoria', 'pendente')
            ->countAllResults();

        return $this->respondSuccess([
            'period' => ['start' => $startDate, 'end' => $endDate],
            'cards' => [
                'open_orders' => $openOrders,
                'loads_in_progress' => $loadsInProgress,
                'contracted_freights_month' => round($contractedFreights, 2),
                'completed_deliveries' => $completedDeliveries,
                'open_incidents' => $openIncidents,
                'pending_audits' => $pendingAudits,
            ],
        ], 'Resumo do dashboard carregado com sucesso.');
    }

    public function charts()
    {
        $this->requirePermission('dashboard.view');
        [$companyId, $startDate, $endDate] = $this->resolvePeriod();

        $ordersByStatus = $this->orders
            ->select('status, COUNT(*) as total')
            ->where('company_id', $companyId)
            ->where('DATE(created_at) >=', $startDate)
            ->where('DATE(created_at) <=', $endDate)
            ->groupBy('status')
            ->findAll();

        $deliveriesByPeriod = $this->deliveryReceipts
            ->select('DATE(data_entrega_real) as reference_date, COUNT(*) as total')
            ->where('company_id', $companyId)
            ->where('DATE(data_entrega_real) >=', $startDate)
            ->where('DATE(data_entrega_real) <=', $endDate)
            ->groupBy('DATE(data_entrega_real)')
            ->orderBy('reference_date', 'ASC')
            ->findAll();

        $freightsByCarrier = $this->transportDocuments
            ->select('carriers.razao_social as transporter_name, SUM(transport_documents.valor_frete_contratado) as total')
            ->join('carriers', 'carriers.id = transport_documents.transporter_id')
            ->where('transport_documents.company_id', $companyId)
            ->where('transport_documents.data_coleta_prevista >=', $startDate)
            ->where('transport_documents.data_coleta_prevista <=', $endDate)
            ->groupBy('carriers.razao_social')
            ->orderBy('total', 'DESC')
            ->findAll();

        return $this->respondSuccess([
            'period' => ['start' => $startDate, 'end' => $endDate],
            'orders_by_status' => [
                'labels' => array_map(static fn (array $row) => $row['status'], $ordersByStatus),
                'values' => array_map(static fn (array $row) => (int) $row['total'], $ordersByStatus),
            ],
            'deliveries_by_period' => [
                'labels' => array_map(static fn (array $row) => $row['reference_date'], $deliveriesByPeriod),
                'values' => array_map(static fn (array $row) => (int) $row['total'], $deliveriesByPeriod),
            ],
            'freights_by_carrier' => [
                'labels' => array_map(static fn (array $row) => $row['transporter_name'], $freightsByCarrier),
                'values' => array_map(static fn (array $row) => (float) $row['total'], $freightsByCarrier),
            ],
        ], 'Graficos do dashboard carregados com sucesso.');
    }

    public function quickLists()
    {
        $this->requirePermission('dashboard.view');
        [$companyId, $startDate, $endDate] = $this->resolvePeriod();

        $latestIncidents = $this->incidents
            ->select('incidents.id, incidents.tipo_ocorrencia, incidents.status, incidents.occurred_at, incidents.observacoes, transport_documents.numero_ot')
            ->join('transport_documents', 'transport_documents.id = incidents.transport_document_id')
            ->where('incidents.company_id', $companyId)
            ->where('DATE(incidents.occurred_at) >=', $startDate)
            ->where('DATE(incidents.occurred_at) <=', $endDate)
            ->orderBy('incidents.occurred_at', 'DESC')
            ->findAll(5);

        $latestDeliveries = $this->deliveryReceipts
            ->select('delivery_receipts.id, delivery_receipts.data_entrega_real, delivery_receipts.nome_recebedor, transport_documents.numero_ot')
            ->join('transport_documents', 'transport_documents.id = delivery_receipts.ordem_transporte_id')
            ->where('delivery_receipts.company_id', $companyId)
            ->where('DATE(delivery_receipts.data_entrega_real) >=', $startDate)
            ->where('DATE(delivery_receipts.data_entrega_real) <=', $endDate)
            ->orderBy('delivery_receipts.data_entrega_real', 'DESC')
            ->findAll(5);

        $latestTransportDocuments = $this->transportDocuments
            ->select('transport_documents.id, transport_documents.numero_ot, transport_documents.status, carriers.razao_social as transporter_name, transport_documents.data_coleta_prevista, transport_documents.data_entrega_prevista')
            ->join('carriers', 'carriers.id = transport_documents.transporter_id')
            ->where('transport_documents.company_id', $companyId)
            ->where('transport_documents.data_coleta_prevista >=', $startDate)
            ->where('transport_documents.data_coleta_prevista <=', $endDate)
            ->orderBy('transport_documents.id', 'DESC')
            ->findAll(5);

        return $this->respondSuccess([
            'period' => ['start' => $startDate, 'end' => $endDate],
            'latest_incidents' => $latestIncidents,
            'latest_deliveries' => $latestDeliveries,
            'latest_transport_documents' => $latestTransportDocuments,
        ], 'Listas rapidas do dashboard carregadas com sucesso.');
    }

    private function resolvePeriod(): array
    {
        $companyId = (int) ($this->authContext->getCompany()['id'] ?? 0);
        $startDate = trim((string) ($this->request->getGet('start_date') ?? ''));
        $endDate = trim((string) ($this->request->getGet('end_date') ?? ''));

        if ($startDate === '') {
            $startDate = Time::now()->startOfMonth()->toDateString();
        }

        if ($endDate === '') {
            $endDate = Time::now()->toDateString();
        }

        return [$companyId, $startDate, $endDate];
    }
}
