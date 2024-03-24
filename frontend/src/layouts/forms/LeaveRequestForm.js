import React, { useState, useEffect } from 'react';
import axios from 'axios';

const LeaveRequestForm = ({ managerId }) => {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [reason, setReason] = useState('');
  const [leaveTypes, setLeaveTypes] = useState([]);
  const [selectedLeaveType, setSelectedLeaveType] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchLeaveTypes = async () => {
      try {
        const response = await axios.get('http://127.0.0.1:8000/leaveTypeDetail/');
        setLeaveTypes(response.data);
      } catch (error) {
        console.error('Error fetching leave types:', error);
      }
    };

    fetchLeaveTypes();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(`http://127.0.0.1:8000/leaveapplicationlist/manager/${managerId}`, {
        start_date: startDate,
        end_date: endDate,
        reason: reason,
        leave_type: selectedLeaveType // Include selected leave type in the request
      });
      console.log(response.data);
      // Handle successful submission
    } catch (error) {
      setError(error.response.data.error);
    }
  };

  const handleLeaveTypeChange = (e) => {
    setSelectedLeaveType(e.target.value);
  };

  return (
    <div>
      <h2>Leave Request Form</h2>
      {error && <p>{error}</p>}
      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="startDate">Start Date:</label>
          <input type="date" id="startDate" value={startDate} onChange={(e) => setStartDate(e.target.value)} required />
        </div>
        <div>
          <label htmlFor="endDate">End Date:</label>
          <input type="date" id="endDate" value={endDate} onChange={(e) => setEndDate(e.target.value)} required />
        </div>
        <div>
          <label htmlFor="leaveType">Leave Type:</label>
          <select id="leaveType" value={selectedLeaveType} onChange={handleLeaveTypeChange} required>
            <option value="">Select leave type</option>
            {leaveTypes.map(leaveType => (
              <option key={leaveType.id} value={leaveType.id}>{leaveType.name}</option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="reason">Reason:</label>
          <textarea id="reason" value={reason} onChange={(e) => setReason(e.target.value)} required />
        </div>
        <button type="submit">Submit</button>
      </form>
    </div>
  );
};

export default LeaveRequestForm;
