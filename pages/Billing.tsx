import React, { useState } from 'react';
import { CreditCard, DollarSign, Plus, Clock, CheckCircle, AlertCircle, Loader2, X, Lock, Printer, Wallet, Landmark, ArrowRight } from 'lucide-react';
import { useData } from '../context/DataContext';
import { Invoice } from '../types';

const Billing: React.FC = () => {
  const { invoices, patients, addInvoice, updateInvoice } = useData();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [transferredAmount, setTransferredAmount] = useState(0);
  const [accountNumber, setAccountNumber] = useState('');

  // Stats
  const totalRevenue = invoices.filter(i => i.status === 'Paid').reduce((acc, curr) => acc + curr.amount, 0);
  const pendingAmount = invoices.filter(i => i.status === 'Pending').reduce((acc, curr) => acc + curr.amount, 0);
  const availableBalance = totalRevenue - transferredAmount;

  // Create Form State
  const [formData, setFormData] = useState({
    patientId: '',
    amount: '',
    items: ''
  });

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    const patient = patients.find(p => p.id === formData.patientId);
    if (!patient) return;

    const newInvoice: Invoice = {
      id: `INV-2023-${Math.floor(100 + Math.random() * 900)}`,
      patientId: patient.id,
      patientName: patient.fullName,
      date: new Date().toISOString().split('T')[0],
      amount: parseFloat(formData.amount),
      status: 'Pending',
      items: formData.items.split(',').map(i => i.trim())
    };

    addInvoice(newInvoice);
    setShowCreateModal(false);
    setFormData({ patientId: '', amount: '', items: '' });
  };

  const initiatePayment = (invoice: Invoice) => {
    setSelectedInvoice(invoice);
    setShowPaymentModal(true);
  };

  const processPayment = (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);

    // Simulate Payment Gateway delay
    setTimeout(() => {
      if (selectedInvoice) {
        updateInvoice({ ...selectedInvoice, status: 'Paid' });
      }
      setIsProcessing(false);
      setShowPaymentModal(false);
      setSelectedInvoice(null);
    }, 2000);
  };

  const handleTransfer = (e: React.FormEvent) => {
    e.preventDefault();
    if (availableBalance <= 0) return;

    setIsProcessing(true);
    // Simulate Bank Transfer delay
    setTimeout(() => {
      setTransferredAmount(prev => prev + availableBalance);
      setIsProcessing(false);
      setShowTransferModal(false);
      setAccountNumber('');
    }, 2000);
  };

  const handlePrintInvoice = (inv: Invoice) => {
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>Receipt - ${inv.id}</title>
            <style>
              body { font-family: 'Courier New', Courier, monospace; padding: 40px; color: #333; max-width: 800px; margin: 0 auto; background: #fff; }
              .header { text-align: center; margin-bottom: 20px; border-bottom: 2px dashed #333; padding-bottom: 20px; }
              .hospital-name { font-size: 28px; font-weight: bold; text-transform: uppercase; letter-spacing: 2px; margin-bottom: 5px; }
              .hospital-info { font-size: 14px; color: #555; }
              .receipt-title { text-align: center; font-size: 20px; font-weight: bold; margin: 20px 0; text-transform: uppercase; }
              .meta { margin-bottom: 30px; display: flex; justify-content: space-between; border: 1px solid #ddd; padding: 15px; }
              .meta-group { display: flex; flex-direction: column; gap: 5px; font-size: 14px; }
              .table { width: 100%; border-collapse: collapse; margin-bottom: 30px; font-size: 14px; }
              .table th { text-align: left; border-bottom: 2px solid #333; padding: 10px 5px; text-transform: uppercase; }
              .table td { padding: 10px 5px; border-bottom: 1px solid #eee; }
              .total-row { border-top: 2px solid #333; font-weight: bold; font-size: 18px; display: flex; justify-content: space-between; padding-top: 15px; margin-top: 10px; }
              .footer { margin-top: 50px; text-align: center; font-size: 12px; border-top: 1px dashed #ccc; padding-top: 20px; color: #777; }
              .stamp { 
                 position: absolute; top: 180px; right: 60px; 
                 border: 4px solid ${inv.status === 'Paid' ? '#059669' : '#dc2626'}; 
                 color: ${inv.status === 'Paid' ? '#059669' : '#dc2626'}; 
                 font-size: 40px; font-weight: 900; padding: 10px 20px; 
                 text-transform: uppercase; letter-spacing: 5px;
                 transform: rotate(-15deg); opacity: 0.8; 
                 border-radius: 8px;
              }
              @media print { 
                body { padding: 0; }
                .no-print { display: none; } 
              }
            </style>
          </head>
          <body>
            <div class="header">
              <div class="hospital-name">MedCore Hospital</div>
              <div class="hospital-info">123 Medical Center Dr, Health City, HC 90210</div>
              <div class="hospital-info">Ph: (555) 123-4567 | Web: www.medcore.com</div>
            </div>
            
            <div class="receipt-title">Payment Receipt</div>
            
            <div class="meta">
              <div class="meta-group">
                <strong>BILL TO:</strong>
                <span>${inv.patientName}</span>
                <span>ID: ${inv.patientId}</span>
              </div>
              <div class="meta-group" style="text-align: right;">
                <strong>INVOICE #:</strong> ${inv.id}<br>
                <strong>DATE:</strong> ${inv.date}<br>
              </div>
            </div>

            <table class="table">
              <thead>
                <tr>
                  <th>Description</th>
                  <th style="text-align: right;">Amount</th>
                </tr>
              </thead>
              <tbody>
                ${inv.items.map((item, index) => `
                  <tr>
                    <td>${index + 1}. ${item}</td>
                    <td style="text-align: right;">--</td> 
                  </tr>
                `).join('')}
              </tbody>
            </table>

            <div class="total-row">
              <span>TOTAL AMOUNT</span>
              <span>$${inv.amount.toLocaleString(undefined, {minimumFractionDigits: 2})}</span>
            </div>

            <div class="stamp">${inv.status === 'Pending' ? 'DUE' : inv.status}</div>

            <div class="footer">
              <p>Thank you for choosing MedCore Hospital.</p>
              <p>This is a computer generated invoice and does not require a physical signature.</p>
              <p>Generated on ${new Date().toLocaleString()}</p>
            </div>
            <script>window.onload = function() { window.print(); }</script>
          </body>
        </html>
      `);
      printWindow.document.close();
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Billing & Payments</h2>
          <p className="text-slate-500">Manage invoices and patient payments</p>
        </div>
        <button 
          onClick={() => setShowCreateModal(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center shadow-lg shadow-blue-600/20"
        >
          <Plus size={18} className="mr-2" />
          Create Invoice
        </button>
      </div>

      {/* Financial Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Wallet / Revenue Card */}
        <div className="bg-gradient-to-br from-emerald-600 to-teal-700 p-6 rounded-2xl shadow-lg shadow-emerald-600/20 text-white flex flex-col justify-between relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -mr-10 -mt-10"></div>
          
          <div className="flex justify-between items-start z-10">
            <div>
              <p className="text-emerald-100 text-sm font-medium flex items-center mb-1">
                 <Wallet size={16} className="mr-2" />
                 Available Balance
              </p>
              <h3 className="text-3xl font-bold tracking-tight">${availableBalance.toLocaleString()}</h3>
              <p className="text-xs text-emerald-200 mt-1">Total Lifetime Revenue: ${totalRevenue.toLocaleString()}</p>
            </div>
            <div className="p-3 rounded-xl bg-white/20 backdrop-blur-sm">
              <DollarSign size={24} className="text-white" />
            </div>
          </div>

          <button 
             onClick={() => setShowTransferModal(true)}
             disabled={availableBalance <= 0}
             className="mt-6 w-full bg-white text-emerald-700 py-2.5 rounded-lg font-bold text-sm hover:bg-emerald-50 transition-colors flex items-center justify-center disabled:opacity-70 disabled:cursor-not-allowed shadow-sm"
          >
             Transfer to Bank
             <ArrowRight size={16} className="ml-2" />
          </button>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center justify-between">
          <div>
            <p className="text-slate-500 text-sm font-medium">Pending Payments</p>
            <h3 className="text-2xl font-bold text-slate-800 mt-1">${pendingAmount.toLocaleString()}</h3>
          </div>
          <div className="p-3 rounded-xl bg-amber-100 text-amber-600">
            <Clock size={24} />
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center justify-between">
          <div>
            <p className="text-slate-500 text-sm font-medium">Overdue Invoices</p>
            <h3 className="text-2xl font-bold text-slate-800 mt-1">1</h3>
          </div>
          <div className="p-3 rounded-xl bg-red-100 text-red-600">
            <AlertCircle size={24} />
          </div>
        </div>
      </div>

      {/* Invoice List */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-4 border-b border-slate-100">
          <h3 className="font-bold text-slate-800">Recent Invoices</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50">
                <th className="p-4 font-semibold text-slate-600 text-sm">Invoice ID</th>
                <th className="p-4 font-semibold text-slate-600 text-sm">Patient</th>
                <th className="p-4 font-semibold text-slate-600 text-sm">Date</th>
                <th className="p-4 font-semibold text-slate-600 text-sm">Services</th>
                <th className="p-4 font-semibold text-slate-600 text-sm">Amount</th>
                <th className="p-4 font-semibold text-slate-600 text-sm">Status</th>
                <th className="p-4 font-semibold text-slate-600 text-sm text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {invoices.map((inv) => (
                <tr key={inv.id} className="hover:bg-slate-50 transition-colors">
                  <td className="p-4 font-mono text-sm text-slate-500">{inv.id}</td>
                  <td className="p-4 font-medium text-slate-800">{inv.patientName}</td>
                  <td className="p-4 text-sm text-slate-500">{inv.date}</td>
                  <td className="p-4 text-sm text-slate-500 max-w-xs truncate">
                    {inv.items.join(', ')}
                  </td>
                  <td className="p-4 font-bold text-slate-800">${inv.amount.toLocaleString()}</td>
                  <td className="p-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      inv.status === 'Paid' ? 'bg-emerald-100 text-emerald-800' :
                      inv.status === 'Pending' ? 'bg-amber-100 text-amber-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {inv.status}
                    </span>
                  </td>
                  <td className="p-4 text-right space-x-2">
                    {inv.status !== 'Paid' && (
                      <button 
                        onClick={() => initiatePayment(inv)}
                        className="text-xs bg-blue-600 text-white px-3 py-1.5 rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
                      >
                        Pay Now
                      </button>
                    )}
                    <button 
                      onClick={() => handlePrintInvoice(inv)}
                      className="text-slate-400 hover:text-slate-600 p-1 hover:bg-slate-100 rounded"
                      title="Print Invoice"
                    >
                      <Printer size={18} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Invoice Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg p-6 animate-fade-in relative">
            <button 
              onClick={() => setShowCreateModal(false)}
              className="absolute right-4 top-4 text-slate-400 hover:text-slate-600"
            >
              <X size={20} />
            </button>
            <h3 className="text-xl font-bold text-slate-800 mb-4">Generate New Invoice</h3>
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Patient</label>
                <select 
                  name="patientId"
                  value={formData.patientId}
                  onChange={(e) => setFormData({...formData, patientId: e.target.value})}
                  required
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                >
                  <option value="">Select Patient</option>
                  {patients.map(p => (
                    <option key={p.id} value={p.id}>{p.fullName}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Amount ($)</label>
                <input 
                  type="number" 
                  step="0.01"
                  value={formData.amount}
                  onChange={(e) => setFormData({...formData, amount: e.target.value})}
                  required
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                  placeholder="0.00" 
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Services (comma separated)</label>
                <input 
                  type="text" 
                  value={formData.items}
                  onChange={(e) => setFormData({...formData, items: e.target.value})}
                  required
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                  placeholder="Consultation, X-Ray" 
                />
              </div>
              <button 
                type="submit" 
                className="w-full mt-4 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 font-medium"
              >
                Create Invoice
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Payment Gateway Modal */}
      {showPaymentModal && selectedInvoice && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-fade-in">
            <div className="bg-slate-900 p-6 text-white flex justify-between items-center">
              <div>
                <h3 className="font-bold text-lg">Secure Payment</h3>
                <p className="text-slate-400 text-sm">Invoice #{selectedInvoice.id}</p>
              </div>
              <CreditCard size={32} className="text-blue-400" />
            </div>
            
            <div className="p-6">
              <div className="mb-6 text-center">
                <p className="text-slate-500 text-sm">Total Amount</p>
                <h2 className="text-3xl font-bold text-slate-800">${selectedInvoice.amount.toLocaleString()}</h2>
              </div>

              <form onSubmit={processPayment} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Card Number</label>
                  <div className="relative">
                    <input 
                      type="text" 
                      placeholder="0000 0000 0000 0000"
                      className="w-full border border-slate-300 rounded-lg pl-10 pr-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                      required
                    />
                    <CreditCard className="absolute left-3 top-2.5 text-slate-400" size={18} />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Expiry Date</label>
                    <input 
                      type="text" 
                      placeholder="MM/YY"
                      className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">CVC</label>
                    <input 
                      type="text" 
                      placeholder="123"
                      className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                      required
                    />
                  </div>
                </div>
                
                <button 
                  type="submit"
                  disabled={isProcessing}
                  className="w-full mt-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 rounded-xl transition-all shadow-lg shadow-emerald-600/20 flex items-center justify-center disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {isProcessing ? (
                    <>
                      <Loader2 size={20} className="animate-spin mr-2" />
                      Processing...
                    </>
                  ) : (
                    <>
                      Pay ${selectedInvoice.amount.toLocaleString()}
                      <CheckCircle size={20} className="ml-2" />
                    </>
                  )}
                </button>
                <button 
                  type="button"
                  onClick={() => setShowPaymentModal(false)}
                  disabled={isProcessing}
                  className="w-full text-slate-500 text-sm hover:text-slate-700 font-medium"
                >
                  Cancel
                </button>
              </form>
            </div>
            <div className="bg-slate-50 p-3 text-center border-t border-slate-100">
              <p className="text-[10px] text-slate-400 flex items-center justify-center">
                <Lock size={10} className="mr-1" />
                Payments are secured with 256-bit encryption
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Transfer Modal */}
      {showTransferModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 animate-fade-in relative">
             <button 
              onClick={() => setShowTransferModal(false)}
              className="absolute right-4 top-4 text-slate-400 hover:text-slate-600"
            >
              <X size={20} />
            </button>
            
            <div className="text-center mb-6">
                <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-3">
                   <Landmark className="text-emerald-600" size={24} />
                </div>
                <h3 className="text-xl font-bold text-slate-800">Transfer Funds</h3>
                <p className="text-sm text-slate-500 mt-1">
                   Withdraw earnings to your linked bank account.
                </p>
             </div>

             <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 mb-6 flex justify-between items-center">
                <span className="text-sm text-slate-500">Available Amount</span>
                <span className="text-lg font-bold text-slate-800">${availableBalance.toLocaleString()}</span>
             </div>

             <form onSubmit={handleTransfer} className="space-y-4">
                <div>
                   <label className="block text-sm font-medium text-slate-700 mb-1">Account Number</label>
                   <input 
                      type="text" 
                      value={accountNumber}
                      onChange={(e) => setAccountNumber(e.target.value)}
                      required
                      placeholder="Enter account number"
                      className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-emerald-500 outline-none"
                   />
                </div>
                
                <button 
                  type="submit"
                  disabled={isProcessing}
                  className="w-full bg-emerald-600 text-white py-2.5 rounded-lg hover:bg-emerald-700 transition-colors font-medium shadow-lg shadow-emerald-600/20 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center"
                >
                  {isProcessing ? (
                     <>
                       <Loader2 size={18} className="mr-2 animate-spin" />
                       Processing Transfer...
                     </>
                  ) : 'Confirm Transfer'}
                </button>
             </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Billing;