import Sidebar from '../Sidebar Section/Sidebar';
import Body from '../Body Section/Body/Body';
import Account from '../Body Section/Account Section/Accountt';
import '../../TeacherDashboard/TeacherD/TeacherDashboard.css';
import { useLocation } from 'react-router-dom';
function StudentDashboard() {
  const location = useLocation();
  const studentId = new URLSearchParams(location.search).get('id');
  return (
    <div className='body'>
        <div className="containerr">
      <Sidebar studentId={studentId}/>
      <Body />
        </div>
    </div>
  );
}

export default StudentDashboard;
