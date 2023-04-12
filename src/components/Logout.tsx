import { signOut, getAuth } from 'firebase/auth'

export default function Logout() {
	const auth = getAuth()

	return (
		<div id='logout'>
			<button onClick={() => signOut(auth)}>Log out</button>
		</div>
	)
}
