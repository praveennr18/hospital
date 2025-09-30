import AdminLayout from './AdminLayout';
export default function AdminDashboard({ setAdminLoggedIn }) {
  return (
    <AdminLayout active="dashboard" setAdminLoggedIn={setAdminLoggedIn}>
      <header className="admin-header">
        <h2>Admin Dashboard</h2>
        <div className="admin-header-desc">Overview of hospital operations and metrics</div>
      </header>
      <div className="admin-cards-row">
        <div className="admin-card">
          <div className="admin-card-title">Total Patients</div>
          <div className="admin-card-value">156</div>
          <div className="admin-card-desc">Registered patients</div>
        </div>
        <div className="admin-card">
          <div className="admin-card-title">Today's Appointments</div>
          <div className="admin-card-value">0</div>
          <div className="admin-card-desc">Scheduled today</div>
        </div>
        <div className="admin-card">
          <div className="admin-card-title">Total Doctors</div>
          <div className="admin-card-value">12</div>
          <div className="admin-card-desc">Medical staff</div>
        </div>
      </div>
      <div className="admin-schedule">
        <div className="admin-schedule-title">Today's Schedule</div>
        <div className="admin-schedule-desc">Appointments scheduled for today</div>
        <div className="admin-schedule-list">
          <div className="admin-schedule-item blue">
            <div className="admin-schedule-time">09:00 AM</div>
            <div className="admin-schedule-patient">John Smith</div>
            <div className="admin-schedule-type">Consultation</div>
            <div className="admin-schedule-doctor">Dr. Sarah Wilson</div>
            <div className="admin-schedule-status scheduled">Scheduled</div>
          </div>
          <div className="admin-schedule-item green">
            <div className="admin-schedule-time">10:30 AM</div>
            <div className="admin-schedule-patient">Mary Johnson</div>
            <div className="admin-schedule-type">Follow-up</div>
            <div className="admin-schedule-doctor">Dr. Michael Johnson</div>
            <div className="admin-schedule-status scheduled">Scheduled</div>
          </div>
          <div className="admin-schedule-item purple">
            <div className="admin-schedule-time">02:00 PM</div>
            <div className="admin-schedule-patient">David Wilson</div>
            <div className="admin-schedule-type">Check-up</div>
            <div className="admin-schedule-doctor">Dr. Emily Brown</div>
            <div className="admin-schedule-status scheduled">Scheduled</div>
          </div>
          <div className="admin-schedule-item orange">
            <div className="admin-schedule-time">03:30 PM</div>
            <div className="admin-schedule-patient">Sarah Davis</div>
            <div className="admin-schedule-type">Procedure</div>
            <div className="admin-schedule-doctor">Dr. David Miller</div>
            <div className="admin-schedule-status scheduled">Scheduled</div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
