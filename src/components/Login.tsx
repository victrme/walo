import { GoogleAuthProvider, signInWithPopup, getAuth } from 'firebase/auth'
import './Login.css'

export default function Login() {
	const provider = new GoogleAuthProvider()
	const auth = getAuth()

	return (
		<div id='login'>
			<button onClick={() => signInWithPopup(auth, provider)}>
				<img src='google.svg' width={20} height={20} />
				<span>Se connecter avec Google</span>
			</button>
		</div>
	)
}
