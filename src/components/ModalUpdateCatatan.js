// src/components/ModalUpdateCatatan.jsx
import { useState } from 'react'
import { supabase } from "../lib/supabaseClient";

export default function ModalUpdateCatatan({ booking, onClose, onSave }) {
  const [catatan, setCatatan] = useState(booking.catatan_pengerjaan || '')

  const handleSubmit = async () => {
    await supabase
      .from('bookings')
      .update({ catatan_pengerjaan: catatan })
      .eq('id', booking.id)

    onSave()
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded p-6 w-full max-w-md">
        <h2 className="text-lg font-bold mb-4">Update Catatan Pengerjaan</h2>
        <textarea
          value={catatan}
          onChange={(e) => setCatatan(e.target.value)}
          className="w-full border rounded p-2 mb-4"
          rows={5}
        />
        <div className="flex justify-end gap-2">
          <button onClick={onClose} className="px-4 py-2 text-gray-600 hover:underline">
            Batal
          </button>
          <button
            onClick={handleSubmit}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Simpan
          </button>
        </div>
      </div>
    </div>
  )
}
