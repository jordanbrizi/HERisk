import React from 'react'
import { useMain } from 'renderer/MainContext'

const Footer: React.FC = () => {
	const { Text } = useMain()
	const { COPY } = Text

	return (
		<footer className="p-6 bg-dark text-light/20">
			<p className="text-xm text-center p-0">
				&copy; 2020 - {new Date().getFullYear()}. {COPY}
			</p>
		</footer>
	)
}

export default Footer
