/* eslint global-require: off, no-console: off, promise/always-return: off */

/**
 * This module executes inside of electron's main process. You can start
 * electron renderer process from here and communicate with the other processes
 * through IPC.
 *
 * When running `npm run build` or `npm run build:main`, this file is compiled to
 * `./src/main.js` using webpack. This gives us some performance wins.
 */
import path from 'path'
import fs from 'fs'
import { app, BrowserWindow, shell, ipcMain } from 'electron'
import { autoUpdater } from 'electron-updater'
import log from 'electron-log'
import MenuBuilder from './menu'
import { resolveHtmlPath } from './util'

const resultsPath = app.getAppPath() + '\\bin\\Results\\'
const appPath = app.getAppPath() + '\\'

// OBTER OS ARQUIVOS EM JSON E TXT DA PASTA RESULTS
class Resultados {
	Arquivos = () => require('fs').readdirSync(resultsPath)
	jsons = () => this.Arquivos().filter((a) => a.includes('.json'))
	txts = () => this.Arquivos().filter((a) => a.includes('.txt'))
}

const GerarODS = async (event, arg) => {
	let Obter = new Resultados()
	const messages = {
		default: [
			'Generating ODS files.',
			'Select Folder',
			'ODS files has been generated.',
			'Canceled by user.',
		],
		br: [
			'Gerando arquivos ODS.',
			'Selecionar pasta',
			'As planilhas ODS foram geradas.',
			'Cancelado pelo usuário.',
		],
	}
	event.sender.send('responseSuccess', messages[arg][0])
	const xlsx = require('xlsx')
	const planilhas = []
	const options = {
		title: messages[arg][1],
		defaultPath: app.getPath('documents'),
		properties: ['openDirectory'],
	}
	Obter.jsons().forEach(async (json) => {
		fs.readFile(path.resolve(resultsPath + json), (err, data) => {
			let arquivo = JSON.parse(data)
			const chaves = Object.keys(arquivo)
			const wb = xlsx.utils.book_new()

			chaves.forEach((chave) => {
				//LIMITA OS TÍTULOS PARA ATÉ 31 CARACTERES
				const chaveNew = chave.substring(0, 28) + '...'
				const keys = Object.keys(arquivo[chave][0])
				const header = [{ chave: chave }]
				const ws = xlsx.utils.json_to_sheet(header, {
					skipHeader: true,
				})
				xlsx.utils.sheet_add_json(ws, arquivo[chave], { origin: 'A2' })
				const merge = [
					{ s: { r: 0, c: 0 }, e: { r: 0, c: keys.length - 1 } },
				]
				ws['!merges'] = merge
				xlsx.utils.book_append_sheet(wb, ws, chaveNew)
			})
			const sheetName = `\\${json.replace('.json', '')}.ods`
			xlsx.writeFile(wb, resultsPath + sheetName)
			planilhas.push(sheetName)
		})
	})

	event.sender.send('responseSuccess', messages[arg][2])

	// ABRIR O DIÁLOGO DE SELEÇÃO DE PASTA
	dialog
		.showOpenDialog(options)
		.then((response) => {
			if (response.canceled === true) {
				return event.sender.send('responseError', messages[arg][3])
			}
			planilhas.forEach((sheet) => {
				const oldPath = path.resolve(resultsPath + sheet)
				const newPath = path.resolve(response.filePaths + sheet)
				fs.rename(oldPath, newPath, (err) => {
					if (err) throw err
				})
			})
			Obter.txts().forEach((txt) => {
				const oldPath = path.resolve(resultsPath + txt)
				const newPath = path.resolve(response.filePaths + `\\${txt}`)
				fs.copyFile(oldPath, newPath, (err) => {
					if (err) throw err
				})
			})
			require('child_process').exec(`start "" "${response.filePaths}"`)
		})
		.catch((err) => {
			console.log(err)
		})
}

// -----------------------------------------------------------------------------
// -----------------------------------------------------------------------------

class AppUpdater {
	constructor() {
		log.transports.file.level = 'info'
		autoUpdater.logger = log
		autoUpdater.checkForUpdatesAndNotify()
	}
}

let mainWindow: BrowserWindow | null = null

ipcMain
	.on('ipc-example', async (event, arg) => {
		const msgTemplate = (pingPong: string) => `IPC test: ${pingPong}`
		console.log(msgTemplate(arg))
		event.reply('ipc-example', msgTemplate('pong'))
	})
	.on('how_to', () => {
		const winHowto = new BrowserWindow({
			width: 1006,
			height: 595,
			backgroundColor: '#23272A',
			resizable: false,
			show: false,
			icon: __dirname + '/favicon.ico',
			webPreferences: {
				nodeIntegration: true,
			},
		})
		winHowto.loadURL('https://www.youtube.com/embed/w3-UVmYQrmM')
		winHowto.show()
	})

	// ABRIR O GUIA EM PDF -----------------------------------------------------
	.on('guide', () => {
		const winGuide = new BrowserWindow({
			width: 1024,
			height: 640,
			backgroundColor: '#23272A',
			resizable: true,
			show: false,
			icon: __dirname + '/favicon.ico',
		})
		winGuide.loadURL(appPath + 'bin/HERisk.pdf')
		winGuide.show()
	})

	// SALVAR O GUIA EM DOCX ---------------------------------------------------
	.on('guideSave', () => {
		const options = {
			defaultPath: app.getPath('documents'),
			properties: ['openDirectory'],
		}
		dialog
			.showOpenDialog(options)
			.then((response) => {
				if (response.canceled === false) {
					const old = path.resolve(appPath + 'bin\\HERisk.docx')
					const nFile = path.resolve(
						response.filePaths + '\\HERisk.docx'
					)
					fs.copyFile(old, nFile, () => {
						require('child_process').exec(
							`start "" "${response.filePaths}"`
						)
					})
				}
			})
			.catch((err) => {
				event.sender.send('responseError', err)
			})
	})

	// SALVAR O ARQUIVO INPUT ----------------------------------------------
	.on('inputSave', () => {
		const options = {
			defaultPath: app.getPath('documents'),
			properties: ['openDirectory'],
		}
		dialog
			.showOpenDialog(options)
			.then((response) => {
				if (response.canceled === false) {
					const old = path.resolve(appPath + 'bin\\input.xlsm')
					const nFile = path.resolve(
						response.filePaths + '\\input.xlsm'
					)
					fs.copyFile(old, nFile, () => {
						require('child_process').exec(
							`start "" "${response.filePaths}"`
						)
					})
				}
			})
			.catch((err) => {
				event.sender.send('responseError', err)
			})
	})

	// ENVIAR ARQUIVO DE INPUT ATUALIZADO PARA A PASTA DO APP --------------
	.on('inputUp', (event, arg) => {
		const options = {
			defaultPath: app.getPath('documents'),
			properties: ['openFile'],
			filters: [
				{
					name: 'Excel Open XML Macro-Enabled Spreadsheet',
					extensions: ['xlsm'],
				},
			],
		}
		dialog
			.showOpenDialog(options)
			.then((response) => {
				if (response.canceled === false) {
					const old = path.resolve(response.filePaths[0])
					const nFile = path.resolve(appPath + 'bin\\input.xlsm')
					fs.copyFile(old, nFile, () => {
						const messages = {
							default: 'File updated successfully.',
							br: 'Arquivo atualizado com sucesso.',
						}
						event.sender.send('responseSuccess', messages[arg])
					})
				}
			})
			.catch((err) => {
				event.sender.send('responseError', err)
			})
	})

	// SAIR DO APLICATIVO --------------------------------------------------
	.on('sair', () => app.quit())

	// ---------------------------------------------------------------------
	// ---------------------------------------------------------------------

	.on('execute', async (event, arg) => {
		let Obter = new Resultados()
		const messages = {
			default: [
				'HERisk is running...',
				'Cleaning the results folder...',
				'An error occurred in ### sheet. Please check the data entered and try again.',
				'A value of 0 was inserted in some field. Please check the entered values.',
				'Successfully executed.',
			],
			br: [
				'HERisk está sendo executado...',
				'Limpando os resultados anteriores...',
				'Ocorreu um erro na planilha ###. Por favor, verifique os dados inseridos e tente novamente.',
				'Um valor 0 ou nulo foi inserido em algum campo. Por favor, verifique os dados inseridos e tente novamente.',
				'Executado com sucesso.',
			],
		}
		event.sender.send('responseSuccess', messages[arg][0])
		const child = require('child_process')
		const herisk_exe = appPath + 'bin\\HERisk.exe'

		// LIMPA A PASTA RESULTS
		event.sender.send('responseSuccess', messages[arg][1])
		if (Obter.jsons().length > 0) {
			Obter.jsons().forEach((json) => fs.unlinkSync(resultsPath + json))
		}
		if (Obter.txts().length > 0) {
			Obter.txts().forEach((txt) => fs.unlinkSync(resultsPath + txt))
		}
		child.exec(
			herisk_exe,
			{ cwd: appPath + 'bin' },
			(err, data, stderr) => {
				if (!err) {
					event.sender.send('responseSuccess', messages[arg][4])
					return GerarODS(event, arg)
				}

				event.sender.send('responseError', stderr)
				const prns = [
					'Concentration',
					'Datachemical',
					'Dataecological',
					'Dataexp',
					'Scenary',
				]
				const prn = prns.filter((a) => stderr.includes(a))
				const erros = ['divide by zero']
				const erro = erros.filter((a) => stderr.includes(a))

				if (prn.length > 0) {
					event.sender.send(
						'responseError',
						messages[arg][2].replace('###', prn)
					)
				}
				if (erro.length > 0) {
					event.sender.send('responseError', messages[arg][3])
				}
			}
		)
	})

if (process.env.NODE_ENV === 'production') {
	const sourceMapSupport = require('source-map-support')
	sourceMapSupport.install()
}

const isDebug =
	process.env.NODE_ENV === 'development' || process.env.DEBUG_PROD === 'true'

if (isDebug) {
	require('electron-debug')()
}

const installExtensions = async () => {
	const installer = require('electron-devtools-installer')
	const forceDownload = !!process.env.UPGRADE_EXTENSIONS
	const extensions = ['REACT_DEVELOPER_TOOLS']

	return installer
		.default(
			extensions.map((name) => installer[name]),
			forceDownload
		)
		.catch(console.log)
}

const createWindow = async () => {
	if (isDebug) {
		await installExtensions()
	}

	const RESOURCES_PATH = app.isPackaged
		? path.join(process.resourcesPath, 'assets')
		: path.join(__dirname, '../../assets')

	const getAssetPath = (...paths: string[]): string => {
		return path.join(RESOURCES_PATH, ...paths)
	}

	mainWindow = new BrowserWindow({
		show: false,
		width: 384,
		height: 728,
		resizable: false,
		autoHideMenuBar: true,
		icon: getAssetPath('icon.png'),
		webPreferences: {
			sandbox: false,
			preload: app.isPackaged
				? path.join(__dirname, 'preload.js')
				: path.join(__dirname, '../../.erb/dll/preload.js'),
		},
	})

	mainWindow.loadURL(resolveHtmlPath('index.html'))

	mainWindow.on('ready-to-show', () => {
		if (!mainWindow) {
			throw new Error('"mainWindow" is not defined')
		}
		if (process.env.START_MINIMIZED) {
			mainWindow.minimize()
		} else {
			mainWindow.show()
		}
	})

	mainWindow.on('closed', () => {
		mainWindow = null
	})

	const menuBuilder = new MenuBuilder(mainWindow)
	menuBuilder.buildMenu()

	// Open urls in the user's browser
	mainWindow.webContents.setWindowOpenHandler((edata) => {
		shell.openExternal(edata.url)
		return { action: 'deny' }
	})

	// Remove this if your app does not use auto updates
	// eslint-disable-next-line
	new AppUpdater()
}

/**
 * Add event listeners...
 */

app.on('window-all-closed', () => {
	// Respect the OSX convention of having the application in memory even
	// after all windows have been closed
	if (process.platform !== 'darwin') {
		app.quit()
	}
})

app.whenReady()
	.then(() => {
		createWindow()
		app.on('activate', () => {
			// On macOS it's common to re-create a window in the app when the
			// dock icon is clicked and there are no other windows open.
			if (mainWindow === null) createWindow()
		})
	})
	.catch(console.log)
