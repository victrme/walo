import { ReactElement } from 'react'
import { Message } from '../../types/message'
import './TextBubble.css'

type TextBubble = {
	children?: ReactElement
	message: Message
}

export default function TextBubble({ message, children }: TextBubble) {
	return (
		<div key={message.t} className={'bubble-line' + (message.self ? ' self' : '')}>
			<div className='bubble'>
				<p className='b-author'>{message.author}</p>
				<p className='b-message'>{message.msg}</p>
				{children}
			</div>
		</div>
	)
}
