import React, { useEffect, useState, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import PageWrapper from '../../components/layout/PageWrapper';
import { getStudent, uploadStudentPhoto } from '../../services/studentService';
import { useToast } from '../../contexts/ToastContext';
import { Edit, Camera, Download, FileText, CheckSquare, Banknote } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

const StudentProfile = () => {
  const { id } = useParams();
  const [student, setStudent] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef(null);
  const { error, success } = useToast();
  const { user } = useAuth();
  
  const isAdminOrPrincipal = ['admin', 'principal'].includes(user?.role);

  useEffect(() => {
    const fetchStudent = async () => {
      try {
        const data = await getStudent(id);
        setStudent(data);
      } catch (err) {
        error(err.response?.data?.message || 'Failed to fetch student details');
      } finally {
        setIsLoading(false);
      }
    };
    fetchStudent();
  }, [id, error]);

  const handlePhotoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate size (e.g. max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      error('File size should not exceed 5MB');
      return;
    }

    try {
      setIsUploading(true);
      const updatedStudent = await uploadStudentPhoto(id, file);
      setStudent(updatedStudent);
      success('Photo uploaded successfully');
    } catch (err) {
      error(err.response?.data?.message || 'Failed to upload photo');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  if (isLoading) {
    return <PageWrapper title="Student Profile" className="animate-pulse" />;
  }

  if (!student) {
    return (
      <PageWrapper title="Student Profile">
        <div className="glass p-8 text-center rounded-xl">
          <p className="text-slate-500">Student not found.</p>
        </div>
      </PageWrapper>
    );
  }

  return (
    <PageWrapper title="Student Profile">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Profile Card */}
        <div className="lg:col-span-1 space-y-6">
          <div className="glass rounded-xl overflow-hidden">
            {/* Header / Cover area */}
            <div className="h-24 bg-gradient-to-r from-primary-500 to-primary-300"></div>
            
            {/* Avatar & Basic Info */}
            <div className="px-6 pb-6 text-center relative -mt-12">
              <div className="relative inline-block">
                <div className="w-24 h-24 mx-auto rounded-full border-4 border-white dark:border-slate-800 overflow-hidden bg-slate-200 dark:bg-slate-700 shadow-md">
                  {student.photo ? (
                    <img src={student.photo} alt={student.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-4xl text-slate-400 bg-primary-100 dark:bg-primary-900/30">
                      {student.name.charAt(0)}
                    </div>
                  )}
                </div>
                {isAdminOrPrincipal && (
                  <>
                    <button 
                      onClick={() => fileInputRef.current?.click()}
                      disabled={isUploading}
                      className="absolute bottom-0 right-0 p-1.5 bg-white dark:bg-slate-800 rounded-full shadow-md text-primary-600 hover:text-primary-700 border border-slate-200 dark:border-slate-700 transition-colors"
                      title="Upload Photo"
                    >
                      <Camera className="w-4 h-4" />
                    </button>
                    <input 
                      type="file" 
                      accept="image/*" 
                      ref={fileInputRef} 
                      onChange={handlePhotoUpload}
                      className="hidden" 
                    />
                  </>
                )}
              </div>
              
              <h2 className="mt-3 text-xl font-bold text-slate-900 dark:text-slate-100">{student.name}</h2>
              <p className="text-sm text-slate-500 dark:text-slate-400">Adm No: {student.admissionNumber}</p>
              
              <div className="mt-4 flex flex-wrap gap-2 justify-center">
                <span className="px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                  Class {student.class} - {student.section}
                </span>
                <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${student.isActive ? 'bg-green-100 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-300 dark:border-green-800' : 'bg-red-100 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-300 dark:border-red-800'}`}>
                  {student.isActive ? 'Active' : 'Inactive'}
                </span>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="border-t border-slate-200 dark:border-slate-700 p-4 grid grid-cols-2 gap-2">
              <Link to={`/students/${student._id}/edit`} className="btn-primary py-2 text-center text-sm flex items-center justify-center gap-2">
                <Edit className="w-4 h-4" /> Edit
              </Link>
              <button className="btn-primary py-2 text-center text-sm bg-white text-slate-700 border border-slate-300 hover:bg-slate-50 dark:bg-slate-800 dark:text-slate-200 flex items-center justify-center gap-2 shadow-sm">
                <Download className="w-4 h-4" /> ID Card
              </button>
            </div>
          </div>

          {/* Quick Links */}
          <div className="glass rounded-xl p-4">
            <h3 className="font-semibold text-slate-800 dark:text-slate-200 mb-3 text-sm uppercase tracking-wider">Quick Links</h3>
            <div className="space-y-2">
              <Link to={`/attendance?student=${student._id}`} className="flex items-center gap-3 p-3 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800/50 transition-colors text-sm font-medium text-slate-700 dark:text-slate-300">
                <div className="p-2 rounded bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400">
                  <CheckSquare className="w-4 h-4" />
                </div>
                View Attendance
              </Link>
              <Link to={`/exams?student=${student._id}`} className="flex items-center gap-3 p-3 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800/50 transition-colors text-sm font-medium text-slate-700 dark:text-slate-300">
                <div className="p-2 rounded bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400">
                  <FileText className="w-4 h-4" />
                </div>
                Academic Results
              </Link>
              <Link to={`/fees?student=${student._id}`} className="flex items-center gap-3 p-3 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800/50 transition-colors text-sm font-medium text-slate-700 dark:text-slate-300">
                <div className="p-2 rounded bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400">
                  <Banknote className="w-4 h-4" />
                </div>
                Fee Ledger
              </Link>
            </div>
          </div>
        </div>

        {/* Right Column: Detailed Info Tabs */}
        <div className="lg:col-span-2 space-y-6">
          <div className="glass rounded-xl overflow-hidden">
            <div className="p-6 border-b border-slate-200 dark:border-slate-700 bg-white/50 dark:bg-slate-800/30">
              <h3 className="font-bold text-lg text-slate-800 dark:text-slate-100">Personal Information</h3>
            </div>
            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-8">
              <InfoItem label="Date of Birth" value={new Date(student.dob).toLocaleDateString()} />
              <InfoItem label="Gender" value={student.gender} />
              <InfoItem label="Blood Group" value={student.bloodGroup || '-'} />
              <InfoItem label="Religion" value={student.religion || '-'} />
              <InfoItem label="Category" value={student.category || '-'} />
              <InfoItem label="Aadhaar" value={student.aadhaar ? 'XXXX-XXXX-' + student.aadhaar.slice(-4) : '-'} />
              <div className="md:col-span-2">
                <InfoItem label="Medical Conditions" value={student.medicalConditions || 'None'} />
              </div>
            </div>
          </div>

          <div className="glass rounded-xl overflow-hidden">
            <div className="p-6 border-b border-slate-200 dark:border-slate-700 bg-white/50 dark:bg-slate-800/30">
              <h3 className="font-bold text-lg text-slate-800 dark:text-slate-100">Guardian Information</h3>
            </div>
            <div className="p-6 space-y-6">
              <div>
                <h4 className="text-sm font-semibold text-slate-600 dark:text-slate-400 mb-3 border-b border-slate-100 dark:border-slate-800 pb-1">Father</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-y-3 gap-x-8">
                  <InfoItem label="Name" value={student.father?.name} />
                  <InfoItem label="Mobile" value={student.father?.mobile} />
                  <InfoItem label="Occupation" value={student.father?.occupation || '-'} />
                </div>
              </div>
              <div>
                <h4 className="text-sm font-semibold text-slate-600 dark:text-slate-400 mb-3 border-b border-slate-100 dark:border-slate-800 pb-1">Mother</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-y-3 gap-x-8">
                  <InfoItem label="Name" value={student.mother?.name} />
                  <InfoItem label="Mobile" value={student.mother?.mobile} />
                  <InfoItem label="Occupation" value={student.mother?.occupation || '-'} />
                </div>
              </div>
            </div>
          </div>

          <div className="glass rounded-xl overflow-hidden">
            <div className="p-6 border-b border-slate-200 dark:border-slate-700 bg-white/50 dark:bg-slate-800/30">
              <h3 className="font-bold text-lg text-slate-800 dark:text-slate-100">Contact & Address</h3>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <span className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Current Address</span>
                <p className="text-sm text-slate-800 dark:text-slate-200 bg-slate-50 dark:bg-slate-800/50 p-3 rounded-lg border border-slate-100 dark:border-slate-700">
                  {student.address?.current || '-'}
                </p>
              </div>
              <div>
                <span className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Permanent Address</span>
                <p className="text-sm text-slate-800 dark:text-slate-200 bg-slate-50 dark:bg-slate-800/50 p-3 rounded-lg border border-slate-100 dark:border-slate-700">
                  {student.address?.permanent || '-'}
                </p>
              </div>
            </div>
          </div>

        </div>
      </div>
    </PageWrapper>
  );
};

const InfoItem = ({ label, value }) => (
  <div>
    <span className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">{label}</span>
    <span className="block text-sm font-semibold text-slate-800 dark:text-slate-200">{value}</span>
  </div>
);

export default StudentProfile;
