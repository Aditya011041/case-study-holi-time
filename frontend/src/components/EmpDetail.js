import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useLocation, useNavigate } from 'react-router-dom';
import { Navbar, Nav } from 'react-bootstrap';
import { ListGroup } from 'react-bootstrap';
import './sidebar.css';
import './manager.css';
import backImg from '../components/pic3.jpg'
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import mygif from '../components/sticker.gif';

function EmpDetail() {
  const location = useLocation();
  const emp_id = location.state?.emp_id;
  const [emp, setEmp] = useState(null);
  const [empApplication, setEmpApplication] = useState([]);
  const [toastShown, setToastShown] = useState(false);
  const navigate = useNavigate();
  const [leaveCounts, setLeaveCounts] = useState([]);

  useEffect(() => {
    if (!sessionStorage.getItem('token')) {
      navigate('/');
    }
  })

  useEffect(() => {
    const fetchEmp = async () => {
      try {
        const response = await axios.get(`http://127.0.0.1:8000/emp/${emp_id}`);
        setEmp(response.data);

      } catch (error) {
        console.error('Error fetching employee:', error);
      }

    };
    const fetchEmployeesApplications = async () => {
      try {
        const response = await axios.get(`http://127.0.0.1:8000/emp-leave-details/${emp_id}`);
        setEmpApplication(response.data);
      } catch (error) {
        console.error('Error fetching employee leave applications:', error);
      }
    };

    fetchEmp();
    fetchEmployeesApplications();
  }, [emp_id]);

  useEffect(() => {
    const fetchLeaveCounts = async () => {
      try {
        const response = await axios.get(`http://127.0.0.1:8000/leave-counts/${emp_id}/`);
        setLeaveCounts(response.data);
        console.log(response.data);
      } catch (error) {
        console.error('Error fetching leave counts:', error);
      }
    };
    fetchLeaveCounts();
  }, [emp_id])

  const renderTotalLeaveCounts = () => {
    return (
      <div className="card" style={{ width: '18rem', marginLeft: '80%' }}>
        <div className="card-body">
          <h5 className="card-title">Leave Type: {leaveCounts.leave_types.name}</h5>
          <p className="card-text">Total Available: {leaveCounts.total_available}</p>
          <p className="card-text">Total Used: {leaveCounts.total_used}</p>
        </div>
      </div>
    );
  };

  // Render leave summaries if available
  const renderLeaveSummaries = () => {
    return leaveCounts.leave_summaries.map(leaveSummary => (
      <div key={leaveSummary.id} className="card" style={{ width: '18rem', marginLeft: '80%' }}>
        <div className="card-body">
          <h5 className="card-title">Leave Type: {leaveSummary.leave_type.name}</h5>
          <p className="card-text">Total Available: {leaveSummary.total_available}</p>
          <p className="card-text">Total Used: {leaveSummary.total_used}</p>
        </div>
      </div>
    ));
  };


  useEffect(() => {
    const isLoggedIn = sessionStorage.getItem('isLoggedIn');
    if (emp && !toastShown && isLoggedIn) {
      toast.success('Logged in successfully!', {
        position: 'bottom-center',
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
      });
      setToastShown(true);
    }
  }, [emp, toastShown]);
  if (toastShown) {
    sessionStorage.removeItem('isLoggedIn');
  }

  const leaveApply = () => {
    navigate('/leave', { state: { employeeEmail: emp.employee.email } });
  };

  const [selectedMenuItem, setSelectedMenuItem] = useState('dashboard');

  const handleMenuClick = (menuItem) => {
    setSelectedMenuItem(menuItem);
  };

  const handleAction = async (appId) => {
    try {
      const res = await axios.delete(`http://127.0.0.1:8000/cancel-leave-application/employee/${emp_id}/${appId}/`);
      alert(res.data.message);
      window.location.reload();
    } catch (error) {
      console.error('Error updating leave application:');
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem('isLoggedIn');
    sessionStorage.removeItem('token');
    navigate('/');
  };
  console.log('logged');
  return (

    <div className='page' style={{ backgroundImage: `url(${backImg})`, backgroundPosition: 'center', backgroundSize: 'cover' }} >
      <div className='container-fluid'>

        <Navbar bg="dark" variant="dark" style={{ borderRadius: '10px', boxShadow: '0 4px 8px rgba(0,0,0,0.6)' }}>
          <Navbar.Brand href="https://www.beehyv.com/">
            <img src="https://www.beehyv.com/wp-content/uploads/2020/10/logo.svg" alt="Logo" className="img-fluid ms-1" style={{ height: '50px' }} />

          </Navbar.Brand>
          <Nav className="ml-auto">
            <Nav.Link href="/detail">Home</Nav.Link>
          </Nav>

          <Navbar.Brand style={{ marginLeft: '280px' }} >
            <h1>Employee Details</h1>
          </Navbar.Brand>
          <Navbar.Brand className='button' style={{ marginLeft: '25rem' }} >
            <button className='logout btn  btn-lg btn-floating' onClick={handleLogout}><span>Log out</span></button>
          </Navbar.Brand>
        </Navbar>
        <div className="container-fluid">

          {/* sidebar */}

          <nav id="sidebarMenu" className=" sidebar ">
            <div className="position-sticky">
              <div className="list-group list-group-flush ">
                <a

                  className={`list-group-item list-group-item-action ripple ${selectedMenuItem === 'dashboard' ? 'active' : ''
                    }`}
                  onClick={() => handleMenuClick('dashboard')}
                >
                  <i className="fas fa-tachometer-alt fa-fw "></i><span className='text'>Main dashboard</span>
                </a>
                <a className={`list-group-item list-group-item-action ripple ${selectedMenuItem === 'project' ? 'active' : ''
                  }`}
                  onClick={() => handleMenuClick('project')}  >
                  <i className="fas fa-chart-area fa-fw"></i><span className='text'>Project Details</span></a>

                <a className={`list-group-item list-group-item-action ripple ${selectedMenuItem === 'manager' ? 'active' : ''
                  }`}
                  onClick={() => handleMenuClick('manager')}  ><i className="fas fa-lock fa-fw "></i><span className='text'>Manager Details</span></a
                >
                <a className={`list-group-item list-group-item-action ripple ${selectedMenuItem === 'leaves' ? 'active' : ''
                  }`}
                  onClick={() => handleMenuClick('leaves')}  ><i className="fas fa-chart-line fa-fw "></i><span className='text'>Leaves Section</span></a>

              </div>
            </div>
          </nav>
          <main className="main-content">
            {emp && (
              <>

                {selectedMenuItem === 'dashboard' && (
                  <>
                    <section className="vh-100 ">
                      <div className="container py-4 h-100">
                        <div className="row d-flex justify-content-center align-items-center h-100">
                          <div className="col-md-12 col-xl-4">
                            <div className="card gradient-custom3" style={{ borderRadius: '15px', marginBottom: '60px', boxShadow: ' 0 5px 5px 0 rgba(0, 0, 0, 0.5), 0 2px 10px 0 rgba(0, 0, 0, 1.5)' }}>
                              <div className="card-body  text-center">
                                <div className="mt-2 mb-5">
                                  <img src="https://mdbcdn.b-cdn.net/img/Photos/new-templates/bootstrap-chat/ava6-bg.webp" alt='Image' className="rounded-circle img-fluid" style={{ width: '100px' }} />
                                </div>
                                <h4 className="mb-2 gradient-custom4 fw-bold fs-3">{emp.employee.name}</h4>
                                <p className="text-muted fw-bold mb-4">@{emp.employee.position} <span className="mx-2">|</span> <a className='text-primary' href="">{emp.employee.department}</a></p>

                                <button type="button" className="btn btn-primary btn-rounded btn-lg">
                                  Hey! - Its me
                                </button>
                                <div className="d-flex justify-content-between text-center mt-5 mb-2">
                                  <div>
                                    <p className="mb-2 h5 text-success">{emp.employee.payment}</p>
                                    <p className="text-muted mb-0 fs-4 fw-bold">Salary</p>
                                  </div>
                                  <div className="px-4">
                                    <p className="mb-2 text-success h5">02/01/2024</p>
                                    <p className="text-muted mb-0 fs-4 fw-bold">Joined</p>
                                  </div>
                                  <div>
                                    <p className="mb-2 text-success h5">Male</p>
                                    <p className="text-muted mb-0 fs-4 fw-bold">Gender</p>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </section>
                    <img src='https://webstockreview.net/images/clipart-clouds-thought-bubble-11.gif'
                      style={{ height: '150px', position: 'absolute', top: '10%', right: '11%' }}
                    />
                    <p className='fw-bold' style={{ color: 'blue', fontSize: '18px', textAlign: 'center', position: 'absolute', top: '17%', zIndex: '1', right: '14%', fontSize: '25px' }}>{emp.employee.name}</p>
                    <img src='https://i.pinimg.com/originals/52/15/2b/52152b74c401f2f4fe52f5d0940b0d79.gif' style={{ height: '150px', position: 'absolute', top: '20%', right: '1%' }} />
                  </>
                )}
                {selectedMenuItem === 'project' && (
                  <>
                    <h2 className='mt-3 text-primary fs-1 fw-bold' style={{ marginLeft: '18rem', display: 'flex', justifyContent: 'flex-start' }}>Project Details</h2>
                    <ListGroup>
                      {emp.projects.map((project) => (
                        <div key={project.id} >
                          <div className="card" style={{ width: '38rem', marginLeft: '20%', marginTop: '50px' }}>
                            <div className="card-body bg-info" >
                              <ListGroup.Item className='fs-5' style={{ display: 'flex', justifyContent: 'flex-start' }}>
                                <p><span className='fs-4 fw-bold text-danger'>Project Name</span>  -<span className='fw-bold text-success'> {project.title}</span></p>
                              </ListGroup.Item>
                              <ListGroup.Item style={{ display: 'flex', justifyContent: 'flex-start' }}>
                                <p><span className='text-primary fw-bold'>Project Desc</span> - <span className='text-secondary fw-bold'> {project.description}</span></p>
                              </ListGroup.Item>
                              <ListGroup.Item>
                                <p className='fw-bold text-danger' style={{ display: 'flex', justifyContent: 'start' }}>Managers:-</p>
                                <ListGroup>
                                  {project.managers.map((manager, index) => (
                                    <div key={manager.id}>
                                      <ListGroup.Item
                                        style={{ display: 'flex', justifyContent: 'start' }}
                                        className='text-success fw-bold'
                                      >
                                        <span className='px-2 text-dark'>{index + 1}.</span> {manager.name}
                                      </ListGroup.Item>
                                    </div>
                                  ))}
                                </ListGroup>

                              </ListGroup.Item>
                            </div>
                          </div>
                        </div>
                      ))}
                    </ListGroup>
                  </>
                )}

                {selectedMenuItem === 'manager' && (
                  <div className="container mt-5 d-flex justify-content-center " >
                    <h2 className='text-primary fs-1 fw-bold' >Manager Details</h2>

                    <div className="cardee p-4" style={{ marginTop: '7rem', marginLeft: '0rem' }}>
                      <ul>
                        {emp.managers.map((i, index) => (
                          <div key={i.id}>
                            <ListGroup.Item className='manager-detail' style={{ display: 'flex', justifyContent: 'flex-start', gap: '10%' }}>
                              <span>{index + 1}. </span>  <p>Project Manager Name - {i.name}</p>
                            </ListGroup.Item>
                          </div>
                        ))}
                      </ul>

                    </div>
                  </div>
                )}


                {selectedMenuItem === 'leaves' && (
                  <>
                    <button className='m-2 p-2' style={{ position: 'absolute', top: "100px", right: '10px', background: 'linear-gradient(to right, #c64aad, #9ce5f2)', borderRadius: '10px' }} onClick={leaveApply}>Apply For Leave</button>
                    <div className='mt-4'>
                      <h2 className='text-warning fs-1 fw-bold'>Leave Applications</h2>
                      <div className='p-3' style={{ overflowX: 'auto', marginLeft: '25%', width: "50%" }}>
                        <table className="table align-middle mb-0" style={{ padding: '2px', borderCollapse: 'collapse', width: '100%' }}>
                          <thead className="bg-light" style={{ borderTop: '4px solid #7312b4', padding: '8px' }}>
                            <tr>
                              <th style={{ borderLeft: '4px solid #7312b4', borderRight: '4px solid #7312b4', borderBottom: '4px solid #7312b4', padding: '8px' }}>Employee Name</th>
                              <th style={{ borderRight: '4px solid #7312b4', borderBottom: '4px solid #7312b4', padding: '8px' }}>Leave Type</th>
                              <th style={{ borderRight: '4px solid #7312b4', borderBottom: '4px solid #7312b4', padding: '8px' }}>Start Date</th>
                              <th style={{ borderRight: '4px solid #7312b4', borderBottom: '4px solid #7312b4', padding: '8px' }}>End Date</th>
                              <th style={{ borderRight: '4px solid #7312b4', borderBottom: '4px solid #7312b4', padding: '8px' }}>Status</th>
                              <th style={{ borderRight: '4px solid #7312b4', borderBottom: '4px solid #7312b4', padding: '8px' }}>Actions</th>
                            </tr>
                          </thead>
                          <tbody>
                            {empApplication.map((app) => (
                              <tr key={app.id}>
                                <td style={{ borderLeft: '2px solid #7312b4', borderRight: '2px solid #7312b4', borderBottom: '2px solid #7312b4', padding: '8px' }}>{app.employee_name}</td>
                                <td style={{ borderRight: '2px solid #7312b4', borderBottom: '2px solid #7312b4', padding: '8px' }}>{app.leave_type_name}</td>
                                <td style={{ borderRight: '2px solid #7312b4', borderBottom: '2px solid #7312b4', padding: '8px' }}>{app.start_date}</td>
                                <td style={{ borderRight: '2px solid #7312b4', borderBottom: '2px solid #7312b4', padding: '8px' }}>{app.end_date}</td>
                                <td style={{ borderRight: '2px solid #7312b4', borderBottom: '2px solid #7312b4', padding: '8px' }}>{app.status}</td>
                                <td className='bg-info' style={{ borderRight: '2px solid #7312b4', borderBottom: '2px solid #7312b4', padding: '8px' }}>
                                  <button className='bg-info fw-bold' style={{ border: 'none', color: 'red' }} onClick={() => handleAction(app.id)}>Cancel</button>
                                </td>
                                {/* Add more columns as needed */}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                    <div className="leave-counts">
                      <h2 className='text-warning fs-1 fw-bold' style={{ marginLeft: '80%' }}>Leave Counts</h2>
                      <div>
                        {Object.keys(leaveCounts.leave_types).map(leaveTypeId => (
                          <div key={leaveTypeId} className="card p-3" style={{ width: '18rem', marginLeft: '80%' }}>
                            <div className="card-body">
                              <h5 className="card-title">Leave Type: {leaveCounts.leave_types[leaveTypeId].name}</h5>
                              <p className="card-text">Total Available: {leaveCounts.leave_types[leaveTypeId].total_available}</p>
                              <p className="card-text">Total Used: {leaveCounts.leave_types[leaveTypeId].total_used}</p>
                            </div>
                          </div>
                        ))}
                      </div>


                    </div>
                  </>
                )}


              </>
            )}
          </main>

        </div>
        <ToastContainer />
      </div>
    </div>
  );
}

export default EmpDetail;
