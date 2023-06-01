const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const fs = require('fs');

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1168,
    height: 1100,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    },
  });

  mainWindow.loadFile('index.html');

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

app.on('ready', () => {
  createWindow();
  mainWindow.webContents.on('did-finish-load', () => {
    generateInvoiceNumber();
  });
});

function generateInvoiceNumber() {
  const min = 1000;
  const max = 9999;
  const invoiceNumber = Math.floor(Math.random() * (max - min + 1)) + min;
  mainWindow.webContents.send('invoice-number-generated', invoiceNumber.toString());
}

ipcMain.on('save-invoice', (event, invoiceData) => {
  console.log("Received save-invoice event", invoiceData);
  const { clientName, invoiceNumber } = invoiceData;

  const options = {
    title: 'Save Invoice',
    defaultPath: `Invoice-${clientName}-${invoiceNumber}.pdf`,
    filters: [{ name: 'PDF', extensions: ['pdf'] }],
  };

  dialog.showSaveDialog(mainWindow, options).then((result) => {
    console.log("Dialog result", result);
    if (!result.canceled && result.filePath) {
      mainWindow.webContents.printToPDF({printBackground: true}).then(data => {
        fs.writeFile(result.filePath, data, (error) => {
          if (error) {
            console.error(error);
            event.reply('save-invoice-response', null);
          } else {
            event.reply('save-invoice-response', result.filePath);
          }
        });
      }).catch(error => {
        console.error(error);
        event.reply('save-invoice-response', null);
      });
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
