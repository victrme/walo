import { FormEvent, useEffect, useState } from 'react'

import { User, getAuth, onAuthStateChanged, getRedirectResult } from 'firebase/auth'
import { getDatabase, ref, set, get, onValue } from 'firebase/database'
import { initializeApp } from 'firebase/app'

import Login from './components/Login'
import Logout from './components/Logout'
import Chat from './components/chat/Chat'

// async function writeUserData(userId: string, name: string, email: string, imageUrl: string) {
// 	const dbRef = ref(getDatabase())
// 	const snapshot = await get(child(dbRef, `users/${userId}`))

// 	if (snapshot.exists()) {
// 		return // Don't save if user is already registered
// 	}

// 	set(ref(getDatabase(), 'users/' + userId), {
// 		username: name,
// 		email: email,
// 		profile_picture: imageUrl,
// 	})
// }

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
	const [uid, setUid] = useState('')
	const [name, setName] = useState('')

	async function submitPseudo(e: FormEvent) {
		e.preventDefault()

		console.log(e)
		return

		const snapshot = await get(ref(database, 'users/'))

		if (snapshot.exists() && !Object.values(snapshot.val()).includes(e)) {
			set(ref(database, 'users/' + uid), e)
		} else {
			console.log('Error')
		}
	}

	// useEffect(() => {
	// 	onValue(ref(database, 'users/' + uid), (snapshot) => {
	// 		const data = snapshot.val()
	// 		console.log(data)
	// 	})
	// }, [uid])

	useEffect(() => {
		getRedirectResult(auth).then((result) => {
			if (result?.user) setUid(result.user.uid)
		})

		onAuthStateChanged(auth, (user) => {
			if (user?.displayName) {
				setName(user.displayName?.split(' ')[0])
				setUid(user.uid)
			} else {
				setName('')
				setUid('')
			}

			// get(ref(database, 'users/' + user?.uid)).then((snapshot) => {
			// 	setPpImage(user?.photoURL || '')
			// 	setUid(user?.uid || '')
			// 	setPseudo(snapshot.val())
			// })
		})
	}, [])

	return (
		<>
			{/* <Header pseudo={pseudo} ppImage={ppImage}></Header> */}

			<main>
				<div className='title'>
					<h1>Walo</h1>
					<p>no chat, only walo</p>
				</div>

				<Chat name={name} uid={uid} />

				{uid ? <Logout /> : <Login />}
			</main>
		</>
	)
}
