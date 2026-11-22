import React from 'react';
import { Layers, ShieldCheck, HeartHandshake } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-slate-900 text-slate-400 border-t border-slate-800 text-xs py-10 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div className="space-y-3 md:col-span-1">
            <div className="flex items-center gap-2">
              <div className="h-7 w-7 rounded-lg bg-brand-500 flex items-center justify-center text-white">
                <Layers className="h-4 w-4" />
              </div>
              <span className="text-white font-bold text-base tracking-tight">LaunchLoop</span>
            </div>
            <p className="text-slate-400 leading-relaxed">
              India&apos;s structured startup de-risking pipeline. Never launch blind.
            </p>
            <div className="flex items-center gap-1.5 text-emerald-400 font-medium">
              <ShieldCheck className="w-4 h-4" />
              <span>Verified Indian Enterprises & Refundable Deposits</span>
            </div>
          </div>

          <div>
            <h3 className="font-semibold text-slate-200 uppercase tracking-wider text-[11px] mb-3">
              The 4-Step Pipeline
            </h3>
            <ul className="space-y-2">
              <li>1. Problem Board (B2B Need)</li>
              <li>2. Complementary Team Finder</li>
              <li>3. Simulated Indian Customer Personas</li>
              <li>4. Refundable Pre-booking</li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-slate-200 uppercase tracking-wider text-[11px] mb-3">
              Founder Safeguards
            </h3>
            <ul className="space-y-2">
              <li>IP Protection & Ownership Policy</li>
              <li>Hypothesis Validation Framing</li>
              <li>Refundable deposits held by payment partner</li>
              <li>No real card data stored</li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-slate-200 uppercase tracking-wider text-[11px] mb-3">
              Sample Data Note
            </h3>
            <p className="text-slate-400 leading-relaxed text-[11px]">
              All enterprise business cases, co-founder profiles, and simulated persona reactions
              shown on LaunchLoop are sample demonstration data crafted for the Indian startup
              ecosystem.
            </p>
          </div>
        </div>

        <div className="pt-6 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-slate-500">
          <p>© {new Date().getFullYear()} LaunchLoop India. Built for builders.</p>
          <div className="flex items-center gap-1">
            <span>Made with</span>
            <HeartHandshake className="w-3.5 h-3.5 text-rose-500" />
            <span>for Indian founders</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
