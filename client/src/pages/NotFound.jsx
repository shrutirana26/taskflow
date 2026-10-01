import React from 'react';
import { Link } from 'react-router-dom';
import { HiOutlineHome, HiOutlineExclamationCircle } from 'react-icons/hi';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center p-6 text-center transition-colors duration-200">
      <div className="max-w-md w-full bg-white dark:bg-slate-900 p-8 sm:p-10 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xl">
        <div className="w-16 h-16 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mx-auto mb-4">
          <HiOutlineExclamationCircle className="w-9 h-9" />
        </div>
        <h1 className="text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight mb-2">
          404
        </h1>
        <h2 className="text-xl font-bold text-slate-800 dark:text-slate-200 mb-2">
          Page Not Found
        </h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 mb-6 leading-relaxed">
          The page you are looking for doesn't exist, has been moved, or you may have entered an incorrect URL.
        </p>
        <Link
          to="/dashboard"
          className="inline-flex items-center justify-center gap-2 w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-xl text-sm shadow-md shadow-indigo-500/20 transition-all duration-200"
        >
          <HiOutlineHome className="w-4 h-4" />
          <span>Back to Dashboard</span>
        </Link>
      </div>
    </div>
  );
}
