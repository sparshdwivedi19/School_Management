import React, { useEffect, useState, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import PageWrapper from '../../components/layout/PageWrapper';
import { getTeacher, uploadTeacherPhoto } from '../../services/teacherService';
import { useToast } from '../../contexts/ToastContext';
import { Edit, Camera, Calendar, Mail, Phone, MapPin, Briefcase } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

const TeacherProfile = () => {
  const { id } = useParams();
  const [teacher, setTeacher] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef(null);
  const { error, success } = useToast();
  const { user } = useAuth();
  
  const isAdminOrPrincipal = ['admin', 'principal'].includes(user?.role);

  useEffect(() => {
    const fetchTeacher = async () => {
      try {
        const data = await getTeacher(id);
        setTeacher(data);
      } catch (err) {
        error(err.response?.data?.message || 'Failed to fetch staff details');
      } finally {
        setIsLoading(false);
      }
    };
    fetchTeacher();
  }, [id, error]);

  const handlePhotoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      error('File size should not exceed 5MB');
      return;
    }

    try {
      setIsUploading(true);
      const updatedTeacher = await uploadTeacherPhoto(id, file);
      setTeacher(updatedTeacher);
      success('Photo uploaded successfully');
    } catch (err) {
      error(err.response?.data?.message || 'Failed to upload photo');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  if (isLoading) {
    return <PageWrapper title="Staff Profile" className="animate-pulse" />;
  }

  if (!teacher) {
    return (
      <PageWrapper title="Staff Profile">
        <div className="glass p-8 text-center rounded-xl">
          <p className="text-slate-500">Staff member not found.</p>
        </div>
      </PageWrapper>
    );
  }

  return (
    <PageWrapper title="Staff Profile">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Profile Card */}
        <div className="lg:col-span-1 space-y-6">
          <div className="glass rounded-xl overflow-hidden">
            <div className="h-24 bg-gradient-to-r from-purple-500 to-purple-300"></div>
            
            <div className="px-6 pb-6 text-center relative -mt-12">
              <div className="relative inline-block">
                <div className="w-24 h-24 mx-auto rounded-full border-4 border-white dark:border-slate-800 overflow-hidden bg-slate-200 dark:bg-slate-700 shadow-md">
                  {teacher.photo ? (
                    <img src={teacher.photo} alt={teacher.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-4xl text-slate-400 bg-purple-100 dark:bg-purple-900/30">
                      {teacher.name.charAt(0)}
                    </div>
                  )}
                </div>
                {isAdminOrPrincipal && (
                  <>
                    <button 
                      onClick={() => fileInputRef.current?.click()}
                      disabled={isUploading}
                      className="absolute bottom-0 right-0 p-1.5 bg-white dark:bg-slate-800 rounded-full shadow-md text-purple-600 hover:text-purple-700 border border-slate-200 dark:border-slate-700 transition-colors"
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
              
              <h2 className="mt-3 text-xl font-bold text-slate-900 dark:text-slate-100">{teacher.name}</h2>
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{teacher.designation}</p>
              
              <div className="mt-4 flex flex-wrap gap-2 justify-center">
                <span className="px-3 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                  ID: {teacher.employeeId}
                </span>
                <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${teacher.isActive ? 'bg-green-100 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-300 dark:border-green-800' : 'bg-red-100 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-300 dark:border-red-800'}`}>
                  {teacher.isActive ? 'Active' : 'Inactive'}
                </span>
              </div>
            </div>

            {isAdminOrPrincipal && (
              <div className="border-t border-slate-200 dark:border-slate-700 p-4">
                <Link to={`/teachers/${teacher._id}/edit`} className="btn-primary w-full py-2 text-center text-sm flex items-center justify-center gap-2">
                  <Edit className="w-4 h-4" /> Edit Profile
                </Link>
              </div>
            )}
          </div>

          <div className="glass rounded-xl p-4 space-y-4">
            <h3 className="font-semibold text-slate-800 dark:text-slate-200 text-sm uppercase tracking-wider mb-2">Contact Details</h3>
            
            <div className="flex items-start gap-3 text-sm">
              <Mail className="w-4 h-4 mt-0.5 text-slate-400" />
              <div>
                <p className="text-slate-500 dark:text-slate-400 text-xs">Email</p>
                <p className="font-medium text-slate-800 dark:text-slate-200">{teacher.email}</p>
              </div>
            </div>
            
            <div className="flex items-start gap-3 text-sm">
              <Phone className="w-4 h-4 mt-0.5 text-slate-400" />
              <div>
                <p className="text-slate-500 dark:text-slate-400 text-xs">Mobile</p>
                <p className="font-medium text-slate-800 dark:text-slate-200">{teacher.mobile}</p>
              </div>
            </div>
            
            <div className="flex items-start gap-3 text-sm">
              <MapPin className="w-4 h-4 mt-0.5 text-slate-400" />
              <div>
                <p className="text-slate-500 dark:text-slate-400 text-xs">Current Address</p>
                <p className="font-medium text-slate-800 dark:text-slate-200">{teacher.address?.current}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Detailed Info Tabs */}
        <div className="lg:col-span-2 space-y-6">
          <div className="glass rounded-xl overflow-hidden">
            <div className="p-6 border-b border-slate-200 dark:border-slate-700 bg-white/50 dark:bg-slate-800/30 flex items-center gap-2">
              <Briefcase className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              <h3 className="font-bold text-lg text-slate-800 dark:text-slate-100">Professional Information</h3>
            </div>
            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-8">
              <InfoItem label="Qualification" value={teacher.qualification} />
              <InfoItem label="Experience" value={`${teacher.experience || 0} Years`} />
              <InfoItem label="Date of Joining" value={new Date(teacher.doj).toLocaleDateString()} />
              <InfoItem label="Date of Birth" value={new Date(teacher.dob).toLocaleDateString()} />
              <InfoItem label="Gender" value={teacher.gender} />
            </div>
          </div>

          {isAdminOrPrincipal && (
            <div className="glass rounded-xl overflow-hidden">
              <div className="p-6 border-b border-slate-200 dark:border-slate-700 bg-white/50 dark:bg-slate-800/30">
                <h3 className="font-bold text-lg text-slate-800 dark:text-slate-100">Confidential Information</h3>
              </div>
              <div className="p-6 space-y-6">
                <div>
                  <h4 className="text-sm font-semibold text-slate-600 dark:text-slate-400 mb-3 border-b border-slate-100 dark:border-slate-800 pb-1">Identification</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-y-3 gap-x-8">
                    <InfoItem label="Aadhaar Number" value={teacher.aadhaar ? 'XXXX-XXXX-' + teacher.aadhaar.slice(-4) : '-'} />
                    <InfoItem label="PAN Number" value={teacher.pan || '-'} />
                  </div>
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-slate-600 dark:text-slate-400 mb-3 border-b border-slate-100 dark:border-slate-800 pb-1">Bank Details</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-y-3 gap-x-8">
                    <InfoItem label="Bank Name" value={teacher.bankDetails?.bankName || '-'} />
                    <InfoItem label="Account Number" value={teacher.bankDetails?.accountNumber ? 'XXXX' + teacher.bankDetails.accountNumber.slice(-4) : '-'} />
                    <InfoItem label="IFSC Code" value={teacher.bankDetails?.ifscCode || '-'} />
                  </div>
                </div>
              </div>
            </div>
          )}

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

export default TeacherProfile;
