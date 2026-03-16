import React from 'react';

const EmployeeListing = () => {
    const employees = [
        { id: 1, name: 'John Doe', designation: 'Data Miner', status: 'Active', phone: '+1 234 567 890', email: 'john@example.com', performance: 'Exceeds Expectations' },
        { id: 2, name: 'Jane Smith', designation: 'Sr. Data Miner', status: 'Active', phone: '+1 345 678 901', email: 'jane@example.com', performance: 'Exceptional' },
        { id: 3, name: 'Mike Ross', designation: 'Jr. Data Miner', status: 'On Leave', phone: '+1 456 789 012', email: 'mike@example.com', performance: 'Meeting Expectations' },
        { id: 4, name: 'Rachel Zane', designation: 'Data Miner', status: 'Active', phone: '+1 567 890 123', email: 'rachel@example.com', performance: 'Great' },
        { id: 5, name: 'Harvey Specter', designation: 'Manager', status: 'Active', phone: '+1 678 901 234', email: 'harvey@example.com', performance: 'Legendary' },
    ];

    return (
        <div className="p-4 md:p-6 space-y-8">
            {/* Header */}
            <div className="flex justify-between items-center px-2">
                <div>
                    <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>Team Management</h1>
                    <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>Manage and view employee performance and status.</p>
                </div>
                <button className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl font-medium shadow-lg shadow-blue-500/20 transition-all flex items-center gap-2">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                    </svg>
                    Add Employee
                </button>
            </div>

            <div
                className="grid gap-5 px-2"
                style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))'
                }}
            >
                {employees.map((emp) => (
                    <div key={emp.id} className="p-6 rounded-2xl shadow-sm border transition-all group"
                        style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-primary)' }}>
                        <div className="flex items-start justify-between mb-4">
                            <div className="flex items-center">
                                <div className="h-14 w-14 rounded-2xl flex items-center justify-center font-bold text-xl mr-4 group-hover:scale-110 transition-transform shadow-inner"
                                    style={{ backgroundColor: 'var(--bg-tertiary)', color: 'var(--accent-primary)' }}>
                                    {emp.name.split(' ').map(n => n[0]).join('')}
                                </div>
                                <div>
                                    <h3 className="font-bold text-lg" style={{ color: 'var(--text-primary)' }}>{emp.name}</h3>
                                    <p className="text-xs uppercase font-bold tracking-wider" style={{ color: 'var(--text-tertiary)' }}>{emp.designation}</p>
                                </div>
                            </div>
                            <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-tight ${emp.status === 'Active' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400'
                                }`}>
                                {emp.status}
                            </span>
                        </div>

                        <div className="space-y-3 py-4 border-t border-b my-4" style={{ borderColor: 'var(--border-primary)' }}>
                            <div className="flex items-center text-sm" style={{ color: 'var(--text-secondary)' }}>
                                <svg className="w-4 h-4 mr-3" style={{ color: 'var(--text-tertiary)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                </svg>
                                {emp.email}
                            </div>
                            <div className="flex items-center text-sm" style={{ color: 'var(--text-secondary)' }}>
                                <svg className="w-4 h-4 mr-3" style={{ color: 'var(--text-tertiary)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.948V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                </svg>
                                {emp.phone}
                            </div>
                        </div>

                        <div className="flex items-center justify-between text-xs">
                            <span className="font-bold uppercase tracking-wider" style={{ color: 'var(--text-tertiary)' }}>Performance</span>
                            <span className="font-bold" style={{ color: 'var(--accent-primary)' }}>{emp.performance}</span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default EmployeeListing;
