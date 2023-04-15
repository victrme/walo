import { useEffect, useState } from 'react'

import { User, getAuth, onAuthStateChanged } from 'firebase/auth'
import { getDatabase, ref, set, get, onValue, DataSnapshot } from 'firebase/database'
import { initializeApp } from 'firebase/app'

import Login from './components/Login'
import Logout from './components/Logout'
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

async function getNameOnLogin(user: User) {
	const dbref = ref(database, 'names/' + user.uid)
	const snapshot = await get(dbref)
	let name = ''

	if (snapshot.exists() && snapshot.val()) {
		name = snapshot.val()
	} else {
		name = (user.displayName || 'user')?.split(' ')[0]
		set(dbref, name)
	}

	return name
}

const defaultLogs: Log[] = [
	[1, { uid: 'guy1', msg: 'walo ???' }],
	[2, { uid: 'guy2', msg: 'waalo !' }],
]

const defaultNames: Names = {
	guy1: 'Jean-Louis',
	guy2: 'Julien',
}

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

		console.log('updates')

		const logs = Object.entries(data)
		const message = logs[0][1]

		if (message) {
			setServerLogs([...logs.sort()] as unknown as Log[])
		}
	}

	function handleNames(snapshot: DataSnapshot) {
		const data = snapshot.val()
		if (!data) return

		setNames(data)
	}

	useEffect(() => {
		onAuthStateChanged(auth, (user) => {
			if (user?.displayName) {
				setUid(user.uid)
				get(ref(database, 'log/')).then((snapshot) => handleLogs(snapshot))
				get(ref(database, 'names/')).then((snapshot) => handleNames(snapshot))
			} else {
				setUid(null)
				setNames(defaultNames)
				setServerLogs(defaultLogs)
			}
		})

		// Get updates only if logged in
		onValue(ref(database, 'log/'), (snapshot) => (uid ? handleLogs(snapshot) : null))
		onValue(ref(database, 'names/'), (snapshot) => (uid ? handleNames(snapshot) : null))
	}, [])

	return (
		<>
			<main>
				<div className='title'>
					<h1>Walo</h1>
					<p>no chat, only walo</p>
				</div>

				<Chat uid={uid} names={names} sendMessage={sendMessage} serverLogs={serverLogs} />

				{uid ? <Logout /> : <Login />}
			</main>
		</>
	)
}
