import { useEffect, useState } from 'react'

import { getDatabase, ref, set, get, onValue, DataSnapshot } from 'firebase/database'
import { User, getAuth, onAuthStateChanged } from 'firebase/auth'
import { initializeApp } from 'firebase/app'

import Login from './components/Login'
import Chat from './components/chat/Chat'

import { Names } from './types/names'
import { Log } from './types/log'

const defaultLogs: Log[] = [
	[1, { uid: 'guy1', msg: 'walo ???' }],
	[2, { uid: 'guy2', msg: 'waalo !' }],
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

export default function Root() {
	const [uid, setUid] = useState<string | null>(null)
	const [names, setNames] = useState<Names>(defaultNames)
	const [serverLogs, setServerLogs] = useState<Log[]>(defaultLogs)

	function sendMessage(log: Log) {
		set(ref(database, 'log/' + log[0]), log[1])
	}

	function handleLogs(snapshot: DataSnapshot) {
		const data = snapshot.val()
		if (!data) return

		const logs = Object.entries(data)
		const message = logs[0][1]

		if (message || logs.length === 0) {
			setServerLogs([...logs.sort()] as unknown as Log[])
		}
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
				get(ref(database, 'log/')).then((snapshot) => handleLogs(snapshot))
				get(ref(database, 'names/')).then((snapshot) => handleNames(snapshot))
			} else {
				setUid(null)
				setNames(defaultNames)
				setServerLogs(defaultLogs)
			}
		})

		onValue(ref(database, 'log/'), (snapshot) => handleLogs(snapshot))
		onValue(ref(database, 'names/'), (snapshot) => handleNames(snapshot))
	}, [])

	return (
		<>
			<main>
				<div className='title'>
					<h1>Walo</h1>
					<p>no chat, only walo</p>
				</div>

				<Chat uid={uid} names={names} sendMessage={sendMessage} serverLogs={serverLogs} />

				<Login uid={uid} />
			</main>
		</>
	)
}
