import { useEffect, useState } from 'react'
import TextBubble from './TextBubble'
import UserInput from './UserInput'
import { Log } from '../../types/Log'
import { Message } from '../../types/Message'
import './Chat.css'

let serverlog: Log[] = [
	[1681374302892, { uid: '2EQbfOlT4MN5uFIPxmwOs8h6zVN2', msg: 'walo !' }],
	[1681374306782, { uid: '9tAOsihMDteoNd9xZBO9fCYNmX52', msg: 'walo' }],
	[1681374307204, { uid: '9tAOsihMDteoNd9xZBO9fCYNmX52', msg: 'walo' }],
	[1681374307635, { uid: '9tAOsihMDteoNd9xZBO9fCYNmX52', msg: 'walo' }],
	[1681374308076, { uid: '2EQbfOlT4MN5uFIPxmwOs8h6zVN2', msg: 'walo !' }],
	[1681374308579, { uid: '2EQbfOlT4MN5uFIPxmwOs8h6zVN2', msg: 'walo !' }],
	[1681374309051, { uid: '2EQbfOlT4MN5uFIPxmwOs8h6zVN2', msg: 'walo !' }],
	[1681374309517, { uid: '2EQbfOlT4MN5uFIPxmwOs8h6zVN2', msg: 'walo :)' }],
	[1681374309940, { uid: '2EQbfOlT4MN5uFIPxmwOs8h6zVN2', msg: 'walo :)' }],
]

export default function Chat({ name, uid }: { name: string; uid?: string }) {
	const [inputTimestamp, setInputTimestamp] = useState(10 ** 16)
	const [input, setInput] = useState('')

	serverlog = serverlog.sort((a, b) => a[0] - b[0])

	const messages: Message[] = serverlog.map(([t, log]) => ({
		t: t,
		msg: log.msg,
		author: log.uid,
		self: log.uid === uid,
	}))

	// Divide messages between older and newer messages
	const messagesOld = messages.filter((elem) => elem.t < inputTimestamp)
	const messagesNew = messages.filter((elem) => elem.t > inputTimestamp)

	function handleInputTimestamp(is: 'focus' | 'submit') {
		const isDefault = inputTimestamp === 10 ** 16

		if (isDefault && is === 'focus') setInputTimestamp(Date.now())
		if (!isDefault && is === 'submit') {
			setInputTimestamp(10 ** 16)

			if (input && uid) {
				handleInput('')
				serverlog.push([inputTimestamp, { uid: uid, msg: input }])
			}
		}
	}

	function handleInput(val: string) {
		setInput(val)
	}

	useEffect(() => {
		// ... send to database when timestamp updates
		// ... it means new response has dropped
		// ... holy hell !

		console.log(inputTimestamp, { uid: uid, msg: input })
	}, [inputTimestamp, input])

	return (
		<div id='chat'>
			{messagesOld.map((elem) => (
				<TextBubble message={elem} />
			))}

			{uid && (
				<TextBubble message={{ t: 0, author: uid, msg: '', self: true }}>
					<UserInput
						inputTimestamp={inputTimestamp}
						handleInputTimestamp={handleInputTimestamp}
						handleInput={handleInput}
						input={input}
					/>
				</TextBubble>
			)}

			{messagesNew.map((elem) => (
				<TextBubble message={elem} />
			))}
		</div>
	)
}
