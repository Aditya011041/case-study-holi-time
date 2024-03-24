import axios from 'axios';
import React, { useEffect, useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import { useLocation, useNavigate } from 'react-router-dom';
import CustomNavbar from '../../../layouts/navbars/AdminNavBar';
import LeaveTypeManagement from './LeavesTypes';



function Admin() {
    const [leaveApplications, setLeaveApplications] = useState([]);
    const [selectedLeaveApplication, setSelectedLeaveApplication] = useState(null);
    const locate = useLocation();
    // const id = locate.state?.emp_id;
    const navigate = useNavigate();
    const [superuser, setSuperuser] = useState(false);


    useEffect(() => {
        console.log('1')
        const fetchData = async () => {
            try {
                console.log('2')
                const response = await axios.get('http://127.0.0.1:8000/all-leave-application/');
                setLeaveApplications(response.data);
                console.log(response.data);
            } catch (error) {
                console.error('Error:', error.message);
            }
        };
        const superuserValue = sessionStorage.getItem('superuser');
        if (superuserValue){
        setSuperuser(superuserValue === 'true');
        }
        console.log('3')
        fetchData();
        console.log('4')
    }, []);

    const handleLogout = () => {
        sessionStorage.removeItem('isLoggedIn');
        sessionStorage.removeItem('token');
        navigate('/');
    };

    const handleViewDetails = (leaveApplication) => {
        setSelectedLeaveApplication(leaveApplication);
        const modal = new window.bootstrap.Modal(document.getElementById('employeeDetailsModal'));
        modal.show();
    };

    const handleManagerAction = async (action, leaveAppId) => {
        try {
            const res = await axios.patch(`http://127.0.0.1:8000/leaveapplication/${leaveAppId}/`, {
                action: action,
            });
            console.log(res.data.message);

            setLeaveApplications(prevLeaveApplications => {
                const updatedLeaveApplications = prevLeaveApplications.map(leaveApp => {
                    if (leaveApp.id === leaveAppId) {
                        return res.data;
                    }
                    return leaveApp;
                });
                return updatedLeaveApplications;
            });
        } catch (error) {
            console.error('Error updating leave application:', error.response.data);
        }
    };

    return (
        <>
        <div className='container-fluid'>
            <div className='container-fluid'>
               <CustomNavbar/>
            </div>

            <div>
                <div className='p-3' style={{ overflowX: 'auto', marginLeft: '25%', width: "52%" }}>
                    <table className="table align-middle mb-0" style={{ padding: '2px', borderCollapse: 'collapse', width: '100%' }}>
                        <thead className="bg-light" style={{ borderTop: '4px solid #7312b4', padding: '8px' }}>
                            <tr>
                                <th style={{ borderLeft: '4px solid #7312b4', borderRight: '4px solid #7312b4', borderBottom: '4px solid #7312b4', padding: '8px' }}>Name</th>
                                <th style={{ borderRight: '4px solid #7312b4', borderBottom: '4px solid #7312b4', padding: '8px' }}>Start Date</th>
                                <th style={{ borderRight: '4px solid #7312b4', borderBottom: '4px solid #7312b4', padding: '8px' }}>End Date</th>
                                <th style={{ borderRight: '4px solid #7312b4', borderBottom: '4px solid #7312b4', padding: '8px' }}>Leave Type</th>
                                <th style={{ borderRight: '4px solid #7312b4', borderBottom: '4px solid #7312b4', padding: '8px' }}>Action</th>
                                <th style={{ borderRight: '4px solid #7312b4', borderBottom: '4px solid #7312b4', padding: '8px' }}>Status</th>
                                <th style={{ borderRight: '4px solid #7312b4', borderBottom: '4px solid #7312b4', padding: '8px' }}>View Details</th>
                            </tr>
                        </thead>
                        <tbody>
                            {leaveApplications.map((leaveApp) => (
                                <tr key={leaveApp.id}>
                                    <td style={{ borderLeft: '2px solid #7312b4', borderRight: '2px solid #7312b4', borderBottom: '2px solid #7312b4', padding: '8px' }}>{leaveApp.employee_name}</td>
                                    <td style={{ borderRight: '2px solid #7312b4', borderBottom: '2px solid #7312b4', padding: '8px' }}>{leaveApp.start_date}</td>
                                    <td style={{ borderRight: '2px solid #7312b4', borderBottom: '2px solid #7312b4', padding: '8px' }}>{leaveApp.end_date}</td>
                                    <td style={{ borderRight: '2px solid #7312b4', borderBottom: '2px solid #7312b4', padding: '8px' }}>{leaveApp.leave_type_name}</td>
                                    <td style={{ borderRight: '2px solid #7312b4', borderBottom: '2px solid #7312b4', padding: '8px' }}>
                                        <div className="dropdown">
                                            <button className="btn btn-secondary dropdown-toggle" type="button" id={`dropdownMenuButton${leaveApp.id}`} data-bs-toggle="dropdown" aria-haspopup="true" aria-expanded="true" defaultValue>
                                                Actions
                                            </button>
                                            <ul className="dropdown-menu " aria-labelledby={`dropdownMenuButton${leaveApp.id}`}>
                                                <li><button className="dropdown-item" onClick={() => handleManagerAction('approve', leaveApp.id)}>Approve</button></li>
                                                <li><button className="dropdown-item" onClick={() => handleManagerAction('reject', leaveApp.id)}>Reject</button></li>
                                                <li><button className="dropdown-item" onClick={() => handleManagerAction('pending', leaveApp.id)}>Leave Pending</button></li>
                                            </ul>
                                        </div>
                                    </td>
                                    <td style={{ borderRight: '2px solid #7312b4', borderBottom: '2px solid #7312b4', padding: '8px' }}>
                                        {leaveApp.status}
                                    </td>

                                    <td style={{ borderRight: '2px solid #7312b4', borderBottom: '2px solid #7312b4', padding: '8px' }}>
                                        <button className='bg-info' onClick={() => handleViewDetails(leaveApp)}>View Details</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Bootstrap Modal */}
                <div className="modal fade" id="employeeDetailsModal" tabIndex="-1" aria-labelledby="employeeDetailsModalLabel" aria-hidden="true">
                    <div className="modal-dialog">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title" id="employeeDetailsModalLabel">Employee Details</h5>
                                <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                            </div>
                            <div className="modal-body">
                                <p>Name: {selectedLeaveApplication?.employee_name}</p>
                                <p>Email: {selectedLeaveApplication?.employee_email}</p>
                            </div>
                        </div>
                    </div>
                </div>
               < LeaveTypeManagement  superuser={superuser}/>

            </div>
            </div>
        </>
    );
}

export default Admin;
