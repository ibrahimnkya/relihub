const TableBase = ({ headers, children, title, action }) => {
  return (
    <div className="bg-brand-card rounded-[12px] shadow-sm border border-brand-border overflow-hidden flex flex-col h-full relative">
      {(title || action) && (
        <div className="px-6 py-4 border-b border-brand-border flex items-center justify-between">
          {title && <h3 className="text-sm font-bold text-brand-heading uppercase tracking-widest">{title}</h3>}
          {action && <div>{action}</div>}
        </div>
      )}
      <div className="overflow-auto flex-1 custom-scrollbar">
        <table className="w-full text-left border-collapse">
          <thead className="sticky top-0 z-10">
            <tr>
              {headers.map((header, index) => (
                <th 
                  key={index} 
                  className="sticky top-0 px-6 py-3.5 text-[10px] font-black text-brand-navy uppercase tracking-[0.15em] border-b border-brand-border bg-slate-50/90 backdrop-blur-md shadow-[0_2px_4px_rgba(0,0,0,0.02)]"
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
