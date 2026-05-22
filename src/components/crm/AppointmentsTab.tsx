import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { Calendar as CalendarIcon, Clock, User, Video, Loader2 } from 'lucide-react';

export default function AppointmentsTab() {
  const [appointments, setAppointments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/appointments')
      .then(res => res.json())
      .then(data => {
        setAppointments(data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return <div className="flex h-64 items-center justify-center"><Loader2 className="w-8 h-8 text-purple-500 animate-spin" /></div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-xl font-bold text-white mb-1">Upcoming Appointments</h2>
          <p className="text-sm text-white/40">Manage your AI-scheduled demos and meetings.</p>
        </div>
        <button className="px-4 py-2 bg-purple-600 hover:bg-purple-500 rounded-xl text-sm font-semibold transition-colors">
          + Manual Booking
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {appointments.length === 0 ? (
          <div className="col-span-full p-10 bg-white/5 border border-white/10 rounded-3xl text-center text-white/40">
            No appointments scheduled yet.
          </div>
        ) : (
          appointments.map((apt: any) => (
            <div key={apt._id} className="bg-white/5 border border-white/10 rounded-3xl p-6 hover:bg-white/[0.07] transition-all">
              <div className="flex items-center justify-between mb-6">
                <div className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${apt.status === 'Scheduled' ? 'bg-blue-500/20 text-blue-400' : apt.status === 'Completed' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                  {apt.status}
                </div>
                <div className="flex items-center gap-2 text-white/60 text-xs font-semibold">
                  <Video className="w-4 h-4" />
                  {apt.meetingType}
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-purple-500/20 flex items-center justify-center text-purple-400">
                    <User className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="font-bold">{apt.leadId?.name || apt.customerName || 'Unknown Lead'}</div>
                    <div className="text-sm text-white/40">{apt.leadId?.phone || apt.phone || 'No phone'}</div>
                    {apt.leadId?.businessType && <div className="text-[10px] text-white/30 mt-1 uppercase">{apt.leadId.businessType}</div>}
                  </div>
                </div>

                <div className="bg-black/20 rounded-xl p-4 flex flex-col gap-3 border border-white/5">
                  <div className="flex items-center gap-3 text-sm font-medium text-white/80">
                    <CalendarIcon className="w-4 h-4 text-purple-400" />
                    {apt.date}
                  </div>
                  <div className="flex items-center gap-3 text-sm font-medium text-white/80">
                    <Clock className="w-4 h-4 text-purple-400" />
                    {apt.time}
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
