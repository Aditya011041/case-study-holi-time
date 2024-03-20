import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import LeaveApplicationList from './LeaveApplicationList';
import { Navbar, Nav, ListGroupItem } from 'react-bootstrap';
import './sidebar.css';
import { ListGroup } from 'react-bootstrap';
import './sidebar.css';
import './manager.css';
import Carousel from 'react-bootstrap/Carousel';
import sound from '../components/message.mp3';
import filterIcon from '../components/filter.jpg'


export default function ManagerDetail() {
  const [managers, setManagers] = useState(null);
  const [notifications, setNotifications] = useState(null);
  const [bellClicked, setBellClicked] = useState(false);
  const [readStatus, setReadStatus] = useState(false);
  const [leaveApplication, setLeaveApplication] = useState(null);
  const location = useLocation();
  const manager_Id = location.state?.manager_Id;
  const [selectedMenuItem, setSelectedMenuItem] = useState('dashboard');
  const [toastShown, setToastShown] = useState(false);
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [showSearchBar, setShowSearchBar] = useState(false);

  useEffect(() => {
    const isLoggedIn = sessionStorage.getItem('token');
    if (!isLoggedIn) {
      window.location.href = '/';
    }
  }, []);

  useEffect(() => {

    const fetchManager = async () => {
      const response = await axios.get(`http://127.0.0.1:8000/manager/${manager_Id}`);
      setManagers(response.data);
    };

    const getNotifications = async () => {
      const response = await axios.get(`http://127.0.0.1:8000/manager-notifications/${manager_Id}`);
      setNotifications(response.data);
    };

    const getLeaveApplications = async () => {
      const response = await axios.get(`http://127.0.0.1:8000/leaveapplicationlist/manager/${manager_Id}`);
      setLeaveApplication(response.data);
    };

    getNotifications();
    fetchManager();
    getLeaveApplications();
  }, [manager_Id]);

  useEffect(() => {
    const isLoggedIn = sessionStorage.getItem('isLoggedIn');
    if (managers && !toastShown && isLoggedIn) {
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
  }, [managers, toastShown]);

  if (toastShown) {
    sessionStorage.removeItem('isLoggedIn');
  }

  const handleBellClick = async () => {
    const response = await axios.get(`http://127.0.0.1:8000/manager-read-all/${manager_Id}`);
    setReadStatus(response.data.notification_read_status);
    setBellClicked(!bellClicked);
    if (notifications && notifications.length > 0) {
      const audio = new Audio(sound);
      audio.play();
    }
  };

  const handleCloseNotify = async (managerId) => {
    try {
      await axios.delete(`http://127.0.0.1:8000/manager-read-all/${managerId}`);
    } catch (error) {
      console.error('Error deleting notifications:', error);
    }
    if (!readStatus) {
      setBellClicked(false);
    }
    if (notifications.length !== 0) {
      window.location.reload();
    }
  };

  const handleMenuClick = (menuItem) => {
    setSelectedMenuItem(menuItem);
  };

  const handleLogout = () => {
    sessionStorage.removeItem('isLoggedIn');
    sessionStorage.removeItem('token');
    navigate('/')
  };
  const filteredEmployees = managers ? managers.map(manager => ({
    ...manager,
    employees: searchTerm ? manager.employees.filter(employee =>
      employee.name.toLowerCase().includes(searchTerm.toLowerCase())
    ) : manager.employees
  })) : [];



  return (
    < >
      <div className='container-fluid'>
        <Navbar bg="dark" variant="dark" style={{ borderRadius: '10px', boxShadow: '0 4px 8px rgba(0,0,0,0.6)' }}>
          <Navbar.Brand href="https://www.beehyv.com/">
            <img src="https://www.beehyv.com/wp-content/uploads/2020/10/logo.svg" alt="Logo" className="img-fluid ms-1" style={{ height: '50px' }} />
          </Navbar.Brand>
          <Nav className="ml-auto">
            <Nav.Link href="/manager-dashboard">Home</Nav.Link>
          </Nav>
          <Navbar.Brand style={{ marginLeft: '280px' }}>
            <h1>Manager Details</h1>
          </Navbar.Brand>
          <Navbar.Brand style={{ marginLeft: '25rem' }} >
            <button className='btn  btn-lg btn-floating logout' onClick={handleLogout}>
              <span>Log out</span>
            </button>
          </Navbar.Brand>
        </Navbar>

        <div className='row-24'>
          <div className='col-3'>
            <nav id="sidebarMenu" className="sidebar">
              <div className="position-sticky">
                <div className="list-group list-group-flush">
                  <a className={`list-group-item list-group-item-action ripple ${selectedMenuItem === 'dashboard' ? 'active' : ''}`} onClick={() => handleMenuClick('dashboard')}>
                    <i className="fas fa-tachometer-alt fa-fw "></i><span className='text'>Main dashboard</span>
                  </a>
                  <a className={`list-group-item list-group-item-action ripple ${selectedMenuItem === 'employee' ? 'active' : ''}`} onClick={() => handleMenuClick('employee')}>
                    <i className="fas fa-chart-area fa-fw"></i><span className='text'>Employee Details</span>
                  </a>
                  <a className={`list-group-item list-group-item-action ripple ${selectedMenuItem === 'project' ? 'active' : ''}`} onClick={() => handleMenuClick('project')}>
                    <i className="fas fa-lock fa-fw "></i><span className='text'>Project Details</span>
                  </a>
                  <a className={`list-group-item list-group-item-action ripple ${selectedMenuItem === 'leaves' ? 'active' : ''}`} onClick={() => handleMenuClick('leaves')}>
                    <i className="fas fa-chart-line fa-fw "></i><span className='text'>Leaves Section</span>
                  </a>
                </div>
              </div>
            </nav>
          </div>

          <div className=''>
            {selectedMenuItem === 'dashboard' && (
              managers && managers.map((i) => (
                <>
                  <section key={i.manager.id} className="vh-100">
                    <div className="container py-4 h-100">
                      <div className="row d-flex justify-content-center align-items-center h-100">
                        <div className="col-md-12 col-xl-4">
                          <div className="card gradient-custom3" style={{ borderRadius: '15px', marginBottom: '100px', boxShadow: ' 0 5px 5px 0 rgba(0, 0, 0, 0.5), 0 2px 10px 0 rgba(0, 0, 0, 1.5)' }}>
                            <div className="card-body text-center">
                              <div className="mt-3 mb-4 text-center">
                                <img src="https://mdbcdn.b-cdn.net/img/Photos/new-templates/bootstrap-chat/ava6-bg.webp" className="rounded-circle img-fluid" style={{ width: '100px' }} alt="Profile" />
                              </div>
                              <h4 className="mb-2 gradient-custom4 fw-bold fs-3">{i.manager.name}</h4>
                              <p className="text-muted fw-bold mb-4">@Manager <span className="mx-2">|</span> <a href="">Project Lead</a></p>
                              <button type="button" className="btn btn-primary btn-rounded btn-lg">
                                Welcome ! --- {i.manager.name}
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </section>
                  
                  <img src='https://webstockreview.net/images/clipart-clouds-thought-bubble-11.gif'
                    style={{ height: '150px', position: 'absolute', top: '10%', right: '9%', width: '180px' }} alt='cloud'
                  />
                  <p className='fw-bold' style={{ color: 'blue', fontSize: '27px', textAlign: 'center', position: 'absolute', top: '17%', zIndex: '1', right: '13%'}}>{i.manager.name}</p>
                  <img src='https://i.pinimg.com/originals/52/15/2b/52152b74c401f2f4fe52f5d0940b0d79.gif' style={{ height: '150px', position: 'absolute', top: '20%', right: '1%' }} alt='sticker'/>
                </>
              ))
            )}

            {selectedMenuItem === 'employee' && (
              <div className="py-5 h-10" style={{ marginLeft: '20rem' }}>
                <div className="row d-flex align-items-center h-10">
                  {/* Button to toggle search bar */}
                  <div className="" onClick={() => setShowSearchBar(!showSearchBar)}>
                    <img src={filterIcon} alt="Filter" style={{ width: '20px', height: '20px', position: 'absolute', top: '13%', right: '2%' }} />
                  </div>
                  {showSearchBar && (
                    <input
                      type="text"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      style={{ width: '7rem', position: 'absolute', right: '5%', top: '15%' }}
                    />
                  )}
                </div>
                <div className="row">
                  {filteredEmployees.map(manage =>
                    manage.employees.map(employee => {
                      const uniqueProjects = [];
                      manage.employee_projects[employee.id].forEach(project => {
                        if (project.assigned_to.some(emp => emp.id === employee.id) && !uniqueProjects.some(proj => proj.id === project.id)) {
                          uniqueProjects.push(project);
                        }
                      });
                      return (
                        <div className="col-lg-6 mb-4" key={employee.id}>
                          <div className="card gradient-custom2 mb-3" style={{ borderRadius: '.5rem' }}>
                            <div className="row g-0">
                              <div className="col-md-4 gradient-custom text-center text-white" style={{ borderTopLeftRadius: '.5rem', borderBottomLeftRadius: '.5rem' }}>
                                <img src="https://mdbcdn.b-cdn.net/img/Photos/new-templates/bootstrap-chat/ava6-bg.webp" alt="Avatar" className="img-fluid my-5" style={{ width: '80px' }} />
                                <div className='text-dark fw-bold'>
                                  <p>{employee.name}</p>
                                  <p>{employee.position}</p>
                                </div>
                                <i className="far fa-edit mb-5"></i>
                              </div>
                              <div className="col-md-8">
                                <div className="card-body p-4">
                                  <h6>Information</h6>
                                  <hr className="mt-0 mb-4" />
                                  <div className="row pt-1">
                                    <div className="col-9 mb-3">
                                      <table className="table">
                                        <thead>
                                          <tr>
                                            <th className='bg-danger'>Email</th>
                                            <th className='bg-success'>Payment</th>
                                          </tr>
                                        </thead>
                                        <tbody>
                                          <tr className='bg-danger'>
                                            <td className='bg-warning'>{employee.email}</td>
                                            <td className='bg-dark text-white'>{employee.payment}</td>
                                          </tr>
                                        </tbody>
                                      </table>
                                    </div>
                                  </div>
                                  <h6>Projects</h6>
                                  <hr className="mt-0 mb-4" />
                                  <Carousel className='gradient-custom5' style={{ borderRadius: '20px' }} controls={false} indicators={false} fade>
                                    {uniqueProjects.map(project => (
                                      <Carousel.Item key={`${project.id}_${employee.id}`} interval={3000}>
                                        <div className='p-2'>
                                          <h5>Project: {project.title}</h5>
                                          <p>Title: {project.title}</p>
                                          <p>Description: {project.description}</p>
                                          <p>Managers: {project.managers.map(manager => manager.name).join(', ')}</p>
                                        </div>
                                      </Carousel.Item>
                                    ))}
                                  </Carousel>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            )}


            {selectedMenuItem === 'project' && (
              managers && managers.map((i) => (
                <div key={i.manager.id}>
                  <h2 className='text-primary fs-1 fw-bold'>Projects</h2>
                  {i.projects_under_manager.map((proj) => (
                    <div key={proj.id} >
                      <div className="mera-list" style={{ width: '28rem', marginLeft: '20%', marginTop: '30px' }}>
                        <div className="card-body" style={{ padding: '8px' }}>
                          <ListGroup className='list-group list-group-item-success'>
                            <ListGroup.Item className='mera-list' style={{ display: 'flex', justifyContent: 'flex-start', alignItems: 'center', gap: '2%' }}>
                              <span className='fs-4 fw-bold text-danger'> Title:</span><span className='text-success fs-5 fw-bold'>{proj.title}</span>
                            </ListGroup.Item >
                            <ListGroup.Item className='mera-list' style={{ display: 'flex', justifyContent: 'start', alignItems: 'center', gap: '2%' }}>
                              <span className='text-primary fw-bold fs-5'>Description:</span><span className='text-danger fs-6 fw-bold'> {proj.description}</span>
                            </ListGroup.Item>
                            <ListGroup.Item className='mera-list' style={{ display: 'flex', justifyContent: 'flex-start', alignItems: 'center', gap: '2%' }}>
                              <span className=' fw-bold fs-5' style={{ color: 'magenta' }}>Assigned to:</span>
                            </ListGroup.Item>
                            {proj.assigned_to.map((emp, index) => (
                              <div className='mera-list' key={emp.id} style={{ display: 'flex', justifyContent: 'center', gap: '2%', alignItems: 'center' }}>
                                <span className=' fs-5 fw-bold' style={{ color: 'gray' }}>{index + 1}. {emp.name}</span>
                              </div>
                            ))}
                          </ListGroup>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ))
            )}


{selectedMenuItem === 'leaves' && (
        <>
          <div className="dropdown" style={{display:'flex' , alignItems:'center' , justifyContent:'end'}}>
          <span  className='text-primary fw-bold fs-2 p-2' style={{marginLeft:'80%'}}>Notifications</span>
            <div
              className={`me-3 dropdown-toggle hidden-arrow ${bellClicked ? 'active' : ''}`}
              id="navbarDropdownMenuLink"
              role="button"
              data-mdb-toggle="dropdown"
              aria-expanded="false"
              onClick={handleBellClick}
            >
              
              <span className="badge rounded-pill badge-notification bg-danger fs-6">{notifications && notifications.length} </span>
              <i className="fas fa-chevron-down bg-primary "></i>
            </div>
            <ul className={`dropdown-menu ${bellClicked ? 'show' : ''} gradient-custom5 p-2` } aria-labelledby="navbarDropdownMenuLink" style={{marginTop:'20rem' , marginRight:'3rem'}}>
              {notifications && bellClicked && notifications.map((notification) => (
                <ListGroup className='p-2'>
                <ListGroup.Item key={notification.id} style={{backgroundColor:'#adf9be'}}>
                  <div className="dropdown-item text-muted fw-bold">{notification.message}</div>
                </ListGroup.Item>
                </ListGroup>
              ))}
              
              {notifications && bellClicked && (
                <li>
                  <button className="dropdown-item " style={{boxShadow:'0 2px 5px 0 rgba(0, 0, 0, 0.5), 0 2px 10px 0 rgba(0, 0, 0, 0.5)' , width:'6rem' ,borderRadius:'10px'}} onClick={() => handleCloseNotify(manager_Id)}><span className='fs-5 fw-bold text-center'>Clear </span> </button>
                </li>
              )}
            </ul>
          </div>
          <div className="leave-application-list">
            <LeaveApplicationList managerId={manager_Id} />
          </div>
        </>
      )}
          </div>
        </div>
        <ToastContainer />
      </div>
    </>
  );
}
