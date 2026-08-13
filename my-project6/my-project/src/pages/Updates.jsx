import { API_BASE_URL } from '../config/api';
import React, { useEffect, useState } from 'react';
import axios from 'axios';

const SOCKET_URL = `${API_BASE_URL}`;

export default function Updates() {
  const [notices, setNotices] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [emails, setEmails] = useState([]);

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [nRes, aRes, eRes] = await Promise.all([
          axios.get(`${SOCKET_URL}/admin/communication-system/notice`),
          axios.get(`${SOCKET_URL}/admin/communication-system/announcement`),
          axios.get(`${SOCKET_URL}/admin/communication-system/email`),
        ]);
        setNotices(nRes.data || []);
        setAnnouncements(aRes.data || []);
        setEmails(eRes.data || []);
      } catch (err) {
        console.error('Failed to fetch updates', err);
      }
    };
    fetchAll();
  }, []);

  return (
    <div className="max-w-6xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Company Updates</h1>
      <section className="mb-6">
        <h2 className="text-xl font-semibold mb-2">Notices</h2>
        {notices.length === 0 ? <p className="text-slate-500">No notices</p> : notices.map(n => (
          <div key={n.id} className="border rounded p-3 bg-white mb-2">
            <div className="font-semibold">{n.title}</div>
            <div className="text-sm text-slate-600">{n.content}</div>
          </div>
        ))}
      </section>

      <section className="mb-6">
        <h2 className="text-xl font-semibold mb-2">Announcements</h2>
        {announcements.length === 0 ? <p className="text-slate-500">No announcements</p> : announcements.map(a => (
          <div key={a.id} className="border rounded p-3 bg-white mb-2">
            <div className="font-semibold">{a.title}</div>
            <div className="text-sm text-slate-600">{a.content}</div>
          </div>
        ))}
      </section>

      <section>
        <h2 className="text-xl font-semibold mb-2">Emails</h2>
        {emails.length === 0 ? <p className="text-slate-500">No emails</p> : emails.map(e => (
          <div key={e.id} className="border rounded p-3 bg-white mb-2">
            <div className="font-semibold">{e.subject}</div>
            <div className="text-sm text-slate-600">{e.message}</div>
          </div>
        ))}
      </section>
    </div>
  );
}
