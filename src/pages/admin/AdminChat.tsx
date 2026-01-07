import { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { HubConnection, HubConnectionBuilder, HubConnectionState } from '@microsoft/signalr';
import { Reply, X, Trash2 } from 'lucide-react';
import { api } from '../../services/api';
import { config } from '../../config';
import * as Crypto from '../../services/CryptoService';
import '../../pages/Admin.css';
import './AdminChat.css';
import Snackbar from '../../components/ui/Snackbar';
import ConfirmationModal from '../../components/ui/ConfirmationModal';

interface Message {
    sender: string;
    receiver: string;
    content: string;
    timestamp: string;
    isRead?: boolean;
}

interface User {
    id: number;
    username: string;
    role: string;
    fullName?: string;
    unreadCount?: number;
    publicKey?: string;
}

export default function AdminChat() {
    const [searchParams] = useSearchParams();
    const [connection, setConnection] = useState<HubConnection | null>(null);
    const [messages, setMessages] = useState<Message[]>([]);
    const [users, setUsers] = useState<User[]>([]);
    const [activeUser, setActiveUser] = useState<User | null>(null);
    const [messageInput, setMessageInput] = useState('');
    const chatBoxRef = useRef<HTMLDivElement>(null);

    // Modal & Snackbar
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [snackbar, setSnackbar] = useState<{ isOpen: boolean; message: string; type: 'success' | 'error' | 'info' }>({
        isOpen: false, message: '', type: 'info'
    });

    const showSnackbar = (message: string, type: 'success' | 'error' | 'info') => setSnackbar({ isOpen: true, message, type });
    const closeSnackbar = () => setSnackbar(prev => ({ ...prev, isOpen: false }));

    const [replyingTo, setReplyingTo] = useState<{ sender: string, content: string, originalMessageTimestamp: string } | null>(null);
    const [myKeyPair, setMyKeyPair] = useState<CryptoKeyPair | null>(null);
    const [decryptedCache, setDecryptedCache] = useState<{ [key: string]: string }>({});

    // New State for Attachment
    const [pendingAttachment, setPendingAttachment] = useState<{ url: string, type: 'image' | 'file', name: string, html: string } | null>(null);

    // Auth & Crypto Init
    const token = localStorage.getItem('authToken');
    const getUsernameFromToken = () => {
        if (!token) return 'admin';
        try {
            const base64Url = token.split('.')[1];
            const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
            const jsonPayload = decodeURIComponent(window.atob(base64).split('').map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)).join(''));
            return (JSON.parse(jsonPayload).unique_name || 'admin').toLowerCase();
        } catch (e) { return 'admin'; }
    };
    const currentUser = getUsernameFromToken();

    useEffect(() => {
        const initCrypto = async () => {
            let keyPair: CryptoKeyPair;
            const savedPriv = localStorage.getItem(`privKey_${currentUser}`);
            const savedPub = localStorage.getItem(`pubKey_${currentUser}`);

            try {
                // 1. Check Server First (Single Source of Truth)
                const serverKeys = await api.getUserKeys();

                if (serverKeys.publicKey && serverKeys.privateKey) {
                    console.log("Found sync keys on server, using them...");
                    const privateKey = await Crypto.importKey(serverKeys.privateKey, 'private');
                    const publicKey = await Crypto.importKey(serverKeys.publicKey, 'public');
                    keyPair = { privateKey, publicKey };

                    // Update local storage to match server
                    localStorage.setItem(`privKey_${currentUser}`, serverKeys.privateKey);
                    localStorage.setItem(`pubKey_${currentUser}`, serverKeys.publicKey);
                }
                else if (savedPriv && savedPub) {
                    // 2. No server keys, but have local keys -> Push to server
                    console.log("No server keys, syncing local keys to server...");
                    const privateKey = await Crypto.importKey(savedPriv, 'private');
                    const publicKey = await Crypto.importKey(savedPub, 'public');
                    keyPair = { privateKey, publicKey };

                    await api.updateUserKeys({ publicKey: savedPub, privateKey: savedPriv });
                }
                else {
                    // 3. No keys anywhere -> Generate New & Sync
                    console.log("Generating fresh E2EE keys...");
                    keyPair = await Crypto.generateKeyPair();
                    const expPriv = await Crypto.exportKey(keyPair.privateKey);
                    const expPub = await Crypto.exportKey(keyPair.publicKey);

                    localStorage.setItem(`privKey_${currentUser}`, expPriv);
                    localStorage.setItem(`pubKey_${currentUser}`, expPub);

                    await api.updateUserKeys({ publicKey: expPub, privateKey: expPriv });
                }
            } catch (e) {
                console.error("Key sync failed, falling back to local/memory", e);
                // Last resort fallback
                if (savedPriv && savedPub) {
                    const privateKey = await Crypto.importKey(savedPriv, 'private');
                    const publicKey = await Crypto.importKey(savedPub, 'public');
                    keyPair = { privateKey, publicKey };
                } else {
                    keyPair = await Crypto.generateKeyPair();
                }
            }
            // @ts-ignore
            setMyKeyPair(keyPair);
        };
        initCrypto();
    }, [currentUser]);

    // Data Loading & SignalR
    useEffect(() => {
        Promise.all([api.getChatHistory(), api.getUsers()]).then(([hist, usersData]) => {
            setMessages(hist);
            const others = usersData.filter((u: User) => u.username.toLowerCase() !== currentUser).map((u: User) => {
                const count = hist.filter((m: Message) => m.sender.toLowerCase() === u.username.toLowerCase() && m.receiver.toLowerCase() === currentUser && !m.isRead).length;
                return { ...u, unreadCount: count };
            });
            setUsers(others);
            const userParam = searchParams.get('user');
            if (userParam) {
                const target = others.find(u => u.username.toLowerCase() === userParam.toLowerCase());
                if (target) setActiveUser(target);
            }
        }).catch(console.error);

        if (!api.isMock) {
            const newConnection = new HubConnectionBuilder().withUrl(`${config.backendUrl}/chatHub`).withAutomaticReconnect().build();
            setConnection(newConnection);
        }
    }, [currentUser]);

    useEffect(() => {
        const userParam = searchParams.get('user');
        if (userParam && users.length > 0) {
            const target = users.find(u => u.username.toLowerCase() === userParam.toLowerCase());
            if (target && activeUser?.id !== target.id) setActiveUser(target);
        }
    }, [searchParams, users]);

    useEffect(() => {
        if (connection) {
            const handleReceiveMessage = (sender: string, receiver: string, message: string, timestamp: string) => {
                setMessages(prev => {
                    if (prev.some(m => m.timestamp === timestamp && m.sender === sender)) return prev;
                    return [...prev, { sender, receiver, content: message, timestamp, isRead: false }];
                });
                if (receiver.toLowerCase() === currentUser) {
                    if (!activeUser || sender.toLowerCase() !== activeUser.username.toLowerCase()) {
                        setUsers(prev => prev.map(u => u.username.toLowerCase() === sender.toLowerCase() ? { ...u, unreadCount: (u.unreadCount || 0) + 1 } : u));
                    } else {
                        markAsRead(sender);
                    }
                }
            };
            const handleMessagesRead = () => { };
            connection.on('ReceiveMessage', handleReceiveMessage);
            connection.on('MessagesRead', handleMessagesRead);
            if (connection.state === HubConnectionState.Disconnected) connection.start().then(() => console.log('Connected')).catch(e => console.log('Connection failed: ', e));
            return () => {
                connection.off('ReceiveMessage', handleReceiveMessage);
                connection.off('MessagesRead', handleMessagesRead);
            };
        }
    }, [connection, activeUser, currentUser]);

    // Decryption
    useEffect(() => {
        const decryptAll = async () => {
            if (!myKeyPair) return;
            const newCache = { ...decryptedCache };
            let changed = false;
            for (const m of messages) {
                const cacheKey = `${m.timestamp}_${m.sender}`;
                if (newCache[cacheKey]) continue;
                try {
                    if (m.content.startsWith('{') && m.content.includes('"keys"')) {
                        const envelope = JSON.parse(m.content);
                        const blob = envelope[currentUser];
                        if (blob) {
                            newCache[cacheKey] = await Crypto.decryptMessage(blob, myKeyPair.privateKey);
                            changed = true;
                        }
                    } else {
                        newCache[cacheKey] = m.content;
                        changed = true;
                    }
                } catch { newCache[cacheKey] = m.content; }
            }
            if (changed) setDecryptedCache(newCache);
        };
        decryptAll();
    }, [messages, myKeyPair, currentUser, decryptedCache]);

    const markAsRead = (target: string) => {
        if (connection && !api.isMock) connection.invoke('MarkAsRead', currentUser, target).catch(console.error);
    };

    useEffect(() => {
        if (activeUser) {
            markAsRead(activeUser.username);
            setUsers(prev => prev.map(u => u.id === activeUser.id ? { ...u, unreadCount: 0 } : u));
        }
        if (chatBoxRef.current) chatBoxRef.current.scrollTop = chatBoxRef.current.scrollHeight;
    }, [activeUser, messages]);

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            try {
                const url = await api.uploadImage(file);
                // Create attachment HTML but DON'T append to messageInput
                const isImage = file.type.startsWith('image/') || /\.(jpg|jpeg|png|gif|webp|bmp|svg)$/i.test(file.name);
                const type = isImage ? 'image' : 'file';
                const html = type === 'image'
                    ? `<img src="${url}" alt="Shared Image" />`
                    : `<div class="file-attachment"><a href="${url}" target="_blank">📎 ${file.name}</a></div>`;

                setPendingAttachment({ url, type, name: file.name, html });
            } catch { showSnackbar("Failed to upload file", 'error'); }
        }
    };

    const sendMessage = async () => {
        if ((!messageInput.trim() && !pendingAttachment) || !activeUser || !myKeyPair) return;

        let finalContent = messageInput;
        if (pendingAttachment) {
            // Append attachment HTML to the content
            finalContent = (finalContent ? finalContent + '<br/>' : '') + pendingAttachment.html;
        }

        if (replyingTo) {
            const quoteHtml = `<div class="chat-quote-block" data-reply-id="${replyingTo.originalMessageTimestamp}">
                <span class="quote-sender">${replyingTo.sender}</span>
                <div class="quote-text">${replyingTo.content}</div>
            </div>`;
            finalContent = quoteHtml + finalContent; // Quote goes first
        }

        try {
            const receiverUser = users.find(u => u.id === activeUser.id);
            if (receiverUser?.publicKey) {
                const receiverPub = await Crypto.importKey(receiverUser.publicKey, 'public');
                const encReceiver = await Crypto.encryptMessage(finalContent, receiverPub);
                const encSender = await Crypto.encryptMessage(finalContent, myKeyPair.publicKey);
                finalContent = JSON.stringify({
                    keys: { [activeUser.username.toLowerCase()]: "direct", [currentUser]: "direct" },
                    [activeUser.username.toLowerCase()]: encReceiver,
                    [currentUser]: encSender
                });
            } else {
                showSnackbar("This user has not set up E2EE yet. Sending in plaintext.", 'info');
            }
        } catch (e) {
            console.error("Encryption failed", e);
            showSnackbar("Encryption failed. Message not sent.", 'error');
            return;
        }

        if (connection && !api.isMock) {
            await connection.send('SendMessage', currentUser, activeUser.username, finalContent);
            setMessageInput('');
            setReplyingTo(null);
            setPendingAttachment(null);
        }
    };

    const handleDeleteConversation = () => setIsDeleteModalOpen(true);
    const confirmDelete = async () => {
        if (activeUser) {
            await api.deleteConversation(activeUser.username);
            setMessages(await api.getChatHistory());
            setIsDeleteModalOpen(false);
            showSnackbar('Conversation deleted.', 'success');
        }
    };

    const handleReply = (sender: string, content: string, ts: string) => {
        const div = document.createElement('div');
        div.innerHTML = content;
        div.querySelectorAll('.chat-quote-block').forEach(q => q.remove());

        // Check for images
        const img = div.querySelector('img');
        let replyContent = '';

        if (img) {
            let src = img.getAttribute('src');
            if (src) {
                // Fix relative URLs for comments/replies
                if (src.startsWith('/')) {
                    src = api.getAssetUrl(src);
                }
                replyContent = `<img src="${src}" class="reply-thumbnail" alt="Image" /> <span>Photo</span>`;
            } else {
                replyContent = '<span>Photo</span>';
            }
        } else {
            let clean = div.innerText.substring(0, 100);
            if (div.innerText.length > 100) clean += '...';
            replyContent = clean || 'Attachment';
        }

        setReplyingTo({ sender, content: replyContent, originalMessageTimestamp: ts });
    };

    const handleQuoteClick = (e: React.MouseEvent) => {
        const target = e.target as HTMLElement;
        const block = target.closest('.chat-quote-block');
        if (block) {
            const id = block.getAttribute('data-reply-id');
            if (id) {
                const el = document.getElementById(`msg-${id}`) || document.getElementById(`msg-${id.slice(0, -1)}`);
                if (el) {
                    el.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    el.classList.add('highlight-message');
                    setTimeout(() => el.classList.remove('highlight-message'), 2000);
                } else { showSnackbar("Original message not visible in current view.", 'info'); }
            }
        }
    };

    const activeMessages = messages.filter(m =>
        (m.sender.toLowerCase() === currentUser && m.receiver.toLowerCase() === activeUser?.username.toLowerCase()) ||
        (m.sender.toLowerCase() === activeUser?.username.toLowerCase() && m.receiver.toLowerCase() === currentUser)
    );

    const processContent = (html: string) => {
        return html.replace(/(src|href)="(\/[^"]+)"/g, (_, attr, path) => {
            return `${attr}="${api.getAssetUrl(path)}"`;
        });
    };

    return (
        <div className={`admin-content chat-layout ${activeUser ? 'mobile-chat-active' : ''}`}>
            <aside className="chat-sidebar">
                <div className="chat-sidebar-header" style={{ padding: '16px', borderBottom: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '60px' }}>
                    <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 600 }}>Direct Messages</h3>
                </div>
                <div className="user-list">
                    {users.map(u => (
                        <div key={u.id} className={`user-item ${activeUser?.id === u.id ? 'active' : ''} ${u.unreadCount && u.unreadCount > 0 ? 'has-unread' : ''}`} onClick={() => setActiveUser(u)}>
                            <img src={`https://api.dicebear.com/7.x/notionists/svg?seed=${u.username}`} className="avatar small" alt={u.username} style={{ background: '#f1f5f9' }} />
                            <div className="user-info-sidebar" style={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center' }}>
                                <span className="username" style={{ fontSize: '0.9rem', fontWeight: 500 }}>{u.fullName || u.username}</span>
                                {u.unreadCount && u.unreadCount > 0 ? <span className="unread-badge">{u.unreadCount}</span> : null}
                            </div>
                        </div>
                    ))}
                    {users.length === 0 && <div className="empty-users">No other users found.</div>}
                </div>
            </aside>

            <main className="chat-main">
                {activeUser ? (
                    <>
                        <header className="chat-header" style={{ justifyContent: 'space-between' }}>
                            <div className="user-profile">
                                <button className="mobile-back-btn icon-btn" onClick={() => setActiveUser(null)} style={{ marginRight: '8px', width: '32px', height: '32px' }}>
                                    ←
                                </button>
                                <img src={`https://api.dicebear.com/7.x/notionists/svg?seed=${activeUser.username}`} className="avatar" alt={activeUser.username} style={{ background: '#f8fafc' }} />
                                <div style={{ display: 'flex', flexDirection: 'column' }}>
                                    <b>{activeUser.fullName || activeUser.username}</b>
                                    {activeUser.publicKey
                                        ? <span style={{ fontSize: '0.7rem', color: '#10b981', fontWeight: 'normal' }}>🔒 End-to-End Encrypted</span>
                                        : <span style={{ fontSize: '0.7rem', color: '#ef4444', fontWeight: 'normal' }}>🔓 Insecure (User has no keys)</span>
                                    }
                                </div>
                            </div>
                            <button onClick={handleDeleteConversation} className="icon-btn danger-hover" title="Delete Conversation" style={{ color: 'var(--color-text-secondary)', background: 'none', border: 'none', cursor: 'pointer' }}>
                                <Trash2 size={20} />
                            </button>
                        </header>

                        <div className="messages-list" ref={chatBoxRef} onClick={handleQuoteClick}>
                            {activeMessages.map((m, i) => {
                                const raw = decryptedCache[`${m.timestamp}_${m.sender}`] || m.content;
                                const content = raw.replace(/^(<br\s*\/?>|\s)+|(<br\s*\/?>|\s)+$/gi, '').replace(/(<br\s*\/?>){3,}/gi, '<br><br>');
                                const finalHtml = processContent(content);
                                const isBlob = content.startsWith('{"keys":');
                                const isMine = m.sender.toLowerCase() === currentUser;
                                const avatarSeed = isMine ? currentUser : m.sender;

                                return (
                                    <div key={i} className={`message-row ${isMine ? 'mine' : ''}`}>
                                        {!isMine && (
                                            <img
                                                src={`https://api.dicebear.com/7.x/notionists/svg?seed=${avatarSeed}`}
                                                className="chat-avatar"
                                                alt={m.sender}
                                            />
                                        )}
                                        <div id={`msg-${m.timestamp}`} className={`message-bubble ${isMine ? 'my-message' : 'other-message'}`}>
                                            <div className="message-content">
                                                {isBlob ? <span style={{ fontStyle: 'italic', opacity: 0.7 }}>Decrypting...</span> : <div dangerouslySetInnerHTML={{ __html: finalHtml }} />}
                                            </div>
                                            <div className="message-actions">
                                                <button className="msg-action-btn" onClick={() => handleReply(m.sender, content, m.timestamp)} title="Reply"><Reply size={14} /></button>
                                            </div>
                                            <div className="message-time">{new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                                        </div>
                                    </div>
                                );
                            })}
                            {activeMessages.length === 0 && <div className="empty-chat">Say hello to start the conversation!</div>}
                        </div>

                        <div className="message-input-area">
                            <input type="file" id="file-upload" style={{ display: 'none' }} onChange={handleFileUpload} />

                            <div className="input-previews" style={{ position: 'absolute', bottom: '100%', left: '20px', right: '20px', display: 'flex', flexDirection: 'column-reverse', gap: '8px', marginBottom: '-1px', zIndex: 5 }}>
                                {replyingTo && (
                                    <div className="reply-preview-banner" style={{ position: 'relative', bottom: 'auto', left: 'auto', right: 'auto', marginBottom: 0 }}>
                                        <div className="reply-info">
                                            <span className="reply-label">Replying to {replyingTo.sender}</span>
                                            <div className="reply-preview-text" dangerouslySetInnerHTML={{ __html: replyingTo.content }} />
                                        </div>
                                        <button onClick={() => setReplyingTo(null)} className="close-reply-btn"><X size={16} /></button>
                                    </div>
                                )}
                                {pendingAttachment && (
                                    <div className="reply-preview-banner" style={{ position: 'relative', bottom: 'auto', left: 'auto', right: 'auto', marginBottom: 0 }}>
                                        <div className="reply-info" style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                                            {pendingAttachment.type === 'image'
                                                ? <img src={api.getAssetUrl(pendingAttachment.url)} alt="Preview" style={{ width: '40px', height: '40px', objectFit: 'cover', borderRadius: '4px' }} />
                                                : <span style={{ fontSize: '1.5rem' }}>📎</span>
                                            }
                                            <div style={{ display: 'flex', flexDirection: 'column' }}>
                                                <span className="reply-label">Attachment</span>
                                                <span className="reply-preview-text">{pendingAttachment.name}</span>
                                            </div>
                                        </div>
                                        <button onClick={() => setPendingAttachment(null)} className="close-reply-btn"><X size={16} /></button>
                                    </div>
                                )}
                            </div>

                            <button className="icon-btn" title="Attach File" onClick={() => document.getElementById('file-upload')?.click()} style={{ marginRight: '10px' }}>📎</button>
                            <div className="editor-wrapper" style={{ background: 'transparent', border: 'none', padding: 0 }}>
                                <textarea
                                    className="chat-textarea"
                                    value={messageInput}
                                    onChange={e => setMessageInput(e.target.value)}
                                    placeholder={`Message ${activeUser.username}...`}
                                    onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); } }}
                                    rows={1}
                                    style={{ height: 'auto', minHeight: '48px' }}
                                />
                            </div>
                            <button className="primary-btn" onClick={sendMessage}>Send</button>
                        </div>
                    </>
                ) : (
                    <div className="no-chat-selected">Select a user to start chatting</div>
                )}
            </main>
            <Snackbar isOpen={snackbar.isOpen} message={snackbar.message} type={snackbar.type} onClose={closeSnackbar} />
            <ConfirmationModal isOpen={isDeleteModalOpen} onClose={() => setIsDeleteModalOpen(false)} onConfirm={confirmDelete} title="Delete Conversation" message={`Are you sure you want to delete the conversation with ${activeUser?.username}? This action cannot be undone.`} confirmText="Delete" type="danger" />
        </div>
    );
}
