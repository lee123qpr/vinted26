'use client';

export default function PrintButton() {
    return (
        <button
            className="btn-primary px-8"
            onClick={() => window.print()}
        >
            Print / Save PDF
        </button>
    );
}
