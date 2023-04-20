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
	handleMessageKey: (val: string | null) => void
}

const MessageList = (props: { list: Message[] }) => (
	<>
		{props.list.map((elem) => (
			<div key={elem.t} className={'bubble-line' + (elem.self ? ' self' : '')}>
				<TextBubble message={elem} />
			</div>
		))}
	</>
)

export default function Chat({ uid, names, serverLogs, handleMessageKey, sendMessage }: Chat) {
	const [input, setInput] = useState('')
	const [timestamp, setTimestamp] = useState(10 ** 16)
	const userFirstName = (uid: string) => names[uid] || 'user'

	const messages: Message[] = serverLogs.map((log) => ({
		t: log.t,
		msg: log.msg,
		self: log.uid === uid,
		author: userFirstName(log.uid),
	}))

	// Divide messages between older and newer messages
	const messagesOld = messages.filter((elem) => elem.t < timestamp)
	const messagesNew = messages.filter((elem) => elem.t > timestamp)

	function handleTimestamp(is: 'focus' | 'submit') {
		const isDefault = timestamp === 10 ** 16

		if (isDefault && is === 'focus') {
			setTimestamp(Date.now())
		}

		if (!isDefault && is === 'submit') {
			setTimestamp(10 ** 16)

			if (input && uid) {
				handleInput('')
				handleMessageKey(null)
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
		if (uid && timestamp !== 10 ** 16) {
			sendMessage({ uid: uid, msg: input, t: timestamp })
		}
	}, [input, timestamp])

	return (
		<div id='chat'>
			<MessageList list={messagesOld} />

			{uid && (
				<div className={'bubble-line self user-input'}>
					<TextBubble message={{ t: 0, author: userFirstName(uid), msg: '', self: true }}>
						<UserInput
							input={input}
							timestamp={timestamp}
							handleInput={handleInput}
							handleTimestamp={handleTimestamp}
						/>
					</TextBubble>
				</div>
			)}

			<MessageList list={messagesNew} />

			<div id='scroll-anchor' />
		</div>
	)
}
