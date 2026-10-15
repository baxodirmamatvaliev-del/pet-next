import { useEffect, useRef, useState } from 'react';
import { useReactiveVar } from '@apollo/client';
import { Avatar, Badge, Box, Stack } from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import CloseFullscreenIcon from '@mui/icons-material/CloseFullscreen';
import MarkChatUnreadIcon from '@mui/icons-material/MarkChatUnread';
import { styled } from '@mui/material/styles';
import { authReadyVar, userVar } from '../../apollo/store';
import { getValidAccessToken } from '../auth';
import { REACT_APP_API_URL, REACT_APP_API_WS } from '../config';

interface ChatMessage {
	event: string;
	text: string;
	memberData?: { _id: string; memberNick?: string; memberImage?: string } | null;
}

const isMessage = (value: unknown): value is ChatMessage => {
	if (!value || typeof value !== 'object') return false;
	const message = value as ChatMessage;
	return typeof message.text === 'string' && (message.memberData == null ||
		(typeof message.memberData === 'object' && typeof message.memberData._id === 'string' &&
			(message.memberData.memberImage == null || typeof message.memberData.memberImage === 'string') &&
			(message.memberData.memberNick == null || typeof message.memberData.memberNick === 'string')));
};

const RippleBadge = styled(Badge)({
	'& .MuiBadge-badge': {
		backgroundColor: '#b4dcff8f', color: '#2c40bdd6',
		'&::after': {
			position: 'absolute', inset: 0, borderRadius: '50%',
			animation: 'chat-ripple 1.2s infinite ease-in-out', border: '2px solid #32c2c1', content: '""',
		},
	},
	'@keyframes chat-ripple': {
		'0%': { transform: 'scale(.8)', opacity: 1 },
		'100%': { transform: 'scale(2.4)', opacity: 0 },
	},
});

export default function Chat() {
	const user = useReactiveVar(userVar);
	const authReady = useReactiveVar(authReadyVar);
	const socketRef = useRef<WebSocket | null>(null);
	const contentRef = useRef<HTMLDivElement>(null);
	const [messages, setMessages] = useState<ChatMessage[]>([]);
	const [onlineUsers, setOnlineUsers] = useState(0);
	const [messageInput, setMessageInput] = useState('');
	const [open, setOpen] = useState(false);
	const [connected, setConnected] = useState(false);

	// Login, logout and token refresh reconnect with the current in-memory token.
	useEffect(() => {
		if (!authReady) return;
		let disposed = false;
		let retry: ReturnType<typeof setTimeout> | undefined;
		let socket: WebSocket | undefined;
		let attempt = 0;
		const scheduleRetry = () => {
			if (disposed) return;
			retry = setTimeout(() => void connect(), Math.min(1000 * 2 ** attempt++, 15000));
		};
		const connect = async () => {
			try {
				const token = await getValidAccessToken();
				if (disposed) return;
				setConnected(false);
				const url = new URL(REACT_APP_API_WS);
				url.searchParams.set('token', token);
				socket = new WebSocket(url);
				socketRef.current = socket;
				socket.onopen = () => { if (!disposed) { attempt = 0; setConnected(true); } };
				socket.onmessage = (event) => {
					if (disposed) return;
					try {
						const data = JSON.parse(event.data);
						if (!data || typeof data !== 'object') return;
						switch (data.event) {
							case 'info':
								if (typeof data.totalClients === 'number') setOnlineUsers(data.totalClients);
								break;
							case 'getMessages':
								if (Array.isArray(data.list)) setMessages(data.list.filter(isMessage));
								break;
							case 'message':
								if (isMessage(data)) setMessages((previous) => [...previous, data]);
								break;
						}
					} catch { /* Ignore malformed frames. */ }
				};
				socket.onclose = () => {
					if (disposed) return;
					setConnected(false);
					setOnlineUsers(0);
					scheduleRetry();
				};
			} catch { scheduleRetry(); }
		};
		void connect();
		return () => {
			disposed = true;
			clearTimeout(retry);
			if (socket) {
				socket.onopen = socket.onmessage = socket.onclose = null;
				socket.close();
				if (socketRef.current === socket) socketRef.current = null;
			}
		};
	}, [authReady, user]);

	useEffect(() => {
		const content = contentRef.current;
		if (content) content.scrollTop = content.scrollHeight;
	}, [messages, open]);

	const sendMessage = () => {
		const text = messageInput.trim();
		if (!text || socketRef.current?.readyState !== WebSocket.OPEN) return;
		socketRef.current.send(JSON.stringify({ event: 'message', data: text }));
		setMessageInput('');
	};

	return (
		<Stack className="chatting">
			<button className="chat-button" onClick={() => setOpen((value) => !value)} aria-label={open ? 'Close live chat' : 'Open live chat'} aria-expanded={open} aria-controls="live-chat">
				{open ? <CloseFullscreenIcon /> : <MarkChatUnreadIcon />}
			</button>
			<Stack id="live-chat" className={`chat-frame ${open ? 'open' : ''}`} inert={!open} aria-hidden={!open}>
				<Box className="chat-top">
					<div style={{ fontFamily: 'Nunito' }}>Online Chat</div>
					<RippleBadge style={{ margin: '-18px 0 0 21px' }} badgeContent={onlineUsers} showZero />
				</Box>
				<Box className="chat-content" ref={contentRef} role="log" aria-label="Live chat messages" aria-live="polite">
					<Stack className="chat-main">
						<Box display="flex" sx={{ m: '10px 0' }}><div className="welcome">Welcome to Live chat!</div></Box>
						{messages.map((message, index) => {
							const member = message.memberData;
							const own = Boolean(user?.sub && member?._id === user.sub);
							const image = member?.memberImage
								? (/^https?:\/\//.test(member.memberImage) ? member.memberImage : `${REACT_APP_API_URL}/${member.memberImage.replace(/^\//, '')}`)
								: '/img/profile/defaultUser.svg';
							return <Box key={index} display="flex" justifyContent={own ? 'flex-end' : 'flex-start'} alignItems="flex-end" sx={{ m: '10px 0' }}>
								{!own && <Avatar alt={member?.memberNick ?? 'Guest'} src={image} />}
								<div className={own ? 'msg-right' : 'msg-left'}>{message.text}</div>
							</Box>;
						})}
					</Stack>
				</Box>
				<Box className="chat-bott" component="form" onSubmit={(event) => { event.preventDefault(); sendMessage(); }}>
					<input className="msg-input" name="message" aria-label="Message" type="text" placeholder="Type message" value={messageInput} onChange={(event) => setMessageInput(event.target.value)} />
					<button type="submit" className="send-msg-btn" aria-label="Send message" disabled={!connected}><SendIcon style={{ color: '#fff' }} /></button>
				</Box>
			</Stack>
		</Stack>
	);
}
