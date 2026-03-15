<?php

use CodeIgniter\Router\RouteCollection;

/**
 * @var RouteCollection $routes
 */
$routes->get('/', 'Home::index');

$routes->group('api/v1', ['namespace' => 'App\Controllers\Api\V1'], static function ($routes) {
    $routes->options('(:any)', 'PreflightController::handle');
    $routes->post('auth/login', 'AuthController::login');

    $routes->group('', ['filter' => 'auth'], static function ($routes) {
        $routes->get('dashboard/summary', 'DashboardController::summary');
        $routes->get('dashboard/charts', 'DashboardController::charts');
        $routes->get('dashboard/quick-lists', 'DashboardController::quickLists');
        $routes->get('auth/me', 'AuthController::me');
        $routes->get('auth/permissions', 'AuthController::permissions');
        $routes->post('auth/logout', 'AuthController::logout');
        $routes->get('companies', 'CompanyController::index');
        $routes->get('carriers', 'CarrierController::index');
        $routes->get('carriers/(:num)', 'CarrierController::show/$1');
        $routes->post('carriers', 'CarrierController::create');
        $routes->put('carriers/(:num)', 'CarrierController::update/$1');
        $routes->delete('carriers/(:num)', 'CarrierController::delete/$1');
        $routes->get('drivers', 'DriverController::index');
        $routes->get('drivers/(:num)', 'DriverController::show/$1');
        $routes->post('drivers', 'DriverController::create');
        $routes->put('drivers/(:num)', 'DriverController::update/$1');
        $routes->delete('drivers/(:num)', 'DriverController::delete/$1');
        $routes->get('vehicles', 'VehicleController::index');
        $routes->get('vehicles/(:num)', 'VehicleController::show/$1');
        $routes->post('vehicles', 'VehicleController::create');
        $routes->put('vehicles/(:num)', 'VehicleController::update/$1');
        $routes->delete('vehicles/(:num)', 'VehicleController::delete/$1');
        $routes->get('transport-orders', 'TransportOrderController::index');
        $routes->get('transport-orders/(:num)', 'TransportOrderController::show/$1');
        $routes->post('transport-orders', 'TransportOrderController::create');
        $routes->put('transport-orders/(:num)', 'TransportOrderController::update/$1');
        $routes->delete('transport-orders/(:num)', 'TransportOrderController::delete/$1');
        $routes->get('loads', 'LoadController::index');
        $routes->get('loads/(:num)', 'LoadController::show/$1');
        $routes->post('loads', 'LoadController::create');
        $routes->put('loads/(:num)', 'LoadController::update/$1');
        $routes->delete('loads/(:num)', 'LoadController::delete/$1');
        $routes->post('loads/(:num)/orders', 'LoadController::syncOrders/$1');
        $routes->get('freight-quotations', 'FreightQuotationController::index');
        $routes->get('freight-quotations/options', 'FreightQuotationController::options');
        $routes->get('freight-quotations/(:num)', 'FreightQuotationController::show/$1');
        $routes->post('freight-quotations', 'FreightQuotationController::create');
        $routes->put('freight-quotations/(:num)', 'FreightQuotationController::update/$1');
        $routes->post('freight-quotations/(:num)/approve/(:num)', 'FreightQuotationController::approveProposal/$1/$2');
        $routes->delete('freight-quotations/(:num)', 'FreightQuotationController::delete/$1');
        $routes->get('transport-documents', 'TransportDocumentController::index');
        $routes->get('transport-documents/options', 'TransportDocumentController::options');
        $routes->get('transport-documents/(:num)', 'TransportDocumentController::show/$1');
        $routes->post('transport-documents', 'TransportDocumentController::create');
        $routes->put('transport-documents/(:num)', 'TransportDocumentController::update/$1');
        $routes->delete('transport-documents/(:num)', 'TransportDocumentController::delete/$1');
        $routes->get('delivery-trackings', 'DeliveryTrackingController::index');
        $routes->get('delivery-trackings/(:num)', 'DeliveryTrackingController::show/$1');
        $routes->post('delivery-trackings/(:num)/events', 'DeliveryTrackingController::createEvent/$1');
        $routes->get('incidents', 'IncidentController::index');
        $routes->get('incidents/options', 'IncidentController::options');
        $routes->get('incidents/(:num)', 'IncidentController::show/$1');
        $routes->post('incidents', 'IncidentController::create');
        $routes->put('incidents/(:num)', 'IncidentController::update/$1');
        $routes->delete('incidents/(:num)', 'IncidentController::delete/$1');
        $routes->get('trip-documents', 'TripDocumentController::index');
        $routes->get('trip-documents/options', 'TripDocumentController::options');
        $routes->get('trip-documents/(:num)', 'TripDocumentController::show/$1');
        $routes->get('trip-documents/(:num)/view', 'TripDocumentController::view/$1');
        $routes->post('trip-documents', 'TripDocumentController::create');
        $routes->delete('trip-documents/(:num)', 'TripDocumentController::delete/$1');
        $routes->get('proof-of-deliveries', 'ProofOfDeliveryController::index');
        $routes->get('proof-of-deliveries/options', 'ProofOfDeliveryController::options');
        $routes->get('proof-of-deliveries/(:num)', 'ProofOfDeliveryController::show/$1');
        $routes->get('proof-of-deliveries/(:num)/view', 'ProofOfDeliveryController::view/$1');
        $routes->post('proof-of-deliveries', 'ProofOfDeliveryController::create');
        $routes->post('proof-of-deliveries/(:num)', 'ProofOfDeliveryController::update/$1');
        $routes->get('freight-audits', 'FreightAuditController::index');
        $routes->get('freight-audits/options', 'FreightAuditController::options');
        $routes->get('freight-audits/(:num)', 'FreightAuditController::show/$1');
        $routes->post('freight-audits', 'FreightAuditController::create');
        $routes->put('freight-audits/(:num)', 'FreightAuditController::update/$1');
        $routes->get('users/profile', 'UserController::profile');
    });
});
