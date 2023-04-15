import { GoogleAuthProvider, signInWithPopup, getAuth, signOut } from 'firebase/auth'
import './Login.css'

export default function Login({ uid }: { uid: string | null }) {
	const provider = new GoogleAuthProvider()
	const auth = getAuth()

	function handleLogin() {
		uid ? signOut(auth) : signInWithPopup(auth, provider)
	}

	return (
		<div id='login'>
			<button onClick={handleLogin}>
				{uid === null && <img src='google.svg' width={20} height={20} />}
				<span>{uid ? 'Se déconnecter' : 'Se connecter avec Google'}</span>
			</button>
		</div>
	)
}
