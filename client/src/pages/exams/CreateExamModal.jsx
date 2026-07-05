import React, { useState } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { X, Plus, Trash2 } from 'lucide-react';
import { createExam } from '../../services/examService';
import { useToast } from '../../contexts/ToastContext';

const EXAM_TYPES = ['UnitTest', 'Quarterly', 'HalfYearly', 'Annual', 'Internal'];
const CLASSES = ['Nursery', 'LKG', 'UKG', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10'];
const SECTIONS = ['A', 'B', 'C', 'D', 'E'];

const CreateExamModal = ({ onClose, onSuccess }) => {
  const [isSaving, setIsSaving] = useState(false);
  const { success, error } = useToast();

  const { register, control, handleSubmit, formState: { errors } } = useForm({
    defaultValues: {
      academicSession: '2025-26',
      status: 'Scheduled',
      subjects: [{ name: '', maxMarks: 100, passingMarks: 33 }],
    }
  });

  const { fields, append, remove } = useFieldArray({ control, name: 'subjects' });

  const onSubmit = async (data) => {
    setIsSaving(true);
    try {
      await createExam(data);
      success('Exam created successfully');
      onSuccess();
    } catch (err) {
      error(err.response?.data?.message || 'Failed to create exam');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="glass rounded-2xl w-full max-w-2xl p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">Create New Examination</h3>
          <button onClick={onClose}><X className="w-5 h-5 text-slate-500" /></button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          {/* Basic Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Exam Name *</label>
              <input {...register('name', { required: true })} className="input-field" placeholder="e.g. Unit Test 1, Half Yearly" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Exam Type *</label>
              <select {...register('type', { required: true })} className="input-field">
                <option value="">Select Type</option>
                {EXAM_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Academic Session *</label>
              <input {...register('academicSession', { required: true })} className="input-field" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Class *</label>
              <select {...register('class', { required: true })} className="input-field">
                <option value="">Select Class</option>
                {CLASSES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Section *</label>
              <select {...register('section', { required: true })} className="input-field">
                <option value="">Select Section</option>
                {SECTIONS.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Start Date</label>
              <input type="date" {...register('startDate')} className="input-field" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">End Date</label>
              <input type="date" {...register('endDate')} className="input-field" />
            </div>
          </div>

          {/* Subjects */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Subjects *</label>
              <button
                type="button"
                onClick={() => append({ name: '', maxMarks: 100, passingMarks: 33 })}
                className="text-xs text-primary-600 hover:text-primary-700 font-medium flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" /> Add Subject
              </button>
            </div>

            <div className="space-y-2">
              <div className="grid grid-cols-12 gap-2 text-xs font-medium text-slate-500 dark:text-slate-400 px-1">
                <span className="col-span-5">Subject Name</span>
                <span className="col-span-3">Max Marks</span>
                <span className="col-span-3">Pass Marks</span>
                <span className="col-span-1"></span>
              </div>
              {fields.map((field, idx) => (
                <div key={field.id} className="grid grid-cols-12 gap-2 items-center">
                  <input
                    {...register(`subjects.${idx}.name`, { required: true })}
                    className="input-field col-span-5 py-1.5 text-sm"
                    placeholder="e.g. Mathematics"
                  />
                  <input
                    type="number"
                    {...register(`subjects.${idx}.maxMarks`, { required: true, min: 1, valueAsNumber: true })}
                    className="input-field col-span-3 py-1.5 text-sm"
                    defaultValue={100}
                  />
                  <input
                    type="number"
                    {...register(`subjects.${idx}.passingMarks`, { required: true, min: 0, valueAsNumber: true })}
                    className="input-field col-span-3 py-1.5 text-sm"
                    defaultValue={33}
                  />
                  <button
                    type="button"
                    onClick={() => fields.length > 1 && remove(idx)}
                    className="col-span-1 flex justify-center text-red-400 hover:text-red-600"
                    disabled={fields.length === 1}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="flex gap-3 pt-2 border-t border-slate-200 dark:border-slate-700">
            <button type="button" onClick={onClose} className="btn-primary flex-1 bg-slate-200 text-slate-700 hover:bg-slate-300 dark:bg-slate-700 dark:text-slate-200 shadow-none">Cancel</button>
            <button type="submit" disabled={isSaving} className="btn-primary flex-1">{isSaving ? 'Creating...' : 'Create Exam'}</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateExamModal;
