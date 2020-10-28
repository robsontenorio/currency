'use strict'

let _cc = 0
const _id = () => `c_${Math.trunc(Date.now() / 1000)}_${_cc++ & 0xFF}`

const instances = new Map()

const GUID = Symbol('GUID')

class Currency {
	static data(input) {
		return instances.has(input[GUID]) && instances.get(input[GUID])
	}

	static masking(v, opts = {}) {
		opts = {
			prefix: false,
			sufix: false,
			separator: ' ',
			decimal: ',',
			thousand: '.',
			...opts
		}

		const n = String(Number(v.replace(/\D/g, '')))
		const d = n.slice(-2).padStart(2, '0')
		const p = n.replace(d, '').replace(/(\d)(?=(\d{3})+(?!\d))/g, `$1${opts.thousand}`)
		const r = n.length > 2 ? `${p}${opts.decimal}${d}` : `0${opts.decimal}${d}`
		const a = []
		if (opts.prefix) {
			a.push(opts.prefix)
		}

		a.push(r)

		if (opts.sufix) {
			a.push(opts.sufix)
		}

		return a.join(opts.separator)
	}

	constructor(input, opts = {}) {
		this.opts = {
			keyEvent: 'input',
			triggerOnBlur: false,
			maskOpts: {},
			...opts
		}

		if (input instanceof HTMLInputElement === false) {
			throw new TypeError('The input should be a HTMLInputElement')
		}

		// Check if element has an instance
		const instance = Currency.data(input)
		if (instance instanceof Currency) {
			return instance
		}

		this.input = input
		this.events = new Set()

		// Listener
		this.input.addEventListener(this.opts.keyEvent, this)
		this.events.add(this.opts.keyEvent)

		this.input.addEventListener('click', this)
		this.events.add('click')

		if (this.opts.triggerOnBlur) {
			this.input.addEventListener('blur', this)
			this.events.add('blur')
		}

		// Storage instance
		this.input[GUID] = _id()
		instances.set(this.input[GUID], this)
	}

	onMasking() {
		this.input.value = Currency.masking(this.input.value, this.opts.maskOpts)
	}

	onClick() {
		this.input.focus()
		this.input.setSelectionRange(this.value.length, this.value.length)
	}

	destroy() {
		for (const _event of this.events) {
			this.input.removeEventListener(_event, this)
		}

		if (instances.has(this.input[GUID])) {
			instances.delete(this.input[GUID])
		}
	}

	handleEvent(event) {
		if (event.type === 'click') {
			this.onClick(event)
		} else {
			this.onMasking(event)
		}
	}
}

export default Currency