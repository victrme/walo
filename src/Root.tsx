import { useEffect, useLayoutEffect, useState } from 'react'

// import { initializeAppCheck, ReCaptchaV3Provider } from 'firebase/app-check'
import { Unsubscribe, User, getAuth, onAuthStateChanged } from 'firebase/auth'
import { initializeApp } from 'firebase/app'
import {
	getDatabase,
	ref,
	set,
	get,
	push,
	query,
	update,
	limitToLast,
	orderByChild,
	DataSnapshot,
	startAt,
	onChildAdded,
	onChildChanged,
	onChildRemoved,
} from 'firebase/database'

import Login from './components/Login'
import Chat from './components/chat/Chat'

import { Names } from './types/names'
import { Log, Logs } from './types/log'

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

export default function Root() {
	const [loading, setLoading] = useState(true)
	const [uid, setUid] = useState<string | null>(null)
	const [messageKey, setMessageKey] = useState<string | null>(null)
	const [serverLogs, setServerLogs] = useState<Logs>({})
	const [names, setNames] = useState<Names>({})

	let onChildAddedUnsub: Unsubscribe = () => {}
	let onChildChangedUnsub: Unsubscribe = () => {}
	let onChildRemovedUnsub: Unsubscribe = () => {}

	function sendMessage(log: Log) {
		//
		// Delete message
		if (messageKey && log.msg.length === 0) {
			set(ref(database, 'logs/' + messageKey), null)
			handleMessageKey(null)
			return
		}

		// Update message (other keypresses)
		if (messageKey) {
			update(ref(database, 'logs/' + messageKey), { msg: log.msg })
			return
		}

		// New message (first keypress)
		const dbref = ref(database, 'logs/')
		const msgRef = push(dbref)

		if (msgRef.key) {
			update(ref(database, 'names/' + uid), { last: log.t })
			set(ref(database, 'logs/' + msgRef.key), log)
			handleMessageKey(msgRef.key)
		}
	}

	async function handleLogs(snapshot: DataSnapshot, listenerType: string) {
		if (!snapshot.val()) return

		// Initial startup call to get messages
		if (listenerType === 'Get') {
			if (loading) setLoading(false)
			setServerLogs(snapshot.val())
			return
		}

		const key = snapshot.key
		if (!key) return console.warn('No key found on: ', listenerType)

		if (listenerType === 'Removed') {
			setServerLogs((current) => {
				const { [key]: _, ...rest } = current
				return rest
			})
		}

		if (listenerType === 'Changed') {
			setServerLogs((current) => ({ ...current, [key]: snapshot.val() }))
		}

		if (listenerType === 'Added') {
			setServerLogs((current) => ({ ...current, [key]: snapshot.val() }))

			const oldestTimestamp = 0
			const queryContrains = [orderByChild('last'), startAt(oldestTimestamp)]
			const namesSnapshot = await get(query(ref(database, 'names/'), ...queryContrains))
			handleNames(namesSnapshot)
		}
	}

	function handleMessageKey(val: string | null) {
		setMessageKey(val)
	}

	function handleNames(snapshot: DataSnapshot) {
		const data = snapshot.val()
		if (!data) return

		setNames(data)
	}

	function handleAuthState(user: User | null) {
		if (user === null) {
			isWatching = false
			removeListeners()
			setUid(null)
			return
		}

		if (user) {
			async function addNameOnFirstLogin(user: User) {
				const dbref = ref(database, 'names/' + user.uid)
				const snapshot = await get(dbref)

				if (!snapshot.exists()) {
					const firstName = (user.displayName || 'user')?.split(' ')[0]
					set(dbref, { last: 0, name: firstName })
				}
			}

			setUid(user.uid)
			addNameOnFirstLogin(user)

			if (isWatching) {
				return
			}

			onChildChangedUnsub = onChildChanged(queryLogs, (snapshot) => handleLogs(snapshot, 'Changed'))
			onChildRemovedUnsub = onChildRemoved(queryLogs, (snapshot) => handleLogs(snapshot, 'Removed'))
			onChildAddedUnsub = onChildAdded(queryLogs, (snapshot) => handleLogs(snapshot, 'Added'))
			isWatching = true
		}
	}

	function removeListeners() {
		onChildAddedUnsub()
		onChildChangedUnsub()
		onChildRemovedUnsub()
	}

	useEffect(() => {
		onAuthStateChanged(auth, (user) => handleAuthState(user))
		get(queryLogs).then((snapshot) => handleLogs(snapshot, 'Get'))

		window.addEventListener('beforeunload', removeListeners)
		return removeListeners
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
					messageKey={messageKey}
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
