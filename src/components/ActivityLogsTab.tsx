import React, { useState, useEffect } from 'react';
import { collection, query, orderBy, limit, getDocs, where, deleteDoc, doc, startAfter } from 'firebase/firestore';
import { db } from '../firebase';
import { Activity, Loader2, Search, Trash2, Calendar } from 'lucide-react';
import { handleFirestoreError, OperationType } from '../services/firestore-errors';

const ActivityLogsTab = ({ allUsers }: { allUsers: any[] }) => {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [daysFilter, setDaysFilter] = useState<number | 'all'>('all');
  const [deletingLogs, setDeletingLogs] = useState(false);
  const [deleteDays, setDeleteDays] = useState<number>(30);

  useEffect(() => {
    loadLogs();
  }, []);

  const loadLogs = async () => {
    setLoading(true);
    try {
      const q = query(
        collection(db, 'tokenTransactions'),
        where('type', '==', 'usage'),
        orderBy('createdAt', 'desc'),
        limit(500)
      );
      const snap = await getDocs(q);
      const data = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setLogs(data);
    } catch (e) {
      console.error("Error loading logs", e);
      handleFirestoreError(e, OperationType.LIST, 'tokenTransactions');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteLogs = async () => {
    const msg = deleteDays === 0 
      ? 'هل أنت متأكد من حذف كافة السجلات؟\nلا يمكن التراجع عن هذا الإجراء.' 
      : `هل أنت متأكد من حذف السجلات الأقدم من ${deleteDays} يوم؟\nلا يمكن التراجع عن هذا الإجراء.`;
    if (!window.confirm(msg)) return;
    
    setDeletingLogs(true);
    try {
       const cutoff = new Date();
       // Adjust hours to make sure we don't accidentally miss today's if 0 is selected
       if (deleteDays === 0) {
           cutoff.setHours(23, 59, 59, 999);
       } else {
           cutoff.setDate(cutoff.getDate() - deleteDays);
       }
       const cutoffIso = cutoff.toISOString();
       console.log("Delete cutoff ISO:", cutoffIso);
       
       let deletedCount = 0;
       let hasMore = true;
       let lastDoc: any = null;

       while (hasMore) {
         // Query only 500 documents at a time to prevent quota bursts
         let q = query(
           collection(db, 'tokenTransactions'),
           where('createdAt', '<', cutoffIso),
           orderBy('createdAt', 'asc'),
           limit(500)
         );
         
         if (lastDoc) {
             q = query(
               collection(db, 'tokenTransactions'),
               where('createdAt', '<', cutoffIso),
               orderBy('createdAt', 'asc'),
               startAfter(lastDoc),
               limit(500)
             );
         }
         
         const snap = await getDocs(q);
         console.log("Docs found in query:", snap.docs.length);
         if (snap.empty) {
           hasMore = false;
           break;
         }
         
         lastDoc = snap.docs[snap.docs.length - 1];
         // Only delete 'usage' type transactions from Activity Logs
         const docsToDelete = snap.docs.filter(d => d.data().type === 'usage');
         console.log("Docs to delete (usage type):", docsToDelete.length);
         const deletePromises = docsToDelete.map(d => deleteDoc(doc(db, 'tokenTransactions', d.id)));
         
         if (deletePromises.length > 0) {
            await Promise.all(deletePromises);
            deletedCount += deletePromises.length;
         }
       }
       
       alert(`تم حذف ${deletedCount} سجل بنجاح.`);
       await loadLogs();
    } catch (e: any) {
       console.error("Error deleting logs", e);
       
       // Handle missing index error by alerting the user
       if (e.message && e.message.includes("requires an index")) {
          alert("خطأ: يرجى إنشاء الفهرس المطلوب في Firestore للحذف. انظر الـ Console للرابط.");
       } else {
          handleFirestoreError(e, OperationType.DELETE, 'tokenTransactions');
       }
    } finally {
       setDeletingLogs(false);
    }
  };

  const deleteSingleLog = async (id: string) => {
    if (!window.confirm("هل أنت متأكد من حذف هذا السجل؟")) return;
    try {
      await deleteDoc(doc(db, 'tokenTransactions', id));
      setLogs(prev => prev.filter(log => log.id !== id));
    } catch (e: any) {
      console.error("Error deleting log", e);
      handleFirestoreError(e, OperationType.DELETE, 'tokenTransactions/' + id);
    }
  };

  const filteredLogs = logs.filter(log => {
      const matchSearch = log.userEmail?.toLowerCase().includes(searchQuery.toLowerCase()) || 
          log.feature?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          log.productName?.toLowerCase().includes(searchQuery.toLowerCase());
          
      let matchDays = true;
      if (daysFilter !== 'all') {
         const cutoff = new Date();
         cutoff.setDate(cutoff.getDate() - daysFilter);
         matchDays = new Date(log.createdAt) >= cutoff;
      }
      
      return matchSearch && matchDays;
  });

  return (
    <div className="space-y-6">
      <div className="mb-6 flex flex-col gap-4">
        <div>
          <h3 className="text-xl font-bold text-[#09090b] dark:text-white mb-2 flex items-center gap-2">
            <Activity className="w-5 h-5 text-[#09090b]" />
            سجل النشاطات (Activity Logs)
          </h3>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">تابع نشاط المستخدمين وعمليات توليد المحتوى.</p>
        </div>
        
        <div className="flex flex-col xl:flex-row gap-4 xl:items-center justify-between bg-zinc-50 dark:bg-zinc-800/50 p-4 rounded-xl border border-zinc-200 dark:border-zinc-700/50">
          <div className="flex gap-4 flex-col sm:flex-row flex-1">
            <div className="relative flex-1 max-w-sm">
               <Search className="w-4 h-4 text-zinc-400 absolute right-3 top-1/2 -translate-y-1/2" />
               <input 
                 type="text" 
                 value={searchQuery}
                 onChange={e => setSearchQuery(e.target.value)}
                 placeholder="ابحث بالايميل أو القسم..."
                 className="pr-10 pl-4 py-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700/50 rounded-lg focus:ring-2 focus:ring-[#09090b]/50 outline-none transition-colors text-sm w-full"
               />
            </div>
            
            <div className="relative">
               <Calendar className="w-4 h-4 text-zinc-400 absolute right-3 top-1/2 -translate-y-1/2" />
               <select
                  value={daysFilter}
                  onChange={(e) => setDaysFilter(e.target.value === 'all' ? 'all' : Number(e.target.value))}
                  className="pr-10 pl-4 py-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700/50 rounded-lg focus:ring-2 focus:ring-[#09090b]/50 outline-none transition-colors text-sm"
               >
                  <option value="all">كل الأيام</option>
                  <option value="1">آخر 24 ساعة</option>
                  <option value="7">آخر 7 أيام</option>
                  <option value="30">آخر 30 يوم</option>
               </select>
            </div>
          </div>
          
          <div className="flex items-center gap-2 pt-4 xl:pt-0 border-t xl:border-t-0 border-zinc-200 dark:border-zinc-700/50 xl:border-r xl:pr-4 dark:xl:border-zinc-700/50">
             <span className="text-sm font-medium text-zinc-600 dark:text-zinc-400 whitespace-nowrap">حذف الأقدم من:</span>
             <input 
                type="number"
                min="0"
                value={deleteDays}
                onChange={e => setDeleteDays(Number(e.target.value))}
                className="w-16 px-2 py-1.5 text-center bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700/50 rounded-lg outline-none focus:ring-2 focus:ring-rose-500/50 text-sm"
             />
             <span className="text-sm text-zinc-500">يوم</span>
             <button
                onClick={handleDeleteLogs}
                disabled={deletingLogs}
                className="flex items-center gap-1.5 bg-rose-500/10 text-rose-600 hover:bg-rose-500/20 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
             >
                {deletingLogs ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                حذف
             </button>
          </div>
        </div>
      </div>
      
      <div className="overflow-x-auto bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl">
        {loading ? (
          <div className="p-12 flex justify-center">
            <Loader2 className="w-8 h-8 text-[#09090b] animate-spin" />
          </div>
        ) : (
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-zinc-50 dark:bg-zinc-800/50 text-zinc-600 dark:text-zinc-400 border-b border-zinc-200 dark:border-zinc-800">
               <tr>
                  <th className="p-4 rounded-tr-lg">الإيميل (Email)</th>
                  <th className="p-4">القسم (Section)</th>
                  <th className="p-4">المنتج (Product)</th>
                  <th className="p-4">اللينك / المدخل (Link)</th>
                  <th className="p-4">التوكينز (Tokens)</th>
                  <th className="p-4">التاريخ (Date)</th>
                  <th className="p-4 rounded-tl-lg text-center">إجراءات</th>
               </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
               {filteredLogs.map((log) => {
                 return (
                 <tr key={log.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/30 transition-colors">
                    <td className="p-4">
                      <div className="font-medium text-[#09090b] dark:text-white">{log.userEmail}</div>
                    </td>
                    <td className="p-4">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#09090b]/10 text-[#09090b] border border-[#09090b]/20">
                        {log.feature}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="font-medium text-zinc-700 dark:text-zinc-300">
                        {log.productName || '-'}
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="max-w-[200px] truncate text-zinc-500 dark:text-zinc-400" title={log.link}>
                        {log.link || '-'}
                      </div>
                    </td>
                    <td className="p-4 font-mono text-zinc-600 dark:text-zinc-300">
                      {log.amount}
                    </td>
                    <td className="p-4 text-xs text-zinc-500">
                      {new Date(log.createdAt).toLocaleString('ar-EG', { dateStyle: 'medium', timeStyle: 'short' })}
                    </td>
                    <td className="p-4 text-center">
                       <button
                         onClick={() => deleteSingleLog(log.id)}
                         className="p-1.5 text-zinc-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10 rounded transition-colors"
                         title="حذف هذا السجل"
                       >
                         <Trash2 className="w-4 h-4" />
                       </button>
                    </td>
                 </tr>
                 );
               })}
               {filteredLogs.length === 0 && (
                 <tr>
                    <td colSpan={7} className="p-8 text-center text-zinc-500">
                       لا توجد نشاطات مسجلة حتى الآن
                    </td>
                 </tr>
               )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default ActivityLogsTab;
