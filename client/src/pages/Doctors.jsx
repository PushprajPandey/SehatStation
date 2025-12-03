import React, { useEffect, useState } from 'react';
import { databaseUrls } from '../data/databaseUrls';
import Navbar from '../components/Navbar';

const Doctors = () => {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        setLoading(true);
        const res = await fetch(databaseUrls.auth.getAllDoctors, {
          headers: { 'Content-Type': 'application/json' },
        });
        if (!res.ok) {
          throw new Error(`Status ${res.status}`);
        }
        const data = await res.json();
        setDoctors(data || []);
      } catch (err) {
        console.error('Error fetching doctors:', err);
        setError('Unable to fetch doctors');
      } finally {
        setLoading(false);
      }
    };

    fetchDoctors();
  }, []);

  return (
    <>
      <Navbar />
      <div className="container mx-auto p-6">
        <h2 className="text-2xl font-bold mb-4">Doctors</h2>
        {loading ? (
          <p>Loading doctors...</p>
        ) : error ? (
          <p>{error}</p>
        ) : doctors.length === 0 ? (
          <p>No doctors found.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {doctors.map((doc) => (
              <div key={doc._id || doc.id} className="p-4 border rounded">
                <h3 className="font-semibold">{doc.name}</h3>
                <p className="text-sm">{doc.department || doc.speciality || 'General'}</p>
                {doc.hospitalName && <p className="text-xs">{doc.hospitalName}</p>}
                <p className="text-xs">Phone: {doc.phone || 'N/A'}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
};

export default Doctors;
