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
const symbols = /^[~`!@#$%^&*()_+\-=\[\]\\{}|;':",.\/<>?\sa-zA-Z\p{Emoji}]*$/u
const containsWALO = /^(?=.*w)(?=.*a)(?=.*l)(?=.*o).*$/i

type UserInputProps = {
	input: string
	timestamp: number | null
	handleInput: (input: string) => void
	handleTimestamp: (is: 'focus' | 'submit') => void
}

export default function UserInput({ input, timestamp, handleInput, handleTimestamp }: UserInputProps) {
	//
	function inputMessage(event: FormEvent<HTMLInputElement>) {
		const nativeEvent = event?.nativeEvent as InputEvent | undefined
		const val = event.currentTarget.value
		const isValid = val.match(regexp) && val.length <= 64 && val.match(symbols)

		if (!nativeEvent) {
			event.preventDefault()
			return
		}

		// Start timestamp on first input
		if (!timestamp && !input && isValid) {
			handleTimestamp('focus')
		}

		if (isValid || val === '') {
			handleInput(val)
		}
	}

	function submitMessage(event: FormEvent<HTMLFormElement>) {
		event.preventDefault()

		if (timestamp && input.match(containsWALO)) {
			handleTimestamp('submit')

			// settimeout to wait a bit before message is added to database
			// without wait, the input is not correctly into view
			setTimeout(() => {
				event.currentTarget?.scrollIntoView({ behavior: 'smooth' })
			}, 10)
		}
	}

	return (
		<form action='' onSubmit={(e) => submitMessage(e)} autoComplete='off' autoCorrect='off'>
			<input
				type='text'
				id='chat-input'
				name='chat-input'
				placeholder='lâche un walo'
				maxLength={64}
				value={input}
				onChange={(e) => inputMessage(e)}
			/>
		</form>
	)
}
