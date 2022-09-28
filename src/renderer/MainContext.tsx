import React, { createContext, useContext, useState, useEffect } from 'react'
import en from './default.json'
import br from './br.json'

interface IMain {
	lang: 'default' | 'br' | string
	setLang: (lang: IMain['lang']) => void
	message: {
		content: string | ''
		type: 'success' | 'error'
	}
	setMessage: (data: IMain['message']) => void
	modal: boolean
	setModal: (data: boolean) => void
	Text: {
		CHANGE_LANG: string
		EXECUTE: string
		EXECUTE_TITLE: string
		INPUT_DATA: string
		INPUT_DATA_TITLE: string
		DOWNLOAD_INPUT: string
		UPLOAD_INPUT: string
		HOW_TO_USE: string
		HOW_TO_USE_TITLE: string
		GUIDE: string
		GUIDE_TITLE: string
		SAVE_GUIDE: string
		SAVE_GUIDE_TITLE: string
		PREFERENCES: string
		PREFERENCES_TITLE: string
		ABOUT: string
		ABOUT_TITLE: string
		COPY: string
		VERSION: string
	}
}

const MainContext = createContext<IMain>({} as IMain)

const Index: React.FC<{ children: React.ReactNode }> = ({ children }) => {
	const [lang, setLang] = useState<IMain['lang']>(
		localStorage.getItem('lang') || 'default'
	)
	const [message, setMessage] = useState<IMain['message']>(
		{} as IMain['message']
	)
	const [modal, setModal] = useState(false)

	// CARREGA O JSON DE LINGUAGEM:
	const Text = lang === 'default' ? en : br

	useEffect(() => {}, [])

	return (
		<MainContext.Provider
			value={{
				lang,
				setLang,
				message,
				setMessage,
				Text,
				modal,
				setModal,
			}}
		>
			{children}
		</MainContext.Provider>
	)
}

export default Index
export const useMain = (): IMain => useContext<IMain>(MainContext)
