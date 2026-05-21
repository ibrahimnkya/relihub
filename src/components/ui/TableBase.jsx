const TableBase = ({ headers, children, title, action }) => {
  return (
    <div className="bg-brand-card rounded-[12px] shadow-sm border border-brand-border overflow-hidden flex flex-col h-full relative">
      {(title || action) && (
        <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-brand-border flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          {title && <h3 className="text-xs sm:text-sm font-bold text-brand-heading uppercase tracking-widest">{title}</h3>}
          {action && <div className="flex-shrink-0">{action}</div>}
        </div>
      )}
      <div className="overflow-x-auto flex-1 custom-scrollbar -webkit-overflow-scrolling-touch">
        <table className="w-full min-w-[560px] text-left border-collapse">
          <thead className="sticky top-0 z-10">
            <tr>
              {headers.map((header, index) => (
                <th 
                  key={index} 
                  className="sticky top-0 px-3 sm:px-6 py-3 sm:py-3.5 text-[9px] sm:text-[10px] font-black text-brand-navy uppercase tracking-[0.15em] border-b border-brand-border bg-slate-50/90 backdrop-blur-md shadow-[0_2px_4px_rgba(0,0,0,0.02)] whitespace-nowrap"
                >
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-brand-border">
            {children}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default TableBase
