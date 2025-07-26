import { Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import LoginPage from './pages/loginPage/LoginPage';
import SignupPage from './pages/signupPage/SignupPage';
import StudentSignupPage from './pages/signupPage/StudentSignupPage';
import CollegeSignupPage from './pages/signupPage/CollegeSignupPage';
import RecruiterSignupPage from './pages/signupPage/RecruiterSignupPage';
import StudentLoginPage from './pages/loginPage/StudentLogin';
import CollegeLoginPage from './pages/loginPage/CollegeLogin';
import RecruiterLoginPage from './pages/loginPage/RecruiterLogin';
import RecruiterDashboard from './pages/recruiterDashboard/RecruiterDashboard';
import CollegeDashboard from './pages/collegeDashboard/CollegeDashboard';
import ScheduledCallsPage from './pages/recruiterDashboard/ScheduledCallsPage';
import CollegeScheduledCallsPage from './pages/collegeDashboard/CollegeScheduledCallsPage';
import StudentDashboard from './pages/studentDashboard/StudentDashboard';

function App() {
  return (
    <div>
      <Routes>
        <Route path="/login" element={<LoginPage />}>
          <Route path="student-login" element={<StudentLoginPage />} />
          <Route path="college-login" element={<CollegeLoginPage />} />
          <Route path="recruiter-login" element={<RecruiterLoginPage />} />
        </Route>
        
        <Route path="/signup" element={<SignupPage />}>
          <Route path="student-signup" element={<StudentSignupPage />} />
          <Route path="college-signup" element={<CollegeSignupPage />} />
          <Route path="recruiter-signup" element={<RecruiterSignupPage />} />
        </Route>

        <Route path="/recruiter-dashboard" element={<RecruiterDashboard />}>
          <Route path="scheduled-calls" element={<ScheduledCallsPage />} />
        </Route>

        <Route path="/college-dashboard" element={<CollegeDashboard />}>
          <Route path="scheduled-calls" element={<CollegeScheduledCallsPage />} />
        </Route>

        <Route path='/student-dashboard' element={<StudentDashboard />} />
        
        <Route path="/" element={<HomePage />} />
      </Routes>
    </div>
  );
}

export default App;
