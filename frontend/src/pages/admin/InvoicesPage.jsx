import { useState, useEffect } from "react";
import {
  DollarSign,
  CheckCircle,
  Eye,
  Download,
  ArrowLeft,
  RotateCcw,
} from "lucide-react";
import { api, getInvoicesList, getInvoiceDetails, downloadInvoicePDF } from "@/api/mockApi";

export default function InvoicesPage() {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState("list"); // 'list' or 'detail'
  const [selectedInvoice, setSelectedInvoice] = useState(null);

  // Filters
  const [selectedDate, setSelectedDate] = useState("");
  const [searchOwner, setSearchOwner] = useState("");

  useEffect(() => {
    fetchInvoices();
  }, [selectedDate, searchOwner]);

  const fetchInvoices = async () => {
    setLoading(true);
    try {
      const params = {};
      if (selectedDate) params.date = selectedDate;
      if (searchOwner) params.user = searchOwner;
      const data = await getInvoicesList(params);
      setInvoices(data.map(inv => ({
        id: inv.invoice_id,
        invoiceId: inv.invoice_id,
        amount: inv.total,
        status: 'Paid',
        patientName: inv.pet_name,
        ownerName: inv.user_name,
        dueDate: inv.check_out ? new Date(inv.check_out).toLocaleDateString() : '',
        subtotal: inv.total,
        tax: 0,
        services: [],
        medications: []
      })));
    } catch (error) {
      console.error('Error fetching invoices:', error);
      setInvoices([]);
    }
    setLoading(false);
  };

  // Calculate stats
  const totalRevenue = invoices.reduce((sum, inv) => sum + inv.amount, 0);
  const totalOrders = invoices.length;

  // Apply filters (none needed as filtered from API)
  const filteredInvoices = invoices;

  const handleReset = () => {
    setSelectedDate("");
    setSearchOwner("");
  };

  const handleViewInvoice = async (invoiceId) => {
    try {
      const data = await getInvoiceDetails(invoiceId);
      setSelectedInvoice({
        invoiceId: data.invoice_id,
        patientName: data.pet_name,
        ownerName: data.user_name,
        amount: data.total,
        status: 'Paid',
        dueDate: data.check_out ? new Date(data.check_out).toLocaleDateString() : '',
        subtotal: data.total,
        tax: 0,
        services: data.services || [],
        medications: data.medicines || []
      });
      setView("detail");
    } catch (error) {
      console.error('Error fetching invoice details:', error);
    }
  };

  const handleBackToList = () => {
    setView("list");
    setSelectedInvoice(null);
  };

  const handleConfirmPayment = () => {
    // Update invoice status to Paid
    const updatedInvoices = invoices.map((inv) =>
      inv.id === selectedInvoice.id ? { ...inv, status: "Paid" } : inv
    );
    setInvoices(updatedInvoices);
    setSelectedInvoice({ ...selectedInvoice, status: "Paid" });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "Paid":
        return "bg-green-100 text-green-700";
      case "Pending":
        return "bg-yellow-100 text-yellow-700";
      case "Overdue":
        return "bg-red-100 text-red-700";
      default:
        return "bg-gray-100 text-gray-600";
    }
  };

  if (loading) {
    return <div className="p-6">Loading...</div>;
  }

  // Detail View
  if (view === "detail" && selectedInvoice) {
    const totalAmount = selectedInvoice.subtotal + selectedInvoice.tax;

    return (
      <div className="p-6 space-y-6 bg-[#f8fafb] min-h-screen">
        {/* Back Button */}
        <button
          onClick={handleBackToList}
          className="flex items-center gap-2 text-teal-600 hover:text-teal-700 transition-colors"
        >
          <ArrowLeft className="size-4" />
          <span>Back to invoices</span>
        </button>

        {/* Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Column - Invoice Info */}
          <div className="space-y-6">
            {/* Invoice Header */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <div className="flex items-start justify-between mb-6">
                <div>
                  <p className="text-xs text-gray-500 uppercase mb-1">
                    INVOICE
                  </p>
                  <h2 className="text-2xl font-bold text-gray-900">
                    {selectedInvoice.invoiceId}
                  </h2>
                </div>
                <span
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium ${getStatusColor(
                    selectedInvoice.status
                  )}`}
                >
                  {selectedInvoice.status}
                </span>
              </div>

              {/* Patient Info */}
              <div className="space-y-4">
                <div>
                  <p className="text-xs text-gray-500 uppercase mb-1">
                    PATIENT
                  </p>
                  <p className="text-sm font-medium text-gray-900">
                    {selectedInvoice.patientName}
                  </p>
                </div>

                <div>
                  <p className="text-xs text-gray-500 uppercase mb-1">OWNER</p>
                  <p className="text-sm font-medium text-gray-900">
                    {selectedInvoice.ownerName}
                  </p>
                </div>

                <div>
                  {/* <p className="text-xs text-gray-500 uppercase mb-1">
                    DUE DATE
                  </p> */}
                  <p className="text-sm font-medium text-gray-900">
                    {selectedInvoice.dueDate}
                  </p>
                </div>
{/*             
                <div>
                  <p className="text-xs text-gray-500 uppercase mb-1">
                    DUE DATE
                  </p>
                  <p className="text-sm font-medium text-gray-900">
                    {selectedInvoice.dueDate}
                  </p>
                </div> */}
              </div>
            </div>

            {/* Payment Summary */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <h3 className="font-semibold text-gray-900 mb-4">
                Payment Summary
              </h3>

              <div className="space-y-3 mb-4">
                <div className="flex justify-between text-sm">
                  {/* <span className="text-gray-600">Subtotal</span> */}
                  {/* <span className="text-gray-900">
                    {selectedInvoice.subtotal.toLocaleString()}
                  </span> */}
                </div>
                {/* <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Tax</span>
                  <span className="text-gray-900">{selectedInvoice.tax}</span>
                </div> */}
                <div className="border-t border-gray-200 pt-3 flex justify-between">
                  <span className="font-semibold text-gray-900">Total</span>
                  <span className="text-xl font-bold text-gray-900">
                    {totalAmount.toLocaleString()}
                  </span>
                </div>
              </div>

              {/* Status Badge */}
              {/* <div className="mb-4">
                <p className="text-xs text-gray-500 uppercase mb-2">STATUS</p>
                <span
                  className={`inline-flex px-3 py-1.5 rounded-lg text-xs font-medium ${getStatusColor(
                    selectedInvoice.status
                  )}`}
                >
                  {selectedInvoice.status}
                </span>
              </div> */}

              {/* Confirm Payment Button - Only for Pending */}
              {selectedInvoice.status === "Pending" && (
                <button
                  onClick={handleConfirmPayment}
                  className="w-full py-3 bg-teal-500 text-white rounded-xl hover:bg-teal-600 transition-colors font-medium"
                >
                  Confirm Payment
                </button>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-3">
              {/* <button className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-white border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors">
                <Printer className="size-4" />
                <span>Print Invoice</span>
              </button> */}
              <button
                onClick={() => downloadInvoicePDF(selectedInvoice.invoiceId)}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-white border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors"
              >
                <Download className="size-4" />
                <span>Download PDF</span>
              </button>
            </div>
          </div>

          {/* Right Column - Invoice Details */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">
              Chi tiết hóa đơn
            </h3>

            {/* Services Section */}
            {selectedInvoice.services &&
              selectedInvoice.services.length > 0 && (
                <div className="mb-6">
                  <div className="flex justify-between items-center mb-3">
                    <h4 className="text-sm font-semibold text-gray-700 uppercase">
                      DỊCH VỤ
                    </h4>
                    <h4 className="text-sm font-semibold text-gray-700 uppercase">
                      GIÁ TIỀN
                    </h4>
                  </div>
                  <div className="space-y-2">
                    {selectedInvoice.services.map((service, index) => (
                      <div key={index} className="flex justify-between text-sm">
                        <span className="text-gray-900">{service.name}</span>
                        <span className="text-gray-900">
                          {service.price.toLocaleString()}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

            {/* Medications Section */}
            {selectedInvoice.medications &&
              selectedInvoice.medications.length > 0 && (
                <div className="mb-6">
                  <div className="flex justify-between items-center mb-3">
                    <h4 className="text-sm font-semibold text-gray-700 uppercase">
                      THUỐC
                    </h4>
                    <h4 className="text-sm font-semibold text-gray-700 uppercase">
                      GIÁ TIỀN
                    </h4>
                  </div>
                  <div className="space-y-2">
                    {selectedInvoice.medications.map((medication, index) => (
                      <div key={index} className="flex justify-between text-sm">
                        <span className="text-gray-900">{medication.name} (x{medication.quantity})</span>
                        <span className="text-gray-900">
                          {(medication.price * medication.quantity).toLocaleString()}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

            {/* Total */}
            <div className="border-t border-gray-200 pt-4">
              <div className="flex justify-end">
                <div className="text-right">
                  <p className="text-2xl font-bold text-gray-900">
                    {totalAmount.toLocaleString()}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // List View
  return (
    <div className="p-6 space-y-6 bg-[#f8fafb] min-h-screen">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Hóa đơn</h1>
        <p className="text-sm text-gray-600 mt-1">
          Quản lý hóa đơn và thanh toán
        </p>
      </div>

      {/* Stats Cards */}

      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Total Orders */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-start justify-between mb-4">
            <div className="p-3 bg-blue-50 rounded-xl">
              <CheckCircle className="size-6 text-blue-600" />
            </div>
            <span className="text-xs text-green-600 font-medium"></span>
          </div>
          <p className="text-sm text-gray-600 mb-2">Tổng số đơn</p>
          <p className="text-3xl font-bold text-gray-900">
            {totalOrders}
          </p>
          <p className="text-xs text-gray-500 mt-1"></p>
        </div>

        {/* Total Revenue */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-start justify-between mb-4">
            <div className="p-3 bg-teal-50 rounded-xl">
              <DollarSign className="size-6 text-teal-600" />
            </div>
            <span className="text-xs text-green-600 font-medium"></span>
          </div>
          <p className="text-sm text-gray-600 mb-2">Tổng doanh thu</p>
          <p className="text-3xl font-bold text-gray-900">
            {totalRevenue.toLocaleString()}đ
          </p>
          <p className="text-xs text-gray-500 mt-1"></p>
        </div>
      </div>

      {/* Filters Section */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          {/* Date */}
          <div>
            <label className="block text-sm text-gray-600 mb-2">Date</label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-teal-200"
            />
          </div>

          {/* Search Owner */}
          <div>
            <label className="block text-sm text-gray-600 mb-2">
              Search Owner
            </label>
            <input
              type="text"
              value={searchOwner}
              onChange={(e) => setSearchOwner(e.target.value)}
              placeholder="Type name or email..."
              className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-teal-200"
            />
          </div>
        

          {/* Placeholder */}
          <div></div>
        </div>

        {/* Filter Buttons */}
        <div className="flex items-center gap-3">
          {/* <button
            onClick={fetchInvoices}
            className="flex items-center gap-2 px-6 py-2.5 bg-teal-500 text-white rounded-xl hover:bg-teal-600 transition-colors"
          >
            Apply Filters
          </button> */}
          <button
            onClick={handleReset}
            className="flex items-center gap-2 px-6 py-2.5 bg-white border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors"
          >
            <RotateCcw className="size-4" />
            Reset
          </button>
        </div>
      </div>

      {/* Invoices Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  INVOICE ID
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  PATIENT
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  OWNER
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  AMOUNT
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  DATE
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  STATUS
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  ACTIONS
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-100">
              {filteredInvoices.length === 0 ? (
                <tr>
                  <td
                    colSpan="7"
                    className="px-6 py-16 text-center text-gray-500"
                  >
                    No invoices found
                  </td>
                </tr>
              ) : (
                filteredInvoices.map((invoice) => (
                  <tr
                    key={invoice.id}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm font-medium text-gray-900">
                        {invoice.invoiceId}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-900">
                        {invoice.patientName}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-600">
                        {invoice.ownerName}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm font-medium text-gray-900">
                        {invoice.amount}đ
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-600">
                        {invoice.dueDate}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(
                          invoice.status
                        )}`}
                      >
                        {invoice.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleViewInvoice(invoice.invoiceId)}
                          className="p-1.5 text-teal-600 hover:bg-teal-50 rounded-lg transition-colors"
                        >
                          <Eye className="size-4" />
                        </button>
                        <button onClick={() => downloadInvoicePDF(invoice.invoiceId)} className="p-1.5 text-gray-400 hover:bg-gray-100 rounded-lg transition-colors">
                          <Download className="size-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}