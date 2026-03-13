import { useState, useEffect, useCallback, useRef } from 'react';
import { toast } from 'react-toastify';
import {
  HiOutlineCloudUpload,
  HiOutlineDocumentText,
  HiOutlineTrash,
  HiOutlineCheckCircle,
  HiOutlineExclamationCircle,
  HiOutlineSparkles,
  HiOutlineAcademicCap,
  HiOutlineBriefcase,
  HiOutlineRefresh,
} from 'react-icons/hi';
import { uploadResume, getMyResume, analyzeResume, deleteResume } from '../../services/resumeService';
import useAuth from '../../hooks/useAuth';

export default function ResumeUpload() {
  const { user, loadUser } = useAuth();
  
  const [file, setFile] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  
  const [currentResume, setCurrentResume] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [loading, setLoading] = useState(true);

  const fileInputRef = useRef(null);

  /* ── Fetch Current Resume ── */
  const fetchResume = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await getMyResume();
      setCurrentResume(data.data?.resume || null);
    } catch (error) {
      if (error.response?.status !== 404) {
        toast.error('Failed to load resume details.');
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchResume();
  }, [fetchResume]);

  /* ── Drag & Drop Handlers ── */
  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      validateAndSetFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      validateAndSetFile(e.target.files[0]);
    }
  };

  const validateAndSetFile = (selectedFile) => {
    if (selectedFile.type !== 'application/pdf') {
      toast.error('Please upload a valid PDF file.');
      return;
    }
    if (selectedFile.size > 5 * 1024 * 1024) { // 5MB limit
      toast.error('File size must be less than 5MB.');
      return;
    }
    setFile(selectedFile);
    setProgress(0);
  };

  /* ── API Actions ── */
  const handleUpload = async () => {
    if (!file) return;

    const formData = new FormData();
    formData.append('resume', file);

    setUploading(true);
    setProgress(0);

    try {
      await uploadResume(formData, (progressEvent) => {
        const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
        setProgress(percentCompleted);
      });
      
      // Auto-analyze right after successful upload
      setAnalyzing(true);
      try {
        await analyzeResume();
      } catch (analyzeErr) {
        console.error('Auto-analysis failed:', analyzeErr);
      } finally {
        setAnalyzing(false);
      }

      toast.success('Resume uploaded and analyzed successfully!');
      setFile(null);
      await fetchResume();
      await loadUser(); // Update auth context if user.profile is returned
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to upload resume.');
      setProgress(0);
    } finally {
      setUploading(false);
    }
  };

  const handleAnalyze = async () => {
    setAnalyzing(true);
    try {
      await analyzeResume();
      toast.success('Resume analyzed successfully!');
      await fetchResume();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to analyze resume.');
    } finally {
      setAnalyzing(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete your resume?')) return;
    
    try {
      await deleteResume();
      setCurrentResume(null);
      setFile(null);
      toast.success('Resume deleted successfully.');
      await loadUser();
    } catch (error) {
      toast.error('Failed to delete resume.');
    }
  };

  /* ═══════════════════ RENDER ═══════════════════ */
  return (
    <div className="max-w-4xl mx-auto px-4 py-8 sm:py-12">
      <div className="text-center mb-10">
        <h1 className="text-3xl font-extrabold text-surface-900 tracking-tight">Resume Management</h1>
        <p className="mt-2 text-surface-500">Upload your ATS-friendly PDF to get perfectly matched with jobs</p>
      </div>

      <div className="space-y-8">
        {/* ═══════ UPLOAD SECTION ═══════ */}
        {!currentResume && (
          <div className="bg-white rounded-2xl shadow-sm border border-surface-100 p-6 sm:p-10">
            <h2 className="text-xl font-bold text-surface-900 mb-6">Upload New Resume</h2>
            
            <form
              className={`relative border-2 border-dashed rounded-2xl p-10 text-center transition-all duration-300
                ${dragActive ? 'border-primary-500 bg-primary-50' : 'border-surface-200 hover:bg-surface-50'}
                ${file ? 'border-primary-500 bg-primary-50/30' : ''}
              `}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf"
                className="hidden"
                onChange={handleChange}
                disabled={uploading}
              />
              
              {!file ? (
                <div className="space-y-4">
                  <div className="w-16 h-16 rounded-full bg-primary-100 text-primary-600 flex items-center justify-center mx-auto">
                    <HiOutlineCloudUpload className="w-8 h-8" />
                  </div>
                  <div>
                    <p className="text-lg font-semibold text-surface-700">Drag & drop your PDF here</p>
                    <p className="text-sm text-surface-500 mt-1">or click to browse from your device</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="mt-4 px-6 py-2.5 rounded-xl bg-primary-600 text-white font-semibold text-sm hover:bg-primary-700 transition-colors"
                  >
                    Select File
                  </button>
                  <p className="text-xs text-surface-400 mt-2">Maximum file size: 5MB</p>
                </div>
              ) : (
                <div className="max-w-md mx-auto">
                  <div className="flex items-center justify-center gap-3 mb-6">
                    <HiOutlineDocumentText className="w-10 h-10 text-primary-500" />
                    <div className="text-left w-full overflow-hidden">
                      <p className="font-semibold text-surface-800 truncate">{file.name}</p>
                      <p className="text-sm text-surface-500">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                    </div>
                    {!uploading && (
                      <button
                        type="button"
                        onClick={() => setFile(null)}
                        className="p-2 rounded-lg text-surface-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                        title="Remove file"
                      >
                        <HiOutlineTrash className="w-5 h-5" />
                      </button>
                    )}
                  </div>

                  {/* Progress Bar */}
                  {uploading && (
                    <div className="mb-6">
                      <div className="flex justify-between text-xs font-medium text-surface-600 mb-1">
                        <span>Uploading...</span>
                        <span>{progress}%</span>
                      </div>
                      <div className="w-full bg-surface-200 rounded-full h-2 overflow-hidden">
                        <div
                          className="bg-primary-600 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                    </div>
                  )}

                  <button
                    type="button"
                    onClick={handleUpload}
                    disabled={uploading}
                    className="w-full py-3 rounded-xl bg-primary-600 text-white font-bold text-sm hover:bg-primary-700 
                      disabled:opacity-70 shadow-lg shadow-primary-200 transition-all flex items-center justify-center gap-2"
                  >
                    {uploading ? (
                      <>
                        <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                        </svg>
                        Uploading...
                      </>
                    ) : (
                      <>
                        <HiOutlineCloudUpload className="w-5 h-5" />
                        Confirm Upload
                      </>
                    )}
                  </button>
                </div>
              )}
            </form>
          </div>
        )}

        {/* ═══════ CURRENT RESUME & ANALYSIS ═══════ */}
        {loading ? (
          <div className="bg-white rounded-2xl shadow-sm border border-surface-100 p-8 animate-pulse text-center space-y-4">
            <div className="h-8 w-48 bg-surface-200 rounded mx-auto" />
            <div className="h-4 w-64 bg-surface-200 rounded mx-auto" />
          </div>
        ) : currentResume && (
          <div className="space-y-6">
            {/* Active Resume Card */}
            <div className="bg-white rounded-2xl shadow-sm border border-surface-100 overflow-hidden">
              <div className="p-6 sm:p-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                    <HiOutlineDocumentText className="w-8 h-8" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-surface-900 flex items-center gap-2">
                      Active Resume
                      <HiOutlineCheckCircle className="w-5 h-5 text-emerald-500" title="ATS Ready" />
                    </h3>
                    <p className="text-sm text-surface-500 break-all truncate w-48 sm:w-auto">
                      {currentResume.fileName || currentResume.publicUrl?.split('/').pop() || 'resume.pdf'}
                    </p>
                    <p className="text-xs text-surface-400 mt-0.5">
                      Uploaded on {new Date(currentResume.uploadedAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <a
                    href={currentResume.publicUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-2.5 rounded-xl border border-surface-200 text-surface-700 font-semibold text-sm hover:bg-surface-50 transition-all flex items-center gap-2"
                  >
                    View PDF
                  </a>
                  <button
                    onClick={handleDelete}
                    className="p-2.5 rounded-xl border border-red-200 text-red-600 hover:bg-red-50 transition-all"
                    title="Delete resume"
                  >
                    <HiOutlineTrash className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Action Banner for unanalyzed resumes */}
              {(!currentResume.skills || currentResume.skills.length === 0) && (
                <div className="bg-amber-50 border-t border-amber-100 p-4 sm:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
                  <p className="text-sm text-amber-700 flex items-center gap-2">
                    <HiOutlineExclamationCircle className="w-5 h-5 flex-shrink-0" />
                    Your resume hasn't been analyzed for keyword matching yet.
                  </p>
                  <button
                    onClick={handleAnalyze}
                    disabled={analyzing}
                    className="w-full sm:w-auto px-5 py-2 rounded-lg bg-amber-500 text-white font-bold text-xs hover:bg-amber-600 disabled:opacity-70 transition-all flex items-center justify-center gap-1.5"
                  >
                    {analyzing ? 'Analyzing...' : <><HiOutlineSparkles className="w-4 h-4" /> Analyze Now</>}
                  </button>
                </div>
              )}
            </div>

            {/* Analysis Results */}
            {currentResume.skills?.length > 0 && (
              <div className="bg-white rounded-2xl shadow-sm border border-surface-100 p-6 sm:p-8">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                  <h3 className="text-xl font-bold text-surface-900 flex items-center gap-2">
                    <HiOutlineSparkles className="w-6 h-6 text-primary-500" />
                    AI Profile Extraction
                  </h3>
                  <button
                    onClick={handleAnalyze}
                    disabled={analyzing}
                    className="text-sm text-primary-600 hover:text-primary-800 font-medium flex items-center gap-1.5"
                  >
                    <HiOutlineRefresh className={`w-4 h-4 ${analyzing ? 'animate-spin' : ''}`} />
                    Re-analyze
                  </button>
                </div>

                <div className="grid md:grid-cols-2 gap-8">
                  {/* Skills Map */}
                  <div>
                    <h4 className="flex items-center gap-2 font-semibold text-surface-800 mb-3">
                      <span className="w-8 h-8 rounded-lg bg-primary-50 text-primary-600 flex items-center justify-center text-sm">🧩</span>
                      Detected Skills
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {currentResume.skills.map(skill => (
                        <span key={skill} className="px-3 py-1.5 rounded-full bg-primary-50 border border-primary-100 text-primary-700 text-xs font-medium capitalize">
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-6">
                    {/* Education */}
                    {currentResume.parsedData?.education?.length > 0 && (
                      <div>
                        <h4 className="flex items-center gap-2 font-semibold text-surface-800 mb-3">
                          <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
                            <HiOutlineAcademicCap className="w-5 h-5" />
                          </div>
                          Education Mentions
                        </h4>
                        <ul className="space-y-2">
                          {currentResume.parsedData.education.map((edu, idx) => (
                            <li key={idx} className="text-sm text-surface-600 flex items-start gap-2">
                              <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 mt-1.5 flex-shrink-0" />
                              {edu}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Jobs/Experience Mentions */}
                    {currentResume.parsedData?.experience?.length > 0 && (
                      <div>
                        <h4 className="flex items-center gap-2 font-semibold text-surface-800 mb-3">
                          <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                            <HiOutlineBriefcase className="w-5 h-5" />
                          </div>
                          Experience Mentions
                        </h4>
                        <ul className="space-y-2">
                          {currentResume.parsedData.experience.slice(0, 5).map((exp, idx) => (
                            <li key={idx} className="text-sm text-surface-600 flex items-start gap-2">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-1.5 flex-shrink-0" />
                              <span className="line-clamp-2">{exp}</span>
                            </li>
                          ))}
                        </ul>
                        {currentResume.parsedData.experience.length > 5 && (
                          <p className="text-xs text-surface-400 mt-2 italic flex items-center gap-1">
                            + {currentResume.parsedData.experience.length - 5} more segments detected.
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
