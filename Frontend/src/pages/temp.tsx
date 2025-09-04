import React, { useState, useEffect } from 'react';
import { Search, Edit, Eye, X, CheckCircle, Users, Clipboard, ThumbsUp, ThumbsDown, Calendar, ChevronLeft, ChevronRight } from 'lucide-react';
import axios from 'axios';
import AdminForm from './Form'
import { Delete } from 'lucide-react';
import Success from '../components/success';
import Failure from '../components/failure';

interface MonthlyData {
  name: string;
  patients: number;
  goodReviews: number;
  badReviews: number;
}

interface Prescription {
  tablets: string;
  dosage: string;
  duration: string;
  _id: string;
  date: string;
}

interface Patient {
  _id: string;
  name: string;
  email: string;
  phno: string;
  age: string;
  address: string;
  sex:string;
  medicalConcern: string[];
  isCompleted: boolean;
  prescription: Prescription[];
  newPrescription: Prescription[];
  createdAt: string;
}

interface StatsCardProps {
  title: string;
  value: number;
  icon: React.ReactNode;
  bgColor: string;
}

// Main Dashboard Component
function Temp(): JSX.Element {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [filteredPatients, setFilteredPatients] = useState<Patient[]>([]);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [showPatientModal, setShowPatientModal] = useState<boolean>(false);
  const [showPrescriptionModal, setShowPrescriptionModal] = useState<boolean>(false);
  const [good,setGood]=useState(0);
  const [bad,setBad]=useState(0);
  const [newPrescription, setNewPrescription] = useState<Omit<Prescription, '_id' | 'date'>>({
    tablets: '',
    dosage: '',
    duration: ''
  });
  const [activeTab, setActiveTab] = useState<'all' | 'completed' | 'pending'>('all');
   const [alertComponent, setAlertComponent] = useState<JSX.Element | null>(null);
  
 
  
  // Add state for monthly data
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Function to get month name
  // Removed duplicate declaration of getMonthName

  // Function to fetch patients data
  const fetchPatients = async () => {
    try {
      setIsLoading(true);
      const response = await axios.get('https://homeo-backend.onrender.com/api/userDetails');
      setPatients(response.data);
      setFilteredPatients(response.data);
      setIsLoading(false);
    } catch (error) {
      console.error('Error fetching patients:', error);
      setIsLoading(false);
    }
  };






const getMonthName = (monthIndex: number) =>
    new Date(0, monthIndex).toLocaleString('default', { month: 'short' });

  const generateSampleMonthlyData = async (): Promise<MonthlyData[]> => {
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth(); // 0-based index
    const currentYear = currentDate.getFullYear();
  
    const months: MonthlyData[] = [];
  
    for (let i = 2; i >= 0; i--) {
      let monthIndex = currentMonth - i;
      let year = currentYear;
  
      if (monthIndex < 0) {
        monthIndex += 12;
        year -= 1;
      }
  
      try {
        // Fetch data filtered by month and year
        const response = await axios.get(`https://homeo-backend.onrender.com/api/userDetails`, {
          params: {
            month: monthIndex + 1, // JS months are 0-based, backend may expect 1-based
            year
          }
        });
  
        const patients = response.data.length;
        const goodReviews = Math.floor(patients * 0.7); // e.g., 70% good
        const badReviews = patients - goodReviews;
  
        months.push({
          name: getMonthName(monthIndex),
          patients,
          goodReviews,
          badReviews
        });
  
      } catch (error) {
        console.error(`Error fetching data for ${monthIndex + 1}/${year}:`, error);
        months.push({
          name: getMonthName(monthIndex),
          patients: 0,
          goodReviews: 0,
          badReviews: 0
        });
      }
    }
  
    return months;
  };



  // Filter patients based on search term
  useEffect(() => {
    const filtered = patients.filter(patient => 
      patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      patient.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      patient.phno.includes(searchTerm)
    );
    setFilteredPatients(filtered);
  }, [searchTerm, patients]);

  // Filter patients based on active tab
  useEffect(() => {
    if (activeTab === 'all') {
      setFilteredPatients(
        patients.filter(patient => 
          patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          patient.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
          patient.phno.includes(searchTerm)
        )
      );
    } else if (activeTab === 'completed') {
      setFilteredPatients(
        patients.filter(patient => 
          patient.isCompleted && (
            patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            patient.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
            patient.phno.includes(searchTerm)
          )
        )
      );
    } else if (activeTab === 'pending') {
      setFilteredPatients(
        patients.filter(patient => 
          !patient.isCompleted && (
            patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            patient.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
            patient.phno.includes(searchTerm)
          )
        )
      );
    }
  }, [activeTab, searchTerm, patients]);

  // Mark patient as completed
  const markAsComplete = async (id: string): Promise<void> => {
    try {
      await axios.put(`https://homeo-backend.onrender.com/api/userDetail/${id}/complete`, { isCompleted: true });
      const updatedPatients = patients.map(patient => 
        patient._id === id ? {...patient, isCompleted: true} : patient
      );
      setPatients(updatedPatients.filter((patient): patient is Patient => patient !== undefined));
      setShowPatientModal(false);
      window.location.reload();
    } catch (error) {
      console.error('Error marking patient as complete:', error);
      alert('Failed to update patient status. Please try again.');
    }
  };

  const handlePrescriptionSubmit = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
  
    if (!newPrescription.tablets || !newPrescription.dosage || !newPrescription.duration) {
      alert('Please fill all fields');
      return;
    }
  
    if (!selectedPatient || !selectedPatient._id) {
      alert('Please select a valid patient');
      return;
    }
  
    try {
      const prescription = {
        ...newPrescription,
        date: new Date().toISOString()
      };
  
      // First, update the prescription
      await axios.put(`https://homeo-backend.onrender.com/api/userDetails/${selectedPatient._id}`, {
        newPrescription: [prescription]
      });
  
      // Then fetch the updated patient
      console.log(selectedPatient._id);
      const res = await axios.get(`https://homeo-backend.onrender.com/api/userDetails/${selectedPatient._id}`);
      window.location.reload();
      
      const updatedUser = res.data;

      console.log('Updated User:', updatedUser);
  
      const updatedPatients = patients.map(patient =>
        patient._id === updatedUser._id ? updatedUser : patient
      );
  
      setPatients(updatedPatients);
      setNewPrescription({ tablets: '', dosage: '', duration: '' });
      setShowPrescriptionModal(false);
      setShowPatientModal(true);
    } catch (error) {
      console.log(error);
      console.error('Error adding prescription:', error);
      alert('Failed to add prescription. Please try again.');
    }
  };

  async function allReviews() {
    try {
      const res = await axios.get('https://homeo-backend.onrender.com/api/reviews');
      const reviews = res.data.data;
  
      const { good, bad } = reviews.reduce(
        (acc: { good: number; bad: number }, review: any) => {
          if (review.rating >= 4) {
            acc.good++;
          } else {
            acc.bad++;
          }
          return acc;
        },
        { good: 0, bad: 0 }
      );
  
      setGood(good);
      setBad(bad);
    } catch (error) {
      console.error("Error fetching reviews:", error);
      setGood(0);
      setBad(0);
    }
  }

  useEffect(() => {
    fetchPatients();
    allReviews();
  }, []);
  // Get total counts for stats cards
  const getTotalPatients = () => patients.length;
  const getCompletedCheckups = () => patients.filter(p => p.isCompleted).length;


  const handleDownload = async () => {
    try {
      const response = await axios.get('https://homeo-backend.onrender.com/api/download-excel', {
        responseType: 'blob', 
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'userDetails.xlsx'); 
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error('Error downloading the file', error);
    }
  };

  const sendEmail = async (id: string) => {
    try {
      const response= await axios.post(`https://homeo-backend.onrender.com/api/send-email/${id}`);
      setSubmittedData(response.data);
      if (response.status >= 200 && response.status < 300) {
        setAlertComponent(<Success head={"Success"} message={"Your request submitted successfully"} />);
        window.location.reload();
      } else {
        setAlertComponent(<Failure head={"Error"} message={"Your request failed"} />);
        window.location.reload();
      }

      setTimeout(() => {
        setAlertComponent(null);
      }, 3000);
    } catch (error) {
      console.error('Error sending email:', error);
      setAlertComponent(<Failure head={"Error"} message={"Your request failed"} />);
      setTimeout(() => {
        setAlertComponent(null);
      }, 3000);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white shadow">
      <div className="flex max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8 items-center justify-between">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Medical Admin Dashboard</h1>
        <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition" 
        onClick={handleDownload}>
          Download
        </button>
      </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
          <StatsCard title="Total Patients" value={getTotalPatients()} icon={<Users className="h-8 w-8 text-blue-500" />} bgColor="bg-blue-100" />
          <StatsCard title="Completed Checkups" value={getCompletedCheckups()} icon={<CheckCircle className="h-8 w-8 text-green-500" />} bgColor="bg-green-100" />
          <StatsCard title="Good Reviews" value={good} icon={<ThumbsUp className="h-8 w-8 text-indigo-500" />} bgColor="bg-indigo-100" />
          <StatsCard title="Bad Reviews" value={bad} icon={<ThumbsDown className="h-8 w-8 text-red-500" />} bgColor="bg-red-100" />
        </div>


        {/* Patients Tab and Search */}
        <div className="bg-white p-6 rounded-lg shadow mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
            <div className="flex space-x-4 mb-4 md:mb-0">
              <button 
                onClick={() => setActiveTab('all')} 
                className={`px-4 py-2 font-medium ${activeTab === 'all' ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-gray-500'}`}
              >
                All Patients
              </button>
              <button 
                onClick={() => setActiveTab('pending')} 
                className={`px-4 py-2 font-medium ${activeTab === 'pending' ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-gray-500'}`}
              >
                Pending Checkups
              </button>
              <button 
                onClick={() => setActiveTab('completed')} 
                className={`px-4 py-2 font-medium ${activeTab === 'completed' ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-gray-500'}`}
              >
                Completed Checkups
              </button>
            </div>
            <div className="relative">
              <input
                type="text"
                placeholder="Search patients..."
                className="pl-10 pr-4 py-2 border rounded-lg w-full md:w-64"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <Search className="h-5 w-5 text-gray-400 absolute left-3 top-2.5" />
            </div>
          </div>

          {/* Patients Table */}
          <div className="overflow-x-auto">
            {isLoading ? (
              <div className="flex justify-center py-8">
                <p>Loading patients...</p>
              </div>
            ) : (
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Patient</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Medical Concerns</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Delete</th>

                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredPatients.length > 0 ? (
                    filteredPatients.map((patient) => (
                      <tr key={patient._id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{patient.name}</div>
                          <div className="text-sm text-gray-500">Age: {patient.age}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{patient.email}</div>
                          <div className="text-sm text-gray-500">{patient.phno}</div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex flex-wrap gap-1">
                            {patient.medicalConcern.map((concern, index) => (
                              <span key={index} className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800">
                                {concern}
                              </span>
                            ))}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {patient.isCompleted ? (
                            <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">
                              Completed
                            </span>
                          ) : (
                            <span className="px-2 py-1 text-xs rounded-full bg-yellow-100 text-yellow-800">
                              Pending
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <button 
                            onClick={() => {
                              setSelectedPatient(patient);
                              setShowPatientModal(true);
                            }}
                            className="text-indigo-600 hover:text-indigo-900 mr-4"
                          >
                            <Eye className="h-5 w-5" />
                          </button>
                        </td>
                        <td>
                          <button 
                            onClick={async () => {
                              try {
                                await axios.delete(`https://homeo-backend.onrender.com/api/userDetails/${patient._id}`);
                                setPatients(patients.filter(p => p._id !== patient._id));
                                setFilteredPatients(filteredPatients.filter(p => p._id !== patient._id));
                                window.location.reload();
                              } catch (error) {
                                console.error('Error deleting patient:', error);
                              }
                            }}
                            className="text-red-600 hover:text-red-900"
                          >
                           <Delete className='ml-8' />
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5} className="px-6 py-4 text-center text-sm text-gray-500">
                        No patients found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            )}
          </div>
        </div>
        <AdminForm/>
      </main>

      {/* Patient Details Modal */}
      {showPatientModal && selectedPatient && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-screen overflow-auto">
            <div className="flex justify-between items-center border-b p-4">
              <h2 className="text-xl font-bold">Patient Details</h2>
              <button onClick={() => setShowPatientModal(false)} className="text-gray-500 hover:text-gray-700">
                <X className="h-6 w-6" />
              </button>
            </div>
            
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <h3 className="text-lg font-semibold mb-4">Personal Information</h3>
                  <div className="space-y-2">
                    <p><span className="font-medium">Name:</span> {selectedPatient.name}</p>
                    <p><span className="font-medium">Age:</span> {selectedPatient.age}</p>
                    <p><span className="font-medium">Email:</span> {selectedPatient.email}</p>
                    <p><span className="font-medium">Phone:</span> {selectedPatient.phno}</p>
                    <p><span className="font-medium">Address:</span> {selectedPatient.address}</p>
                    <p><span className='font-medium' >Sex: </span>{selectedPatient.sex}</p>
                    <p><span className="font-medium">Registered:</span> {new Date(selectedPatient.createdAt).toLocaleDateString()}</p>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-lg font-semibold mb-4">Medical Information</h3>
                  <div className="space-y-2">
                    <p><span className="font-medium">Medical Concerns:</span></p>
                    <div className="flex flex-wrap gap-2">
                      {selectedPatient.medicalConcern.map((concern, index) => (
                        <span key={index} className="px-3 py-1 rounded-full bg-blue-100 text-blue-800">
                          {concern}
                        </span>
                      ))}
                    </div>
                    <p><span className="font-medium">Status:</span> {selectedPatient.isCompleted ? 'Completed' : 'Pending'}</p>
                  </div>
                </div>
              </div>
              
              <div className="mb-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold">Prescription History</h3>
                  <button 
                    onClick={() => {
                      setShowPrescriptionModal(true);
                      setShowPatientModal(false);
                    }}
                    className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 flex items-center"
                  >
                    <Edit className="h-4 w-4 mr-2" /> New Prescription
                  </button>
                </div>
                
                {selectedPatient.prescription.length === 0 && selectedPatient.newPrescription.length === 0 ? (
                  <p className="text-gray-500">No prescriptions found</p>
                ) : (
                  <div className="border rounded-lg overflow-hidden">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Medication</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Dosage</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Duration</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {[...selectedPatient.prescription, ...selectedPatient.newPrescription].map((prescription, index) => (
                          <tr key={prescription._id}>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {new Date(prescription.date).toLocaleDateString()}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                              {prescription.tablets}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {prescription.dosage}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {prescription.duration}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {index < selectedPatient.prescription.length ? (
                                <span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800">Previous</span>
                              ) : (
                                <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">New</span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
              
              <div className="border-t pt-4 flex justify-end space-x-3">
                {!selectedPatient.isCompleted && (
                  <button
                    onClick={() => markAsComplete(selectedPatient._id)}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                  >
                    Mark as Complete
                  </button>
                )}
                <button
                  onClick={() => setShowPatientModal(false)}
                  className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300"
                >
                  Close
                </button>
                <button
                onClick={()=> sendEmail(selectedPatient._id)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Send Email
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* New Prescription Modal */}
      {showPrescriptionModal && selectedPatient && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-lg w-full">
            <div className="flex justify-between items-center border-b p-4">
              <h2 className="text-xl font-bold">New Prescription</h2>
              <button 
                onClick={() => {
                  setShowPrescriptionModal(false);
                  setShowPatientModal(true);
                }} 
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            
            <form onSubmit={handlePrescriptionSubmit} className="p-6">
              <div className="mb-6">
                <p className="text-lg font-medium mb-2">Patient: {selectedPatient.name}</p>
                <div className="flex flex-wrap gap-2 mb-4">
                  {selectedPatient.medicalConcern.map((concern, index) => (
                    <span key={index} className="px-3 py-1 rounded-full bg-blue-100 text-blue-800 text-sm">
                      {concern}
                    </span>
                  ))}
                </div>
              </div>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Medication</label>
                <input
                  type="text"
                  className="w-full p-2 border rounded-lg"
                  value={newPrescription.tablets}
                  onChange={(e) => setNewPrescription({...newPrescription, tablets: e.target.value})}
                  required
                />
              </div>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Dosage</label>
                <input
                  type="text"
                  className="w-full p-2 border rounded-lg"
                  value={newPrescription.dosage}
                  onChange={(e) => setNewPrescription({...newPrescription, dosage: e.target.value})}
                  required
                />
              </div>
              
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-1">Duration</label>
                <input
                  type="text"
                  className="w-full p-2 border rounded-lg"
                  value={newPrescription.duration}
                  onChange={(e) => setNewPrescription({...newPrescription, duration: e.target.value})}
                  required
                />
              </div>
              
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowPrescriptionModal(false);
                    setShowPatientModal(true);
                  }}
                  className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                >
                  Save Prescription
                </button>
              </div>
            </form>
          </div>
          <div>
          </div>
        </div>
      )}
    </div>

  );
}

// Stats Card Component
function StatsCard({ title, value, icon, bgColor }: StatsCardProps): JSX.Element {
  return (
    <div className={`${bgColor} rounded-lg shadow-sm p-6`}>
      <div className="flex justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-3xl font-bold mt-2">{value}</p>
        </div>
        <div>
          {icon}
        </div>
      </div>
    </div>
  );
}

export default Temp;

function setSubmittedData(data: any) {
  throw new Error('Function not implemented.');
}
