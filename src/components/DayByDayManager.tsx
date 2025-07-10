import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { localDataService } from '../services/localDataService';
import { Lead, Meeting, Call } from '../types';
import { format, isToday, isPast, parseISO, startOfDay, endOfDay } from 'date-fns';
import { es } from 'date-fns/locale';
import { Calendar, Phone, Users, Clock, Info, CheckCircle, XCircle } from 'lucide-react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

interface DailyActivity {
  type: 'lead' | 'meeting' | 'call';
  id: string;
  title: string;
  date: Date; // Changed from 'time' to 'date' for consistency
  status?: string;
  description: string;
  link?: string;
}

const DayByDayManager: React.FC = () => {
  const { user } = useAuth();
  const [dailyActivities, setDailyActivities] = useState<DailyActivity[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(new Date());

  useEffect(() => {
    if (user) {
      loadDailyActivities(user.id, selectedDate);
    }
  }, [user, selectedDate]);

  const loadDailyActivities = async (brokerId: string, date: Date) => {
    setIsLoading(true);
    try {
      const leads = await localDataService.getLeads();
      const meetings = await localDataService.getMeetings();
      const calls = await localDataService.getCalls();

      const activities: DailyActivity[] = [];
      const formattedSelectedDate = format(date, 'yyyy-MM-dd');

      // Process Leads with next actions
      leads.filter(lead => lead.assignedTo === brokerId && lead.nextActionDate)
        .forEach(lead => {
          const nextActionDate = lead.nextActionDate instanceof Date ? lead.nextActionDate : parseISO(lead.nextActionDate.toString());
          if (format(nextActionDate, 'yyyy-MM-dd') === formattedSelectedDate) {
            activities.push({
              type: 'lead',
              id: lead.id,
              title: `Seguimiento: ${lead.name}`,
              date: nextActionDate,
              status: lead.status,
              description: `Próxima acción: ${lead.nextAction || 'N/A'} (Prioridad: ${lead.priority})`,
              link: `/leads/${lead.id}` // Assuming a route for individual leads
            });
          }
        });

      // Process Meetings
      meetings.filter(meeting => meeting.attendees.includes(brokerId) || meeting.attendees.some(attendee => attendee.includes(user?.name || '')))
        .forEach(meeting => {
          const meetingDate = meeting.date instanceof Date ? meeting.date : parseISO(meeting.date.toString());
          if (format(meetingDate, 'yyyy-MM-dd') === formattedSelectedDate) {
            activities.push({
              type: 'meeting',
              id: meeting.id,
              title: `Reunión: ${meeting.title}`,
              date: meetingDate,
              status: meeting.status,
              description: `Tipo: ${meeting.type}, con: ${meeting.attendees.join(', ')}`,
              link: meeting.zoomLink || ''
            });
          }
        });

      // Process Calls
      calls.filter(call => call.assignedTo === brokerId && call.scheduledTime)
        .forEach(call => {
          const callTime = call.scheduledTime instanceof Date ? call.scheduledTime : parseISO(call.scheduledTime.toString());
          if (format(callTime, 'yyyy-MM-dd') === formattedSelectedDate) {
            activities.push({
              type: 'call',
              id: call.id,
              title: `Llamada: ${call.leadInfo?.name || 'Desconocido'}`,
              date: callTime,
              status: call.status,
              description: `Tipo: ${call.type}, Outcome: ${call.outcome || 'N/A'}`,
              link: '' // No direct link for calls in this mock setup
            });
          }
        });

      // Sort activities by date
      activities.sort((a, b) => a.date.getTime() - b.date.getTime());
      setDailyActivities(activities);
    } catch (error) {
      console.error('Error loading daily activities:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getActivityIcon = (type: DailyActivity['type']) => {
    switch (type) {
      case 'lead': return <Users size={16} />;
      case 'meeting': return <Calendar size={16} />;
      case 'call': return <Phone size={16} />;
      default: return <Info size={16} />;
    }
  };

  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'scheduled':
      case 'new':
      case 'contacted':
      case 'qualified':
      case 'presentation':
        return 'text-blue-600';
      case 'completed':
      case 'sold':
      case 'booked':
        return 'text-green-600';
      case 'cancelled':
      case 'failed':
      case 'lost':
      case 'no-show':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  const getStatusIcon = (status?: string) => {
    switch (status) {
      case 'completed':
      case 'sold':
      case 'booked':
        return <CheckCircle className="w-4 h-4" />;
      case 'cancelled':
      case 'failed':
      case 'lost':
      case 'no-show':
        return <XCircle className="w-4 h-4" />;
      default:
        return <Info className="w-4 h-4" />;
    }
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Plan del Día</h2>

      <div className="mb-6 flex items-center space-x-4">
        <label htmlFor="date-picker" className="block text-sm font-medium text-gray-700">Seleccionar Fecha:</label>
        <DatePicker
          id="date-picker"
          selected={selectedDate}
          onChange={(date: Date) => setSelectedDate(date)}
          dateFormat="dd/MM/yyyy"
          locale={es}
          className="p-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent w-40"
        />
      </div>

      {isLoading ? (
        <div className="text-center py-8">
          <div className="w-8 h-8 border-4 border-teal-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600">Cargando actividades...</p>
        </div>
      ) : (
        <div>
          {dailyActivities.length === 0 ? (
            <div className="bg-white p-4 rounded-lg shadow-md text-center">
              <p className="text-gray-600 text-lg">🎉 ¡No hay actividades programadas para esta fecha! 🎉</p>
              <p className="text-gray-500 text-sm mt-2">¡Disfruta de un día tranquilo o busca actividades en otras fechas!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {dailyActivities.map((activity) => (
                <div key={activity.id} className="flex items-start space-x-4 p-4 border border-gray-200 rounded-lg shadow-sm">
                  <div className="flex-shrink-0 mt-1">
                    {getActivityIcon(activity.type)}
                  </div>
                  <div className="flex-grow">
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="text-lg font-semibold text-gray-900">{activity.title}</h3>
                      <span className="text-sm text-gray-500 flex items-center">
                        <Clock className="w-4 h-4 mr-1" />
                        {format(activity.date, 'dd/MM/yyyy HH:mm', { locale: es })}
                      </span>
                    </div>
                    <p className="text-gray-700 mb-2">{activity.description}</p>
                    <div className="flex items-center space-x-2 text-sm">
                      <span className={`font-medium ${getStatusColor(activity.status)} flex items-center`}>
                        {getStatusIcon(activity.status)}
                        <span className="ml-1 capitalize">{activity.status || 'N/A'}</span>
                      </span>
                      {activity.link && (
                        <a href={activity.link} target="_blank" rel="noopener noreferrer" className="text-teal-600 hover:underline">
                          Ver Detalles
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default DayByDayManager;