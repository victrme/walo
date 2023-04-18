import { useEffect, useState } from 'react'

import { initializeApp } from 'firebase/app'
import { User, getAuth, onAuthStateChanged } from 'firebase/auth'
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
	databaseURL: import.meta.env.VITE_DATABASEURL,
	apiKey: import.meta.env.VITE_APIKEY,
	appId: import.meta.env.VITE_APPID,
	projectId: 'sandbox-383306',
	measurementId: 'G-3V500QMWL7',
	messagingSenderId: '643065650510',
	storageBucket: 'sandbox-383306.appspot.com',
	authDomain: 'sandbox-383306.firebaseapp.com',
}

const app = initializeApp(firebaseConfig)
const auth = getAuth(app)
const database = getDatabase()
const queryContrains = [limitToLast(100), orderByChild('t')]
const queryLogs = query(ref(database, 'logs/'), ...queryContrains)
let isWatching = false

export default function Root() {
	const [loading, setLoading] = useState(true)
	const [uid, setUid] = useState<string | null>(null)
	const [msgKey, setMsgKey] = useState<string | null>(null)
	const [names, setNames] = useState<Names>({})
	const [serverLogs, setServerLogs] = useState<Log[]>([])

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

		setServerLogs(logs as Log[])
	}

	function handleMessageKey(val: string | null) {
		setMsgKey(val)
	}

	function handleLoadingState() {
		if (loading) setLoading(false)
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
					onValue(queryLogs, (snapshot) => handleLogs(snapshot))
					onValue(ref(database, 'names/'), (snapshot) => handleNames(snapshot))
					isWatching = true
				}
			} else {
				setUid(null)
				removeDatabaseEvents()
				isWatching = false
			}
		})

		// Get server logs once every startups
		get(queryLogs).then((snapshot) => handleLogs(snapshot))
		get(ref(database, 'names/')).then((snapshot) => handleNames(snapshot))

		return removeDatabaseEvents()
	}, [])

	useEffect(() => {
		if (loading && serverLogs.length > 0) {
			handleLoadingState()
			const chat = document.querySelector('#chat')
			chat?.scrollTo(0, chat.scrollHeight)
		}
	}, [serverLogs])

	return (
		<>
			<main className={loading ? 'loading' : ''}>
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
						<a href='https://victr.me'>victr.me</a>
						<a href='https://github.com/victrme/walo'>Code source</a>
						<a href='https://github.com/victrme/walo/PRIVACY.md'>Confidentialité</a>
					</div>
				</div>
			</main>
		</>
	)
}
