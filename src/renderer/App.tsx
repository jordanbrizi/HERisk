import { MemoryRouter as Router, Routes, Route } from 'react-router-dom'
import MainContext from './MainContext'
import Header from './components/Header'
import Footer from './components/Footer'
import Section from './components/Section'
import './App.css'

const Main = () => {
	return (
		<main className="flex flex-1 flex-col h-full">
			<Header />
			<Section />
			<Footer />
		</main>
	)
}

export default function App() {
	return (
		<MainContext>
			<Router>
				<Routes>
					<Route path="/" element={<Main />} />
				</Routes>
			</Router>
		</MainContext>
	)
}
