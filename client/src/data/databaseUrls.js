// Dynamically set the base URL depending on the environment (production vs local development)

// Always use the environment variable for backend API URL
const BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:8081";

export const databaseUrls = {
  auth: {
    login: `${BASE_URL}/auth/login`,
    register: `${BASE_URL}/auth/register`,
    profile: `${BASE_URL}/auth/profile`,
    editProfile: `${BASE_URL}/auth/profile/edit`,
    addDoctor: `${BASE_URL}/auth/profile/adddoctor`,
    getAllDoctors: `${BASE_URL}/auth/doctors`,
  },
  hospitals: {
    all: `${BASE_URL}/hospitalapi`,
    fromId: `${BASE_URL}/hospitalapi/_id`,
    bookHospital: `${BASE_URL}/hospitalapi/hospitals/_id/book`,
    appointments: `${BASE_URL}/hospitalapi/appointments`,
    emergency: `${BASE_URL}/hospitalapi/emergency`,
    updateAppointments: `${BASE_URL}/hospitalapi/_id/appointments`,
  },
  patient: {
    appointments: `${BASE_URL}/patientapi/appointments`,
  },
  appointments: {
    register: `${BASE_URL}/appointments/register`,
    availableSlots: `${BASE_URL}/appointments/available-slots`,
  },
};
