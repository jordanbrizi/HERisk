import React from 'react'
import { useMain } from 'renderer/MainContext'

const Header: React.FC = () => {
	const { lang, setLang, Text } = useMain()
	const { PREFERENCES } = Text
	const HandleLang = () =>
		lang === 'default' ? setLang('br') : setLang('default')
	return (
		<header className="h-24 bg-primary">
			<h1></h1>
		</header>
	)
}

export default Header
