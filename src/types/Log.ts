export type Log = {
	t: number
	uid: string
	msg: string
}

export type Logs = {
	[key: string]: Log
}
