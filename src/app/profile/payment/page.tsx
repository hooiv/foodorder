'use client';

import { useState } from 'react';
import { useProtectedRoute } from '../../lib/use-protected-route';
import { UserRole } from '../../types/auth';
import toast from 'react-hot-toast';

interface PaymentMethod {
  id: string;
  cardNumber: string;
  cardType: string;
  isDefault: boolean;
}

export default function PaymentMethods() {
  // Protect this route - only Admin can access
  useProtectedRoute({
    requiredRoles: [UserRole.ADMIN],
    redirectTo: '/dashboard',
  });
  
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([
    {
      id: '1',
      cardNumber: '•••• •••• •••• 1234',
      cardType: 'Visa',
      isDefault: true,
    },
    {
      id: '2',
      cardNumber: '•••• •••• •••• 5678',
      cardType: 'MasterCard',
      isDefault: false,
    }
  ]);
  
  const [showAddForm, setShowAddForm] = useState(false);
  const [newCard, setNewCard] = useState({
    cardNumber: '',
    cardholderName: '',
    expirationDate: '',
    cvv: '',
  });

  // Handle setting a card as default
  const handleSetDefault = (id: string) => {
    setPaymentMethods(
      paymentMethods.map(method => ({
        ...method,
        isDefault: method.id === id,
      }))
    );
    toast.success('Default payment method updated');
  };

  // Handle card removal
  const handleRemoveCard = (id: string) => {
    setPaymentMethods(paymentMethods.filter(method => method.id !== id));
    toast.success('Payment method removed');
  };

  // Handle adding new card
  const handleAddCard = (e: React.FormEvent) => {
    e.preventDefault();
    
    // In a real app, we would send this to the server
    // For now, just add it to the state with the last 4 digits
    const last4 = newCard.cardNumber.slice(-4);
    
    const newPaymentMethod = {
      id: (paymentMethods.length + 1).toString(),
      cardNumber: `•••• •••• •••• ${last4}`,
      cardType: 'New Card',
      isDefault: paymentMethods.length === 0, // Make it default if it's the first card
    };
    
    setPaymentMethods([...paymentMethods, newPaymentMethod]);
    setShowAddForm(false);
    setNewCard({
      cardNumber: '',
      cardholderName: '',
      expirationDate: '',
      cvv: '',
    });
    
    toast.success('New payment method added');
  };

  return (
    <div className="py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-2xl font-semibold text-gray-900">Payment Methods</h1>
        
        {/* Payment methods list */}
        <div className="mt-6 bg-white overflow-hidden shadow rounded-lg">
          <div className="px-4 py-5 sm:px-6">
            <h2 className="text-lg font-medium text-gray-900">Your Cards</h2>
            <p className="mt-1 text-sm text-gray-500">Manage your payment methods</p>
          </div>
          <div className="border-t border-gray-200">
            <ul className="divide-y divide-gray-200">
              {paymentMethods.map((method) => (
                <li key={method.id} className="px-4 py-4">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center">
                      {method.cardType === 'Visa' ? (
                        <svg className="h-8 w-8 text-blue-600" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 50 50">
                          <path d="M 5 8 C 2.25 8 0 10.25 0 13 L 0 37 C 0 39.75 2.25 42 5 42 L 45 42 C 47.75 42 50 39.75 50 37 L 50 13 C 50 10.25 47.75 8 45 8 Z M 5 10 L 45 10 C 46.667969 10 48 11.332031 48 13 L 48 37 C 48 38.667969 46.667969 40 45 40 L 5 40 C 3.332031 40 2 38.667969 2 37 L 2 13 C 2 11.332031 3.332031 10 5 10 Z M 15.121094 17.527344 L 9.203125 31 L 12.46875 31 L 13.625 28 L 18.8125 28 L 19.921875 31 L 23.363281 31 L 17.449219 17.527344 Z M 25.121094 17.632812 L 21.902344 31 L 25.007812 31 L 28.226562 17.632812 Z M 31.095703 17.632812 L 28 31 L 31.128906 31 L 34.236328 17.632812 Z M 37.28125 17.632812 L 33.619141 26.847656 L 32.5 22.667969 C 31.7 19.871094 34.1 17.6 37 17.6 Z M 16.300781 20.121094 L 17.777344 25.164062 L 14.664062 25.164062 Z"></path>
                        </svg>
                      ) : method.cardType === 'MasterCard' ? (
                        <svg className="h-8 w-8" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 50 50">
                          <path fill="#F44336" d="M 9 5 C 5.1 5 2 8.1 2 12 L 2 38 C 2 41.9 5.1 45 9 45 L 41 45 C 44.9 45 48 41.9 48 38 L 48 12 C 48 8.1 44.9 5 41 5 Z"></path>
                          <path fill="#F57C00" d="M 29 21 A 9 9 0 1 0 29 39 A 9 9 0 1 0 29 21 Z"></path>
                          <path fill="#FFC107" d="M 21 21 A 9 9 0 1 0 21 39 A 9 9 0 1 0 21 21 Z"></path>
                          <path fill="#FF9800" d="M 25 25 A 9 9 0 0 0 21 21 A 9 9 0 0 0 21 39 A 9 9 0 0 0 25 35 L 25 33 L 25 25Z"></path>
                        </svg>
                      ) : (
                        <svg className="h-8 w-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                        </svg>
                      )}
                      <div className="ml-4">
                        <p className="text-sm font-medium text-gray-900">{method.cardType}</p>
                        <p className="text-sm text-gray-500">{method.cardNumber}</p>
                        {method.isDefault && (
                          <p className="text-xs text-blue-600 font-medium">Default</p>
                        )}
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      {!method.isDefault && (
                        <button
                          onClick={() => handleSetDefault(method.id)}
                          className="text-sm text-blue-600 hover:text-blue-500"
                        >
                          Set as default
                        </button>
                      )}
                      <button
                        onClick={() => handleRemoveCard(method.id)}
                        className="text-sm text-red-600 hover:text-red-500"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
          <div className="border-t border-gray-200 px-4 py-4">
            <button
              onClick={() => setShowAddForm(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm"
            >
              Add Payment Method
            </button>
          </div>
        </div>
        
        {/* Add new card form */}
        {showAddForm && (
          <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center">
            <div className="bg-white rounded-lg p-6 max-w-md w-full">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Add New Payment Method</h3>
              <form onSubmit={handleAddCard}>
                <div className="mb-4">
                  <label htmlFor="cardNumber" className="block text-sm font-medium text-gray-700">Card Number</label>
                  <input
                    type="text"
                    id="cardNumber"
                    value={newCard.cardNumber}
                    onChange={(e) => setNewCard({ ...newCard, cardNumber: e.target.value })}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    placeholder="1234 5678 9012 3456"
                    required
                  />
                </div>
                <div className="mb-4">
                  <label htmlFor="cardholderName" className="block text-sm font-medium text-gray-700">Cardholder Name</label>
                  <input
                    type="text"
                    id="cardholderName"
                    value={newCard.cardholderName}
                    onChange={(e) => setNewCard({ ...newCard, cardholderName: e.target.value })}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    placeholder="John Doe"
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <label htmlFor="expirationDate" className="block text-sm font-medium text-gray-700">Expiration Date</label>
                    <input
                      type="text"
                      id="expirationDate"
                      value={newCard.expirationDate}
                      onChange={(e) => setNewCard({ ...newCard, expirationDate: e.target.value })}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      placeholder="MM/YY"
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="cvv" className="block text-sm font-medium text-gray-700">CVV</label>
                    <input
                      type="text"
                      id="cvv"
                      value={newCard.cvv}
                      onChange={(e) => setNewCard({ ...newCard, cvv: e.target.value })}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      placeholder="123"
                      required
                    />
                  </div>
                </div>
                <div className="flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => setShowAddForm(false)}
                    className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 text-sm"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm"
                  >
                    Add Card
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
