import './TextBubble.css'

type TextBubble = {
	author: string
	self: boolean
	msg?: string
}

export default function TextBubble({ author, msg, self }: TextBubble) {
	return (
		<div className={'bubble-line' + (self ? ' self' : '')}>
			<div className='bubble'>
				<p className='b-author'>{author}</p>
				<p className='b-message'>{msg}</p>
			</div>
		</div>
	)
}
