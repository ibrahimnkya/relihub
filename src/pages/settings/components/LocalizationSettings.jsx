import { useState } from 'react'
import { Globe, Save, MapPin } from 'lucide-react'
import Select from '../../../components/ui/Select'
import { useToast } from '../../../store/toastStore'

const LocalizationSettings = () => {
  const { addToast } = useToast()
  const [language, setLanguage] = useState('English (System Default)')
  const [currency, setCurrency] = useState('TZS (Tanzanian Shilling)')
  const [dateFormat, setDateFormat] = useState('DD/MM/YYYY (24 Hour)')
  const [metric, setMetric] = useState('Liters (L)')

  return (
    <div className="bg-brand-card rounded-[10px] p-4 sm:p-6 lg:p-8 border border-brand-border shadow-sm space-y-6 sm:space-y-8 animate-fade-in-up">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-black text-brand-heading mb-1 uppercase tracking-tight">Regional Configuration</h2>
          <p className="text-xs text-brand-body font-bold uppercase tracking-widest opacity-60">Adjust localization formats and display metrics.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-6">
          <div className="flex items-center gap-2 mb-4">
            <Globe className="text-brand-blue" size={20} />
            <h3 className="text-sm font-black text-brand-heading uppercase tracking-widest">Interface Localization</h3>
          </div>
          
          <div className="space-y-6">
            <div className="space-y-4">
              <Select 
                label="Default Language"
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                options={['English (System Default)', 'Swahili']}
              />
              <Select 
                label="Date & Time Format"
                value={dateFormat}
                onChange={(e) => setDateFormat(e.target.value)}
                options={[
                   'DD/MM/YYYY (24 Hour)',
                   'MM/DD/YYYY (12 Hour)',
                   'YYYY-MM-DD (ISO 8601)'
                ]}
              />
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="flex items-center gap-2 mb-4">
            <MapPin className="text-brand-blue" size={20} />
            <h3 className="text-sm font-black text-brand-heading uppercase tracking-widest">Metrics & Exchange</h3>
          </div>
          
          <div className="space-y-6">
            <div className="space-y-4">
              <Select 
                label="Volume Metric System"
                value={metric}
                onChange={(e) => setMetric(e.target.value)}
                options={[
                   'Liters (L)',
                   'Gallons (Gal)',
                   'Cubic Meters (m³)'
                ]}
              />
              <Select 
                label="Base Currency"
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                options={[
                   'TZS (Tanzanian Shilling)',
                   'USD (US Dollar)',
                   'KES (Kenyan Shilling)'
                ]}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="pt-6 border-t border-brand-border flex justify-end">
        <button 
          onClick={() => addToast({ title: "Localization Patterns Updated", message: "Regional display formats have been successfully applied.", type: "success" })}
          className="bg-brand-blue text-white px-6 py-3 rounded-[10px] font-bold text-xs uppercase tracking-widest hover:bg-brand-hover transition-all shadow-lg shadow-brand-blue/10 flex items-center gap-2 border border-brand-hover"
        >
          <Save size={16} /> Save Localization
        </button>
      </div>
    </div>
  )
}

export default LocalizationSettings
