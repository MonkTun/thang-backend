module.exports = [
"[project]/Documents/GitHub/ThangBackend/pages/social.tsx [ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>SocialPage
]);
var __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/react/jsx-dev-runtime [external] (react/jsx-dev-runtime, cjs)");
var __TURBOPACK__imported__module__$5b$externals$5d2f$react__$5b$external$5d$__$28$react$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/react [external] (react, cjs)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$GitHub$2f$ThangBackend$2f$node_modules$2f$next$2f$router$2e$js__$5b$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Documents/GitHub/ThangBackend/node_modules/next/router.js [ssr] (ecmascript)");
;
;
;
function SocialPage() {
    const router = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$GitHub$2f$ThangBackend$2f$node_modules$2f$next$2f$router$2e$js__$5b$ssr$5d$__$28$ecmascript$29$__["useRouter"])();
    const [loading, setLoading] = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react__$5b$external$5d$__$28$react$2c$__cjs$29$__["useState"])(true);
    const [error, setError] = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react__$5b$external$5d$__$28$react$2c$__cjs$29$__["useState"])(null);
    // Friends State
    const [friends, setFriends] = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react__$5b$external$5d$__$28$react$2c$__cjs$29$__["useState"])([]);
    const [requests, setRequests] = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react__$5b$external$5d$__$28$react$2c$__cjs$29$__["useState"])([]);
    const [blockedUsers, setBlockedUsers] = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react__$5b$external$5d$__$28$react$2c$__cjs$29$__["useState"])([]);
    const [targetUsername, setTargetUsername] = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react__$5b$external$5d$__$28$react$2c$__cjs$29$__["useState"])("");
    const [friendError, setFriendError] = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react__$5b$external$5d$__$28$react$2c$__cjs$29$__["useState"])(null);
    const [friendSuccess, setFriendSuccess] = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react__$5b$external$5d$__$28$react$2c$__cjs$29$__["useState"])(null);
    // Party State
    const [party, setParty] = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react__$5b$external$5d$__$28$react$2c$__cjs$29$__["useState"])(null);
    const [partyInvites, setPartyInvites] = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react__$5b$external$5d$__$28$react$2c$__cjs$29$__["useState"])([]);
    const [partyTargetUsername, setPartyTargetUsername] = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react__$5b$external$5d$__$28$react$2c$__cjs$29$__["useState"])("");
    const [partyError, setPartyError] = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react__$5b$external$5d$__$28$react$2c$__cjs$29$__["useState"])(null);
    const [partySuccess, setPartySuccess] = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react__$5b$external$5d$__$28$react$2c$__cjs$29$__["useState"])(null);
    const [currentUserUid, setCurrentUserUid] = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react__$5b$external$5d$__$28$react$2c$__cjs$29$__["useState"])(null);
    // 1. Auth Check & Initial Data
    (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react__$5b$external$5d$__$28$react$2c$__cjs$29$__["useEffect"])(()=>{
        const init = async ()=>{
            const idToken = localStorage.getItem("idToken");
            const uid = localStorage.getItem("uid");
            if (!idToken || !uid) {
                router.push("/login");
                return;
            }
            setCurrentUserUid(uid);
            setLoading(false);
            fetchFriends();
            fetchPartyStatus();
        };
        init();
    }, [
        router
    ]);
    // 2. Heartbeat Loop (Every 30s)
    (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react__$5b$external$5d$__$28$react$2c$__cjs$29$__["useEffect"])(()=>{
        const idToken = localStorage.getItem("idToken");
        if (!idToken) return;
        const sendHeartbeat = async ()=>{
            try {
                await fetch("/api/presence/heartbeat", {
                    method: "POST",
                    headers: {
                        Authorization: `Bearer ${idToken}`
                    }
                });
            } catch (e) {
                console.error("Heartbeat failed", e);
            }
        };
        sendHeartbeat();
        const interval = setInterval(sendHeartbeat, 30000);
        return ()=>clearInterval(interval);
    }, []);
    // 3. Polling (Every 5s for faster updates)
    (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react__$5b$external$5d$__$28$react$2c$__cjs$29$__["useEffect"])(()=>{
        const idToken = localStorage.getItem("idToken");
        if (!idToken) return;
        const poll = ()=>{
            fetchFriends();
            fetchPartyStatus();
        };
        const interval = setInterval(poll, 5000);
        return ()=>clearInterval(interval);
    }, []);
    // --- API CALLS ---
    const fetchFriends = async ()=>{
        const idToken = localStorage.getItem("idToken");
        if (!idToken) return;
        try {
            const res = await fetch("/api/friends/list", {
                headers: {
                    Authorization: `Bearer ${idToken}`
                }
            });
            if (res.ok) {
                const data = await res.json();
                setFriends(data.friends);
                setRequests(data.friendRequests);
                setBlockedUsers(data.blocked || []);
            }
        } catch (e) {
            console.error("Fetch friends failed", e);
        }
    };
    const fetchPartyStatus = async ()=>{
        const idToken = localStorage.getItem("idToken");
        if (!idToken) return;
        try {
            const res = await fetch("/api/party/status", {
                headers: {
                    Authorization: `Bearer ${idToken}`
                }
            });
            if (res.ok) {
                const data = await res.json();
                setParty(data.party || null);
                setPartyInvites(data.partyInvites || []);
            }
        } catch (e) {
            console.error("Fetch party failed", e);
        }
    };
    // --- FRIEND ACTIONS ---
    const handleSendFriendRequest = async ()=>{
        setFriendError(null);
        setFriendSuccess(null);
        const idToken = localStorage.getItem("idToken");
        if (!idToken || !targetUsername) return;
        try {
            const res = await fetch("/api/friends/request", {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${idToken}`,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    targetUsername
                })
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error);
            setFriendSuccess(`Request sent to ${targetUsername}`);
            setTargetUsername("");
            fetchFriends();
        } catch (e) {
            setFriendError(e.message);
        }
    };
    const handleAcceptFriendRequest = async (requesterUid)=>{
        const idToken = localStorage.getItem("idToken");
        if (!idToken) return;
        try {
            const res = await fetch("/api/friends/accept", {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${idToken}`,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    requesterUid
                })
            });
            if (!res.ok) throw new Error("Failed to accept");
            fetchFriends();
        } catch (e) {
            console.error(e);
        }
    };
    const handleRemoveFriend = async (targetUid)=>{
        const idToken = localStorage.getItem("idToken");
        if (!idToken) return;
        try {
            await fetch("/api/friends/remove", {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${idToken}`,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    targetUid
                })
            });
            fetchFriends();
        } catch (e) {
            console.error(e);
        }
    };
    const handleRejectRequest = async (requesterUid)=>{
        const idToken = localStorage.getItem("idToken");
        if (!idToken) return;
        try {
            await fetch("/api/friends/reject", {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${idToken}`,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    requesterUid
                })
            });
            fetchFriends();
        } catch (e) {
            console.error(e);
        }
    };
    const handleBlockUser = async (targetUid)=>{
        const idToken = localStorage.getItem("idToken");
        if (!idToken) return;
        try {
            await fetch("/api/friends/block", {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${idToken}`,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    targetUid
                })
            });
            fetchFriends();
        } catch (e) {
            console.error(e);
        }
    };
    const handleUnblockUser = async (targetUid)=>{
        const idToken = localStorage.getItem("idToken");
        if (!idToken) return;
        try {
            await fetch("/api/friends/unblock", {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${idToken}`,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    targetUid
                })
            });
            fetchFriends();
        } catch (e) {
            console.error(e);
        }
    };
    // --- PARTY ACTIONS ---
    const handleCreateParty = async ()=>{
        setPartyError(null);
        const idToken = localStorage.getItem("idToken");
        if (!idToken) return;
        try {
            const res = await fetch("/api/party/create", {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${idToken}`
                }
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error);
            fetchPartyStatus();
        } catch (e) {
            setPartyError(e.message);
        }
    };
    const handleLeaveParty = async ()=>{
        const idToken = localStorage.getItem("idToken");
        if (!idToken) return;
        try {
            await fetch("/api/party/leave", {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${idToken}`
                }
            });
            setParty(null);
            fetchPartyStatus();
        } catch (e) {
            console.error(e);
        }
    };
    const handleInviteToParty = async ()=>{
        setPartyError(null);
        setPartySuccess(null);
        const idToken = localStorage.getItem("idToken");
        if (!idToken || !partyTargetUsername) return;
        try {
            const res = await fetch("/api/party/invite", {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${idToken}`,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    targetUsername: partyTargetUsername
                })
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error);
            setPartySuccess(`Invited ${partyTargetUsername}`);
            setPartyTargetUsername("");
        } catch (e) {
            setPartyError(e.message);
        }
    };
    const handleJoinParty = async (partyId)=>{
        const idToken = localStorage.getItem("idToken");
        if (!idToken) return;
        try {
            const res = await fetch("/api/party/join", {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${idToken}`,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    partyId
                })
            });
            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error);
            }
            fetchPartyStatus();
        } catch (e) {
            setPartyError(e.message);
        }
    };
    const handleTransferLeadership = async (targetUid)=>{
        const idToken = localStorage.getItem("idToken");
        if (!idToken) return;
        try {
            const res = await fetch("/api/party/transfer", {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${idToken}`,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    targetUid
                })
            });
            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error);
            }
            fetchPartyStatus();
        } catch (e) {
            setPartyError(e.message);
        }
    };
    const handleKickMember = async (targetUid)=>{
        const idToken = localStorage.getItem("idToken");
        if (!idToken) return;
        try {
            const res = await fetch("/api/party/kick", {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${idToken}`,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    targetUid
                })
            });
            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error);
            }
            fetchPartyStatus();
        } catch (e) {
            setPartyError(e.message);
        }
    };
    const handlePartySettings = async (privacy)=>{
        const idToken = localStorage.getItem("idToken");
        if (!idToken) return;
        try {
            const res = await fetch("/api/party/settings", {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${idToken}`,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    privacy
                })
            });
            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error);
            }
            fetchPartyStatus();
        } catch (e) {
            setPartyError(e.message);
        }
    };
    if (loading) {
        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
            style: styles.container,
            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                style: styles.card,
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("p", {
                    style: {
                        color: "#c8cbd2"
                    },
                    children: "Loading social data..."
                }, void 0, false, {
                    fileName: "[project]/Documents/GitHub/ThangBackend/pages/social.tsx",
                    lineNumber: 438,
                    columnNumber: 11
                }, this)
            }, void 0, false, {
                fileName: "[project]/Documents/GitHub/ThangBackend/pages/social.tsx",
                lineNumber: 437,
                columnNumber: 9
            }, this)
        }, void 0, false, {
            fileName: "[project]/Documents/GitHub/ThangBackend/pages/social.tsx",
            lineNumber: 436,
            columnNumber: 7
        }, this);
    }
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
        style: styles.container,
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
            style: styles.card,
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("h1", {
                    style: styles.title,
                    children: "Social Hub"
                }, void 0, false, {
                    fileName: "[project]/Documents/GitHub/ThangBackend/pages/social.tsx",
                    lineNumber: 447,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("h2", {
                    style: styles.sectionTitle,
                    children: "Party"
                }, void 0, false, {
                    fileName: "[project]/Documents/GitHub/ThangBackend/pages/social.tsx",
                    lineNumber: 450,
                    columnNumber: 9
                }, this),
                party ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                    style: styles.partyBox,
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                            style: styles.partyHeader,
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("span", {
                                    style: {
                                        color: "#10b981",
                                        fontWeight: "bold"
                                    },
                                    children: "In Party"
                                }, void 0, false, {
                                    fileName: "[project]/Documents/GitHub/ThangBackend/pages/social.tsx",
                                    lineNumber: 455,
                                    columnNumber: 15
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("button", {
                                    onClick: handleLeaveParty,
                                    style: styles.dangerButton,
                                    children: "Leave"
                                }, void 0, false, {
                                    fileName: "[project]/Documents/GitHub/ThangBackend/pages/social.tsx",
                                    lineNumber: 458,
                                    columnNumber: 15
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/Documents/GitHub/ThangBackend/pages/social.tsx",
                            lineNumber: 454,
                            columnNumber: 13
                        }, this),
                        party.leaderUid === currentUserUid && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                            style: {
                                marginBottom: "16px"
                            },
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("span", {
                                    style: {
                                        fontSize: "14px",
                                        color: "#9ca3af",
                                        marginRight: "8px"
                                    },
                                    children: [
                                        "Privacy: ",
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("b", {
                                            children: party.privacy || "private"
                                        }, void 0, false, {
                                            fileName: "[project]/Documents/GitHub/ThangBackend/pages/social.tsx",
                                            lineNumber: 472,
                                            columnNumber: 28
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/Documents/GitHub/ThangBackend/pages/social.tsx",
                                    lineNumber: 465,
                                    columnNumber: 17
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("button", {
                                    onClick: ()=>handlePartySettings(party.privacy === "public" ? "private" : "public"),
                                    style: styles.smallButton,
                                    children: [
                                        "Switch to ",
                                        party.privacy === "public" ? "Private" : "Public"
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/Documents/GitHub/ThangBackend/pages/social.tsx",
                                    lineNumber: 474,
                                    columnNumber: 17
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/Documents/GitHub/ThangBackend/pages/social.tsx",
                            lineNumber: 464,
                            columnNumber: 15
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("h3", {
                            style: styles.subTitle,
                            children: "Members"
                        }, void 0, false, {
                            fileName: "[project]/Documents/GitHub/ThangBackend/pages/social.tsx",
                            lineNumber: 487,
                            columnNumber: 13
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                            style: styles.list,
                            children: party.members.map((m)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                    style: styles.listItem,
                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                        style: {
                                            display: "flex",
                                            justifyContent: "space-between",
                                            alignItems: "center",
                                            width: "100%"
                                        },
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("span", {
                                                children: [
                                                    m.username,
                                                    " ",
                                                    m.uid === party.leaderUid && "👑"
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/Documents/GitHub/ThangBackend/pages/social.tsx",
                                                lineNumber: 499,
                                                columnNumber: 21
                                            }, this),
                                            party.leaderUid === currentUserUid && m.uid !== currentUserUid && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                                style: {
                                                    display: "flex",
                                                    gap: "4px"
                                                },
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("button", {
                                                        onClick: ()=>handleTransferLeadership(m.uid),
                                                        style: styles.promoteButton,
                                                        children: "Promote"
                                                    }, void 0, false, {
                                                        fileName: "[project]/Documents/GitHub/ThangBackend/pages/social.tsx",
                                                        lineNumber: 505,
                                                        columnNumber: 27
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("button", {
                                                        onClick: ()=>handleKickMember(m.uid),
                                                        style: styles.dangerButton,
                                                        children: "Kick"
                                                    }, void 0, false, {
                                                        fileName: "[project]/Documents/GitHub/ThangBackend/pages/social.tsx",
                                                        lineNumber: 511,
                                                        columnNumber: 27
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/Documents/GitHub/ThangBackend/pages/social.tsx",
                                                lineNumber: 504,
                                                columnNumber: 25
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/Documents/GitHub/ThangBackend/pages/social.tsx",
                                        lineNumber: 491,
                                        columnNumber: 19
                                    }, this)
                                }, m.uid, false, {
                                    fileName: "[project]/Documents/GitHub/ThangBackend/pages/social.tsx",
                                    lineNumber: 490,
                                    columnNumber: 17
                                }, this))
                        }, void 0, false, {
                            fileName: "[project]/Documents/GitHub/ThangBackend/pages/social.tsx",
                            lineNumber: 488,
                            columnNumber: 13
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                            style: styles.divider
                        }, void 0, false, {
                            fileName: "[project]/Documents/GitHub/ThangBackend/pages/social.tsx",
                            lineNumber: 524,
                            columnNumber: 13
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("h3", {
                            style: styles.subTitle,
                            children: "Invite Player"
                        }, void 0, false, {
                            fileName: "[project]/Documents/GitHub/ThangBackend/pages/social.tsx",
                            lineNumber: 526,
                            columnNumber: 13
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                            style: {
                                display: "flex",
                                gap: "8px"
                            },
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("input", {
                                    type: "text",
                                    placeholder: "Username",
                                    value: partyTargetUsername,
                                    onChange: (e)=>setPartyTargetUsername(e.target.value),
                                    style: styles.input
                                }, void 0, false, {
                                    fileName: "[project]/Documents/GitHub/ThangBackend/pages/social.tsx",
                                    lineNumber: 528,
                                    columnNumber: 15
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("button", {
                                    onClick: handleInviteToParty,
                                    style: styles.smallButton,
                                    children: "Invite"
                                }, void 0, false, {
                                    fileName: "[project]/Documents/GitHub/ThangBackend/pages/social.tsx",
                                    lineNumber: 535,
                                    columnNumber: 15
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/Documents/GitHub/ThangBackend/pages/social.tsx",
                            lineNumber: 527,
                            columnNumber: 13
                        }, this),
                        partyError && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("p", {
                            style: styles.errorText,
                            children: partyError
                        }, void 0, false, {
                            fileName: "[project]/Documents/GitHub/ThangBackend/pages/social.tsx",
                            lineNumber: 539,
                            columnNumber: 28
                        }, this),
                        partySuccess && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("p", {
                            style: styles.successText,
                            children: partySuccess
                        }, void 0, false, {
                            fileName: "[project]/Documents/GitHub/ThangBackend/pages/social.tsx",
                            lineNumber: 540,
                            columnNumber: 30
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/Documents/GitHub/ThangBackend/pages/social.tsx",
                    lineNumber: 453,
                    columnNumber: 11
                }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                    style: styles.partyBox,
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("p", {
                            style: {
                                color: "#9ca3af",
                                marginBottom: "12px"
                            },
                            children: "You are not in a party."
                        }, void 0, false, {
                            fileName: "[project]/Documents/GitHub/ThangBackend/pages/social.tsx",
                            lineNumber: 544,
                            columnNumber: 13
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("button", {
                            onClick: handleCreateParty,
                            style: styles.button,
                            children: "Create Party"
                        }, void 0, false, {
                            fileName: "[project]/Documents/GitHub/ThangBackend/pages/social.tsx",
                            lineNumber: 547,
                            columnNumber: 13
                        }, this),
                        partyError && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("p", {
                            style: styles.errorText,
                            children: partyError
                        }, void 0, false, {
                            fileName: "[project]/Documents/GitHub/ThangBackend/pages/social.tsx",
                            lineNumber: 550,
                            columnNumber: 28
                        }, this),
                        partyInvites.length > 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                            style: {
                                marginTop: "20px"
                            },
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("h3", {
                                    style: styles.subTitle,
                                    children: "Party Invites"
                                }, void 0, false, {
                                    fileName: "[project]/Documents/GitHub/ThangBackend/pages/social.tsx",
                                    lineNumber: 554,
                                    columnNumber: 17
                                }, this),
                                partyInvites.map((inv)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                        style: styles.inviteItem,
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("span", {
                                                children: [
                                                    "Invited by ",
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("b", {
                                                        children: inv.leaderUsername
                                                    }, void 0, false, {
                                                        fileName: "[project]/Documents/GitHub/ThangBackend/pages/social.tsx",
                                                        lineNumber: 558,
                                                        columnNumber: 34
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/Documents/GitHub/ThangBackend/pages/social.tsx",
                                                lineNumber: 557,
                                                columnNumber: 21
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("button", {
                                                onClick: ()=>handleJoinParty(inv.partyId),
                                                style: styles.acceptButton,
                                                children: "Join"
                                            }, void 0, false, {
                                                fileName: "[project]/Documents/GitHub/ThangBackend/pages/social.tsx",
                                                lineNumber: 560,
                                                columnNumber: 21
                                            }, this)
                                        ]
                                    }, inv.partyId, true, {
                                        fileName: "[project]/Documents/GitHub/ThangBackend/pages/social.tsx",
                                        lineNumber: 556,
                                        columnNumber: 19
                                    }, this))
                            ]
                        }, void 0, true, {
                            fileName: "[project]/Documents/GitHub/ThangBackend/pages/social.tsx",
                            lineNumber: 553,
                            columnNumber: 15
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/Documents/GitHub/ThangBackend/pages/social.tsx",
                    lineNumber: 543,
                    columnNumber: 11
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                    style: styles.sectionDivider
                }, void 0, false, {
                    fileName: "[project]/Documents/GitHub/ThangBackend/pages/social.tsx",
                    lineNumber: 573,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("h2", {
                    style: styles.sectionTitle,
                    children: "Friends"
                }, void 0, false, {
                    fileName: "[project]/Documents/GitHub/ThangBackend/pages/social.tsx",
                    lineNumber: 576,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                    style: styles.addFriendBox,
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                            style: {
                                display: "flex",
                                gap: "8px"
                            },
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("input", {
                                    type: "text",
                                    placeholder: "Enter username to add",
                                    value: targetUsername,
                                    onChange: (e)=>setTargetUsername(e.target.value),
                                    style: styles.input
                                }, void 0, false, {
                                    fileName: "[project]/Documents/GitHub/ThangBackend/pages/social.tsx",
                                    lineNumber: 581,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("button", {
                                    onClick: handleSendFriendRequest,
                                    style: styles.smallButton,
                                    children: "Add"
                                }, void 0, false, {
                                    fileName: "[project]/Documents/GitHub/ThangBackend/pages/social.tsx",
                                    lineNumber: 588,
                                    columnNumber: 13
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/Documents/GitHub/ThangBackend/pages/social.tsx",
                            lineNumber: 580,
                            columnNumber: 11
                        }, this),
                        friendError && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("p", {
                            style: styles.errorText,
                            children: friendError
                        }, void 0, false, {
                            fileName: "[project]/Documents/GitHub/ThangBackend/pages/social.tsx",
                            lineNumber: 595,
                            columnNumber: 27
                        }, this),
                        friendSuccess && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("p", {
                            style: styles.successText,
                            children: friendSuccess
                        }, void 0, false, {
                            fileName: "[project]/Documents/GitHub/ThangBackend/pages/social.tsx",
                            lineNumber: 596,
                            columnNumber: 29
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/Documents/GitHub/ThangBackend/pages/social.tsx",
                    lineNumber: 579,
                    columnNumber: 9
                }, this),
                requests.filter((r)=>r.type === "incoming").length > 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                    style: styles.requestsBox,
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("h3", {
                            style: styles.subTitle,
                            children: "Pending Requests"
                        }, void 0, false, {
                            fileName: "[project]/Documents/GitHub/ThangBackend/pages/social.tsx",
                            lineNumber: 602,
                            columnNumber: 13
                        }, this),
                        requests.filter((r)=>r.type === "incoming").map((req)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                style: styles.requestItem,
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("span", {
                                        children: req.username
                                    }, void 0, false, {
                                        fileName: "[project]/Documents/GitHub/ThangBackend/pages/social.tsx",
                                        lineNumber: 607,
                                        columnNumber: 19
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                        style: {
                                            display: "flex",
                                            gap: "8px"
                                        },
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("button", {
                                                onClick: ()=>handleAcceptFriendRequest(req.uid),
                                                style: styles.acceptButton,
                                                children: "Accept"
                                            }, void 0, false, {
                                                fileName: "[project]/Documents/GitHub/ThangBackend/pages/social.tsx",
                                                lineNumber: 609,
                                                columnNumber: 21
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("button", {
                                                onClick: ()=>handleRejectRequest(req.uid),
                                                style: styles.dangerButton,
                                                children: "Reject"
                                            }, void 0, false, {
                                                fileName: "[project]/Documents/GitHub/ThangBackend/pages/social.tsx",
                                                lineNumber: 615,
                                                columnNumber: 21
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("button", {
                                                onClick: ()=>handleBlockUser(req.uid),
                                                style: {
                                                    ...styles.dangerButton,
                                                    background: "#4b5563"
                                                },
                                                children: "Block"
                                            }, void 0, false, {
                                                fileName: "[project]/Documents/GitHub/ThangBackend/pages/social.tsx",
                                                lineNumber: 621,
                                                columnNumber: 21
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/Documents/GitHub/ThangBackend/pages/social.tsx",
                                        lineNumber: 608,
                                        columnNumber: 19
                                    }, this)
                                ]
                            }, req.uid, true, {
                                fileName: "[project]/Documents/GitHub/ThangBackend/pages/social.tsx",
                                lineNumber: 606,
                                columnNumber: 17
                            }, this))
                    ]
                }, void 0, true, {
                    fileName: "[project]/Documents/GitHub/ThangBackend/pages/social.tsx",
                    lineNumber: 601,
                    columnNumber: 11
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                    style: styles.friendList,
                    children: friends.length === 0 ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("p", {
                        style: styles.emptyText,
                        children: "No friends yet. Add someone!"
                    }, void 0, false, {
                        fileName: "[project]/Documents/GitHub/ThangBackend/pages/social.tsx",
                        lineNumber: 636,
                        columnNumber: 13
                    }, this) : friends.map((friend)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                            style: styles.friendItem,
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                    style: styles.friendInfo,
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                            style: {
                                                ...styles.statusDot,
                                                background: friend.status === "online" ? "#10b981" : "#6b7280"
                                            }
                                        }, void 0, false, {
                                            fileName: "[project]/Documents/GitHub/ThangBackend/pages/social.tsx",
                                            lineNumber: 641,
                                            columnNumber: 19
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("span", {
                                            style: styles.friendName,
                                            children: friend.username
                                        }, void 0, false, {
                                            fileName: "[project]/Documents/GitHub/ThangBackend/pages/social.tsx",
                                            lineNumber: 648,
                                            columnNumber: 19
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/Documents/GitHub/ThangBackend/pages/social.tsx",
                                    lineNumber: 640,
                                    columnNumber: 17
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                    style: {
                                        display: "flex",
                                        alignItems: "center",
                                        gap: "8px"
                                    },
                                    children: [
                                        friend.party?.privacy === "public" && !friend.party.isFull && !party && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("button", {
                                            onClick: ()=>handleJoinParty(friend.party.id),
                                            style: styles.joinButton,
                                            children: "Join Party"
                                        }, void 0, false, {
                                            fileName: "[project]/Documents/GitHub/ThangBackend/pages/social.tsx",
                                            lineNumber: 656,
                                            columnNumber: 23
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("span", {
                                            style: styles.friendStatus,
                                            children: friend.status === "online" ? "Online" : "Offline"
                                        }, void 0, false, {
                                            fileName: "[project]/Documents/GitHub/ThangBackend/pages/social.tsx",
                                            lineNumber: 663,
                                            columnNumber: 19
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("button", {
                                            onClick: ()=>handleRemoveFriend(friend.uid),
                                            style: styles.dangerButton,
                                            children: "Remove"
                                        }, void 0, false, {
                                            fileName: "[project]/Documents/GitHub/ThangBackend/pages/social.tsx",
                                            lineNumber: 666,
                                            columnNumber: 19
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("button", {
                                            onClick: ()=>handleBlockUser(friend.uid),
                                            style: {
                                                ...styles.dangerButton,
                                                background: "#4b5563"
                                            },
                                            children: "Block"
                                        }, void 0, false, {
                                            fileName: "[project]/Documents/GitHub/ThangBackend/pages/social.tsx",
                                            lineNumber: 672,
                                            columnNumber: 19
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/Documents/GitHub/ThangBackend/pages/social.tsx",
                                    lineNumber: 650,
                                    columnNumber: 17
                                }, this)
                            ]
                        }, friend.uid, true, {
                            fileName: "[project]/Documents/GitHub/ThangBackend/pages/social.tsx",
                            lineNumber: 639,
                            columnNumber: 15
                        }, this))
                }, void 0, false, {
                    fileName: "[project]/Documents/GitHub/ThangBackend/pages/social.tsx",
                    lineNumber: 634,
                    columnNumber: 9
                }, this),
                blockedUsers.length > 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["Fragment"], {
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                            style: styles.sectionDivider
                        }, void 0, false, {
                            fileName: "[project]/Documents/GitHub/ThangBackend/pages/social.tsx",
                            lineNumber: 687,
                            columnNumber: 13
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("h2", {
                            style: styles.sectionTitle,
                            children: "Blocked Users"
                        }, void 0, false, {
                            fileName: "[project]/Documents/GitHub/ThangBackend/pages/social.tsx",
                            lineNumber: 688,
                            columnNumber: 13
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                            style: styles.list,
                            children: blockedUsers.map((user)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                    style: styles.listItem,
                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                        style: {
                                            display: "flex",
                                            justifyContent: "space-between",
                                            alignItems: "center",
                                            width: "100%"
                                        },
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("span", {
                                                style: {
                                                    color: "#9ca3af",
                                                    fontSize: "14px"
                                                },
                                                children: user.uid
                                            }, void 0, false, {
                                                fileName: "[project]/Documents/GitHub/ThangBackend/pages/social.tsx",
                                                lineNumber: 700,
                                                columnNumber: 21
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("button", {
                                                onClick: ()=>handleUnblockUser(user.uid),
                                                style: styles.smallButton,
                                                children: "Unblock"
                                            }, void 0, false, {
                                                fileName: "[project]/Documents/GitHub/ThangBackend/pages/social.tsx",
                                                lineNumber: 703,
                                                columnNumber: 21
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/Documents/GitHub/ThangBackend/pages/social.tsx",
                                        lineNumber: 692,
                                        columnNumber: 19
                                    }, this)
                                }, user.uid, false, {
                                    fileName: "[project]/Documents/GitHub/ThangBackend/pages/social.tsx",
                                    lineNumber: 691,
                                    columnNumber: 17
                                }, this))
                        }, void 0, false, {
                            fileName: "[project]/Documents/GitHub/ThangBackend/pages/social.tsx",
                            lineNumber: 689,
                            columnNumber: 13
                        }, this)
                    ]
                }, void 0, true),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                    style: styles.sectionDivider
                }, void 0, false, {
                    fileName: "[project]/Documents/GitHub/ThangBackend/pages/social.tsx",
                    lineNumber: 716,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("button", {
                    onClick: ()=>router.push("/profile"),
                    style: styles.secondaryButton,
                    children: "Back to Profile"
                }, void 0, false, {
                    fileName: "[project]/Documents/GitHub/ThangBackend/pages/social.tsx",
                    lineNumber: 718,
                    columnNumber: 9
                }, this)
            ]
        }, void 0, true, {
            fileName: "[project]/Documents/GitHub/ThangBackend/pages/social.tsx",
            lineNumber: 446,
            columnNumber: 7
        }, this)
    }, void 0, false, {
        fileName: "[project]/Documents/GitHub/ThangBackend/pages/social.tsx",
        lineNumber: 445,
        columnNumber: 5
    }, this);
}
const styles = {
    container: {
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        minHeight: "100vh",
        background: "#0b0d10",
        color: "#e7e9ed",
        fontFamily: "Inter, system-ui, -apple-system, sans-serif",
        padding: "20px"
    },
    card: {
        background: "#11141a",
        border: "1px solid #1e232d",
        borderRadius: "6px",
        padding: "36px",
        boxShadow: "0 12px 40px rgba(0, 0, 0, 0.35)",
        maxWidth: "540px",
        width: "100%"
    },
    title: {
        margin: "0 0 28px 0",
        fontSize: "26px",
        fontWeight: 700,
        letterSpacing: "-0.01em",
        color: "#f5f7fb",
        textAlign: "center"
    },
    sectionTitle: {
        fontSize: "18px",
        color: "#f5f7fb",
        marginBottom: "16px"
    },
    sectionDivider: {
        height: "1px",
        background: "#1e232d",
        margin: "24px 0"
    },
    input: {
        width: "100%",
        padding: "12px",
        borderRadius: "4px",
        border: "1px solid #1f2a3a",
        background: "#0b0d10",
        color: "#f5f7fb",
        fontSize: "14px",
        outline: "none"
    },
    button: {
        width: "100%",
        padding: "12px 20px",
        fontSize: "15px",
        fontWeight: 600,
        border: "1px solid #1f2a3a",
        borderRadius: "4px",
        background: "#0f62fe",
        color: "#f5f7fb",
        cursor: "pointer",
        marginBottom: "10px"
    },
    secondaryButton: {
        width: "100%",
        padding: "12px 20px",
        fontSize: "15px",
        fontWeight: 600,
        border: "1px solid #1f2a3a",
        borderRadius: "4px",
        background: "transparent",
        color: "#9ca3af",
        cursor: "pointer"
    },
    smallButton: {
        padding: "0 16px",
        background: "#2563eb",
        color: "white",
        border: "none",
        borderRadius: "4px",
        cursor: "pointer",
        fontWeight: 600
    },
    dangerButton: {
        padding: "4px 12px",
        background: "#ef4444",
        color: "white",
        border: "none",
        borderRadius: "4px",
        cursor: "pointer",
        fontSize: "12px"
    },
    acceptButton: {
        padding: "4px 12px",
        background: "#10b981",
        color: "white",
        border: "none",
        borderRadius: "4px",
        cursor: "pointer",
        fontSize: "12px"
    },
    promoteButton: {
        padding: "4px 12px",
        background: "#f59e0b",
        color: "white",
        border: "none",
        borderRadius: "4px",
        cursor: "pointer",
        fontSize: "12px",
        marginLeft: "8px"
    },
    errorText: {
        color: "#f87171",
        fontSize: "12px",
        marginTop: "6px"
    },
    successText: {
        color: "#34d399",
        fontSize: "12px",
        marginTop: "6px"
    },
    partyBox: {
        background: "#1f2937",
        padding: "16px",
        borderRadius: "6px",
        marginBottom: "20px"
    },
    partyHeader: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: "12px"
    },
    subTitle: {
        fontSize: "14px",
        color: "#9ca3af",
        margin: "0 0 10px 0",
        textTransform: "uppercase",
        letterSpacing: "0.05em"
    },
    list: {
        display: "flex",
        flexDirection: "column",
        gap: "8px",
        marginBottom: "16px"
    },
    listItem: {
        background: "#111827",
        padding: "8px 12px",
        borderRadius: "4px",
        fontSize: "14px"
    },
    divider: {
        height: "1px",
        background: "#374151",
        margin: "16px 0"
    },
    inviteItem: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        background: "#111827",
        padding: "10px",
        borderRadius: "4px",
        marginBottom: "8px",
        fontSize: "14px"
    },
    addFriendBox: {
        marginBottom: "20px"
    },
    requestsBox: {
        background: "#1f2937",
        padding: "12px",
        borderRadius: "6px",
        marginBottom: "20px"
    },
    requestItem: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: "8px",
        fontSize: "14px"
    },
    friendList: {
        display: "flex",
        flexDirection: "column",
        gap: "10px"
    },
    friendItem: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        background: "#0f1218",
        padding: "12px",
        borderRadius: "6px",
        border: "1px solid #1f2a3a"
    },
    friendInfo: {
        display: "flex",
        alignItems: "center",
        gap: "10px"
    },
    statusDot: {
        width: "8px",
        height: "8px",
        borderRadius: "50%"
    },
    friendName: {
        color: "#e5e7eb",
        fontSize: "14px",
        fontWeight: 500
    },
    joinButton: {
        padding: "4px 12px",
        background: "#2563eb",
        color: "white",
        border: "none",
        borderRadius: "4px",
        cursor: "pointer",
        fontSize: "12px",
        marginRight: "8px"
    },
    friendStatus: {
        color: "#9ca3af",
        fontSize: "12px"
    },
    emptyText: {
        color: "#6b7280",
        fontSize: "14px",
        fontStyle: "italic"
    }
};
}),
"[externals]/next/dist/shared/lib/no-fallback-error.external.js [external] (next/dist/shared/lib/no-fallback-error.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/shared/lib/no-fallback-error.external.js", () => require("next/dist/shared/lib/no-fallback-error.external.js"));

module.exports = mod;
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__f5757f24._.js.map