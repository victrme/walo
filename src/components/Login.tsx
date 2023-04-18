import { GoogleAuthProvider, signInWithPopup, getAuth, signOut, Auth } from 'firebase/auth'
import './Login.css'

export default function Login({ uid }: { uid: string | null }) {
	const provider = new GoogleAuthProvider()
	const auth = getAuth()

	function handleLogin() {
		uid ? signOut(auth) : signInWithPopup(auth, provider)
	}

	return (
		<div id='login'>
			{uid ? (
				<div className='logged-in'>
					<p className='user'>
						<img
							src={auth.currentUser?.photoURL || 'google.svg'}
							alt='Photo de profil'
							draggable='false'
							referrerPolicy='no-referrer'
						/>
						<span>{auth.currentUser?.displayName || 'Jean-Alfred Cointreau'}</span>
					</p>
					<button onClick={handleLogin}>Se déconnecter</button>
				</div>
			) : (
				<div className='logged-out'>
					<button onClick={handleLogin}>
						<img src='google.svg' width={20} height={20} alt='Google icon' />
						<span>Se connecter avec Google</span>
					</button>
				</div>
			)}
		</div>
	)
}
