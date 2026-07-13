import React from 'react';

function ParentLayout({ children }) {
    return (
        <div style={{ fontFamily: 'Arial, sans-serif' }}>
            {children}
        </div>
    );
}

export default ParentLayout;