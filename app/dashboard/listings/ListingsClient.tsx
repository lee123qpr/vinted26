'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { formatCurrency } from '@/lib/format';
import { deleteListing } from '@/app/actions/listings';

interface Props {
    initialListings: any[];
}

export default function ListingsClient({ initialListings }: Props) {
    const [listings, setListings] = useState(initialListings);
    const [deleteModal, setDeleteModal] = useState<{ isOpen: boolean; listingId: string | null; listingTitle: string }>({
        isOpen: false,
        listingId: null,
        listingTitle: ''
    });
    const [deleting, setDeleting] = useState(false);

    const openDeleteModal = (id: string, title: string) => {
        setDeleteModal({ isOpen: true, listingId: id, listingTitle: title });
    };

    const closeDeleteModal = () => {
        setDeleteModal({ isOpen: false, listingId: null, listingTitle: '' });
    };

    const confirmDelete = async () => {
        if (!deleteModal.listingId) return;

        setDeleting(true);
        const result = await deleteListing(deleteModal.listingId);

        if (result.success) {
            setListings(prev => prev.filter(l => l.id !== deleteModal.listingId));
            closeDeleteModal();
        } else {
            alert('Error deleting listing: ' + result.error);
        }
        setDeleting(false);
    };

    return (
        <>
            <div className="space-y-6">
                <div className="flex justify-between items-center">
                    <h1 className="text-2xl font-bold text-secondary-900">My Listings</h1>
                    <Link href="/sell" className="btn-primary">
                        + New Listing
                    </Link>
                </div>

                {listings.length === 0 ? (
                    <div className="bg-white rounded-xl shadow-sm p-8 text-center">
                        <p className="text-secondary-500 mb-4">You haven't listed any items yet.</p>
                        <Link href="/sell" className="btn-primary">Start Selling</Link>
                    </div>
                ) : (
                    <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="bg-secondary-50 text-secondary-600 font-medium border-b border-secondary-200">
                                    <tr>
                                        <th className="px-6 py-4">Item</th>
                                        <th className="px-6 py-4">Price</th>
                                        <th className="px-6 py-4">Status</th>
                                        <th className="px-6 py-4">Views</th>
                                        <th className="px-6 py-4">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-secondary-100">
                                    {listings.map((item) => (
                                        <tr key={item.id} className="hover:bg-primary-50/10 transition">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center space-x-3">
                                                    <div className="relative w-12 h-12 bg-secondary-100 rounded-lg overflow-hidden flex-shrink-0">
                                                        {item.listing_images?.[0]?.image_url ? (
                                                            <Image src={item.listing_images[0].image_url} alt={item.title} fill className="object-cover" />
                                                        ) : (
                                                            <div className="w-full h-full flex items-center justify-center text-secondary-400">
                                                                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                                                                    <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
                                                                </svg>
                                                            </div>
                                                        )}
                                                    </div>
                                                    <span className="font-medium text-secondary-900">{item.title}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 font-medium text-secondary-900">
                                                {item.is_free ? (
                                                    <span className="text-green-600 font-bold">FREE</span>
                                                ) : (
                                                    formatCurrency(item.price_gbp)
                                                )}
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`px-2 py-1 text-xs rounded-full capitalize ${item.status === 'active' ? 'bg-green-100 text-green-700' :
                                                    item.status === 'sold' ? 'bg-blue-100 text-blue-700' :
                                                        'bg-secondary-100 text-secondary-700'
                                                    }`}>
                                                    {item.status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-secondary-600">{item.view_count || 0}</td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center space-x-3">
                                                    <Link href={`/listing/${item.id}`} className="text-primary-600 hover:underline text-sm">View</Link>
                                                    <Link href={`/listing/${item.id}/edit`} className="text-secondary-600 hover:underline text-sm">Edit</Link>
                                                    <button
                                                        onClick={() => openDeleteModal(item.id, item.title)}
                                                        className="text-red-500 hover:text-red-700 text-sm font-medium"
                                                    >
                                                        Delete
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>

            {/* Delete Confirmation Modal */}
            {deleteModal.isOpen && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={closeDeleteModal}>
                    <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6 animate-in fade-in zoom-in duration-200" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-start space-x-4 mb-4">
                            <div className="flex-shrink-0 w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                                <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                </svg>
                            </div>
                            <div className="flex-1">
                                <h3 className="text-lg font-bold text-secondary-900 mb-1">Delete Listing</h3>
                                <p className="text-sm text-secondary-600">
                                    Are you sure you want to delete <span className="font-semibold">"{deleteModal.listingTitle}"</span>? This action cannot be undone.
                                </p>
                            </div>
                        </div>

                        <div className="flex space-x-3 mt-6">
                            <button
                                onClick={closeDeleteModal}
                                disabled={deleting}
                                className="flex-1 px-4 py-2 bg-secondary-100 hover:bg-secondary-200 text-secondary-900 font-medium rounded-lg transition-colors disabled:opacity-50"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={confirmDelete}
                                disabled={deleting}
                                className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50 flex items-center justify-center"
                            >
                                {deleting ? (
                                    <>
                                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Deleting...
                                    </>
                                ) : (
                                    'Delete'
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
