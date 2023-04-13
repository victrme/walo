import { FormEvent } from 'react'

/*
 *  Asked ChatGPT to generate a regexp
 *  that meets these conditions:
 *      Only w, a, l, o characters are available, in this order (eg: "walo")
 *      "a" should be valid only after the "w", "l" after "a" and "o" after  "l"
 *      You can repeat characters (eg: "wwwwaaaloooo")
 *      The regexp is still valid when not all characters are included (eg: "wal", "w", "waaaaalllll")
 */
const regexp = /^(w+(a+(l+(o+[^\w]*)?)?)?)?$/i

export default function UserInput(props: any) {
	function handleUserMessage(event: FormEvent<HTMLInputElement>) {
		const nativeEvent = event?.nativeEvent as InputEvent | undefined
		const val = event.currentTarget.value
		const isValid = val === '' || val.match(regexp)

		if (!nativeEvent) {
			event.preventDefault()
			return
		}

		// Start timestamp on first input
		if (props.inputTimestamp === 10 ** 16 && !props.input) {
			props.handleInputTimestamp('focus')
		}

		props.handleInput(isValid ? val : props.input)
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
				spellCheck='false'
				value={props.input}
				onChange={(e) => handleUserMessage(e)}
			/>
		</form>
	)
}
