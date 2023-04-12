import { GoogleAuthProvider, signInWithRedirect, signOut, getAuth, User } from 'firebase/auth'

export default function Header({ pseudo, ppImage }: { pseudo: string; ppImage: string }) {
	const provider = new GoogleAuthProvider()
	const auth = getAuth()

	function logIn() {
		signInWithRedirect(auth, provider)
	}

	function logOut() {
		signOut(auth)
	}

	return (
		<header>
			<a id='branding' href='/' draggable='false'>
				<span>🍞</span>
				<span>Wallo</span>
			</a>
			<div id='login'>
				{(pseudo?.length || 0) > 0 && (
					<div id='login-info'>
						<div className='logged-in-info'>
							<img src={ppImage} alt='user icon' draggable='false' />
							<span>{pseudo}</span>
						</div>
					</div>
				)}
			</div>
		</header>
	)
}
