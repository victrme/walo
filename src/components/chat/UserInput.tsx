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
const containsWALO = /^(?=.*w)(?=.*a)(?=.*l)(?=.*o).*$/i

type UserInputProps = {
	input: string
	timestamp: number
	handleInput: (input: string) => void
	handleTimestamp: (is: 'focus' | 'submit') => void
}

export default function UserInput(props: UserInputProps) {
	//

	function handleUserMessage(event: FormEvent<HTMLInputElement>) {
		const nativeEvent = event?.nativeEvent as InputEvent | undefined
		const val = event.currentTarget.value
		const isValid = val.match(regexp) && val.length <= 64

		if (!nativeEvent) {
			event.preventDefault()
			return
		}

		// Start timestamp on first input
		if (props.timestamp === 10 ** 16 && !props.input && isValid) {
			props.handleTimestamp('focus')
		}

		props.handleInput(isValid ? val : props.input)
	}

	function applyMessage(event: FormEvent<HTMLFormElement>) {
		event.preventDefault()

		if (props.input.match(containsWALO)) {
			props.handleTimestamp('submit')

			// settimeout to wait a bit before message is added to database
			// without wait, the input is not correctly into view
			setTimeout(() => {
				event.currentTarget?.scrollIntoView({ behavior: 'smooth' })
			}, 10)
		}
	}

	return (
		<form action='' onSubmit={(e) => applyMessage(e)}>
			<input
				type='text'
				id='chat-input'
				name='chat-input'
				spellCheck='false'
				autoComplete='false'
				placeholder='lâche un walo'
				maxLength={64}
				value={props.input}
				onChange={(e) => handleUserMessage(e)}
			/>
		</form>
	)
}
