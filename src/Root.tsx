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

const defaultLogs: Log[] = [
	{ t: 1, uid: 'guy1', msg: 'walo ???' },
	{ t: 2, uid: 'guy2', msg: 'waalo !' },
]

const defaultNames: Names = {
	guy1: 'Jean-Louis',
	guy2: 'Julien',
}

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

export default function Root() {
	const [uid, setUid] = useState<string | null>(null)
	const [msgKey, setMsgKey] = useState<string | null>(null)
	const [names, setNames] = useState<Names>(defaultNames)
	const [serverLogs, setServerLogs] = useState<Log[]>(defaultLogs)

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
		const data = snapshot.val() ?? []
		const logs = Object.values(data)

		if (!logs) return

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

	useEffect(() => {
		onAuthStateChanged(auth, (user) => {
			if (user?.displayName) {
				setUid(user.uid)
				addNameOnFirstLogin(user)
				get(queryLogs).then((snapshot) => handleLogs(snapshot))
				get(ref(database, 'names/')).then((snapshot) => handleNames(snapshot))
			} else {
				setUid(null)
				setNames(defaultNames)
				setServerLogs(defaultLogs)
			}
		})

		onValue(ref(database, 'names/'), (snapshot) => handleNames(snapshot))
		onValue(queryLogs, (snapshot) => handleLogs(snapshot))

		return () => {
			off(ref(database, 'logs/'))
			off(ref(database, 'names/'))
		}
	}, [])

	return (
		<>
			<main>
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
				<Login uid={uid} />
			</main>
		</>
	)
}
