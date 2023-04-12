import { useState } from 'react'
import TextBubble from './TextBubble'
import './Chat.css'

export default function Chat({ name, isLoggedIn }: { name: string; isLoggedIn: boolean }) {
	const log = [
		{ author: 'tester2', msg: 'walo', self: true },
		{ author: 'test3', msg: 'wwwwwalo !!!', self: false },
		{ author: 'test3', msg: 'wwwwwalo !!!', self: false },
		{ author: 'test3', msg: 'wwwwwalo !!!', self: false },
		{ author: 'test3', msg: 'wwwwwalo !!!', self: false },
		{ author: 'test3', msg: 'wwwwwalo !!!', self: false },
		{ author: 'testeur11', msg: 'walo :)', self: false },
		{ author: 'testeur11', msg: 'walo :)', self: false },
		{ author: 'testeur11', msg: 'walo :)', self: false },
		{ author: 'testeur11', msg: 'walo :)', self: false },
		{ author: 'testeur11', msg: 'walo :)', self: false },
	]

	const [isChatting, setIsChatting] = useState(false)

	return (
		<div id='chat'>
			{log.map((l) => (
				<TextBubble author={l.author} msg={l.msg} self={l.self}></TextBubble>
			))}

			{!isChatting && isLoggedIn && <TextBubble author={name} self={true}></TextBubble>}
		</div>
	)
}
