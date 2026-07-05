import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import PageWrapper from '../../components/layout/PageWrapper';
import { getTeacher, createTeacher, updateTeacher } from '../../services/teacherService';
import { useToast } from '../../contexts/ToastContext';
import { Save, X } from 'lucide-react';

const TeacherForm = () => {
  const { id } = useParams();
  const isEdit = !!id;
  const navigate = useNavigate();
  const { success, error } = useToast();
  const [isLoading, setIsLoading] = useState(isEdit);
  const [isSaving, setIsSaving] = useState(false);

  const { register, handleSubmit, formState: { errors }, reset } = useForm({
    defaultValues: {
      gender: 'Female',
      isActive: true,
      address: {
        current: '',
        permanent: ''
      },
      bankDetails: {
        accountNumber: '',
        ifscCode: '',
        bankName: ''
      }
    }
  });

  useEffect(() => {
    if (isEdit) {
      const fetchTeacher = async () => {
        try {
          const data = await getTeacher(id);
          if (data.dob) data.dob = data.dob.split('T')[0];
          if (data.doj) data.doj = data.doj.split('T')[0];
          reset(data);
        } catch (err) {
          error(err.response?.data?.message || 'Failed to fetch teacher details');
          navigate('/teachers');
        } finally {
          setIsLoading(false);
        }
      };
      fetchTeacher();
    }
  }, [id, isEdit, reset, error, navigate]);

  const onSubmit = async (data) => {
    setIsSaving(true);
    try {
      if (isEdit) {
        await updateTeacher(id, data);
        success('Teacher updated successfully');
      } else {
        await createTeacher(data);
        success('Teacher created successfully');
      }
      navigate('/teachers');
    } catch (err) {
      error(err.response?.data?.message || `Failed to ${isEdit ? 'update' : 'create'} teacher`);
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return <PageWrapper title="Loading Staff Details..." className="animate-pulse" />;
  }

  return (
    <PageWrapper title={isEdit ? 'Edit Staff Member' : 'Add New Staff'}>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        
        <div className="glass p-6 rounded-xl space-y-4">
          <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-100 border-b border-slate-200 dark:border-slate-700 pb-2">Employment Details</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Employee ID *</label>
              <input 
                {...register('employeeId', { required: 'Employee ID is required' })} 
                className={`input-field ${errors.employeeId ? 'border-red-500 focus:ring-red-500' : ''}`}
                placeholder="e.g. EMP-001"
              />
              {errors.employeeId && <p className="text-xs text-red-500 mt-1">{errors.employeeId.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Designation *</label>
              <input 
                {...register('designation', { required: 'Designation is required' })} 
                className={`input-field ${errors.designation ? 'border-red-500 focus:ring-red-500' : ''}`}
                placeholder="e.g. TGT Science"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Date of Joining *</label>
              <input 
                type="date" 
                {...register('doj', { required: 'Date of joining is required' })} 
                className={`input-field ${errors.doj ? 'border-red-500 focus:ring-red-500' : ''}`}
              />
            </div>
          </div>
        </div>

        <div className="glass p-6 rounded-xl space-y-4">
          <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-100 border-b border-slate-200 dark:border-slate-700 pb-2">Personal Details</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Full Name *</label>
              <input 
                {...register('name', { required: 'Name is required' })} 
                className={`input-field ${errors.name ? 'border-red-500 focus:ring-red-500' : ''}`}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Email *</label>
              <input 
                type="email"
                {...register('email', { required: 'Email is required' })} 
                className={`input-field ${errors.email ? 'border-red-500 focus:ring-red-500' : ''}`}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Mobile *</label>
              <input 
                {...register('mobile', { required: 'Mobile is required' })} 
                className={`input-field ${errors.mobile ? 'border-red-500 focus:ring-red-500' : ''}`}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Gender *</label>
              <select {...register('gender')} className="input-field">
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Date of Birth *</label>
              <input 
                type="date" 
                {...register('dob', { required: 'DOB is required' })} 
                className={`input-field ${errors.dob ? 'border-red-500 focus:ring-red-500' : ''}`}
              />
            </div>
          </div>
        </div>

        <div className="glass p-6 rounded-xl space-y-4">
          <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-100 border-b border-slate-200 dark:border-slate-700 pb-2">Qualifications & Documents</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Highest Qualification *</label>
              <input 
                {...register('qualification', { required: 'Qualification is required' })} 
                className={`input-field ${errors.qualification ? 'border-red-500 focus:ring-red-500' : ''}`}
                placeholder="e.g. M.Sc. B.Ed."
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Experience (Years)</label>
              <input 
                type="number" 
                {...register('experience', { valueAsNumber: true })} 
                className="input-field" 
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Aadhaar Number</label>
              <input {...register('aadhaar')} className="input-field" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">PAN Number</label>
              <input {...register('pan')} className="input-field uppercase" />
            </div>
          </div>
        </div>
        
        <div className="glass p-6 rounded-xl space-y-4">
          <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-100 border-b border-slate-200 dark:border-slate-700 pb-2">Address details</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Current Address *</label>
              <textarea 
                {...register('address.current', { required: 'Current address is required' })} 
                className="input-field h-24 resize-none"
              ></textarea>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Permanent Address *</label>
              <textarea 
                {...register('address.permanent', { required: 'Permanent address is required' })} 
                className="input-field h-24 resize-none"
              ></textarea>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-700">
          <button 
            type="button" 
            onClick={() => navigate('/teachers')}
            className="btn-primary bg-slate-200 text-slate-700 hover:bg-slate-300 dark:bg-slate-700 dark:text-slate-200 dark:hover:bg-slate-600 flex items-center gap-2 shadow-none"
            disabled={isSaving}
          >
            <X className="w-4 h-4" />
            Cancel
          </button>
          <button 
            type="submit" 
            className="btn-primary flex items-center gap-2"
            disabled={isSaving}
          >
            <Save className="w-4 h-4" />
            {isSaving ? 'Saving...' : 'Save Staff'}
          </button>
        </div>
        
      </form>
    </PageWrapper>
  );
};

export default TeacherForm;
