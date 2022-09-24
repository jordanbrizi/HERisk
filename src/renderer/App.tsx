import { MemoryRouter as Router, Routes, Route } from 'react-router-dom'
import icon from '../../assets/icon.svg'
import Header from './components/Header'
import Footer from './components/Footer'
import Section from './components/Section'
import './App.css'

const Main = () => {
	return (
		<main className="bg-slate-900 h-96">
			<Header />
			<Section />
			<Footer />
		</main>
	)
}

export default function App() {
	return (
		<Router>
			<Routes>
				<Route path="/" element={<Main />} />
			</Routes>
		</Router>
	)
}
