import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
import PageWrapper from '../../components/layout/PageWrapper';
import { getStudent, createStudent, updateStudent } from '../../services/studentService';
import { useToast } from '../../contexts/ToastContext';
import { Save, X, ArrowLeft } from 'lucide-react';

const StudentForm = () => {
  const { id } = useParams();
  const isEdit = !!id;
  const navigate = useNavigate();
  const { success, error } = useToast();
  const [isLoading, setIsLoading] = useState(isEdit);
  const [isSaving, setIsSaving] = useState(false);

  const { register, handleSubmit, formState: { errors }, reset, control } = useForm({
    defaultValues: {
      gender: 'Male',
      category: 'General',
      isActive: true,
      address: {
        current: '',
        permanent: ''
      },
      father: { relation: 'Father' },
      mother: { relation: 'Mother' },
      localGuardian: { relation: 'Local Guardian' }
    }
  });

  useEffect(() => {
    if (isEdit) {
      const fetchStudent = async () => {
        try {
          const data = await getStudent(id);
          // format dates for input type="date"
          if (data.dob) data.dob = data.dob.split('T')[0];
          if (data.admissionDate) data.admissionDate = data.admissionDate.split('T')[0];
          reset(data);
        } catch (err) {
          error(err.response?.data?.message || 'Failed to fetch student details');
          navigate('/students');
        } finally {
          setIsLoading(false);
        }
      };
      fetchStudent();
    }
  }, [id, isEdit, reset, error, navigate]);

  const onSubmit = async (data) => {
    setIsSaving(true);
    try {
      if (isEdit) {
        await updateStudent(id, data);
        success('Student updated successfully');
      } else {
        await createStudent(data);
        success('Student created successfully');
      }
      navigate('/students');
    } catch (err) {
      error(err.response?.data?.message || `Failed to ${isEdit ? 'update' : 'create'} student`);
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return <PageWrapper title="Loading Student Details..." className="animate-pulse" />;
  }

  return (
    <PageWrapper title={isEdit ? 'Edit Student' : 'Admit New Student'}>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        
        <div className="glass p-6 rounded-xl space-y-4">
          <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-100 border-b border-slate-200 dark:border-slate-700 pb-2">Academic Details</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Admission Number *</label>
              <input 
                {...register('admissionNumber', { required: 'Admission Number is required' })} 
                className={`input-field ${errors.admissionNumber ? 'border-red-500 focus:ring-red-500' : ''}`}
                placeholder="e.g. S-2025-001"
              />
              {errors.admissionNumber && <p className="text-xs text-red-500 mt-1">{errors.admissionNumber.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Academic Session *</label>
              <input 
                {...register('academicSession', { required: 'Session is required' })} 
                className={`input-field ${errors.academicSession ? 'border-red-500 focus:ring-red-500' : ''}`}
                placeholder="2025-26"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Admission Date</label>
              <input type="date" {...register('admissionDate')} className="input-field" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Class *</label>
              <input 
                {...register('class', { required: 'Class is required' })} 
                className="input-field"
                placeholder="e.g. 1"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Section *</label>
              <input 
                {...register('section', { required: 'Section is required' })} 
                className="input-field"
                placeholder="e.g. A"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Roll Number</label>
              <input {...register('rollNumber')} className="input-field" />
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
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Date of Birth *</label>
              <input 
                type="date" 
                {...register('dob', { required: 'DOB is required' })} 
                className="input-field"
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
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Aadhaar Number</label>
              <input {...register('aadhaar')} className="input-field" placeholder="12-digit number" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Blood Group</label>
              <input {...register('bloodGroup')} className="input-field" placeholder="e.g. O+" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Category</label>
              <select {...register('category')} className="input-field">
                <option value="General">General</option>
                <option value="OBC">OBC</option>
                <option value="SC">SC</option>
                <option value="ST">ST</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>
        </div>

        <div className="glass p-6 rounded-xl space-y-4">
          <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-100 border-b border-slate-200 dark:border-slate-700 pb-2">Parent/Guardian Details</h2>
          
          <h3 className="text-sm font-semibold text-slate-600 dark:text-slate-400">Father's Details</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Name *</label>
              <input {...register('father.name', { required: 'Father name is required' })} className="input-field" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Mobile *</label>
              <input {...register('father.mobile', { required: 'Mobile is required' })} className="input-field" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Occupation</label>
              <input {...register('father.occupation')} className="input-field" />
            </div>
          </div>

          <h3 className="text-sm font-semibold text-slate-600 dark:text-slate-400 pt-2">Mother's Details</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Name *</label>
              <input {...register('mother.name', { required: 'Mother name is required' })} className="input-field" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Mobile *</label>
              <input {...register('mother.mobile', { required: 'Mobile is required' })} className="input-field" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Occupation</label>
              <input {...register('mother.occupation')} className="input-field" />
            </div>
          </div>
        </div>

        <div className="glass p-6 rounded-xl space-y-4">
          <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-100 border-b border-slate-200 dark:border-slate-700 pb-2">Contact Details</h2>
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
            onClick={() => navigate('/students')}
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
            {isSaving ? 'Saving...' : 'Save Student'}
          </button>
        </div>
        
      </form>
    </PageWrapper>
  );
};

export default StudentForm;
