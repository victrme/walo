import { useEffect, useLayoutEffect, useState } from 'react'

// import { initializeAppCheck, ReCaptchaV3Provider } from 'firebase/app-check'
import { User, getAuth, onAuthStateChanged } from 'firebase/auth'
import { initializeApp } from 'firebase/app'
import {
	getDatabase,
	ref,
	set,
	get,
	off,
	push,
	query,
	update,
	onValue,
	limitToLast,
	orderByChild,
	DataSnapshot,
} from 'firebase/database'

import Login from './components/Login'
import Chat from './components/chat/Chat'

import { Names } from './types/names'
import { Log } from './types/log'

const firebaseConfig = {
	apiKey: import.meta.env.VITE_APIKEY,
	appId: import.meta.env.VITE_APPID,
	projectId: 'walo-chat',
	messagingSenderId: '899004629819',
	storageBucket: 'walo-chat.appspot.com',
	authDomain: 'walo-chat.firebaseapp.com',
	databaseURL: 'https://walo-chat-default-rtdb.europe-west1.firebasedatabase.app',
}

const app = initializeApp(firebaseConfig)
const auth = getAuth(app)
const database = getDatabase()
const queryContrains = [limitToLast(100), orderByChild('t')]
const queryLogs = query(ref(database, 'logs/'), ...queryContrains)
let isWatching = false

// const appCheck = initializeAppCheck(app, {
// 	provider: new ReCaptchaV3Provider('6LdnXKIlAAAAAJNhHD49z57J6VG94tHJdDc6USPu'),
// })

function mockLogs() {
	return Array.from({ length: 20 }, (_, i) => ({ t: i, uid: '', msg: 'walo' }))
}

export default function Root() {
	const [loading, setLoading] = useState(true)
	const [uid, setUid] = useState<string | null>(null)
	const [msgKey, setMsgKey] = useState<string | null>(null)
	const [serverLogs, setServerLogs] = useState<Log[]>(mockLogs())
	const [names, setNames] = useState<Names>({})

	function sendMessage(log: Log) {
		//
		// Update message (other keypresses)
		if (msgKey) {
			update(ref(database, 'logs/' + msgKey), { msg: log.msg })
			return
		}

		// New message (first keypress)
		const dbref = ref(database, 'logs/')
		const msgRef = push(dbref)

		if (!msgRef.key) {
			return console.error('No key for new message')
		}

		set(ref(database, 'logs/' + msgRef.key), log)
		handleMessageKey(msgRef.key)
	}

	function handleLogs(snapshot: DataSnapshot) {
		const data = snapshot.val() ?? [{ t: 0, uid: '', msg: 'walo' }]
		const logs = Object.values(data)

		if (!logs) return
		if (loading) setLoading(false)

		setServerLogs(logs as Log[])
	}

	function handleMessageKey(val: string | null) {
		setMsgKey(val)
	}

	function handleNames(snapshot: DataSnapshot) {
		const data = snapshot.val()
		if (!data) return

		setNames(data)
	}

	async function addNameOnFirstLogin(user: User) {
		const dbref = ref(database, 'names/' + user.uid)
		const snapshot = await get(dbref)

		if (!snapshot.exists()) {
			set(dbref, (user.displayName || 'user')?.split(' ')[0])
		}
	}

	function removeDatabaseEvents() {
		off(ref(database, 'logs/'))
		off(ref(database, 'names/'))
	}

	useEffect(() => {
		onAuthStateChanged(auth, (user) => {
			if (user?.uid) {
				setUid(user.uid)
				addNameOnFirstLogin(user)

				if (!isWatching) {
					onValue(ref(database, 'names/'), (snapshot) => handleNames(snapshot))
					onValue(queryLogs, (snapshot) => handleLogs(snapshot))
					isWatching = true
				}
			} else {
				setUid(null)
				removeDatabaseEvents()
				isWatching = false
			}
		})

		// Get server logs once every startups
		get(ref(database, 'names/')).then((snapshot) => handleNames(snapshot))
		get(queryLogs).then((snapshot) => handleLogs(snapshot))

		return removeDatabaseEvents()
	}, [])

	useLayoutEffect(() => {
		const chat = document.querySelector<HTMLDivElement>('#chat')
		chat?.scrollTo(0, chat.scrollHeight)
	}, [])

	useLayoutEffect(() => {
		if (uid && !loading) {
			const input = document.querySelector<HTMLInputElement>('#chat form input')
			input?.focus()
		}
	}, [loading, uid])

	return (
		<>
			<main className={(loading ? 'loading ' : '') + (uid ? 'user-in' : 'user-out')}>
				<div className='title'>
					<h1>Walo</h1>
					<p>no chat, only walo</p>
				</div>

				<Chat
					uid={uid}
					names={names}
					serverLogs={serverLogs}
					sendMessage={sendMessage}
					handleMessageKey={handleMessageKey}
				/>

				<div id='bottom'>
					<Login uid={uid} />

					<div id='out-links'>
						<p>
							<a href='https://victr.me'>victr.me</a>
						</p>
						<p>
							<a href='https://github.com/victrme/walo'>Code source</a>
						</p>
					</div>
				</div>
			</main>
		</>
	)
}
