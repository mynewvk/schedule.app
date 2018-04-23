const electron = require('electron');
const url = require('url');
const path = require('path');
const fs = require('fs');
const jquery = require('jquery');
const {Menu, app, BrowserWindow, ipcMain} = electron;
const {Parser} = require('./module/parser');

let mainWindow, mainMenu;

//Listen app ready and create main window
app.on('ready',function(){

	let view = 'enterPoint.html';

	parser = new Parser(1,1,1,1);
	parser.parse();

	mainWindow = new BrowserWindow({
		titleBarStyle: 'hidden',
     	width: 700,
     	height: 500,
     	minWidth: 700,
     	minHeight: 500,
     	backgroundColor: '#312450',
     	show: false,
	})

	fs.readFile('./login.txt', err => {
		view = (err) ? 'enterPoint.html' : 'main.html';

		mainWindow.loadURL(url.format({
			pathname: path.join(__dirname, 'view/'+ view),
			protocol: 'file:',
			slashes: true,
		}));
	});

	mainWindow.once('ready-to-show', () => {
	    mainWindow.show()
	})

	const mainMenu = Menu.buildFromTemplate(mainMenuTemplate);

	Menu.setApplicationMenu(mainMenu);

	mainWindow.webContents.openDevTools();

});


const mainMenuTemplate = [
	{
		label: "File",
		submenu: [
			{
				label: "Dev Tools",
				click(){
					mainWindow.webContents.openDevTools();
				}
			}
		]
	}
];

ipcMain.on('message', (event, arg) => {
	//console.log(JSON.stringify(parser.timetable));
});
