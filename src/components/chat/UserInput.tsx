import { FormEvent } from 'react'

export default function UserInput(props: any) {
	function handleUserMessage(event: FormEvent<HTMLInputElement>) {
		if (props.inputTimestamp === 10 ** 16 && !props.input) {
			props.handleInputTimestamp('focus')
		}

		// ... tout le truc compliqué
		// ... qui empeche d'écrire autre chose que WALOOOO
		props.handleInput(event?.currentTarget?.value)
	}

	function applyMessage(event: FormEvent<HTMLFormElement>) {
		event.preventDefault()
		props.handleInputTimestamp('submit')
	}

	return (
		<form action='' onSubmit={(e) => applyMessage(e)}>
			<input
				type='text'
				id='chat-input'
				name='chat-input'
				placeholder='lache un walo'
				autoComplete='false'
				autoCorrect='true'
				value={props.input}
				onInput={(e) => handleUserMessage(e)}
			/>
		</form>
	)
}
