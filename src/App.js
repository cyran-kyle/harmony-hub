import React, { useState, useEffect, createContext, useContext, useRef, useCallback } from 'react';

// Create a context for User data and API functions
const AppContext = createContext();

// Mock API Base URL (adjust if your backend runs on a different port/path)
const API_BASE_URL = 'http://localhost/harmonyhub_backend/api'; // Adjust this to your XAMPP backend path

// Reusable SVG Icon Component
const SvgIcon = ({ path, viewBox = "0 0 24 24", className, fill = "none" }) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox={viewBox}
        fill={fill}
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={className}
    >
        <path d={path} />
    </svg>
);

// Specific SVG paths for icons
const Icons = {
    Home: (props) => <SvgIcon path="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" {...props} />,
    Search: (props) => <SvgIcon path="M11 2a9 9 0 1 0 0 18 9 9 0 0 0 0-18zM21 21l-4.35-4.35" {...props} />,
    User: (props) => <SvgIcon path="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2M12 7a4 4 0 1 0 0 8 4 4 0 0 0 0-8z" {...props} />,
    MessageSquare: (props) => <SvgIcon path="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" {...props} />,
    Star: (props) => <SvgIcon path="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.27l-6.18 3.25L7 14.14l-5-4.87 6.91-1.01L12 2z" fill="currentColor" {...props} />,
    MapPin: (props) => <SvgIcon path="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zM12 12a3 3 0 1 0 0-6 3 3 0 0 0 0 6z" {...props} />,
    Music: (props) => <SvgIcon path="M18 18v-6a4 4 0 0 0-4-4V3a4 4 0 0 0-4 4v7a4 4 0 0 0-4 4v2a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-2z" {...props} />,
    Guitar: (props) => <SvgIcon path="M16 18c0 1.1-.9 2-2 2H6c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2h8c1.1 0 2 .9 2 2v12zM10 4V2m0 18v-2m4-14V2m0 18v-2" {...props} />,
    Mic: (props) => <SvgIcon path="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3zM19 10v2a7 7 0 0 1-14 0v-2M12 19v3M12 22h3M12 22h-3" {...props} />,
    BookOpen: (props) => <SvgIcon path="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2zM22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" {...props} />,
    Mail: (props) => <SvgIcon path="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2zM22 6l-10 7L2 6" {...props} />,
    Phone: (props) => <SvgIcon path="M22 16.92v3.08a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.63A2 2 0 0 1 3.08 2H6.1a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" {...props} />,
    CalendarDays: (props) => <SvgIcon path="M8 2v4M16 2v4M21 12V6a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-8zM3 10h18" {...props} />,
    Send: (props) => <SvgIcon path="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" {...props} />,
    LogIn: (props) => <SvgIcon path="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4M10 17l5-5-5-5M13.5 12H3" {...props} />,
    LogOut: (props) => <SvgIcon path="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9" {...props} />,
};

// AppProvider component to wrap the entire application
const AppProvider = ({ children }) => {
    const [currentUser, setCurrentUser] = useState(null); // Stores mock user object
    const [userId, setUserId] = useState(null); // UID from mock auth
    const [userRole, setUserRole] = useState(null); // 'learner', 'coach', or null
    const [isAuthReady, setIsAuthReady] = useState(false); // Simulates auth readiness
    const [coaches, setCoaches] = useState([]);
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Hardcoded dummy data (will be replaced by actual API calls in a real backend)
    // This initial data is primarily for display before fetching from DB
    const initialCoaches = [
        {
            id: 'mockCoach1', name: "Dr. Kwesi Mensah", instrument: "Piano", genre: "Jazz", location: "Accra",
            bio: "A seasoned jazz pianist with over 20 years of experience, Dr. Mensah specializes in improvisation and music theory, helping students find their unique sound.",
            photoUrl: "https://placehold.co/150x150/AEC6CF/FFFFFF?text=Dr.KM", phone: "+233241234567"
        },
        {
            id: 'mockCoach2', name: "Ama Serwaa", instrument: "Voice", genre: "Gospel", location: "Kumasi",
            bio: "Passionate vocal coach focused on developing powerful and soulful gospel voices, from beginners to advanced singers.",
            photoUrl: "https://placehold.co/150x150/FFDDC1/333333?text=Ama+S", phone: "+233552345678"
        },
        {
            id: 'mockCoach3', name: "Kofi Boateng", instrument: "Guitar", genre: "Highlife", location: "Accra",
            bio: "Master of Highlife guitar, teaching traditional and modern techniques, chord progressions, and rhythm.",
            photoUrl: "https://placehold.co/150x150/DDA0DD/FFFFFF?text=Kofi+B", phone: "+233203456789"
        },
        {
            id: 'mockCoach4', name: "Nana Yaa", instrument: "Violin", genre: "Classical", location: "Tamale",
            bio: "Experienced classical violinist, offering lessons for all ages, focusing on technique, posture, and musicality.",
            photoUrl: "https://placehold.co/150x150/ADD8E6/333333?text=Nana+Y", phone: "+233274567890"
        },
        {
            id: 'mockCoach5', name: "Yaw Asante", instrument: "Drums", genre: "Afrobeat", location: "Accra",
            bio: "Dynamic drum instructor specializing in Afrobeat rhythms and polyrhythms, suitable for all skill levels.",
            photoUrl: "https://placehold.co/150x150/C3B1E1/FFFFFF?text=Yaw+A", phone: "+233249876543"
        },
        {
            id: 'mockCoach6', name: "Adwoa Mensah", instrument: "Flute", genre: "Traditional Ghanaian", location: "Cape Coast",
            bio: "Expert in traditional Ghanaian flute music, preserving cultural heritage through musical instruction.",
            photoUrl: "https://placehold.co/150x150/F0E68C/333333?text=Adwoa+M", phone: "+233508765432"
        },
        {
            id: 'mockCoach7', name: "Kwame Nkrumah", instrument: "Bass Guitar", genre: "Reggae", location: "Kumasi",
            bio: "Groove master on bass guitar, teaching reggae basslines, improvisation, and theory.",
            photoUrl: "https://placehold.co/150x150/98FB98/333333?text=Kwame+N", phone: "+233267654321"
        },
        {
            id: 'mockCoach8', name: "Esi Boateng", instrument: "Saxophone", genre: "Smooth Jazz", location: "Takoradi",
            bio: "Smooth jazz saxophonist offering lessons on tone production, improvisation, and performance.",
            photoUrl: "https://placehold.co/150x150/FFDAB9/333333?text=Esi+B", phone: "+233246543210"
        },
        {
            id: 'mockCoach9', name: "Joseph Kojo", instrument: "Keyboard", genre: "Contemporary Christian", location: "Accra",
            bio: "Dedicated keyboardist teaching contemporary Christian music, worship leading, and chord voicings.",
            photoUrl: "https://placehold.co/150x150/B0E0E6/333333?text=Joseph+K", phone: "+233205432109"
        },
        {
            id: 'mockCoach10', name: "Fatima Alhassan", instrument: "Percussion", genre: "World Music", location: "Tamale",
            bio: "Versatile percussionist offering lessons on various world music instruments, including Djembe and Congas.",
            photoUrl: "https://placehold.co/150x150/D8BFD8/333333?text=Fatima+A", phone: "+233278901234"
        }
    ];

    const initialReviews = [
        { coachId: 'mockCoach1', rating: 5, comment: "Excellent jazz piano lessons!", reviewerId: "mockUser1", timestamp: new Date(2024, 0, 15) },
        { coachId: 'mockCoach1', rating: 4, comment: "Very knowledgeable and patient.", reviewerId: "mockUser2", timestamp: new Date(2024, 1, 20) },
        { coachId: 'mockCoach2', rating: 5, comment: "Ama has an amazing voice and teaches beautifully.", reviewerId: "mockUser3", timestamp: new Date(2024, 2, 10) },
    ];

    // Simulate initial data load and auth check
    useEffect(() => {
        const loadInitialData = async () => {
            setLoading(true);
            console.log("AppProvider: Attempting to fetch data from API_BASE_URL:", API_BASE_URL);
            try {
                const coachesResponse = await fetch(`${API_BASE_URL}/coaches.php`);
                if (coachesResponse.ok) {
                    const fetchedCoaches = await coachesResponse.json();
                    setCoaches(fetchedCoaches);
                } else {
                    console.error("AppProvider: Failed to fetch coaches:", coachesResponse.status, await coachesResponse.text());
                    setCoaches(initialCoaches);
                }

                const reviewsResponse = await fetch(`${API_BASE_URL}/reviews.php`);
                if (reviewsResponse.ok) {
                    const fetchedReviews = await reviewsResponse.json();
                    setReviews(fetchedReviews.map(r => ({ ...r, timestamp: new Date(r.timestamp) })));
                } else {
                    console.error("AppProvider: Failed to fetch reviews:", reviewsResponse.status, await reviewsResponse.text());
                    setReviews(initialReviews);
                }

            } catch (err) {
                console.error("AppProvider: Error loading initial data:", err);
                setError("Failed to load initial data. Using mock data. Please ensure XAMPP Apache and MySQL are running and API_BASE_URL is correct.");
                setCoaches(initialCoaches);
                setReviews(initialReviews);
            } finally {
                const storedUser = JSON.parse(localStorage.getItem('currentUser'));
                if (storedUser) {
                    setCurrentUser(storedUser);
                    setUserId(storedUser.id);
                    setUserRole(storedUser.role);
                } else {
                    setUserId(crypto.randomUUID());
                    setUserRole(null);
                }
                setIsAuthReady(true);
                setLoading(false);
            }
        };

        loadInitialData();
    }, []);

    useEffect(() => {
        if (currentUser) {
            localStorage.setItem('currentUser', JSON.stringify(currentUser));
        } else {
            localStorage.removeItem('currentUser');
        }
    }, [currentUser]);

    // --- API Functions ---
    const addReview = async (coachId, rating, comment) => {
        if (!currentUser) {
            return { success: false, error: "Authentication required." };
        }
        try {
            const response = await fetch(`${API_BASE_URL}/reviews.php`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ coachId, rating, comment, reviewerId: userId })
            });
            const data = await response.json();
            if (response.ok) {
                const reviewsResponse = await fetch(`${API_BASE_URL}/reviews.php`);
                const fetchedReviews = await reviewsResponse.json();
                setReviews(fetchedReviews.map(r => ({ ...r, timestamp: new Date(r.timestamp) })));
                return { success: true };
            } else {
                return { success: false, error: data.message || "Failed to add review." };
            }
        } catch (e) {
            console.error("Error adding review:", e);
            return { success: false, error: "Network error or server issue." };
        }
    };

    const bookSession = async (coachId, date, time) => {
        if (!currentUser || userRole !== 'learner') {
            return { success: false, error: "Authentication as a learner required." };
        }
        try {
            const response = await fetch(`${API_BASE_URL}/bookings.php`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ coachId, learnerId: userId, date, time })
            });
            const data = await response.json();
            if (response.ok) {
                return { success: true };
            } else {
                return { success: false, error: data.message || "Failed to book session." };
            }
        } catch (e) {
            console.error("Error booking session:", e);
            return { success: false, error: "Network error or server issue." };
        }
    };

    const sendMessage = async (recipientId, messageText) => {
        if (!currentUser || !userId) {
            console.error("Authentication required to send a message.");
            return { success: false, error: "Authentication required." };
        }
        console.log(`Sending message from ${userId} to ${recipientId}: "${messageText}"`);
        try {
            // Determine participant roles for consistent chatDocId
            let participant1_id = userId; // Assume current user is participant1 initially
            let participant2_id = recipientId; // Assume recipient is participant2 initially

            // If current user is a coach, and recipient is a learner
            if (userRole === 'coach' && !coaches.some(c => c.id === recipientId)) {
                participant1_id = recipientId; // Learner is participant1
                participant2_id = userId;     // Coach is participant2
            }
            // If current user is a learner, and recipient is a coach
            else if (userRole === 'learner' && coaches.some(c => c.id === recipientId)) {
                participant1_id = userId;     // Learner is participant1
                participant2_id = recipientId; // Coach is participant2
            }
            // For this app, we assume learner-coach or coach-learner chats.

            const response = await fetch(`${API_BASE_URL}/chats.php`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    participant1_id: participant1_id,
                    participant2_id: participant2_id,
                    messageText: messageText,
                    senderId: userId
                })
            });
            const data = await response.json();
            if (response.ok) {
                return { success: true };
            } else {
                console.error("Failed to send message:", data.message || "Unknown error.");
                return { success: false, error: data.message || "Failed to send message." };
            }
        } catch (e) {
            console.error("Error sending message:", e);
            return { success: false, error: "Network error or server issue." };
        }
    };

    const fetchUserChatsList = useCallback(async (currentUserId) => {
        if (!currentUserId) return [];
        try {
            // Fetch all chats where currentUserId is either participant1_id or participant2_id
            const response = await fetch(`${API_BASE_URL}/chats.php?participantId=${currentUserId}`);
            if (response.ok) {
                const data = await response.json();
                return data.map(chat => {
                    const otherParticipantId = chat.participant1_id === currentUserId ? chat.participant2_id : chat.participant1_id;
                    const unreadCount = chat.participant1_id === currentUserId ? chat.unread_count_p1 : chat.unread_count_p2;
                    return {
                        chatDocId: chat.id,
                        participant1_id: chat.participant1_id,
                        participant2_id: chat.participant2_id,
                        otherParticipantId: otherParticipantId,
                        lastMessageText: chat.last_message_text,
                        lastMessageSender: chat.last_message_sender,
                        lastMessageTimestamp: chat.last_message_at ? new Date(chat.last_message_at) : null,
                        unreadCount: parseInt(unreadCount || 0),
                    };
                }).sort((a, b) => (b.lastMessageTimestamp || new Date(0)) - (a.lastMessageTimestamp || new Date(0)));
            } else {
                console.error("Failed to fetch chat list:", response.status, await response.text());
                return [];
            }
        } catch (err) {
            console.error("Error fetching chat list:", err);
            return [];
        }
    }, []);

    const fetchChatHistory = useCallback(async (chatDocId) => {
        if (!chatDocId) return [];
        try {
            const response = await fetch(`${API_BASE_URL}/chats.php?chatDocId=${chatDocId}`);
            if (response.ok) {
                const data = await response.json();
                return (data.messages || []).map(msg => ({
                    ...msg,
                    timestamp: new Date(msg.timestamp)
                })).sort((a, b) => a.timestamp - b.timestamp);
            } else {
                console.error("Failed to fetch chat history:", response.status, await response.text());
                return [];
            }
        } catch (err) {
            console.error("Error fetching chat history:", err);
            return [];
        }
    }, []);

    const markChatAsRead = async (chatDocId, readerId) => {
        try {
            const response = await fetch(`${API_BASE_URL}/chats.php`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ chatDocId, readerId })
            });
            if (!response.ok) {
                console.error("Failed to mark chat as read:", response.status, await response.text());
            }
            return { success: response.ok };
        } catch (e) {
            console.error("Error marking chat as read:", e);
            return { success: false, error: "Network error." };
        }
    };


    const registerUser = async (email, password, role, profileData = {}) => {
        try {
            const response = await fetch(`${API_BASE_URL}/register.php`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password, role, ...profileData })
            });
            const data = await response.json();
            if (response.ok) {
                setCurrentUser({ id: data.userId, email, role: data.role });
                setUserId(data.userId);
                setUserRole(data.role);
                if (role === 'coach') {
                    const coachesResponse = await fetch(`${API_BASE_URL}/coaches.php`);
                    if (coachesResponse.ok) {
                        const fetchedCoaches = await coachesResponse.json();
                        setCoaches(fetchedCoaches);
                    }
                }
                return { success: true, user: { id: data.userId, email, role: data.role } };
            } else {
                return { success: false, error: data.message || "Registration failed." };
            }
        } catch (e) {
            console.error("Error during registration:", e);
            return { success: false, error: "Network error or server issue." };
        }
    };

    const loginUser = async (email, password) => {
        try {
            const response = await fetch(`${API_BASE_URL}/login.php`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });
            const data = await response.json();
            if (response.ok) {
                setCurrentUser(data.user);
                setUserId(data.user.id);
                setUserRole(data.user.role);
                return { success: true };
            } else {
                return { success: false, error: data.message || "Invalid email or password." };
            }
        } catch (e) {
            console.error("Error during login:", e);
            return { success: false, error: "Network error or server issue." };
        }
    };

    const logoutUser = async () => {
        try {
            setCurrentUser(null);
            setUserId(crypto.randomUUID());
            setUserRole(null);
            return { success: true };
        } catch (e) {
            console.error("Error logging out:", e);
            return { success: false, error: e.message };
        }
    };

    const updateCoachProfile = async (coachId, updatedProfileData) => {
        if (!currentUser || currentUser.id !== coachId || userRole !== 'coach') {
            return { success: false, error: "Authorization failed." };
        }
        try {
            const response = await fetch(`${API_BASE_URL}/update_coach_profile.php`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id: coachId, ...updatedProfileData })
            });
            const data = await response.json();
            if (response.ok) {
                setCoaches(prevCoaches =>
                    prevCoaches.map(coach =>
                        coach.id === coachId ? { ...coach, ...updatedProfileData } : coach
                    )
                );
                return { success: true };
            } else {
                return { success: false, error: data.message || "Failed to update profile." };
            }
        } catch (e) {
            console.error("Error updating coach profile:", e);
            return { success: false, error: "Network error or server issue." };
        }
    };


    return (
        <AppContext.Provider value={{
            currentUser, userId, userRole, isAuthReady,
            coaches, reviews, loading, error,
            addReview, bookSession, sendMessage,
            fetchUserChatsList, fetchChatHistory, markChatAsRead,
            registerUser, loginUser, logoutUser, updateCoachProfile
        }}>
            {children}
        </AppContext.Provider>
    );
};

// Helper function to calculate average rating
const getAverageRating = (coachId, allReviews) => {
    const coachReviews = allReviews.filter(review => review.coachId === coachId);
    if (coachReviews.length === 0) return { average: 0, count: 0 };
    const totalRating = coachReviews.reduce((sum, review) => sum + review.rating, 0);
    return {
        average: (totalRating / coachReviews.length).toFixed(1),
        count: coachReviews.length
    };
};

// --- Navigation Components ---
const NavBar = ({ setCurrentPage }) => {
    const { currentUser, logoutUser, userId, fetchUserChatsList, userRole, isAuthReady } = useContext(AppContext);
    const [totalUnreadCount, setTotalUnreadCount] = useState(0);

    useEffect(() => {
        let interval;
        if (isAuthReady && currentUser && userId) {
            const updateUnreadCount = async () => {
                const chats = await fetchUserChatsList(userId);
                const unread = chats.reduce((sum, chat) => sum + (chat.unreadCount || 0), 0);
                setTotalUnreadCount(unread);
            };
            updateUnreadCount();
            interval = setInterval(updateUnreadCount, 5000);
        } else {
            setTotalUnreadCount(0);
        }
        return () => clearInterval(interval);
    }, [currentUser, userId, fetchUserChatsList, isAuthReady]);


    const handleLogout = async () => {
        const result = await logoutUser();
        if (result.success) {
            setCurrentPage('home');
        } else {
            console.error("Logout failed:", result.error);
        }
    };

    return (
        <nav className="bg-gradient-to-r from-purple-600 to-indigo-600 p-4 shadow-lg rounded-b-xl">
            <div className="container mx-auto flex justify-between items-center">
                <div className="text-white text-2xl font-bold tracking-wide">HarmonyHub</div>
                {/* Removed the isAuthReady check here, as it's handled by MainContentWrapper */}
                <div className="flex space-x-4 md:space-x-6">
                    <NavItem icon={<Icons.Home className="w-5 h-5" />} text="Home" onClick={() => setCurrentPage('home')} />
                    {userRole === 'learner' && (
                        <NavItem icon={<Icons.Search className="w-5 h-5" />} text="Find a Coach" onClick={() => setCurrentPage('find-coach')} />
                    )}
                    <NavItem icon={<Icons.Mail className="w-5 h-5" />} text="Contact" onClick={() => setCurrentPage('contact')} />
                    {currentUser && (
                        <NavItem
                            icon={
                                <div className="relative">
                                    <Icons.MessageSquare className="w-5 h-5" />
                                    {totalUnreadCount > 0 && (
                                        <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full h-4 w-4 flex items-center justify-center">
                                            {totalUnreadCount}
                                        </span>
                                    )}
                                </div>
                            }
                            text="Messages"
                            onClick={() => setCurrentPage('messages')}
                        />
                    )}
                    {currentUser ? (
                        <>
                            <NavItem icon={<Icons.User className="w-5 h-5" />} text="Profile" onClick={() => setCurrentPage('profile')} />
                            <NavItem icon={<Icons.LogOut className="w-5 h-5" />} text="Sign Out" onClick={handleLogout} />
                        </>
                    ) : (
                        <NavItem icon={<Icons.LogIn className="w-5 h-5" />} text="Sign In" onClick={() => setCurrentPage('auth')} />
                    )}
                </div>
            </div>
        </nav>
    );
};

const NavItem = ({ icon, text, onClick }) => (
    <button
        onClick={onClick}
        className="text-white hover:text-purple-200 flex items-center space-x-2 p-2 rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-purple-300"
    >
        {icon}
        <span className="hidden md:inline">{text}</span>
    </button>
);

// --- Page Components ---
const HomePage = ({ setCurrentPage }) => (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-80px)] bg-gradient-to-br from-purple-50 to-indigo-100 p-4">
        <div className="bg-white p-8 md:p-12 rounded-3xl shadow-xl text-center max-w-2xl w-full transform transition-all duration-300 hover:scale-105">
            <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-6 leading-tight">
                Unlock Your Musical Potential
            </h1>
            <p className="text-lg md:text-xl text-gray-700 mb-8">
                Find the perfect music coach in Ghana to guide your journey. Search by instrument, genre, or location.
            </p>
            <button
                onClick={() => setCurrentPage('find-coach')}
                className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold py-3 px-8 rounded-full text-lg shadow-lg hover:from-purple-700 hover:to-indigo-700 transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-purple-300"
            >
                <Icons.Search className="inline-block mr-2 w-5 h-5" /> Find a Music Coach
            </button>
        </div>
    </div>
);

// New CoachHomePage Component
const CoachHomePage = ({ setCurrentPage }) => {
    const { currentUser } = useContext(AppContext);
    const coachName = currentUser?.email.split('@')[0] || 'Coach';

    return (
        <div className="flex flex-col items-center justify-center min-h-[calc(100vh-80px)] bg-gradient-to-br from-indigo-50 to-purple-100 p-4">
            <div className="bg-white p-8 md:p-12 rounded-3xl shadow-xl text-center max-w-2xl w-full transform transition-all duration-300 hover:scale-105">
                <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-6 leading-tight">
                    Welcome, {coachName}!
                </h1>
                <p className="text-lg md:text-xl text-gray-700 mb-8">
                    Manage your profile, view your bookings, and connect with your learners.
                </p>
                <div className="flex flex-col sm:flex-row justify-center gap-4">
                    <button
                        onClick={() => setCurrentPage('profile')}
                        className="bg-indigo-600 text-white font-bold py-3 px-8 rounded-full text-lg shadow-lg hover:bg-indigo-700 transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-indigo-300 flex items-center justify-center"
                    >
                        <Icons.User className="inline-block mr-2 w-5 h-5" /> My Profile
                    </button>
                    <button
                        onClick={() => setCurrentPage('messages')}
                        className="bg-blue-600 text-white font-bold py-3 px-8 rounded-full text-lg shadow-lg hover:bg-blue-700 transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-blue-300 flex items-center justify-center"
                    >
                        <Icons.MessageSquare className="inline-block mr-2 w-5 h-5" /> Messages
                    </button>
                    {/* Add more coach-specific buttons as needed, e.g., "View Bookings" */}
                </div>
            </div>
        </div>
    );
};


const FindCoachPage = ({ setCurrentPage, setSelectedCoachId }) => {
    const { coaches, reviews, loading, error, userId } = useContext(AppContext);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedInstrument, setSelectedInstrument] = useState('');
    const [selectedGenre, setSelectedGenre] = useState('');
    const [selectedLocation, setSelectedLocation] = useState('');

    const instruments = [...new Set(coaches.map(c => c.instrument))].sort();
    const genres = [...new Set(coaches.map(c => c.genre))].sort();
    const locations = [...new Set(coaches.map(c => c.location))].sort();

    const filteredCoaches = coaches.filter(coach => {
        const matchesSearch = coach.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                              coach.bio.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesInstrument = selectedInstrument ? coach.instrument === selectedInstrument : true;
        const matchesGenre = selectedGenre ? coach.genre === selectedGenre : true;
        const matchesLocation = selectedLocation ? coach.location === selectedLocation : true;
        return matchesSearch && matchesInstrument && matchesGenre && matchesLocation;
    });

    if (loading) return <div className="text-center py-10 text-gray-600">Loading coaches...</div>;
    if (error) return <div className="text-center py-10 text-red-600">{error}</div>;

    return (
        <div className="container mx-auto p-4 md:p-8 bg-white rounded-xl shadow-lg my-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-6 text-center">Find Your Perfect Music Coach</h2>

            {/* Search and Filters */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                <input
                    type="text"
                    placeholder="Search by name or keyword..."
                    className="p-3 border border-gray-300 rounded-lg focus:ring-purple-500 focus:border-purple-500 shadow-sm"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
                <select
                    className="p-3 border border-gray-300 rounded-lg focus:ring-purple-500 focus:border-purple-500 shadow-sm"
                    value={selectedInstrument}
                    onChange={(e) => setSelectedInstrument(e.target.value)}
                >
                    <option value="">All Instruments</option>
                    {instruments.map(inst => <option key={inst} value={inst}>{inst}</option>)}
                </select>
                <select
                    className="p-3 border border-gray-300 rounded-lg focus:ring-purple-500 focus:border-purple-500 shadow-sm"
                    value={selectedGenre}
                    onChange={(e) => setSelectedGenre(e.target.value)}
                >
                    <option value="">All Genres</option>
                    {genres.map(gen => <option key={gen} value={gen}>{gen}</option>)}
                </select>
                <select
                    className="p-3 border border-gray-300 rounded-lg focus:ring-purple-500 focus:border-purple-500 shadow-sm"
                    value={selectedLocation}
                    onChange={(e) => setSelectedLocation(e.target.value)}
                >
                    <option value="">All Locations</option>
                    {locations.map(loc => <option key={loc} value={loc}>{loc}</option>)}
                </select>
            </div>

            {/* Coach Listings */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredCoaches.length > 0 ? (
                    filteredCoaches.map(coach => {
                        const { average, count } = getAverageRating(coach.id, reviews);
                        return (
                            <div key={coach.id} className="bg-gray-50 p-6 rounded-2xl shadow-md border border-gray-200 flex flex-col items-center text-center transform transition-transform duration-300 hover:scale-105 hover:shadow-lg">
                                <img
                                    src={coach.photoUrl || `https://placehold.co/150x150/E0E0E0/333333?text=${coach.name.split(' ').map(n => n[0]).join('')}`}
                                    alt={coach.name}
                                    className="w-24 h-24 rounded-full object-cover mb-4 border-4 border-purple-300"
                                    onError={(e) => { e.target.onerror = null; e.target.src = `https://placehold.co/150x150/E0E0E0/333333?text=${coach.name.split(' ').map(n => n[0]).join('')}` }}
                                />
                                <h3 className="text-xl font-semibold text-gray-800 mb-2">{coach.name}</h3>
                                <p className="text-purple-600 font-medium flex items-center mb-1">
                                    <Icons.Guitar className="w-4 h-4 mr-1" /> {coach.instrument}
                                </p>
                                <p className="text-gray-600 flex items-center mb-3">
                                    <Icons.MapPin className="w-4 h-4 mr-1" /> {coach.location}
                                </p>
                                <p className="text-gray-700 text-sm mb-4 line-clamp-3">{coach.bio}</p>
                                <div className="flex items-center mb-4">
                                    <Icons.Star className="w-5 h-5 text-yellow-500 fill-current mr-1" />
                                    <span className="text-gray-800 font-bold">{average}</span>
                                    <span className="text-gray-500 ml-1">({count} reviews)</span>
                                </div>
                                <button
                                    onClick={() => {
                                        setSelectedCoachId(coach.id);
                                        setCurrentPage('coach-profile');
                                    }}
                                    className="bg-purple-500 text-white py-2 px-5 rounded-full hover:bg-purple-600 transition-colors duration-200 shadow-md focus:outline-none focus:ring-2 focus:ring-purple-300"
                                >
                                    View Profile
                                </button>
                            </div>
                        );
                    })
                ) : (
                    <p className="col-span-full text-center text-gray-600 text-lg py-10">No coaches found matching your criteria.</p>
                )}
            </div>
            {userId && <p className="mt-8 text-sm text-gray-500 text-center">Your User ID: <span className="font-mono text-gray-700 break-all">{userId}</span></p>}
        </div>
    );
};

const CoachProfilePage = ({ selectedCoachId, setCurrentPage }) => {
    const { coaches, reviews, addReview, bookSession, currentUser, userRole } = useContext(AppContext);
    const coach = coaches.find(c => c.id === selectedCoachId);
    const { average, count } = getAverageRating(selectedCoachId, reviews);
    const coachReviews = reviews.filter(r => r.coachId === selectedCoachId).sort((a, b) => {
        const timestampA = a.timestamp || new Date(0);
        const timestampB = b.timestamp || new Date(0);
        return timestampB - timestampA;
    });

    const [rating, setRating] = useState(0);
    const [comment, setComment] = useState('');
    const [reviewMessage, setReviewMessage] = useState('');

    const [bookingDate, setBookingDate] = useState('');
    const [bookingTime, setBookingTime] = useState('');
    const [bookingMessage, setBookingMessage] = useState('');

    const handleSubmitReview = async () => {
        if (!currentUser) {
            setReviewMessage("Please login to leave a review.");
            setTimeout(() => setReviewMessage(''), 3000);
            return;
        }
        if (!rating || !comment.trim()) {
            setReviewMessage("Please provide both a rating and a comment.");
            setTimeout(() => setReviewMessage(''), 3000);
            return;
        }
        setReviewMessage("Submitting review...");
        const result = await addReview(selectedCoachId, rating, comment);
        if (result.success) {
            setReviewMessage("Review submitted successfully!");
            setRating(0);
            setComment('');
        } else {
            setReviewMessage(`Error: ${result.error}`);
        }
        setTimeout(() => setReviewMessage(''), 3000);
    };

    const handleBookSession = async () => {
        if (!currentUser || userRole !== 'learner') {
            setBookingMessage("Please login as a learner to book a session.");
            setTimeout(() => setBookingMessage(''), 3000);
            return;
        }
        if (!bookingDate || !bookingTime) {
            setBookingMessage("Please select a date and time for your session.");
            setTimeout(() => setBookingMessage(''), 3000);
            return;
        }
        setBookingMessage("Booking session...");
        const result = await bookSession(selectedCoachId, bookingDate, bookingTime);
        if (result.success) {
            setBookingMessage("Session booked successfully! Coach will contact you.");
            setBookingDate('');
            setBookingTime('');
        } else {
            setBookingMessage(`Error: ${result.error}`);
        }
        setTimeout(() => setBookingMessage(''), 3000);
    };


    if (!coach) {
        return (
            <div className="container mx-auto p-8 text-center text-red-600">
                Coach not found. <button onClick={() => setCurrentPage('find-coach')} className="text-purple-600 hover:underline">Go back to search.</button>
            </div>
        );
    }

    return (
        <div className="container mx-auto p-4 md:p-8 bg-white rounded-xl shadow-lg my-8">
            <button
                onClick={() => setCurrentPage('find-coach')}
                className="mb-6 flex items-center text-purple-600 hover:text-purple-800 transition-colors duration-200"
            >
                &larr; Back to Coaches
            </button>

            <div className="flex flex-col md:flex-row items-center md:items-start gap-8 mb-10 pb-8 border-b border-gray-200">
                <img
                    src={coach.photoUrl || `https://placehold.co/200x200/E0E0E0/333333?text=${coach.name.split(' ').map(n => n[0]).join('')}`}
                    alt={coach.name}
                    className="w-40 h-40 md:w-48 md:h-48 rounded-full object-cover shadow-lg border-4 border-purple-400"
                    onError={(e) => { e.target.onerror = null; e.target.src = `https://placehold.co/200x200/E0E0E0/333333?text=${coach.name.split(' ').map(n => n[0]).join('')}` }}
                />
                <div className="text-center md:text-left">
                    <h1 className="text-4xl font-extrabold text-gray-900 mb-2">{coach.name}</h1>
                    <p className="text-purple-700 text-xl font-semibold mb-2 flex items-center justify-center md:justify-start">
                        <Icons.Guitar className="w-5 h-5 mr-2" /> {coach.instrument} | <Icons.Music className="w-5 h-5 ml-4 mr-2" /> {coach.genre}
                    </p>
                    <p className="text-gray-600 text-lg mb-4 flex items-center justify-center md:justify-start">
                        <Icons.MapPin className="w-5 h-5 mr-2" /> {coach.location}
                    </p>
                    {coach.phone && (
                        <a href={`tel:${coach.phone}`} className="text-purple-600 hover:underline text-lg mb-4 flex items-center justify-center md:justify-start">
                            <Icons.Phone className="w-5 h-5 mr-2" /> {coach.phone}
                        </a>
                    )}
                    <div className="flex items-center justify-center md:justify-start mb-4">
                        <Icons.Star className="w-6 h-6 text-yellow-500 fill-current mr-2" />
                        <span className="text-gray-900 text-2xl font-bold">{average}</span>
                        <span className="text-gray-600 text-lg ml-2">({count} reviews)</span>
                    </div>
                    <p className="text-gray-800 text-base leading-relaxed">{coach.bio}</p>

                    <div className="mt-6 flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
                        {userRole === 'learner' && (
                            <>
                                <button
                                    onClick={() => setCurrentPage('messages', { selectedChatPartnerId: coach.id })}
                                    className="bg-blue-500 text-white py-2 px-5 rounded-full hover:bg-blue-600 transition-colors duration-200 shadow-md flex items-center justify-center"
                                >
                                    <Icons.MessageSquare className="w-5 h-5 mr-2" /> Chat with Coach
                                </button>
                                <button
                                    onClick={() => document.getElementById('booking-section').scrollIntoView({ behavior: 'smooth' })}
                                    className="bg-green-500 text-white py-2 px-5 rounded-full hover:bg-green-600 transition-colors duration-200 shadow-md flex items-center justify-center"
                                >
                                    <Icons.CalendarDays className="w-5 h-5 mr-2" /> Book Session
                                </button>
                            </>
                        )}
                        {currentUser && currentUser.id === selectedCoachId && userRole === 'coach' && (
                            <button
                                onClick={() => setCurrentPage('profile')}
                                className="bg-indigo-500 text-white py-2 px-5 rounded-full hover:bg-indigo-600 transition-colors duration-200 shadow-md flex items-center justify-center"
                            >
                                <Icons.User className="w-5 h-5 mr-2" /> Edit My Profile
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* Booking Section */}
            <div id="booking-section" className="mb-10 p-6 bg-green-50 rounded-2xl shadow-inner border border-green-200">
                <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
                    <Icons.CalendarDays className="w-6 h-6 mr-2 text-green-600" /> Book a Session with {coach.name}
                </h2>
                {!currentUser || userRole !== 'learner' ? (
                    <p className="text-green-700 text-center py-4">Please login as a learner to book a session.</p>
                ) : (
                    <>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                            <div>
                                <label htmlFor="bookingDate" className="block text-gray-700 text-sm font-bold mb-2">Date:</label>
                                <input
                                    type="date"
                                    id="bookingDate"
                                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500 shadow-sm"
                                    value={bookingDate}
                                    onChange={(e) => setBookingDate(e.target.value)}
                                />
                            </div>
                            <div>
                                <label htmlFor="bookingTime" className="block text-gray-700 text-sm font-bold mb-2">Time:</label>
                                <input
                                    type="time"
                                    id="bookingTime"
                                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500 shadow-sm"
                                    value={bookingTime}
                                    onChange={(e) => setBookingTime(e.target.value)}
                                />
                            </div>
                        </div>
                        <button
                            onClick={handleBookSession}
                            className="bg-green-600 text-white font-bold py-2 px-6 rounded-full hover:bg-green-700 transition-colors duration-200 shadow-md focus:outline-none focus:ring-2 focus:ring-green-300"
                        >
                            Submit Booking Request
                        </button>
                        {bookingMessage && <p className="mt-3 text-sm text-green-700">{bookingMessage}</p>}
                    </>
                )}
            </div>

            {/* Leave a Review Section */}
            <div className="mb-10 p-6 bg-purple-50 rounded-2xl shadow-inner">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Leave a Review</h2>
                {!currentUser ? (
                    <p className="text-purple-700 text-center py-4">Please login to leave a review.</p>
                ) : (
                    <>
                        <div className="flex items-center mb-4">
                            <span className="text-gray-700 mr-3">Your Rating:</span>
                            {[1, 2, 3, 4, 5].map((star) => (
                                <Icons.Star
                                    key={star}
                                    className={`w-8 h-8 cursor-pointer transition-colors duration-200 ${
                                        star <= rating ? 'text-yellow-500 fill-current' : 'text-gray-300'
                                    }`}
                                    onClick={() => setRating(star)}
                                />
                            ))}
                        </div>
                        <textarea
                            className="w-full p-3 border border-gray-300 rounded-lg mb-4 focus:ring-purple-500 focus:border-purple-500 shadow-sm"
                            rows="4"
                            placeholder="Share your experience with this coach..."
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                        ></textarea>
                        <button
                            onClick={handleSubmitReview}
                            className="bg-purple-600 text-white font-bold py-2 px-6 rounded-full hover:bg-purple-700 transition-colors duration-200 shadow-md focus:outline-none focus:ring-2 focus:ring-purple-300"
                        >
                            Submit Review
                        </button>
                        {reviewMessage && <p className="mt-3 text-sm text-purple-700">{reviewMessage}</p>}
                    </>
                )}
            </div>

            {/* Reviews Section */}
            <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">What Learners Are Saying ({count})</h2>
                {coachReviews.length > 0 ? (
                    <div className="space-y-6">
                        {coachReviews.map((review, index) => (
                            <div key={index} className="bg-gray-50 p-5 rounded-xl shadow-sm border border-gray-200">
                                <div className="flex items-center mb-2">
                                    <div className="flex">
                                        {[1, 2, 3, 4, 5].map((star) => (
                                            <Icons.Star
                                                key={star}
                                                className={`w-5 h-5 ${
                                                    star <= review.rating ? 'text-yellow-500 fill-current' : 'text-gray-300'
                                                }`}
                                            />
                                        ))}
                                    </div>
                                    <span className="text-gray-600 text-sm ml-3">
                                        {review.timestamp?.toLocaleDateString()}
                                    </span>
                                </div>
                                <p className="text-gray-800 text-base leading-relaxed">{review.comment}</p>
                                <p className="text-gray-500 text-sm mt-2">By: {review.reviewerId.substring(0, 8)}...</p>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className="text-gray-600">No reviews yet. Be the first to leave one!</p>
                )}
            </div>
        </div>
    );
};

// New ChatWindow Component
const ChatWindow = ({ chatDocId, chatPartner, currentUser, sendMessage, fetchChatHistory, markChatAsRead, onChatClose }) => {
    const { userId } = useContext(AppContext);
    const [chatMessage, setChatMessage] = useState('');
    const [chatHistory, setChatHistory] = useState([]);
    const [currentChatDocIdState, setCurrentChatDocIdState] = useState(chatDocId);
    const chatHistoryRef = useRef(null);

    // Update internal state when chatDocId prop changes
    useEffect(() => {
        setCurrentChatDocIdState(chatDocId);
    }, [chatDocId]);

    const loadChatMessages = useCallback(async () => {
        console.log("ChatWindow: Loading messages for chatDocId:", chatDocId);
        let resolvedChatDocId = currentChatDocIdState;

        // If chatDocId is null (new chat initiated from coach profile), construct a potential one
        if (!resolvedChatDocId && chatPartner && userId) {
            const participants = [userId, chatPartner.id].sort();
            resolvedChatDocId = `${participants[0]}_${participants[1]}`;
            setCurrentChatDocIdState(resolvedChatDocId); // Update state with constructed ID
            console.log("ChatWindow: Constructed potential chatDocId for new chat:", resolvedChatDocId);
        }

        if (resolvedChatDocId) {
            const history = await fetchChatHistory(resolvedChatDocId);
            setChatHistory(history);
            // Mark chat as read when opening/viewing it
            markChatAsRead(resolvedChatDocId, userId);
        } else {
            setChatHistory([]); // Clear history if no chatDocId or partner
        }
    }, [chatDocId, chatPartner, fetchChatHistory, markChatAsRead, userId, currentChatDocIdState]); // Added currentChatDocIdState to dependencies

    useEffect(() => {
        loadChatMessages();
        const interval = setInterval(loadChatMessages, 2000); // Poll every 2 seconds for new messages
        return () => clearInterval(interval);
    }, [loadChatMessages]);

    useEffect(() => {
        if (chatHistoryRef.current) {
            chatHistoryRef.current.scrollTop = chatHistoryRef.current.scrollHeight;
        }
    }, [chatHistory]);

    const handleSendMessage = async () => {
        if (!chatMessage.trim() || !chatPartner?.id) return;
        console.log("ChatWindow: Sending message...");
        const result = await sendMessage(chatPartner.id, chatMessage);
        if (result.success) {
            setChatMessage('');
            // Re-fetch messages immediately after sending to show the new message
            loadChatMessages();
        } else {
            console.error("Failed to send message:", result.error);
        }
    };

    if (!chatPartner) {
        return (
            <div className="flex flex-col items-center justify-center h-full text-gray-500 p-4">
                <Icons.MessageSquare className="w-12 h-12 mb-4" />
                <p className="text-lg">Select a chat to start messaging.</p>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-full bg-white rounded-xl shadow-lg border border-blue-200">
            <div className="flex items-center justify-between p-4 bg-blue-600 text-white rounded-t-xl shadow-md">
                <h3 className="text-xl font-semibold">Chat with {chatPartner.name || chatPartner.email}</h3>
                <button onClick={onChatClose} className="text-white hover:text-blue-200 focus:outline-none">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6"><path d="M18 6L6 18M6 6l12 12"/></svg>
                </button>
            </div>
            <div ref={chatHistoryRef} className="flex-grow overflow-y-auto p-4 space-y-3 bg-blue-50">
                {chatHistory.length > 0 ? (
                    chatHistory.map((msg, index) => (
                        <div key={index} className={`flex ${msg.senderId === userId ? 'justify-end' : 'justify-start'}`}>
                            <div className={`max-w-[70%] p-3 rounded-lg ${msg.senderId === userId ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-800'}`}>
                                <p className="text-sm break-words">{msg.text}</p>
                                <span className="text-xs opacity-80 mt-1 block">
                                    {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </span>
                            </div>
                        </div>
                    ))
                ) : (
                    <p className="text-gray-500 text-center py-10">Start a conversation!</p>
                )}
            </div>
            <div className="p-4 border-t border-blue-200 bg-white flex gap-2 rounded-b-xl">
                <input
                    type="text"
                    className="flex-grow p-3 border border-blue-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 shadow-sm"
                    placeholder="Type your message..."
                    value={chatMessage}
                    onChange={(e) => setChatMessage(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                />
                <button
                    onClick={handleSendMessage}
                    className="bg-blue-600 text-white p-3 rounded-lg hover:bg-blue-700 transition-colors duration-200 shadow-md"
                >
       
                    <Icons.Send className="w-5 h-5" />
                </button>
            </div>
        </div>
    );
};

// New ChatList Component
const ChatList = ({ chats, onSelectChat, selectedChatDocId, onNewChatClick }) => {
    return (
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 h-full overflow-y-auto">
            <h2 className="text-2xl font-bold text-gray-900 p-4 border-b border-gray-200 flex justify-between items-center">
                Your Conversations
                <button
                    onClick={onNewChatClick}
                    className="bg-purple-500 text-white p-2 rounded-full hover:bg-purple-600 transition-colors duration-200 shadow-md"
                    title="Start a new chat"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                </button>
            </h2>
            {chats.length === 0 ? (
                <p className="text-gray-500 p-4 text-center">No active chats. Find a coach to start one!</p>
            ) : (
                <div className="divide-y divide-gray-100">
                    {chats.map(chat => (
                        <ChatItem
                            key={chat.chatDocId}
                            chat={chat}
                            onSelectChat={onSelectChat}
                            isSelected={chat.chatDocId === selectedChatDocId}
                        />
                    ))}
                </div>
            )}
        </div>
    );
};

// New ChatItem Component
const ChatItem = ({ chat, onSelectChat, isSelected }) => {
    const { currentUser } = useContext(AppContext);
    const isUnread = chat.unreadCount > 0;

    // Fallback for image text if name is not available
    const getInitials = (name) => {
        if (!name) return 'UU'; // Unknown User
        const parts = name.split(' ').filter(Boolean); // Filter out empty strings
        if (parts.length === 0) return 'UU';
        if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
        return (parts[0][0] + parts[1][0]).toUpperCase();
    };

    return (
        <div
            onClick={() => onSelectChat(chat)}
            className={`flex items-center p-4 cursor-pointer hover:bg-gray-50 transition-colors duration-150 ${
                isSelected ? 'bg-purple-100 border-l-4 border-purple-500' : ''
            }`}
        >
            <div className="flex-shrink-0 mr-3">
                <img
                    src={`https://placehold.co/40x40/E0E0E0/333333?text=${getInitials(chat.otherParticipantName)}`}
                    alt={chat.otherParticipantName || "Unknown User"}
                    className="w-10 h-10 rounded-full object-cover border border-gray-300"
                    onError={(e) => { e.target.onerror = null; e.target.src = `https://placehold.co/40x40/E0E0E0/333333?text=UU` }}
                />
            </div>
            <div className="flex-grow">
                <div className="flex justify-between items-center">
                    <h3 className={`font-semibold ${isUnread ? 'text-purple-700' : 'text-gray-800'}`}>
                        {chat.otherParticipantName || "Unknown User"}
                    </h3>
                    {isUnread && (
                        <span className="bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                            {chat.unreadCount}
                        </span>
                    )}
                </div>
                <p className={`text-sm ${isUnread ? 'text-purple-600 font-medium' : 'text-gray-600'} truncate`}>
                    {chat.lastMessageSender === currentUser?.id ? 'You: ' : ''}
                    {chat.lastMessageText || "No messages yet."}
                </p>
                {chat.lastMessageTimestamp && (
                    <p className="text-xs text-gray-400 mt-1">
                        {chat.lastMessageTimestamp.toLocaleString()}
                    </p>
                )}
            </div>
        </div>
    );
};

// New NewChatModal Component
const NewChatModal = ({ coaches, onSelectCoach, onClose }) => {
    const { userId } = useContext(AppContext);
    // Filter out the current user if they are a coach to prevent self-chatting
    const availableCoaches = coaches.filter(coach => coach.id !== userId);

    return (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-md max-h-[80vh] overflow-y-auto relative">
                <button onClick={onClose} className="absolute top-4 right-4 text-gray-500 hover:text-gray-700">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                </button>
                <h3 className="text-2xl font-bold text-gray-900 mb-6 text-center">Start a New Chat</h3>

                {availableCoaches.length === 0 ? (
                    <p className="text-gray-600 text-center">No coaches available to chat with.</p>
                ) : (
                    <div className="space-y-3">
                        {availableCoaches.map(coach => (
                            <button
                                key={coach.id}
                                onClick={() => onSelectCoach(coach.id)}
                                className="flex items-center w-full p-3 bg-gray-50 rounded-lg hover:bg-purple-100 transition-colors duration-150 shadow-sm border border-gray-200"
                            >
                                <img
                                    src={coach.photoUrl || `https://placehold.co/40x40/E0E0E0/333333?text=${coach.name.split(' ').map(n => n[0]).join('')}`}
                                    alt={coach.name}
                                    className="w-10 h-10 rounded-full object-cover mr-3 border-2 border-purple-300"
                                    onError={(e) => { e.target.onerror = null; e.target.src = `https://placehold.co/40x40/E0E0E0/333333?text=${coach.name.split(' ').map(n => n[0]).join('')}` }}
                                />
                                <div>
                                    <p className="font-semibold text-gray-800">{coach.name}</p>
                                    <p className="text-sm text-gray-600">{coach.instrument} - {coach.genre}</p>
                                </div>
                            </button>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};


// New MessagesPage Component
const MessagesPage = ({ setCurrentPage, initialChatPartnerId }) => {
    const { currentUser, userId, fetchUserChatsList, sendMessage, fetchChatHistory, markChatAsRead, coaches } = useContext(AppContext);
    const [activeChats, setActiveChats] = useState([]);
    const [selectedChat, setSelectedChat] = useState(null);
    const [loadingChats, setLoadingChats] = useState(true);
    const [showNewChatModal, setShowNewChatModal] = useState(false); // State for new chat modal
    const initialChatPartnerIdRef = useRef(initialChatPartnerId); // Use ref to capture initial prop

    // Function to get the name/email of a user by their ID
    const getParticipantDetails = useCallback((participantId) => {
        if (participantId === userId) {
            return { id: userId, name: currentUser?.email.split('@')[0] || 'You', email: currentUser?.email };
        }
        const coach = coaches.find(c => c.id === participantId);
        if (coach) {
            return { id: coach.id, name: coach.name || `Coach ${coach.id.substring(0, 8)}`, email: null };
        }
        return { id: participantId, name: `User ${participantId.substring(0, 8)}`, email: null };
    }, [coaches, currentUser, userId]);


    const loadActiveChats = useCallback(async () => {
        if (!currentUser || !userId) {
            setActiveChats([]);
            setLoadingChats(false);
            console.log("MessagesPage: Not logged in or userId missing, cannot load chats.");
            return;
        }
        setLoadingChats(true);
        console.log("MessagesPage: Fetching active chats for userId:", userId);
        try {
            const chats = await fetchUserChatsList(userId);
            console.log("MessagesPage: Raw chats fetched:", chats);

            const chatsWithNames = chats.map(chat => {
                const otherParticipantId = chat.participant1_id === userId ? chat.participant2_id : chat.participant1_id;
                const otherParticipantDetails = getParticipantDetails(otherParticipantId);

                return {
                    ...chat,
                    otherParticipantId: otherParticipantDetails.id,
                    otherParticipantName: otherParticipantDetails.name,
                    otherParticipantEmail: otherParticipantDetails.email,
                };
            });
            setActiveChats(chatsWithNames);
            console.log("MessagesPage: Chats with names:", chatsWithNames);

            // After loading chats, if there's an initialChatPartnerId and no chat is selected,
            // try to auto-select or create a new chat placeholder.
            if (initialChatPartnerIdRef.current && !selectedChat) {
                const partnerId = initialChatPartnerIdRef.current;
                const partnerChat = chatsWithNames.find(chat => chat.otherParticipantId === partnerId);
                if (partnerChat) {
                    console.log("MessagesPage: Auto-selecting existing chat for initial partner:", partnerChat);
                    setSelectedChat(partnerChat);
                } else {
                    const coach = coaches.find(c => c.id === partnerId);
                    if (coach) {
                        console.log("MessagesPage: Creating new chat placeholder for coach:", coach);
                        setSelectedChat({
                            chatDocId: null, // Indicates a new chat
                            otherParticipantId: coach.id,
                            otherParticipantName: coach.name || `Coach ${coach.id.substring(0, 8)}`,
                            otherParticipantEmail: null,
                            lastMessageText: "Start a new conversation!",
                            lastMessageTimestamp: null,
                            unreadCount: 0
                        });
                    } else {
                        console.warn("MessagesPage: Initial chat partner ID provided but coach not found:", partnerId);
                    }
                }
                initialChatPartnerIdRef.current = null; // Clear the ref after processing
            }

        } catch (error) {
            console.error("MessagesPage: Error loading active chats:", error);
        } finally {
            setLoadingChats(false);
        }
    }, [currentUser, userId, fetchUserChatsList, getParticipantDetails, selectedChat, coaches]);


    // Initial load and periodic refresh of chat list
    useEffect(() => {
        loadActiveChats();
        const interval = setInterval(loadActiveChats, 5000);
        return () => clearInterval(interval);
    }, [loadActiveChats]);

    const handleSelectChat = (chat) => {
        console.log("MessagesPage: Selected chat:", chat);
        setSelectedChat(chat);
    };

    const handleChatClose = () => {
        console.log("MessagesPage: Closing chat window.");
        setSelectedChat(null);
        loadActiveChats(); // Refresh chat list to update unread counts
    };

    const handleNewChatSelectCoach = (coachId) => {
        setCurrentPage('messages', { selectedChatPartnerId: coachId });
        setShowNewChatModal(false);
    };

    if (!currentUser) {
        return (
            <div className="container mx-auto p-8 text-center text-red-600">
                Please login to view your messages. <button onClick={() => setCurrentPage('auth')} className="text-purple-600 hover:underline">Go to Login/Register.</button>
            </div>
        );
    }

    return (
        <div className="container mx-auto p-4 md:p-8 bg-white rounded-xl shadow-lg my-8 h-[calc(100vh-180px)] flex flex-col md:flex-row gap-6">
            <div className={`flex-shrink-0 ${selectedChat ? 'hidden md:block' : 'w-full md:w-1/3'} h-full`}>
                {loadingChats ? (
                    <div className="text-center py-10 text-gray-600">Loading chats...</div>
                ) : (
                    <ChatList
                        chats={activeChats}
                        onSelectChat={handleSelectChat}
                        selectedChatDocId={selectedChat?.chatDocId}
                        onNewChatClick={() => setShowNewChatModal(true)} // Pass new chat click handler
                    />
                )}
            </div>
            <div className={`flex-grow ${selectedChat ? 'block' : 'hidden md:block'} h-full`}>
                <ChatWindow
                    chatDocId={selectedChat?.chatDocId}
                    chatPartner={selectedChat ? { id: selectedChat.otherParticipantId, name: selectedChat.otherParticipantName, email: selectedChat.otherParticipantEmail } : null}
                    currentUser={currentUser}
                    sendMessage={sendMessage}
                    fetchChatHistory={fetchChatHistory}
                    markChatAsRead={markChatAsRead}
                    onChatClose={handleChatClose}
                />
            </div>

            {showNewChatModal && (
                <NewChatModal
                    coaches={coaches}
                    onSelectCoach={handleNewChatSelectCoach}
                    onClose={() => setShowNewChatModal(false)}
                />
            )}
        </div>
    );
};


const AuthPage = ({ setCurrentPage }) => {
    const { registerUser, loginUser } = useContext(AppContext);
    const [isRegister, setIsRegister] = useState(true);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState('learner'); // 'learner' or 'coach'
    const [name, setName] = useState(''); // For coach registration
    const [instrument, setInstrument] = useState(''); // For coach registration
    const [genre, setGenre] = useState(''); // For coach registration
    const [location, setLocation] = useState(''); // For coach registration
    const [phone, setPhone] = useState(''); // For coach registration
    const [message, setMessage] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage('');
        if (isRegister) {
            let profileData = {};
            if (role === 'coach') {
                profileData = { name, instrument, genre, location, phone };
                if (!name || !instrument || !genre || !location || !phone) {
                    setMessage("Please fill all coach profile fields.");
                    return;
                }
            }
            const result = await registerUser(email, password, role, profileData);
            if (result.success) {
                setMessage("Registration successful! You can now login.");
                setEmail('');
                setPassword('');
                setName('');
                setInstrument('');
                setGenre('');
                setLocation('');
                setPhone('');
                setIsRegister(false); // Switch to login after successful registration
            } else {
                setMessage(`Error: ${result.error}`);
            }
        } else {
            const result = await loginUser(email, password);
            if (result.success) {
                setMessage("Login successful!");
                setCurrentPage('home'); // Redirect to home on successful login
            } else {
                setMessage(`Error: ${result.error}`);
            }
        }
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-[calc(100vh-80px)] bg-gradient-to-br from-purple-50 to-indigo-100 p-4">
            <div className="bg-white p-8 md:p-12 rounded-3xl shadow-xl text-center max-w-lg w-full transform transition-all duration-300 hover:scale-105">
                <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-6">
                    {isRegister ? 'Register' : 'Login'} to HarmonyHub
                </h1>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <input
                            type="email"
                            placeholder="Email"
                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-purple-500 focus:border-purple-500 shadow-sm"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>
                    <div>
                        <input
                            type="password"
                            placeholder="Password"
                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-purple-500 focus:border-purple-500 shadow-sm"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>
                    {isRegister && (
                        <div className="flex flex-col items-start space-y-2">
                            <label className="text-gray-700 font-medium">Register as:</label>
                            <div className="flex space-x-4">
                                <label className="inline-flex items-center">
                                    <input
                                        type="radio"
                                        className="form-radio text-purple-600"
                                        name="role"
                                        value="learner"
                                        checked={role === 'learner'}
                                        onChange={() => setRole('learner')}
                                    />
                                    <span className="ml-2 text-gray-700">Learner</span>
                                </label>
                                <label className="inline-flex items-center">
                                    <input
                                        type="radio"
                                        className="form-radio text-purple-600"
                                        name="role"
                                        value="coach"
                                        checked={role === 'coach'}
                                        onChange={() => setRole('coach')}
                                    />
                                    <span className="ml-2 text-gray-700">Coach</span>
                                </label>
                            </div>
                        </div>
                    )}

                    {isRegister && role === 'coach' && (
                        <>
                            <input type="text" placeholder="Your Name" className="w-full p-3 border border-gray-300 rounded-lg focus:ring-purple-500 focus:border-purple-500 shadow-sm" value={name} onChange={(e) => setName(e.target.value)} required={role === 'coach'} />
                            <input type="text" placeholder="Instrument (e.g., Guitar, Piano)" className="w-full p-3 border border-gray-300 rounded-lg focus:ring-purple-500 focus:border-purple-500 shadow-sm" value={instrument} onChange={(e) => setInstrument(e.target.value)} required={role === 'coach'} />
                            <input type="text" placeholder="Genre (e.g., Jazz, Gospel)" className="w-full p-3 border border-gray-300 rounded-lg focus:ring-purple-500 focus:border-purple-500 shadow-sm" value={genre} onChange={(e) => setGenre(e.target.value)} required={role === 'coach'} />
                            <input type="text" placeholder="Location (e.g., Accra, Kumasi)" className="w-full p-3 border border-gray-300 rounded-lg focus:ring-purple-500 focus:border-purple-500 shadow-sm" value={location} onChange={(e) => setLocation(e.target.value)} required={role === 'coach'} />
                            <input type="tel" placeholder="Phone Number (e.g., +233241234567)" className="w-full p-3 border border-gray-300 rounded-lg focus:ring-purple-500 focus:border-purple-500 shadow-sm" value={phone} onChange={(e) => setPhone(e.target.value)} required={role === 'coach'} />
                        </>
                    )}

                    <button
                        type="submit"
                        className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold py-3 px-8 rounded-full text-lg shadow-lg hover:from-purple-700 hover:to-indigo-700 transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-purple-300"
                    >
                        {isRegister ? 'Register Account' : 'Login'}
                    </button>
                </form>
                {message && <p className="mt-4 text-sm text-purple-700">{message}</p>}
                <button
                    onClick={() => setIsRegister(!isRegister)}
                    className="mt-4 text-purple-600 hover:underline text-sm"
                >
                    {isRegister ? 'Already have an account? Login' : 'Need an account? Register'}
                </button>
            </div>
        </div>
    );
};

const ProfilePage = ({ setCurrentPage }) => {
    const { currentUser, userRole, coaches, updateCoachProfile } = useContext(AppContext);
    const [profileData, setProfileData] = useState({
        name: '',
        instrument: '',
        genre: '',
        location: '',
        bio: '',
        photoUrl: '',
        phone: ''
    });
    const [message, setMessage] = useState('');
    const [isEditing, setIsEditing] = useState(false);

    useEffect(() => {
        if (currentUser && userRole === 'coach' && coaches.length > 0) {
            const currentCoach = coaches.find(c => c.id === currentUser.id);
            if (currentCoach) {
                setProfileData(currentCoach);
            }
        }
    }, [currentUser, userRole, coaches]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setProfileData(prev => ({ ...prev, [name]: value }));
    };

    const handleSave = async () => {
        setMessage("Saving profile...");
        const result = await updateCoachProfile(currentUser.id, profileData);
        if (result.success) {
            setMessage("Profile updated successfully!");
            setIsEditing(false);
        } else {
            setMessage(`Error: ${result.error}`);
        }
        setTimeout(() => setMessage(''), 3000);
    };

    if (!currentUser) {
        return (
            <div className="container mx-auto p-8 text-center text-red-600">
                Please login to view your profile. <button onClick={() => setCurrentPage('auth')} className="text-purple-600 hover:underline">Go to Login/Register.</button>
            </div>
        );
    }

    return (
        <div className="container mx-auto p-4 md:p-8 bg-white rounded-xl shadow-lg my-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-6 text-center">Your Profile</h1>
            <div className="text-center mb-6">
                <p className="text-gray-700 text-lg">Email: <span className="font-semibold">{currentUser.email}</span></p>
                <p className="text-gray-700 text-lg">Role: <span className="font-semibold capitalize">{userRole}</span></p>
            </div>

            {userRole === 'coach' && (
                <div className="mt-8 p-6 bg-purple-50 rounded-2xl shadow-inner">
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">Coach Profile Details</h2>
                    {isEditing ? (
                        <div className="space-y-4">
                            <div>
                                <label className="block text-gray-700 text-sm font-bold mb-2">Name:</label>
                                <input type="text" name="name" value={profileData.name} onChange={handleChange} className="w-full p-3 border border-gray-300 rounded-lg" />
                            </div>
                            <div>
                                <label className="block text-gray-700 text-sm font-bold mb-2">Instrument:</label>
                                <input type="text" name="instrument" value={profileData.instrument} onChange={handleChange} className="w-full p-3 border border-gray-300 rounded-lg" />
                            </div>
                            <div>
                                <label className="block text-gray-700 text-sm font-bold mb-2">Genre:</label>
                                <input type="text" name="genre" value={profileData.genre} onChange={handleChange} className="w-full p-3 border border-gray-300 rounded-lg" />
                            </div>
                            <div>
                                <label className="block text-gray-700 text-sm font-bold mb-2">Location:</label>
                                <input type="text" name="location" value={profileData.location} onChange={handleChange} className="w-full p-3 border border-gray-300 rounded-lg" />
                            </div>
                            <div>
                                <label className="block text-gray-700 text-sm font-bold mb-2">Phone:</label>
                                <input type="tel" name="phone" value={profileData.phone} onChange={handleChange} className="w-full p-3 border border-gray-300 rounded-lg" />
                            </div>
                            <div>
                                <label className="block text-gray-700 text-sm font-bold mb-2">Bio:</label>
                                <textarea name="bio" value={profileData.bio} onChange={handleChange} rows="4" className="w-full p-3 border border-gray-300 rounded-lg"></textarea>
                            </div>
                            <div>
                                <label className="block text-gray-700 text-sm font-bold mb-2">Photo URL:</label>
                                <input type="text" name="photoUrl" value={profileData.photoUrl} onChange={handleChange} className="w-full p-3 border border-gray-300 rounded-lg" />
                            </div>
                            <button onClick={handleSave} className="bg-purple-600 text-white py-2 px-6 rounded-full hover:bg-purple-700 transition-colors duration-200 shadow-md">Save Changes</button>
                            <button onClick={() => setIsEditing(false)} className="ml-4 bg-gray-300 text-gray-800 py-2 px-6 rounded-full hover:bg-gray-400 transition-colors duration-200">Cancel</button>
                        </div>
                    ) : (
                        <div>
                            <p className="text-gray-800 text-lg mb-2"><span className="font-semibold">Name:</span> {profileData.name}</p>
                            <p className="text-gray-800 text-lg mb-2"><span className="font-semibold">Instrument:</span> {profileData.instrument}</p>
                            <p className="text-gray-800 text-lg mb-2"><span className="font-semibold">Genre:</span> {profileData.genre}</p>
                            <p className="text-gray-800 text-lg mb-2"><span className="font-semibold">Location:</span> {profileData.location}</p>
                            <p className="text-gray-800 text-lg mb-2"><span className="font-semibold">Phone:</span> {profileData.phone}</p>
                            <p className="text-gray-800 text-lg mb-2"><span className="font-semibold">Bio:</span> {profileData.bio}</p>
                            {profileData.photoUrl && <img src={profileData.photoUrl} alt="Profile" className="w-24 h-24 rounded-full object-cover mt-4" />}
                            <button onClick={() => setIsEditing(true)} className="mt-6 bg-purple-500 text-white py-2 px-6 rounded-full hover:bg-purple-600 transition-colors duration-200 shadow-md">Edit Profile</button>
                        </div>
                    )}
                    {message && <p className="mt-3 text-sm text-purple-700">{message}</p>}
                </div>
            )}
        </div>
    );
};


const ContactPage = () => (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-80px)] bg-gradient-to-br from-purple-50 to-indigo-100 p-4">
        <div className="bg-white p-8 md:p-12 rounded-3xl shadow-xl text-center max-w-xl w-full transform transition-all duration-300 hover:scale-105">
            <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-6 leading-tight">
                Get in Touch with HarmonyHub
            </h1>
            <p className="text-lg md:text-xl text-gray-700 mb-8">
                Have questions or feedback? We'd love to hear from you!
            </p>
            <div className="space-y-4 text-left">
                <p className="text-gray-800 text-lg flex items-center justify-center md:justify-start">
                    <Icons.Mail className="w-6 h-6 mr-3 text-purple-600" />
                    Email: <a href="mailto:info@harmonyhub.com" className="text-purple-600 hover:underline ml-2">info@harmonyhub.com</a>
                </p>
                <p className="text-gray-800 text-lg flex items-center justify-center md:justify-start">
                    <Icons.MessageSquare className="w-6 h-6 mr-3 text-purple-600" />
                    Phone: <a href="tel:+233201234567" className="text-purple-600 hover:underline ml-2">+233 20 123 4567</a>
                </p>
                <p className="text-gray-800 text-lg flex items-center justify-center md:justify-start">
                    <Icons.MapPin className="w-6 h-6 mr-3 text-purple-600" />
                    Address: 123 Music Lane, Accra, Ghana
                </p>
            </div>
            <p className="mt-8 text-gray-600 text-md">
                We aim to respond to all inquiries within 24-48 hours.
            </p>
        </div>
    </div>
);

// New MainContent component to hold the routing logic and consume context
const MainContent = ({ currentPage, setCurrentPage, selectedCoachId, setSelectedCoachId, messagesPageProps, setMessagesPageProps }) => {
    const { userRole, isAuthReady } = useContext(AppContext);

    return (
        <main className="py-4">
            {isAuthReady ? (
                (() => {
                    switch (currentPage) {
                        case 'home':
                            return userRole === 'coach' ? <CoachHomePage setCurrentPage={setCurrentPage} /> : <HomePage setCurrentPage={setCurrentPage} />;
                        case 'find-coach':
                            return <FindCoachPage setCurrentPage={setCurrentPage} setSelectedCoachId={setSelectedCoachId} />;
                        case 'coach-profile':
                            return <CoachProfilePage selectedCoachId={selectedCoachId} setCurrentPage={setCurrentPage} />;
                        case 'contact':
                            return <ContactPage />;
                        case 'auth':
                            return <AuthPage setCurrentPage={setCurrentPage} />;
                        case 'profile':
                            return <ProfilePage setCurrentPage={setCurrentPage} />;
                        case 'messages':
                            return <MessagesPage setCurrentPage={setCurrentPage} {...messagesPageProps} />;
                        default:
                            return userRole === 'coach' ? <CoachHomePage setCurrentPage={setCurrentPage} /> : <HomePage setCurrentPage={setCurrentPage} />;
                    }
                })()
            ) : (
                <div className="text-center py-20 text-gray-600 text-lg">Loading application...</div>
            )}
        </main>
    );
};


// Main App Component
const App = () => {
    // Tailwind CSS script for JIT compilation
    useEffect(() => {
        const script = document.createElement('script');
        script.src = 'https://cdn.tailwindcss.com';
        document.head.appendChild(script);
        return () => {
            document.head.removeChild(script);
        };
    }, []);

    // Inter font family
    useEffect(() => {
        const link = document.createElement('link');
        link.href = 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap';
        link.rel = 'stylesheet';
        document.head.appendChild(link);

        const style = document.createElement('style');
        style.innerHTML = `body { font-family: 'Inter', sans-serif; }`;
        document.head.appendChild(style);

        return () => {
            document.head.removeChild(link);
            document.head.removeChild(style);
        };
    }, []);

    return (
        <AppProvider>
            <div className="min-h-screen bg-gray-100 font-sans antialiased">
                <MainContentWrapper />
            </div>
        </AppProvider>
    );
};

// A small wrapper component to bridge NavBar and MainContent
const MainContentWrapper = () => {
    const [currentPage, setCurrentPage] = useState('home');
    const [selectedCoachId, setSelectedCoachId] = useState(null);
    const [messagesPageProps, setMessagesPageProps] = useState({});
    const { isAuthReady } = useContext(AppContext); // Consume isAuthReady here

    const handleSetCurrentPage = (page, props = {}) => {
        if (page === 'messages') {
            setMessagesPageProps(props);
        }
        setCurrentPage(page);
    };

    return (
        <>
            {isAuthReady && <NavBar setCurrentPage={handleSetCurrentPage} />}
            <MainContent
                currentPage={currentPage}
                setCurrentPage={handleSetCurrentPage}
                selectedCoachId={selectedCoachId}
                setSelectedCoachId={setSelectedCoachId}
                messagesPageProps={messagesPageProps}
                setMessagesPageProps={setMessagesPageProps}
            />
        </>
    );
};


export default App;
