import { LayoutGrid, List } from 'lucide-react'

const LayoutToggle = ({ layout, onChange }) => {
  return (
    <div className="bg-white border border-slate-200 rounded-[10px] p-1 flex items-center gap-1 shadow-sm">
      <button
        onClick={() => onChange('grid')}
        className={`p-2 rounded-[8px] transition-all ${
          layout === 'grid' 
            ? 'bg-brand-blue text-white shadow-md' 
            : 'text-slate-400 hover:bg-slate-50 hover:text-brand-blue'
        }`}
        title="Grid View"
      >
        <LayoutGrid size={16} />
      </button>
      <button
        onClick={() => onChange('list')}
        className={`p-2 rounded-[8px] transition-all ${
          layout === 'list' 
            ? 'bg-brand-blue text-white shadow-md' 
            : 'text-slate-400 hover:bg-slate-50 hover:text-brand-blue'
        }`}
        title="List View"
      >
        <List size={16} />
      </button>
    </div>
  )
}

export default LayoutToggle
