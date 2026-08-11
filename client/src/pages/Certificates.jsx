import React, { useState, useEffect } from 'react';
import API from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import { jsPDF } from 'jspdf';
import { Award, Clock, Heart, ShieldCheck, Download, Calendar } from 'lucide-react';

const Certificates = () => {
  const { user, profile } = useAuth();
  const { showToast } = useNotification();
  const [participations, setParticipations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchVault = async () => {
      try {
        const res = await API.get('/participation/my');
        if (res.data.success) {
          // Keep only verified items with a certificate ID
          const certs = res.data.participations.filter(p => p.certificateId);
          setParticipations(certs);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchVault();
  }, []);

  const downloadCertificate = (part) => {
    try {
      const doc = new jsPDF({
        orientation: 'landscape',
        unit: 'mm',
        format: 'a4'
      });

      // Border outer (Emerald Green)
      doc.setLineWidth(4);
      doc.setDrawColor(4, 120, 87);
      doc.rect(10, 10, 277, 190);

      // Border inner (Gold)
      doc.setLineWidth(1);
      doc.setDrawColor(217, 119, 6);
      doc.rect(14, 14, 269, 182);

      // Header Brand
      doc.setFont('Helvetica', 'bold');
      doc.setFontSize(28);
      doc.setTextColor(4, 120, 87);
      doc.text('NGOConnect', 148, 40, { align: 'center' });

      // Certificate Title
      doc.setFont('Helvetica', 'normal');
      doc.setFontSize(14);
      doc.setTextColor(15, 23, 42);
      doc.text('CERTIFICATE OF VOLUNTEER PARTICIPATION', 148, 52, { align: 'center' });

      doc.setFont('Helvetica', 'italic');
      doc.setFontSize(12);
      doc.text('This certificate is proudly awarded to', 148, 75, { align: 'center' });

      // Volunteer Name
      doc.setFont('Helvetica', 'bold');
      doc.setFontSize(24);
      doc.setTextColor(217, 119, 6);
      doc.text(user.name.toUpperCase(), 148, 92, { align: 'center' });

      // Citation details
      doc.setFont('Helvetica', 'normal');
      doc.setFontSize(12);
      doc.setTextColor(15, 23, 42);
      doc.text(
        `for successfully contributing ${part.hours} volunteer service hours to`,
        148,
        110,
        { align: 'center' }
      );

      doc.setFont('Helvetica', 'bold');
      doc.setFontSize(14);
      doc.text(`"${part.opportunityId?.title || 'Community Service'}"`, 148, 122, { align: 'center' });

      doc.setFont('Helvetica', 'normal');
      doc.setFontSize(12);
      doc.text(`conducted by organization: ${part.ngoId?.name || 'NGO Partner'}`, 148, 134, { align: 'center' });

      // Unique ID & issue Date
      doc.setFont('Helvetica', 'normal');
      doc.setFontSize(9);
      doc.setTextColor(100, 116, 139);
      doc.text(`Certificate ID: ${part.certificateId}`, 148, 155, { align: 'center' });
      doc.text(`Date of Issue: ${new Date(part.activityDate).toLocaleDateString()}`, 148, 162, { align: 'center' });

      // Signatures
      doc.line(40, 175, 100, 175);
      doc.text('NGO Representative', 70, 180, { align: 'center' });

      doc.line(197, 175, 257, 175);
      doc.text('NGOConnect Admin', 227, 180, { align: 'center' });

      // Download trigger
      doc.save(`Certificate-${part.certificateId}.pdf`);
      showToast('PDF Downloaded', 'Certificate downloaded successfully!', 'success');
    } catch (err) {
      console.error(err);
      showToast('Error', 'Certificate PDF compilation failed.', 'error');
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      
      {/* Header */}
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight">Credentials Vault</h1>
        <p className="text-sm text-slate-500 mt-1">Access all your earned certifications and gamified achievement badges.</p>
      </div>

      {/* Achievement Badges grid */}
      <div className="bg-white dark:bg-charcoal p-6 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm space-y-4">
        <h3 className="font-bold text-sm text-slate-400 uppercase tracking-widest">Achieved Badges</h3>

        {profile?.badges && profile.badges.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {profile.badges.map((badge) => (
              <div
                key={badge._id}
                className="p-4 rounded-2xl bg-amber-500/5 dark:bg-amber-500/2 border border-amber-500/10 flex flex-col items-center text-center group hover:scale-105 transition-transform"
              >
                <div className="w-12 h-12 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center mb-3">
                  <Award className="w-6 h-6 fill-current" />
                </div>
                <p className="font-bold text-xs">{badge.name}</p>
                <p className="text-[9px] text-slate-400 mt-1 leading-snug">{badge.description}</p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs text-slate-400 italic">No badges earned yet. Complete activities to unlock achievements!</p>
        )}
      </div>

      {/* PDF Certificates list */}
      <div className="space-y-4">
        <h3 className="font-bold text-sm text-slate-400 uppercase tracking-widest">Certificates of Service</h3>
        
        {loading ? (
          <div className="space-y-4">
            {[1, 2].map(i => (
              <div key={i} className="h-20 shimmer rounded-2xl"></div>
            ))}
          </div>
        ) : participations.length === 0 ? (
          <div className="bg-white dark:bg-charcoal p-10 rounded-2xl border border-slate-150 dark:border-slate-800 text-center text-slate-400 text-xs italic">
            You haven't earned any service certificates yet. Complete and verify hours to issue credentials.
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 gap-4">
            {participations.map((part) => (
              <div
                key={part._id}
                className="bg-white dark:bg-charcoal p-5 rounded-2xl border border-slate-100 dark:border-slate-800/80 shadow-sm flex items-center justify-between gap-4 hover:border-slate-200 transition-colors"
              >
                <div className="space-y-1">
                  <h4 className="font-bold text-sm line-clamp-1">{part.opportunityId?.title}</h4>
                  <p className="text-[10px] text-slate-400 font-semibold">{part.ngoId?.name}</p>
                  <p className="text-[9px] text-slate-400 flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    <span>{new Date(part.activityDate).toLocaleDateString()}</span>
                  </p>
                </div>

                <button
                  onClick={() => downloadCertificate(part)}
                  className="p-2.5 bg-amber-500 hover:bg-amber-600 text-white rounded-xl shadow-md transition-all flex items-center justify-center flex-shrink-0"
                  title="Download Certificate"
                >
                  <Download className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
};

export default Certificates;
