'use client';

import { useState } from 'react';
import type { ChangeEvent } from 'react';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { useFlightStore } from '../../store/flightStore';

const nationalities = ['India', 'United States', 'United Kingdom', 'Canada', 'Australia'];

export function PassengerForm() {
  const passengerForm = useFlightStore((state) => state.passengerForm);
  const updatePassengerForm = useFlightStore((state) => state.updatePassengerForm);
  const [showPassport, setShowPassport] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleChange = (field: keyof typeof passengerForm, value: string) => {
    updatePassengerForm({ [field]: value });
    setErrors((current) => ({ ...current, [field]: '' }));
  };

  const validate = () => {
    const nextErrors: Record<string, string> = {};
    if (!passengerForm.fullName.trim()) nextErrors.fullName = 'Full name is required.';
    if (!passengerForm.passportNo.trim()) nextErrors.passportNo = 'Passport number is required.';
    if (!passengerForm.nationality) nextErrors.nationality = 'Nationality is required.';
    if (!passengerForm.dob) nextErrors.dob = 'Date of birth is required.';
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  return (
    <div className="space-y-4 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <h2 className="text-lg font-semibold text-slate-900">Passenger details</h2>
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="space-y-2 text-sm font-medium text-slate-800">
          Full name
          <Input value={passengerForm.fullName} onChange={(event: ChangeEvent<HTMLInputElement>) => handleChange('fullName', event.target.value)} placeholder="Sunita Sharma" />
          {errors.fullName ? <p className="text-xs text-red-600">{errors.fullName}</p> : null}
        </label>
        <label className="space-y-2 text-sm font-medium text-slate-800">
          Passport number
          <div className="relative">
            <Input type={showPassport ? 'text' : 'password'} value={passengerForm.passportNo} onChange={(event: ChangeEvent<HTMLInputElement>) => handleChange('passportNo', event.target.value)} placeholder="A12345678" />
            <button type="button" className="absolute right-3 top-3 text-sm text-indigo-600" onClick={() => setShowPassport((current) => !current)}>{showPassport ? 'Hide' : 'Show'}</button>
          </div>
          {errors.passportNo ? <p className="text-xs text-red-600">{errors.passportNo}</p> : null}
        </label>
        <label className="space-y-2 text-sm font-medium text-slate-800">
          Nationality
          <Select value={passengerForm.nationality} onChange={(event: ChangeEvent<HTMLSelectElement>) => handleChange('nationality', event.target.value)}>
            <option value="">Choose country</option>
            {nationalities.map((country) => <option key={country} value={country}>{country}</option>)}
          </Select>
          {errors.nationality ? <p className="text-xs text-red-600">{errors.nationality}</p> : null}
        </label>
        <label className="space-y-2 text-sm font-medium text-slate-800">
          Date of birth
          <Input type="date" value={passengerForm.dob} onChange={(event: ChangeEvent<HTMLInputElement>) => handleChange('dob', event.target.value)} />
          {errors.dob ? <p className="text-xs text-red-600">{errors.dob}</p> : null}
        </label>
      </div>
    </div>
  );
}
