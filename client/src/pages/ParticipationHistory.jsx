import React, { useState, useEffect } from 'react';
import API from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import { jsPDF } from 'jspdf';
import { Clipboard, Award, Clock, Heart, ShieldCheck, AlertCircle } from 'lucide-react';

const ParticipationHistory = () => {
  const { user } = useAuth();
  const { showToast } = useNotification();
  const [participations, setParticipations] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchParticipation = async () => {
    setLoading(true);
    try {
      const res = await API.get('/participation/my');
      if (res.data.success) {
        setParticipations(res.data.participations);
      }
    } catch (err) {
      console.error(err);
      showToast('Error', 'Failed to retrieve participation logs.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchParticipation();
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
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      
      {/* Header */}
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight">Participation Vault</h1>
        <p className="text-sm text-slate-500 mt-1">Review verified volunteering records and download certificates of appreciation.</p>
      </div>

      {loading ? (
        <div className="space-y-4">
          {[1, 2].map(i => (
            <div key={i} className="h-32 rounded-2xl shimmer border border-slate-100 dark:border-slate-850"></div>
          ))}
        </div>
      ) : participations.length === 0 ? (
        <div className="bg-white dark:bg-charcoal p-10 rounded-2xl border border-slate-150 dark:border-slate-800 text-center text-slate-400">
          No verified participations found in your profile history.
        </div>
      ) : (
        <div className="space-y-4">
          {participations.map((part) => (
            <div key={part._id} className="bg-white dark:bg-charcoal p-5 rounded-2xl border border-slate-100 dark:border-slate-800/80 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-6 hover:shadow-md transition-shadow">
              
              {/* Left Details */}
              <div className="space-y-2 flex-1 text-center sm:text-left">
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md">
                    {part.opportunityId?.category || 'Service'}
                  </span>
                  <span className="text-[10px] text-emerald-600 bg-emerald-50 dark:bg-emerald-950/20 px-2.5 py-0.5 rounded-md font-bold flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5 fill-current" /> Verified Hours
                  </span>
                </div>

                <h3 className="font-bold text-base text-slate-900 dark:text-white leading-tight">
                  {part.opportunityId?.title}
                </h3>
                
                <p className="text-xs text-slate-400 font-semibold">by {part.ngoId?.name}</p>

                {/* NGO feedback notes */}
                {part.feedback && (
                  <p className="text-xs text-slate-500 italic p-3 bg-slate-50 dark:bg-charcoal-dark/50 rounded-xl mt-2">
                    " {part.feedback} "
                  </p>
                )}
              </div>

              {/* Right hours and Certificate triggers */}
              <div className="flex flex-row sm:flex-col items-center sm:items-end justify-between sm:justify-center border-t sm:border-t-0 sm:border-l border-slate-100 dark:border-slate-800/80 pt-4 sm:pt-0 sm:pl-6 w-full sm:w-44 gap-4">
                
                {/* Stats */}
                <div className="flex gap-4 sm:gap-2 text-right">
                  <div className="text-center sm:text-right">
                    <span className="text-slate-400 text-[10px] font-bold uppercase tracking-widest block">Hours</span>
                    <span className="text-sm font-extrabold flex items-center justify-center sm:justify-end gap-1 mt-0.5">
                      <Clock className="w-3.5 h-3.5 text-primary" /> {part.hours}
                    </span>
                  </div>
                  <div className="text-center sm:text-right pl-4 sm:pl-0 border-l sm:border-l-0 border-slate-100">
                    <span className="text-slate-400 text-[10px] font-bold uppercase tracking-widest block">Impacted</span>
                    <span className="text-sm font-extrabold flex items-center justify-center sm:justify-end gap-1 mt-0.5">
                      <Heart className="w-3.5 h-3.5 text-rose-500 fill-current" /> {part.peopleImpacted}
                    </span>
                  </div>
                </div>

                {/* Certificate button */}
                {part.certificateId ? (
                  <button
                    onClick={() => downloadCertificate(part)}
                    className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold rounded-lg flex items-center gap-1 shadow-sm transition-all text-center"
                  >
                    <Award className="w-4 h-4" />
                    <span>Download PDF</span>
                  </button>
                ) : (
                  <span className="text-[10px] text-slate-400 italic">Certificate Pending</span>
                )}
              </div>

            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ParticipationHistory;
