import { useEffect, useState } from 'react'
import TextBubble from './TextBubble'
import UserInput from './UserInput'
import { Log } from '../../types/log'
import { Names } from '../../types/names'
import { Message } from '../../types/message'
import './Chat.css'

type Chat = {
	uid: string | null
	names: Names
	serverLogs: Log[]
	sendMessage: (log: Log) => void
}

export default function Chat({ uid, names, serverLogs, sendMessage }: Chat) {
	const [inputTimestamp, setInputTimestamp] = useState(10 ** 16)
	const [input, setInput] = useState('')
	const userFirstName = (uid: string) => names[uid] || 'user'

	const messages: Message[] = serverLogs.map(([t, log]) => ({
		t: t,
		msg: log.msg,
		self: log.uid === uid,
		author: userFirstName(log.uid),
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
		if (uid && inputTimestamp !== 10 ** 16) {
			sendMessage([inputTimestamp, { uid: uid, msg: input }])
		}
	}, [inputTimestamp, input])

	return (
		<div id='chat'>
			{messagesOld.map((elem) => (
				<TextBubble message={elem} />
			))}

			{uid && (
				<TextBubble message={{ t: 0, author: userFirstName(uid), msg: '', self: true }}>
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
