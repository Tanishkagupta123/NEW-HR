import { API_BASE_URL } from '../config/api';
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { MessageCircle, MessageSquare, Upload, RefreshCcw, AtSign, Clock, Bell, Send } from 'lucide-react';
import { io } from 'socket.io-client';
import axios from 'axios';
import { Link } from 'react-router-dom';

const SOCKET_URL = `${API_BASE_URL}`;

export default function TeamCollaboration({ defaultPanel = null }) {
  const location = useLocation();
  const navigate = useNavigate();
  const isAdminPath = location.pathname.startsWith('/admin');
  const isAdminTeamCollab = location.pathname.startsWith('/admin/team-collaboration');
  const isAdminCommunication = location.pathname.startsWith('/admin/communication-system');
  const isDashboardCommunication = location.pathname === '/dashboard/communication-system';
  const isHRChatbot = location.pathname === '/dashboard/system';
  const [isEmployeeDashboardCommunication, setIsEmployeeDashboardCommunication] = useState(false);
  const [user, setUser] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [myId, setMyId] = useState('');
  const [otherId, setOtherId] = useState('');
  const [role, setRole] = useState('');
  const [room, setRoom] = useState('');
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const canCreateGroup = ['admin', 'tl'].includes(role);
  const [employees, setEmployees] = useState([]);
  const [selectedEmployee, setSelectedEmployee] = useState('');
  const [groupInput, setGroupInput] = useState('');
  const [selectedGroupMembers, setSelectedGroupMembers] = useState([]);
  const [groupChats, setGroupChats] = useState([]);
  const [dashboardCounts] = useState({ notices: 12, chats: 24, announcements: 8, emails: 5 });
  const [activeCommunicationPanel, setActiveCommunicationPanel] = useState(null);
  const [noticeForm, setNoticeForm] = useState({ title: '', content: '', priority: 'Normal', expiry: '', department: 'All', attachment: '' });
  const [notices, setNotices] = useState([]);
  const [editingNoticeId, setEditingNoticeId] = useState(null);
  const [announcementForm, setAnnouncementForm] = useState({ title: '', content: '', priority: 'Normal', scheduleDate: '', department: 'All', attachment: '' });
  const [announcements, setAnnouncements] = useState([]);
  const [editingAnnouncementId, setEditingAnnouncementId] = useState(null);
  const [emailForm, setEmailForm] = useState({ eventType: 'Welcome', recipientGroup: 'All Employees', subject: '', message: '', attachment: '' });
  const [emailHistory, setEmailHistory] = useState([]);
  const [updatesCounts, setUpdatesCounts] = useState({ notices: 0, announcements: 0, emails: 0 });
  const socketRef = useRef(null);

  useEffect(() => {
    const pathParts = location.pathname.split('/');
    const panel = pathParts[3];
    if (panel === 'notice' || panel === 'announcement' || panel === 'email') {
      setActiveCommunicationPanel(panel);
    } else {
      setActiveCommunicationPanel(defaultPanel);
    }
  }, [location.pathname, defaultPanel]);

  const resetNoticeForm = () => {
    setNoticeForm({ title: '', content: '', priority: 'Normal', expiry: '', department: 'All', attachment: '' });
    setEditingNoticeId(null);
  };

  const handleNoticeChange = (field, value) => {
    setNoticeForm((prev) => ({ ...prev, [field]: value }));
  };

  const fetchNotices = async () => {
    try {
      const response = await axios.get(`${SOCKET_URL}/admin/communication-system/notice`);
      setNotices(response.data || []);
    } catch (error) {
      console.error('Failed to fetch notices', error);
    }
  };

  const fetchUpdatesCounts = async () => {
    try {
      const [nRes, aRes, eRes] = await Promise.all([
        axios.get(`${SOCKET_URL}/admin/communication-system/notice`),
        axios.get(`${SOCKET_URL}/admin/communication-system/announcement`),
        axios.get(`${SOCKET_URL}/admin/communication-system/email`),
      ]);
      setUpdatesCounts({
        notices: (nRes.data || []).length,
        announcements: (aRes.data || []).length,
        emails: (eRes.data || []).length,
      });
    } catch (err) {
      console.error('Failed to fetch updates counts', err);
    }
  };

  const saveNotice = async () => {
    if (!noticeForm.title.trim() || !noticeForm.content.trim()) {
      alert('Title aur Content zaroori hain.');
      return;
    }
    try {
      const token = localStorage.getItem('token');
      if (editingNoticeId) {
        const response = await axios.put(
          `${SOCKET_URL}/admin/communication-system/notice/${editingNoticeId}`,
          noticeForm,
          { headers: { 'Authorization': `Bearer ${token}` } }
        );
        setNotices((prev) => prev.map((notice) => notice.id === editingNoticeId ? response.data : notice));
        resetNoticeForm();
        return;
      }
      const response = await axios.post(
        `${SOCKET_URL}/admin/communication-system/notice`,
        noticeForm,
        { headers: { 'Authorization': `Bearer ${token}` } }
      );
      setNotices((prev) => [response.data, ...prev]);
      resetNoticeForm();
    } catch (error) {
      console.error('Failed to save notice', error);
      alert('Notice save failed: ' + (error.response?.data?.error || error.message));
    }
  };

  const editNotice = (notice) => {
    setEditingNoticeId(notice.id);
    setNoticeForm({
      title: notice.title,
      content: notice.content,
      priority: notice.priority,
      expiry: notice.expiry,
      department: notice.department,
      attachment: notice.attachment,
    });
  };

  const deleteNotice = async (id) => {
    const isConfirmed = await window.confirm('Kya aap sure hain ki aap ye notice delete karna chahte hain?');
    if (isConfirmed) {
      try {
        const token = localStorage.getItem('token');
        await axios.delete(
          `${SOCKET_URL}/admin/communication-system/notice/${id}`,
          { headers: { 'Authorization': `Bearer ${token}` } }
        );
        setNotices((prev) => prev.filter((notice) => notice.id !== id));
      } catch (error) {
        console.error('Failed to delete notice', error);
        alert('Delete failed');
      }
    }
  };

  const togglePin = async (id) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.patch(
        `${SOCKET_URL}/admin/communication-system/notice/${id}/pin`,
        {},
        { headers: { 'Authorization': `Bearer ${token}` } }
      );
      setNotices((prev) => prev.map((notice) => notice.id === id ? response.data : notice));
    } catch (error) {
      console.error('Failed to toggle pin', error);
    }
  };

  const resetAnnouncementForm = () => {
    setAnnouncementForm({ title: '', content: '', priority: 'Normal', scheduleDate: '', department: 'All', attachment: '' });
    setEditingAnnouncementId(null);
  };

  const handleAnnouncementChange = (field, value) => {
    setAnnouncementForm((prev) => ({ ...prev, [field]: value }));
  };

  const fetchAnnouncements = async () => {
    try {
      const response = await axios.get(`${SOCKET_URL}/admin/communication-system/announcement`);
      setAnnouncements(response.data || []);
    } catch (error) {
      console.error('Failed to fetch announcements', error);
    }
  };

  const saveAnnouncement = async () => {
    if (!announcementForm.title.trim() || !announcementForm.content.trim()) {
      alert('Announcement title aur content zaroori hain.');
      return;
    }
    try {
      const token = localStorage.getItem('token');
      if (editingAnnouncementId) {
        const response = await axios.put(
          `${SOCKET_URL}/admin/communication-system/announcement/${editingAnnouncementId}`,
          announcementForm,
          { headers: { 'Authorization': `Bearer ${token}` } }
        );
        setAnnouncements((prev) => prev.map((item) => item.id === editingAnnouncementId ? response.data : item));
        resetAnnouncementForm();
        return;
      }
      const response = await axios.post(
        `${SOCKET_URL}/admin/communication-system/announcement`,
        announcementForm,
        { headers: { 'Authorization': `Bearer ${token}` } }
      );
      setAnnouncements((prev) => [response.data, ...prev]);
      resetAnnouncementForm();
    } catch (error) {
      console.error('Failed to save announcement', error);
      alert('Announcement save failed: ' + (error.response?.data?.error || error.message));
    }
  };

  const editAnnouncement = (announcement) => {
    setEditingAnnouncementId(announcement.id);
    setAnnouncementForm({
      title: announcement.title,
      content: announcement.content,
      priority: announcement.priority,
      scheduleDate: announcement.scheduleDate,
      department: announcement.department,
      attachment: announcement.attachment,
    });
  };

  const deleteAnnouncement = async (id) => {
    const isConfirmed = await window.confirm('Kya aap sure hain ki aap ye announcement delete karna chahte hain?');
    if (isConfirmed) {
      try {
        const token = localStorage.getItem('token');
        await axios.delete(
          `${SOCKET_URL}/admin/communication-system/announcement/${id}`,
          { headers: { 'Authorization': `Bearer ${token}` } }
        );
        setAnnouncements((prev) => prev.filter((announcement) => announcement.id !== id));
      } catch (error) {
        console.error('Failed to delete announcement', error);
        alert('Delete failed');
      }
    }
  };

  const resetEmailForm = () => {
    setEmailForm({ eventType: 'Welcome', recipientGroup: 'All Employees', subject: '', message: '', attachment: '' });
  };

  const handleEmailChange = (field, value) => {
    setEmailForm((prev) => ({ ...prev, [field]: value }));
  };

  const fetchEmails = async () => {
    try {
      const response = await axios.get(`${SOCKET_URL}/admin/communication-system/email`);
      setEmailHistory(response.data || []);
    } catch (error) {
      console.error('Failed to fetch emails', error);
    }
  };

  const saveEmailNotification = async () => {
    if (!emailForm.subject.trim() || !emailForm.message.trim()) {
      alert('Subject aur message zaroori hain.');
      return;
    }
    try {
      const token = localStorage.getItem('token');
      const payload = {
        eventType: emailForm.eventType,
        recipientGroup: emailForm.recipientGroup,
        subject: emailForm.subject,
        message: emailForm.message,
        attachment: emailForm.attachment || null,
      };
      const response = await axios.post(
        `${SOCKET_URL}/admin/communication-system/email`,
        payload,
        { headers: { 'Authorization': `Bearer ${token}` } }
      );
      setEmailHistory((prev) => [{ ...response.data, sentOn: new Date().toLocaleDateString() }, ...prev]);
      resetEmailForm();
    } catch (error) {
      console.error('Failed to send email', error);
      alert('Email send failed: ' + (error.response?.data?.error || error.message));
    }
  };

  const currentRoomRef = useRef('');

  // Check if user is logged in
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        const userData = JSON.parse(storedUser);
        setUser(userData);
        setIsLoggedIn(true);
        const userRole = userData.role || 'employee';
        // Use a consistent identifier for admin so room names match between admin and employee
        const userId = userRole === 'admin' ? 'admin' : (userData.id || userData.name || 'employee');
        setMyId(userId);
        setRole(userRole);
        // For admin and tl leave otherId empty (they will select an employee/group)
        // For normal employees default otherId to 'admin' so chat targets admin
        setOtherId((userRole === 'admin' || userRole === 'tl') ? '' : 'admin');
      } catch (error) {
        console.error('Error parsing user data:', error);
        setIsLoggedIn(false);
      }
    } else {
      setIsLoggedIn(false);
    }
  }, []);

  // Fetch all employees for admin and dashboard (to show names instead of ids)
  useEffect(() => {
    // Fetch employees on admin path, for TL, or on the dashboard communication system path
    if ((isAdminPath || role === 'tl' || isDashboardCommunication) && isLoggedIn) {
      fetchEmployees();
    }
  }, [isAdminPath, role, isLoggedIn, isDashboardCommunication]);

  const fetchEmployees = async () => {
    try {
      const response = await axios.get(`${SOCKET_URL}/employees`);
      if (response.data) {
        setEmployees(response.data);
        // Set first employee as default only for admin/tl path
        if (response.data.length > 0 && (isAdminPath || role === 'tl')) {
          setSelectedEmployee(response.data[0].id);
          setOtherId(response.data[0].id);
        }
      }
    } catch (error) {
      console.error('Failed to fetch employees', error);
    }
  };

  // Helper to map id -> display name
  const getNameById = (id) => {
    if (!id) return '';
    if (String(id) === 'admin') return 'Admin';
    if (String(id).startsWith('group_')) {
      const raw = String(id).replace('group_', '');
      return raw.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
    }
    if (user && (String(user.id) === String(id) || String(user.name) === String(id))) return user.name || String(id);
    const emp = employees.find((e) => String(e.id) === String(id) || String(e.employee_code) === String(id));
    return emp ? emp.name : String(id);
  };

  useEffect(() => {
    // Setup socket connection once
    if (!socketRef.current) {
      const socket = io(SOCKET_URL, {
        reconnection: true,
        reconnectionDelay: 1000,
        reconnectionDelayMax: 5000,
        reconnectionAttempts: 5,
      });
      socketRef.current = socket;
      
      socket.on('connect', () => {
        console.log('Socket connected:', socket.id);
      });
      
      socket.on('receiveMessage', (m) => {
        console.log('Received message:', m, 'For room:', currentRoomRef.current);
        // Add message if it's for the current room
        if (m && m.room === currentRoomRef.current) {
          setMessages((s) => {
            // Prevent duplicates
            const isDuplicate = s.some(msg => msg.id === m.id && msg.id);
            if (isDuplicate) return s;
            return [...s, m];
          });
        }
      });

      socket.on('disconnect', () => {
        console.log('Socket disconnected');
      });
    }
    
    return () => {
      // Don't disconnect on unmount to keep socket alive
    };
  }, []);

  // Update room ref whenever room changes
  useEffect(() => {
    currentRoomRef.current = room;
  }, [room]);

  // Fetch communication data when component mounts or admin path changes
  useEffect(() => {
    if (isAdminCommunication && isLoggedIn) {
      fetchNotices();
      fetchAnnouncements();
      fetchEmails();
    }
  }, [isAdminCommunication, isLoggedIn]);

  // Fetch notices for dashboard communication view (read-only for employees)
  useEffect(() => {
    if (!isDashboardCommunication) return;
    const employeeOnly = !(user && (user.role === 'admin' || user.role === 'tl'));
    setIsEmployeeDashboardCommunication(employeeOnly);
    if (isLoggedIn && !employeeOnly) {
      fetchNotices();
      fetchAnnouncements();
      fetchEmails();
    }
    // fetch counts for the Announcement sidebar card for everyone
    fetchUpdatesCounts();
  }, [isDashboardCommunication, isLoggedIn, user]);

  const startChat = useCallback(async (targetOtherId) => {
    const chatOtherId = targetOtherId || otherId;
    if (!myId || !chatOtherId) return;
    const r = 'chat_' + [myId, chatOtherId].sort().join('_');
    setRoom(r);
    currentRoomRef.current = r;
    setOtherId(chatOtherId);
    setShowChat(true);

    // Join room with socket
    if (socketRef.current) {
      if (socketRef.current.connected) {
        socketRef.current.emit('join', r);
      } else {
        socketRef.current.once('connect', () => {
          socketRef.current.emit('join', r);
        });
      }
      console.log('Joining room:', r);
    }
    
    // load history
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`${SOCKET_URL}/admin/chat/history`, { 
        params: { room: r },
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      setMessages(res.data || []);
    } catch (err) {
      console.error('Failed to load chat history', err);
      if (err.response?.status === 401) {
        setIsLoggedIn(false);
        navigate('/');
      }
    }
  }, [myId, otherId]);

  const fetchGroupChats = useCallback(async () => {
    if (!myId) return;
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${SOCKET_URL}/admin/chat/groups`, {
        params: { userId: myId },
        headers: { 'Authorization': `Bearer ${token}` }
      });
      setGroupChats(response.data || []);
    } catch (err) {
      console.error('Failed to fetch groups', err);
    }
  }, [myId]);

  const startGroupChat = useCallback(async (groupRoomName) => {
    if (!groupRoomName) return;
    setRoom(groupRoomName);
    currentRoomRef.current = groupRoomName;
    setOtherId(groupRoomName);
    setShowChat(true);

    // Join room with socket
    if (socketRef.current) {
      if (socketRef.current.connected) {
        socketRef.current.emit('join', groupRoomName);
      } else {
        socketRef.current.once('connect', () => {
          socketRef.current.emit('join', groupRoomName);
        });
      }
      console.log('Joining group room:', groupRoomName);
    }
    
    // load history
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`${SOCKET_URL}/admin/chat/history`, { 
        params: { room: groupRoomName },
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      setMessages(res.data || []);
      fetchGroupChats();
    } catch (err) {
      console.error('Failed to load group chat history', err);
      if (err.response?.status === 401) {
        setIsLoggedIn(false);
        navigate('/');
      }
    }
  }, [SOCKET_URL, navigate, fetchGroupChats]);

  const handleGroupStart = () => {
    if (!groupInput.trim()) return;
    const requestedRoom = 'group_' + groupInput.trim().toLowerCase().replace(/\s+/g, '_');
    const existingGroup = groupChats.find((g) => String(g.room) === requestedRoom || String(g.name).toLowerCase() === groupInput.trim().toLowerCase());
    if (!existingGroup) {
      alert('Aap is group ke member nahi hain ya group exist nahi karta.');
      return;
    }
    startGroupChat(existingGroup.room);
    setGroupInput('');
  };

  useEffect(() => {
    if (isLoggedIn && myId) {
      fetchGroupChats();
    }
  }, [isLoggedIn, myId, fetchGroupChats]);

  const handleGroupCheckboxChange = (empId) => {
    setSelectedGroupMembers(prev => {
      const idStr = String(empId);
      if (prev.includes(idStr)) {
        return prev.filter(id => id !== idStr);
      } else {
        return [...prev, idStr];
      }
    });
  };

  const handleCreateGroupChat = async () => {
    if (!canCreateGroup) {
      alert('Sirf Admin aur TL hi group create kar sakte hain.');
      return;
    }
    if (!groupInput.trim()) {
      alert('Group Name input karein!');
      return;
    }
    if (selectedGroupMembers.length === 0) {
      alert('Kam se kam ek employee select karein!');
      return;
    }
    const roomName = 'group_' + groupInput.trim().toLowerCase().replace(/\s+/g, '_');
    const token = localStorage.getItem('token');
    
    // Automatically include creator in members if not already present
    const membersPayload = [...selectedGroupMembers];
    if (myId && !membersPayload.includes(String(myId))) {
      membersPayload.push(String(myId));
    }
    
    try {
      await axios.post(`${SOCKET_URL}/admin/chat/groups`, {
        room: roomName,
        name: groupInput.trim(),
        members: membersPayload,
      }, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      alert(`Group "${groupInput.trim()}" successfully created!`);
      setGroupInput('');
      setSelectedGroupMembers([]);
      fetchGroupChats();
      startGroupChat(roomName);
    } catch (err) {
      console.error('Failed to create group', err);
      alert('Group create karne me error aayi.');
    }
  };

  useEffect(() => {
    if (isLoggedIn && (location.pathname === '/dashboard/team-collaboration' || isHRChatbot)) {
      startChat();
    }
  }, [isLoggedIn, location.pathname, startChat, isHRChatbot]);

  const sendMessage = async () => {
    if (!input.trim()) return;
    
    // Calculate room if not set yet
    let messageRoom = room;
    if (!messageRoom) {
      messageRoom = 'chat_' + [myId, otherId].sort().join('_');
    }
    
    const payload = {
      room: messageRoom,
      senderId: myId,
      senderName: user?.name || myId,
      senderRole: role,
      message: input.trim(),
    };
    
    try {
      if (socketRef.current && socketRef.current.connected) {
        socketRef.current.emit('join', messageRoom);
        socketRef.current.emit('sendMessage', payload);
        setInput('');
        return;
      }

      const token = localStorage.getItem('token');
      const res = await axios.post(`${SOCKET_URL}/admin/chat/message`, payload, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      // Add the sent message to local state immediately
      if (res.data) {
        setMessages((prev) => {
          const isDuplicate = prev.some(msg => msg.id === res.data.id);
          if (isDuplicate) return prev;
          return [...prev, res.data];
        });
      }

      setInput('');
    } catch (err) {
      console.error('Send failed', err);
      if (err.response?.status === 401) {
        setIsLoggedIn(false);
        navigate('/');
      }
    }
  };

  // --- Shared style tokens (presentation-only, no logic here) ---
  const card = 'rounded-2xl border border-slate-200 bg-white p-6 shadow-sm';
  const inputBase = 'w-full rounded-lg border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm text-slate-800 outline-none placeholder:text-slate-400 focus:border-violet-500 focus:bg-white focus:ring-2 focus:ring-violet-100 transition';
  const labelBase = 'block text-xs font-medium uppercase tracking-wide text-slate-400 mb-1.5';
  const primaryBtn = 'rounded-lg bg-gradient-to-r from-violet-600 to-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:opacity-90 transition disabled:opacity-40 disabled:cursor-not-allowed';
  const outlineBtn = 'rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 transition';
  const successBtn = 'rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2.5 text-sm font-semibold transition';
  const pill = 'rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600 ring-1 ring-slate-200';

  const SectionIcon = ({ icon: Icon }) => (
    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-violet-600 to-indigo-600 text-white shadow-sm">
      <Icon size={18} />
    </div>
  );

  return (
    <div className="min-h-screen bg-[#F6F5FB] p-4 sm:p-6 md:p-8">
      {!isLoggedIn ? (
        <div className="mx-auto max-w-6xl rounded-2xl border border-slate-200 bg-white p-4 shadow-sm md:p-8">
          <div className="text-center">
            <h1 className="mb-3 text-2xl font-bold text-slate-800 md:text-3xl">Team Collaboration</h1>
            <p className="text-sm text-red-500 md:text-base">Please log in to access the team collaboration chat.</p>
            <button
              onClick={() => navigate('/')}
              className="mt-6 rounded-lg bg-gradient-to-r from-violet-600 to-indigo-600 px-6 py-3 font-semibold text-white shadow-sm transition hover:opacity-90"
            >
              Go to Login
            </button>
          </div>
        </div>
      ) : (
        <div className="mx-auto max-w-6xl rounded-2xl border border-slate-200 bg-white p-4 shadow-sm md:p-8">
        <div className="mb-6 md:mb-8">
          <p className="text-xs font-semibold uppercase tracking-widest text-violet-500">Workspace</p>
          <h1 className="mt-1 text-2xl font-bold text-slate-800 md:text-3xl">Team Collaboration</h1>
          <p className="mt-2 max-w-2xl text-sm text-slate-500 md:text-base">Welcome, <span className="font-semibold text-slate-700">{user?.name}</span>! Connect and collaborate with your team members through direct messaging.</p>
        </div>

        <div className="grid gap-5 lg:grid-cols-2">
          {(isAdminPath || role === 'tl') && !isAdminCommunication ? (<>
            <div className={card}>
              <div className="mb-4 flex items-center gap-3">
                <SectionIcon icon={MessageCircle} />
                <h2 className="text-base font-semibold text-slate-800">Select Employee / Group</h2>
              </div>
              <div className="space-y-3">
                <div>
                  <label className={labelBase}>Select Employee for Direct Chat</label>
                  <select
                    value={selectedEmployee}
                    onChange={(e) => {
                      setSelectedEmployee(e.target.value);
                      setOtherId(e.target.value);
                    }}
                    className={inputBase}
                  >
                    <option value="">-- Select an Employee --</option>
                    {employees.map((emp) => (
                      <option key={emp.id} value={emp.id}>
                        {emp.name}{emp.email ? ` (${emp.email})` : ''}
                      </option>
                    ))}
                  </select>
                </div>
                <button
                  onClick={() => selectedEmployee && startChat(selectedEmployee)}
                  disabled={!selectedEmployee}
                  className={`w-full ${primaryBtn}`}
                >
                  Start Direct Chat
                </button>

                <div className="my-4 border-t border-slate-100 pt-4">
                  <label className={labelBase}>Create Group Chat</label>
                  <div className="space-y-3">
                    <input
                      type="text"
                      placeholder="Enter Group Name (e.g. Dev Team)"
                      value={groupInput}
                      onChange={(e) => setGroupInput(e.target.value)}
                      className={inputBase}
                    />

                    <label className={labelBase}>Select Group Members</label>
                    <div className="max-h-40 space-y-1 overflow-y-auto rounded-lg border border-slate-200 bg-slate-50 p-2.5">
                      {employees.map((emp) => (
                        <label key={emp.id} className="flex cursor-pointer items-center gap-2 rounded p-1.5 text-sm text-slate-700 hover:bg-white">
                          <input
                            type="checkbox"
                            checked={selectedGroupMembers.includes(String(emp.id))}
                            onChange={() => handleGroupCheckboxChange(emp.id)}
                            className="rounded border-slate-300 text-violet-600 focus:ring-violet-500"
                          />
                          <span>{emp.name}</span>
                        </label>
                      ))}
                    </div>

                    <button
                      onClick={handleCreateGroupChat}
                      className={`w-full ${successBtn}`}
                    >
                      Create Group Chat
                    </button>
                  </div>
                </div>
              </div>
            </div>
              <div className={card}>
                <div className="mb-4 flex items-center gap-3">
                  <SectionIcon icon={MessageCircle} />
                  <h2 className="text-base font-semibold text-slate-800">My Group Chats</h2>
                </div>
                <div className="max-h-60 space-y-2 overflow-y-auto">
                  {groupChats.length === 0 ? (
                    <p className="text-sm text-slate-400">Aap kisi bhi group chat me added nahi hain.</p>
                  ) : (
                    groupChats.map((g) => (
                      <button
                        key={g.room}
                        onClick={() => startGroupChat(g.room)}
                        className="flex w-full items-center justify-between rounded-lg border border-slate-200 bg-white p-3 text-left font-medium text-slate-700 transition hover:border-violet-300 hover:bg-violet-50"
                      >
                        <span>{g.name}</span>
                        <span className={pill}>Group</span>
                      </button>
                    ))
                  )}
                </div>
              </div>
            </>
          ) : (!isAdminPath && !isHRChatbot) ? (
            <div className="grid gap-5">
              <div className={card}>
                <div className="mb-4 flex items-center gap-3">
                  <SectionIcon icon={MessageCircle} />
                  <h2 className="text-base font-semibold text-slate-800">Select Employee / Group</h2>
                </div>
                <div className="space-y-3">
                  <div>
                    <label className={labelBase}>Select Employee for Direct Chat</label>
                    <select
                      value={selectedEmployee}
                      onChange={(e) => {
                        setSelectedEmployee(e.target.value);
                        setOtherId(e.target.value);
                      }}
                      className={inputBase}
                    >
                      <option value="">-- Select an Employee --</option>
                      {employees.map((emp) => (
                        String(emp.id) !== String(myId) && (
                          <option key={emp.id} value={emp.id}>
                            {emp.name}{emp.email ? ` (${emp.email})` : ''}
                          </option>
                        )
                      ))}
                    </select>
                  </div>
                  <button
                    onClick={() => selectedEmployee && startChat(selectedEmployee)}
                    disabled={!selectedEmployee}
                    className={`w-full ${primaryBtn}`}
                  >
                    Start Direct Chat
                  </button>

                  {canCreateGroup && (
                    <div className="my-4 border-t border-slate-100 pt-4">
                      <label className={labelBase}>Create Group Chat</label>
                      <div className="space-y-3">
                        <input
                          type="text"
                          placeholder="Enter Group Name (e.g. Dev Team)"
                          value={groupInput}
                          onChange={(e) => setGroupInput(e.target.value)}
                          className={inputBase}
                        />

                        <label className={labelBase}>Select Group Members</label>
                        <div className="max-h-40 space-y-1 overflow-y-auto rounded-lg border border-slate-200 bg-slate-50 p-2.5">
                          {employees.map((emp) => (
                            String(emp.id) !== String(myId) && (
                              <label key={emp.id} className="flex cursor-pointer items-center gap-2 rounded p-1.5 text-sm text-slate-700 hover:bg-white">
                                <input
                                  type="checkbox"
                                  checked={selectedGroupMembers.includes(String(emp.id))}
                                  onChange={() => handleGroupCheckboxChange(emp.id)}
                                  className="rounded border-slate-300 text-violet-600 focus:ring-violet-500"
                                />
                                <span>{emp.name}</span>
                              </label>
                            )
                          ))}
                        </div>

                        <button
                          onClick={handleCreateGroupChat}
                          className={`w-full ${successBtn}`}
                        >
                          Create Group Chat
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className={card}>
                <div className="mb-4 flex items-center gap-3">
                  <SectionIcon icon={MessageCircle} />
                  <h2 className="text-base font-semibold text-slate-800">My Group Chats</h2>
                </div>
                <div className="max-h-60 space-y-2 overflow-y-auto">
                  {groupChats.length === 0 ? (
                    <p className="text-sm text-slate-400">Aap kisi bhi group chat me added nahi hain.</p>
                  ) : (
                    groupChats.map((g) => (
                      <button
                        key={g.room}
                        onClick={() => startGroupChat(g.room)}
                        className="flex w-full items-center justify-between rounded-lg border border-slate-200 bg-white p-3 text-left font-medium text-slate-700 transition hover:border-violet-300 hover:bg-violet-50"
                      >
                        <span>{g.name}</span>
                        <span className={pill}>Group</span>
                      </button>
                    ))
                  )}
                </div>
              </div>
            </div>
          ) : null}

          {!isAdminPath && !isHRChatbot && location.pathname !== '/dashboard/team-collaboration' && location.pathname !== '/dashboard/communication-system' && (
            <>
          <div className={card}>
            <div className="mb-4 flex items-center gap-3">
              <SectionIcon icon={MessageSquare} />
              <div>
                <h2 className="text-base font-semibold text-slate-800">Task Comments</h2>
                <p className="text-sm text-slate-500">हर Task के नीचे Comment करने का Option।</p>
              </div>
            </div>
            <div className="space-y-1.5 text-sm text-slate-600">
              <p>• "API complete ho gayi."</p>
              <p>• "Design review pending hai."</p>
              <p>• Comments task history में store हों।</p>
            </div>
          </div>

          <div className={card}>
            <div className="mb-4 flex items-center gap-3">
              <SectionIcon icon={Upload} />
              <div>
                <h2 className="text-base font-semibold text-slate-800">File Sharing</h2>
                <p className="text-sm text-slate-500">Task के साथ Files Upload कर सकते हैं। PDF, Word, Excel, Images आदि।</p>
              </div>
            </div>
            <div className="space-y-1.5 text-sm text-slate-600">
              <p>• Attach files directly to tasks.</p>
              <p>• देखें जो भी document काम से जुड़ा है।</p>
            </div>
          </div>

          <div className={card}>
            <div className="mb-4 flex items-center gap-3">
              <SectionIcon icon={RefreshCcw} />
              <div>
                <h2 className="text-base font-semibold text-slate-800">Task Updates</h2>
                <p className="text-sm text-slate-500">Task का Status Update कर सकते हैं।</p>
              </div>
            </div>
            <div className="space-y-1.5 text-sm text-slate-600">
              <p>• Status जैसे: To Do, In Progress, On Hold, Completed</p>
              <p>• हर बदलाव की जानकारी पूरी team को मिले।</p>
            </div>
          </div>

          <div className={card}>
            <div className="mb-4 flex items-center gap-3">
              <SectionIcon icon={AtSign} />
              <div>
                <h2 className="text-base font-semibold text-slate-800">@Mention</h2>
                <p className="text-sm text-slate-500">किसी Team Member को Mention कर सकते हैं।</p>
              </div>
            </div>
            <div className="space-y-1.5 text-sm text-slate-600">
              <p>• उदाहरण: @Ruchi Please check the dashboard UI।</p>
              <p>• mentions notification के साथ team member तक पहुँचें।</p>
            </div>
          </div>

          <div className={card}>
            <div className="mb-4 flex items-center gap-3">
              <SectionIcon icon={Clock} />
              <div>
                <h2 className="text-base font-semibold text-slate-800">Activity History</h2>
                <p className="text-sm text-slate-500">किसने क्या Update किया और कब किया, उसका पूरा Record।</p>
              </div>
            </div>
            <div className="space-y-1.5 text-sm text-slate-600">
              <p>• Ruchi created the task।</p>
              <p>• Amit changed status to In Progress।</p>
              <p>• Ruchi uploaded design.pdf।</p>
            </div>
          </div>

          <div className={card}>
            <div className="mb-4 flex items-center gap-3">
              <SectionIcon icon={Bell} />
              <div>
                <h2 className="text-base font-semibold text-slate-800">Notifications</h2>
                <p className="text-sm text-slate-500">Task Assign, Comment, Deadline Reminder और Status Change Notifications।</p>
              </div>
            </div>
            <div className="space-y-1.5 text-sm text-slate-600">
              <p>• Task Assign होने पर Notification।</p>
              <p>• Comment आने पर Notification।</p>
              <p>• Deadline Reminder।</p>
            </div>
          </div>
            </>
          )}
        </div>

        {!isAdminTeamCollab && location.pathname !== '/dashboard/team-collaboration' && (
          <div className="mt-8">
            {isAdminCommunication && !activeCommunicationPanel && (
              <div className="mb-6 grid gap-5 lg:grid-cols-3">
                <button
                  type="button"
                  onClick={() => navigate('/admin/communication-system/notice')}
                  className={`rounded-2xl border p-6 text-left transition ${activeCommunicationPanel === 'notice' ? 'border-violet-400 bg-violet-50' : 'border-slate-200 bg-white hover:border-violet-300 hover:shadow-sm'}`}>
                  <div className="mb-3 flex items-center gap-3">
                    <SectionIcon icon={MessageCircle} />
                    <h2 className="text-base font-semibold text-slate-800">Notice Board</h2>
                  </div>
                  <p className="text-sm text-slate-500">Click to open the Notice Board UI.</p>
                </button>

                <button
                  type="button"
                  onClick={() => navigate('/admin/communication-system/announcement')}
                  className={`rounded-2xl border p-6 text-left transition ${activeCommunicationPanel === 'announcement' ? 'border-violet-400 bg-violet-50' : 'border-slate-200 bg-white hover:border-violet-300 hover:shadow-sm'}`}>
                  <div className="mb-3 flex items-center gap-3">
                    <SectionIcon icon={MessageSquare} />
                    <h2 className="text-base font-semibold text-slate-800">Announcement</h2>
                  </div>
                  <p className="text-sm text-slate-500">Click to open the Announcement UI.</p>
                </button>

                <button
                  type="button"
                  onClick={() => navigate('/admin/communication-system/email')}
                  className={`rounded-2xl border p-6 text-left transition ${activeCommunicationPanel === 'email' ? 'border-violet-400 bg-violet-50' : 'border-slate-200 bg-white hover:border-violet-300 hover:shadow-sm'}`}>
                  <div className="mb-3 flex items-center gap-3">
                    <SectionIcon icon={Bell} />
                    <h2 className="text-base font-semibold text-slate-800">Email Notifications</h2>
                  </div>
                  <p className="text-sm text-slate-500">Click to open the Email Notifications UI.</p>
                </button>
              </div>
            )}

            {(!isAdminCommunication || activeCommunicationPanel === 'notice') && (
              <div className={`mt-4 ${card}`}>
                <div className="mb-4 flex flex-col justify-between gap-3 md:flex-row md:items-center">
                  <div className="flex items-center gap-3">
                    <SectionIcon icon={MessageCircle} />
                    <div>
                      <h2 className="text-base font-semibold text-slate-800">Notice Board</h2>
                      <p className="text-sm text-slate-500">Company notices and updates for all employees with pinning, expiry, attachments, and department targeting.</p>
                    </div>
                  </div>
                  {isAdminPath && (
                    <div className="flex gap-2 self-start md:self-auto">
                      <button onClick={resetNoticeForm} className={outlineBtn}>Clear</button>
                      <button onClick={saveNotice} className={primaryBtn}>{editingNoticeId ? 'Update Notice' : 'Add Notice'}</button>
                    </div>
                  )}
                </div>

                {isAdminPath && (
                  <div className="mb-6 grid gap-4 lg:grid-cols-2">
                    <div className="space-y-4">
                      <div>
                        <label className="mb-1.5 block text-sm font-medium text-slate-700">Title</label>
                        <input value={noticeForm.title} onChange={(e) => handleNoticeChange('title', e.target.value)} className={inputBase} placeholder="Notice title" />
                      </div>
                      <div>
                        <label className="mb-1.5 block text-sm font-medium text-slate-700">Department</label>
                        <select value={noticeForm.department} onChange={(e) => handleNoticeChange('department', e.target.value)} className={inputBase}>
                          <option>All</option>
                          <option>HR</option>
                          <option>IT</option>
                          <option>Sales</option>
                          <option>Finance</option>
                        </select>
                      </div>
                      <div>
                        <label className="mb-1.5 block text-sm font-medium text-slate-700">Attachment</label>
                        <input value={noticeForm.attachment} onChange={(e) => handleNoticeChange('attachment', e.target.value)} placeholder="PDF, image, document file name" className={inputBase} />
                      </div>
                    </div>
                    <div className="space-y-4">
                      <div>
                        <label className="mb-1.5 block text-sm font-medium text-slate-700">Content</label>
                        <textarea value={noticeForm.content} onChange={(e) => handleNoticeChange('content', e.target.value)} rows={6} className={inputBase} placeholder="Write the notice details..."></textarea>
                      </div>
                      <div className="grid gap-4 sm:grid-cols-2">
                        <div>
                          <label className="mb-1.5 block text-sm font-medium text-slate-700">Priority</label>
                          <select value={noticeForm.priority} onChange={(e) => handleNoticeChange('priority', e.target.value)} className={inputBase}>
                            <option>Normal</option>
                            <option>Medium</option>
                            <option>High</option>
                          </select>
                        </div>
                        <div>
                          <label className="mb-1.5 block text-sm font-medium text-slate-700">Expiry Date</label>
                          <input type="date" value={noticeForm.expiry} onChange={(e) => handleNoticeChange('expiry', e.target.value)} className={inputBase} />
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {!isAdminPath && (
                  <div className="mt-4">
                    <Link to="/dashboard/updates" className="text-sm font-semibold text-violet-600 hover:text-violet-800">View Company Updates</Link>
                  </div>
                )}

                <div className="space-y-3">
                  {notices.map((notice) => (
                    <div key={notice.id} className={`rounded-xl border p-4 md:p-5 ${notice.pinned ? 'border-violet-300 bg-violet-50' : 'border-slate-200 bg-white'}`}>
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="text-base font-semibold text-slate-800">{notice.title}</h3>
                            {notice.pinned && <span className="rounded-full bg-gradient-to-r from-violet-600 to-indigo-600 px-3 py-1 text-xs font-medium text-white">Pinned</span>}
                          </div>
                          <p className="mt-2 text-sm text-slate-600">{notice.content}</p>
                          <div className="mt-3 flex flex-wrap gap-2 text-xs text-slate-500">
                            <span className={pill}>{notice.department} Department</span>
                            <span className={pill}>Priority: {notice.priority}</span>
                            <span className={pill}>Expiry: {notice.expiry || 'No expiry'}</span>
                            {notice.attachment && <span className={pill}>Attachment: {notice.attachment}</span>}
                          </div>
                        </div>
                        {isAdminPath && (
                          <div className="flex flex-wrap gap-2 text-sm">
                            <button onClick={() => editNotice(notice)} className={outlineBtn}>Edit</button>
                            <button onClick={() => deleteNotice(notice.id)} className="rounded-lg border border-red-200 bg-white px-4 py-2 text-sm font-medium text-red-600 transition hover:bg-red-50">Delete</button>
                            <button onClick={() => togglePin(notice.id)} className={outlineBtn}>{notice.pinned ? 'Unpin' : 'Pin'}</button>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {(!isAdminCommunication || activeCommunicationPanel === 'announcement') && (
              <div className={`mt-4 ${card}`}>
                <div className="mb-4 flex flex-col justify-between gap-3 md:flex-row md:items-center">
                  <div className="flex items-center gap-3">
                    <SectionIcon icon={MessageSquare} />
                    <div>
                      <h2 className="text-base font-semibold text-slate-800">Announcement</h2>
                      <p className="text-sm text-slate-500">HR/Admin ke liye company-wide ya department-wise announcements send karne ka centralized section.</p>
                    </div>
                  </div>
                  {isAdminPath && (
                    <div className="flex gap-2 self-start md:self-auto">
                      <button onClick={resetAnnouncementForm} className={outlineBtn}>Clear</button>
                      <button onClick={saveAnnouncement} className={primaryBtn}>{editingAnnouncementId ? 'Update Announcement' : 'Add Announcement'}</button>
                    </div>
                  )}
                  {!isAdminPath && (
                    <div className="flex flex-wrap gap-2 text-sm text-slate-600">
                      <span className={pill}>Notices: {updatesCounts.notices}</span>
                      <span className={pill}>Announcements: {updatesCounts.announcements}</span>
                      <span className={pill}>Emails: {updatesCounts.emails}</span>
                    </div>
                  )}
                </div>

                {isAdminPath && (
                  <div className="mb-6 grid gap-4 lg:grid-cols-2">
                    <div className="space-y-4">
                      <div>
                        <label className="mb-1.5 block text-sm font-medium text-slate-700">Title</label>
                        <input value={announcementForm.title} onChange={(e) => handleAnnouncementChange('title', e.target.value)} className={inputBase} placeholder="Announcement title" />
                      </div>
                      <div>
                        <label className="mb-1.5 block text-sm font-medium text-slate-700">Department</label>
                        <select value={announcementForm.department} onChange={(e) => handleAnnouncementChange('department', e.target.value)} className={inputBase}>
                          <option>All</option>
                          <option>HR</option>
                          <option>IT</option>
                          <option>Sales</option>
                          <option>Finance</option>
                        </select>
                      </div>
                      <div>
                        <label className="mb-1.5 block text-sm font-medium text-slate-700">Attachment</label>
                        <input value={announcementForm.attachment} onChange={(e) => handleAnnouncementChange('attachment', e.target.value)} placeholder="PDF, image, document file name" className={inputBase} />
                      </div>
                    </div>
                    <div className="space-y-4">
                      <div>
                        <label className="mb-1.5 block text-sm font-medium text-slate-700">Content</label>
                        <textarea value={announcementForm.content} onChange={(e) => handleAnnouncementChange('content', e.target.value)} rows={6} className={inputBase} placeholder="Write announcement details..."></textarea>
                      </div>
                      <div className="grid gap-4 sm:grid-cols-2">
                        <div>
                          <label className="mb-1.5 block text-sm font-medium text-slate-700">Priority</label>
                          <select value={announcementForm.priority} onChange={(e) => handleAnnouncementChange('priority', e.target.value)} className={inputBase}>
                            <option>Normal</option>
                            <option>Medium</option>
                            <option>High</option>
                          </select>
                        </div>
                        <div>
                          <label className="mb-1.5 block text-sm font-medium text-slate-700">Schedule Date</label>
                          <input type="date" value={announcementForm.scheduleDate} onChange={(e) => handleAnnouncementChange('scheduleDate', e.target.value)} className={inputBase} />
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                <div className="space-y-3">
                  {announcements.map((announcement) => (
                    <div key={announcement.id} className="rounded-xl border border-slate-200 bg-white p-4 md:p-5">
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="text-base font-semibold text-slate-800">{announcement.title}</h3>
                            <span className={pill}>{announcement.department}</span>
                          </div>
                          <p className="mt-2 text-sm text-slate-600">{announcement.content}</p>
                          <div className="mt-3 flex flex-wrap gap-2 text-xs text-slate-500">
                            <span className={pill}>Priority: {announcement.priority}</span>
                            <span className={pill}>Schedule: {announcement.scheduleDate || 'Immediate'}</span>
                            {announcement.attachment && <span className={pill}>Attachment: {announcement.attachment}</span>}
                          </div>
                        </div>
                        {isAdminPath && (
                          <div className="flex flex-wrap gap-2 text-sm">
                            <button onClick={() => editAnnouncement(announcement)} className={outlineBtn}>Edit</button>
                            <button onClick={() => deleteAnnouncement(announcement.id)} className="rounded-lg border border-red-200 bg-white px-4 py-2 text-sm font-medium text-red-600 transition hover:bg-red-50">Delete</button>
                          </div>
                        )}
                      </div>
                      <div className="mt-3 text-xs text-slate-400">
                        History: {announcement.history.join(' • ')}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {(!isAdminCommunication || activeCommunicationPanel === 'email') && (
              <div className="mt-4 space-y-5">
                {isAdminPath && (
                  <div className={card}>
                    <div className="mb-4 flex items-center gap-3">
                      <SectionIcon icon={Bell} />
                      <h2 className="text-base font-semibold text-slate-800">Email Notifications</h2>
                    </div>
                    <p className="mb-4 text-sm text-slate-500">Schedule and preview email templates for key HR events, then review the delivery history.</p>
                    <div className="grid gap-4 lg:grid-cols-[1.5fr_1fr]">
                      <div className="space-y-4">
                        <div className="space-y-1.5">
                          <label className="text-sm font-medium text-slate-700">Event Type</label>
                          <select value={emailForm.eventType} onChange={(e) => handleEmailChange('eventType', e.target.value)} className={inputBase}>
                            <option>Welcome</option>
                            <option>Password Reset</option>
                            <option>Leave Approval</option>
                            <option>Task Assignment</option>
                            <option>Attendance Reminder</option>
                            <option>Performance Update</option>
                          </select>
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-sm font-medium text-slate-700">Recipient Group</label>
                          <select value={emailForm.recipientGroup} onChange={(e) => handleEmailChange('recipientGroup', e.target.value)} className={inputBase}>
                            <option>All Employees</option>
                            <option>HR Team</option>
                            <option>Managers</option>
                            <option>Finance</option>
                            <option>New Hires</option>
                          </select>
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-sm font-medium text-slate-700">Subject</label>
                          <input type="text" value={emailForm.subject} onChange={(e) => handleEmailChange('subject', e.target.value)} placeholder="Enter email subject" className={inputBase} />
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-sm font-medium text-slate-700">Message</label>
                          <textarea value={emailForm.message} onChange={(e) => handleEmailChange('message', e.target.value)} rows={5} placeholder="Write message body" className={inputBase} />
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-sm font-medium text-slate-700">Attachment (optional)</label>
                          <input type="text" value={emailForm.attachment} onChange={(e) => handleEmailChange('attachment', e.target.value)} placeholder="Attachment filename or URL" className={inputBase} />
                        </div>
                        <div className="flex flex-wrap gap-3">
                          <button onClick={saveEmailNotification} className={primaryBtn}>Send Email</button>
                          <button onClick={resetEmailForm} className={outlineBtn}>Reset</button>
                        </div>
                      </div>
                      <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                        <div className="mb-4 flex items-center justify-between">
                          <div>
                            <h3 className="text-sm font-semibold text-slate-800">Email Preview</h3>
                            <p className="text-xs text-slate-500">How the recipient will see the message.</p>
                          </div>
                          <span className="rounded-full bg-violet-100 px-3 py-1 text-xs font-semibold text-violet-700">{emailForm.eventType}</span>
                        </div>
                        <div className="space-y-3 text-sm text-slate-700">
                          <div>
                            <span className="mb-1 block text-xs text-slate-400">To:</span>
                            <p className="rounded-lg bg-white p-3 text-slate-800 ring-1 ring-slate-200">{emailForm.recipientGroup}</p>
                          </div>
                          <div>
                            <span className="mb-1 block text-xs text-slate-400">Subject:</span>
                            <p className="rounded-lg bg-white p-3 text-slate-800 ring-1 ring-slate-200">{emailForm.subject || 'No subject yet'}</p>
                          </div>
                          <div>
                            <span className="mb-1 block text-xs text-slate-400">Message:</span>
                            <p className="whitespace-pre-wrap rounded-lg bg-white p-3 text-slate-800 ring-1 ring-slate-200">{emailForm.message || 'No message yet'}</p>
                          </div>
                          {emailForm.attachment && (
                            <div className="rounded-lg bg-white p-3 text-sm text-slate-700 ring-1 ring-slate-200">Attachment: {emailForm.attachment}</div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                <div className={card}>
                  <div className="mb-4 flex flex-col justify-between gap-2 sm:flex-row sm:items-center">
                    <div>
                      <h3 className="text-base font-semibold text-slate-800">Recent Email History</h3>
                      <p className="text-sm text-slate-500">Track previously sent notifications and their status.</p>
                    </div>
                    <button onClick={() => setEmailHistory((prev) => prev)} className={outlineBtn}>Refresh</button>
                  </div>
                  <div className="space-y-3">
                    {emailHistory.map((item) => (
                      <div key={item.id} className="rounded-xl border border-slate-200 bg-slate-50 p-3 md:p-4">
                        <div className="flex flex-wrap items-center justify-between gap-3 text-sm text-slate-700">
                          <div className="space-y-1">
                            <div className="font-semibold text-slate-800">{item.subject}</div>
                            <div className="text-slate-500">{item.eventType} • {item.recipientGroup}</div>
                          </div>
                          <span className={pill}>{item.status}</span>
                        </div>
                        <div className="mt-3 flex flex-wrap gap-2 text-xs text-slate-400">
                          <span>Sent: {item.sentOn}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {(showChat) ? (
          <div className="mt-8 border-t border-slate-100 pt-6 md:pt-8">
            <div className="mb-5 flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
              <div>
                <h2 className="text-xl font-semibold text-slate-800">{isHRChatbot ? 'HR Chatbot Assistant' : 'Team Chat'}</h2>
                <p className="text-sm text-slate-500">{isHRChatbot ? 'Ask HR questions and get quick help from the assistant.' : 'Real-time chat between users. Messages are stored in DB.'}</p>
                {!isHRChatbot && otherId && String(otherId).startsWith('group_') && (() => {
                  const currentGroup = groupChats.find(g => g.room === otherId);
                  if (currentGroup) {
                    let membersList = [];
                    try {
                      membersList = JSON.parse(currentGroup.members || '[]');
                    } catch (e) {}
                    const memberNames = membersList.map(id => getNameById(id)).filter(Boolean);
                    return (
                      <div className="mt-2 max-w-xl rounded-lg border border-violet-100 bg-violet-50 p-2.5 text-xs text-slate-600">
                        <span className="font-semibold text-violet-700">Members ({membersList.length}): </span>
                        <span>{memberNames.join(', ')}</span>
                      </div>
                    );
                  }
                  return null;
                })()}
              </div>
              <div className="flex w-full flex-wrap items-center gap-2 lg:w-auto">
                <div className="min-w-20 flex-1 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 sm:flex-initial">
                  <p className="text-[10px] text-slate-400">Your ID</p>
                  <p className="text-xs font-semibold text-slate-700 sm:text-sm">{getNameById(myId)}</p>
                </div>
                <div className="min-w-20 flex-1 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 sm:flex-initial">
                  <p className="text-[10px] text-slate-400">Chat With</p>
                  <p className="text-xs font-semibold text-slate-700 sm:text-sm">{getNameById(otherId)}</p>
                </div>
                <div className="min-w-20 flex-1 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 sm:flex-initial">
                  <p className="text-[10px] text-slate-400">Your Role</p>
                  <p className="text-xs font-semibold capitalize text-slate-700 sm:text-sm">{role}</p>
                </div>
                <button onClick={() => { setShowChat(false); }} className="px-2 py-1 text-sm font-semibold text-violet-600 hover:text-violet-800">Close</button>
              </div>
            </div>

            <div className="mb-4">
              <button onClick={startChat} className="rounded-lg bg-gradient-to-r from-violet-600 to-indigo-600 px-4 py-2.5 text-xs font-semibold text-white shadow-sm transition hover:opacity-90">Start / Refresh Chat</button>
            </div>

            <div className="max-h-96 space-y-3 overflow-y-auto rounded-2xl border border-slate-200 bg-slate-50/60 p-3 md:p-4">
              {messages.map((m) => {
                const isSentByMe = String(m.sender_id) === String(myId);
                return (
                  <div key={m.id || Math.random()} className="flex">
                    <div
                      className={`max-w-[85%] rounded-2xl p-3 md:max-w-[70%] ${isSentByMe ? 'ml-auto bg-gradient-to-br from-violet-600 to-indigo-600 text-white' : 'mr-auto border border-slate-200 bg-white text-slate-800'}`}
                    >
                      <div className={`mb-1 text-xs ${isSentByMe ? 'text-violet-100' : 'text-slate-400'}`}>{m.sender_name ? m.sender_name : getNameById(m.sender_id)} • {new Date(m.created_at).toLocaleString()}</div>
                      <div className="text-sm">{m.message}</div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="mt-4 flex items-center gap-3">
              <input value={input} onChange={(e) => setInput(e.target.value)} type="text" placeholder="Type your message..." className={`flex-1 ${inputBase}`} />
              <button onClick={sendMessage} className="flex shrink-0 items-center gap-2 rounded-lg bg-gradient-to-r from-violet-600 to-indigo-600 px-3.5 py-3 text-white shadow-sm transition hover:opacity-90 sm:px-5"><Send size={16} /><span className="hidden sm:inline">Send</span></button>
            </div>
          </div>
        ) : null}
        </div>
      )}
    </div>
  );
}
