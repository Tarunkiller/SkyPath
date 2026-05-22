'use client';

import { useState } from 'react';
import type { ChangeEvent } from 'react';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { Button } from '../ui/Button';

export type PaymentMethod = 'card' | 'upi' | 'netbanking';

interface PaymentFormProps {
  paymentMethod: PaymentMethod;
  setPaymentMethod: (method: PaymentMethod) => void;
  cardDetails: { name: string; number: string; expiry: string; cvv: string };
  setCardDetails: (details: any) => void;
  upiId: string;
  setUpiId: (id: string) => void;
  selectedBank: string;
  setSelectedBank: (bank: string) => void;
  onOpenQR: () => void;
}

export function PaymentForm({
  paymentMethod,
  setPaymentMethod,
  cardDetails,
  setCardDetails,
  upiId,
  setUpiId,
  selectedBank,
  setSelectedBank,
  onOpenQR,
}: PaymentFormProps) {
  const handleCardChange = (field: string, value: string) => {
    let formatted = value;
    if (field === 'number') {
      const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '').slice(0, 16);
      const parts = [];
      for (let i = 0; i < v.length; i += 4) {
        parts.push(v.substring(i, i + 4));
      }
      formatted = parts.join(' ');
    } else if (field === 'expiry') {
      const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '').slice(0, 4);
      if (v.length > 2) {
        formatted = `${v.slice(0, 2)}/${v.slice(2)}`;
      } else {
        formatted = v;
      }
    } else if (field === 'cvv') {
      formatted = value.replace(/[^0-9]/gi, '').slice(0, 3);
    }
    setCardDetails((prev: any) => ({ ...prev, [field]: formatted }));
  };

  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-slate-900">Payment details</h2>
        <p className="mt-1 text-sm text-slate-600">Select your preferred payment method and complete verification.</p>
      </div>

      <div className="grid grid-cols-3 gap-2 p-1 bg-slate-100 rounded-2xl">
        {(['card', 'upi', 'netbanking'] as const).map((method) => (
          <button
            key={method}
            type="button"
            onClick={() => setPaymentMethod(method)}
            className={`py-2 text-xs font-semibold rounded-xl capitalize transition-all ${
              paymentMethod === method
                ? 'bg-white text-indigo-600 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            {method === 'card' ? 'Card' : method === 'upi' ? 'UPI' : 'Net Banking'}
          </button>
        ))}
      </div>

      {paymentMethod === 'card' && (
        <div className="space-y-4">
          <label className="block space-y-2 text-sm font-medium text-slate-800">
            Cardholder Name
            <Input
              type="text"
              value={cardDetails.name}
              onChange={(e: ChangeEvent<HTMLInputElement>) => handleCardChange('name', e.target.value)}
              placeholder="As printed on card"
            />
          </label>
          <label className="block space-y-2 text-sm font-medium text-slate-800">
            Card Number
            <Input
              type="text"
              value={cardDetails.number}
              onChange={(e: ChangeEvent<HTMLInputElement>) => handleCardChange('number', e.target.value)}
              placeholder="0000 0000 0000 0000"
            />
          </label>
          <div className="grid grid-cols-2 gap-4">
            <label className="block space-y-2 text-sm font-medium text-slate-800">
              Expiry Date
              <Input
                type="text"
                value={cardDetails.expiry}
                onChange={(e: ChangeEvent<HTMLInputElement>) => handleCardChange('expiry', e.target.value)}
                placeholder="MM/YY"
              />
            </label>
            <label className="block space-y-2 text-sm font-medium text-slate-800">
              CVV
              <Input
                type="password"
                value={cardDetails.cvv}
                onChange={(e: ChangeEvent<HTMLInputElement>) => handleCardChange('cvv', e.target.value)}
                placeholder="•••"
              />
            </label>
          </div>
        </div>
      )}

      {paymentMethod === 'upi' && (
        <div className="space-y-4">
          <label className="block space-y-2 text-sm font-medium text-slate-800">
            UPI ID
            <Input
              type="text"
              value={upiId}
              onChange={(e: ChangeEvent<HTMLInputElement>) => setUpiId(e.target.value)}
              placeholder="e.g. mobile@upi, username@bank"
            />
          </label>
          <div className="relative flex py-2 items-center">
            <div className="flex-grow border-t border-slate-200"></div>
            <span className="flex-shrink mx-4 text-xs text-slate-400 font-semibold uppercase">Or Pay with QR</span>
            <div className="flex-grow border-t border-slate-200"></div>
          </div>
          <Button
            variant="secondary"
            type="button"
            onClick={onOpenQR}
            className="w-full flex items-center justify-center gap-2"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 4.875c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5A1.125 1.125 0 013.75 9.375v-4.5zM3.75 14.625c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5a1.125 1.125 0 01-1.125-1.125v-4.5zM13.5 4.875c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5A1.125 1.125 0 0113.5 9.375v-4.5z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 13.5h.75v.75h-.75v-.75zM13.5 16.5h.75v.75h-.75v-.75zM16.5 13.5h.75v.75h-.75v-.75zM16.5 16.5h.75v.75h-.75v-.75zM15 15h.75v.75H15V15zM18 18h.75v.75H18V18zM15 18h.75v.75H15V18zM18 15h.75v.75H18V15zM19.5 19.5h.75v.75h-.75v-.75zM19.5 13.5h.75v.75h-.75v-.75zM13.5 19.5h.75v.75h-.75v-.75z" />
            </svg>
            Generate QR Code
          </Button>
        </div>
      )}

      {paymentMethod === 'netbanking' && (
        <div className="space-y-4">
          <label className="block space-y-2 text-sm font-medium text-slate-800">
            Select Your Bank
            <Select
              value={selectedBank}
              onChange={(e: ChangeEvent<HTMLSelectElement>) => setSelectedBank(e.target.value)}
            >
              <option value="">-- Choose Bank --</option>
              <option value="sbi">State Bank of India</option>
              <option value="hdfc">HDFC Bank</option>
              <option value="icici">ICICI Bank</option>
              <option value="axis">Axis Bank</option>
              <option value="kotak">Kotak Mahindra Bank</option>
            </Select>
          </label>
        </div>
      )}
    </div>
  );
}
