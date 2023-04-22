import { useEffect, useState } from 'react'
import TextBubble from './TextBubble'
import UserInput from './UserInput'
import { Log, Logs } from '../../types/log'
import { Names } from '../../types/names'
import { Message } from '../../types/message'
import './Chat.css'

type Chat = {
	uid: string | null
	names: Names
	messageKey: string | null
	serverLogs: Logs
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

export default function Chat({ uid, names, serverLogs, messageKey, sendMessage, handleMessageKey }: Chat) {
	const [timestamp, setTimestamp] = useState<number | null>(null)
	const [input, setInput] = useState('')

	const messages: Message[] = Object.values(serverLogs).map((log) => ({
		t: log.t,
		msg: log.msg,
		self: log.uid === uid,
		author: names[log.uid]?.name || 'user',
	}))

	// Divide messages between older and newer messages
	const messagesOld = messages.filter((elem) => elem.t < (timestamp || 10 ** 16))
	const messagesNew = messages.filter((elem) => elem.t > (timestamp || 10 ** 16))

	function handleTimestamp(is: 'focus' | 'submit') {
		if (is === 'focus') {
			setTimestamp(Date.now())
		}

		if (is === 'submit') {
			handleMessageKey(null)
			setTimestamp(null)
			handleInput('')
		}
	}

	function handleInput(val: string) {
		setInput(val)
	}

	useEffect(() => {
		// When user empties the input, it removes the message from the server
		// So to keep the form at the bottom: reset timestamp
		if (uid && timestamp && !messageKey && input.length === 0) {
			setTimestamp(null)
		}
	}, [messageKey])

	useEffect(() => {
		if (uid && timestamp) {
			sendMessage({ uid: uid, msg: input, t: timestamp })
		}
	}, [input, timestamp])

	return (
		<div id='chat'>
			<MessageList list={messagesOld} />

			{uid && (
				<div className='bubble-line self user-input'>
					<TextBubble message={{ t: 0, author: '', msg: '', self: true }}>
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
