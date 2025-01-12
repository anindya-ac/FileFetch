function onOpen() {
  SpreadsheetApp.getUi().createMenu('FileFetch')
    .addItem('Fetch Files', 'getMyFilesFromDrive')  // This points to the original function
    .addItem('Advanced Fetch', 'showAdvancedFetchDialog')  // This calls the dialog for advanced fetch
    .addItem('About', 'showAboutDialog')  // This shows the "About" popup
    .addToUi();
}

function showAboutDialog() {
  const htmlContent = `
    <div style="font-family: Arial, sans-serif; text-align: center;">
      <h3>FileFetch</h3>
      <p>Created by: A Chowdhury</p>
      <p>Version: 1.0</p>
      <p>Release Date: Jan 2025</p>
    </div>
  `;
  const htmlOutput = HtmlService.createHtmlOutput(htmlContent)
    .setWidth(300)
    .setHeight(200);
  SpreadsheetApp.getUi().showModalDialog(htmlOutput, 'About FileFetch');
}


function showAdvancedFetchDialog() {
  const html = HtmlService.createHtmlOutputFromFile('Index')
    .setWidth(400)
    .setHeight(300);
  SpreadsheetApp.getUi().showModalDialog(html, 'Advanced Fetch');
}

function getMyFilesFromDrive() {
  const maxFiles = 5000; // Limit to the most recent 5000 files
  const rows = [["File Name", "Url", "Created Date", "File Type"]];
  const sheet = getOrCreateSheet('FileFetch');

  // Clear the existing sheet content
  sheet.clear();

  const files = getFilesFromDrive(maxFiles, []);

  // Add file data to rows
  files.forEach(file => {
    const fileType = getFileType(file.mimeType);
    rows.push([file.name, file.url, file.createdDate, fileType]);
  });

  // Set values in the sheet and apply formatting
  sheet.getRange(1, 1, rows.length, rows[0].length).setValues(rows);
  formatSheet(sheet);
}

function getAdvancedFilesFromDrive(selectedTypes) {
  const maxFiles = 5000; // Limit to the most recent 5000 files
  const rows = [["File Name", "Url", "Created Date", "File Type"]];
  const sheet = getOrCreateSheet('FileFetch');

  // Clear the existing sheet content
  sheet.clear();

  const files = getFilesFromDrive(maxFiles, selectedTypes);

  // Add file data to rows
  files.forEach(file => {
    const fileType = getFileType(file.mimeType);
    rows.push([file.name, file.url, file.createdDate, fileType]);
  });

  // Set values in the sheet and apply formatting
  sheet.getRange(1, 1, rows.length, rows[0].length).setValues(rows);
  formatSheet(sheet);
}

function getFilesFromDrive(maxFiles, selectedTypes) {
  const files = [];
  const myFiles = DriveApp.searchFiles('"me" in owners');
  let count = 0;

  while (myFiles.hasNext() && count < maxFiles) {
    const file = myFiles.next();
    const fileType = getFileType(file.getMimeType());

    if (selectedTypes.length === 0 || selectedTypes.includes(fileType)) {
      files.push({
        name: file.getName(),
        url: file.getUrl(),
        createdDate: file.getDateCreated(),
        mimeType: file.getMimeType()
      });
      count++;
    }
  }

  return files;
}

function getFileType(mimeType) {
  if (mimeType.startsWith("image/")) return "Image";
  
  const fileTypes = {
    "application/vnd.google-apps.spreadsheet": "Spreadsheet",
    "application/vnd.google-apps.document": "Document",
    "application/vnd.google-apps.presentation": "Presentation",
    "application/pdf": "PDF",
    "application/vnd.google-apps.form": "Form",
    "video/": "Video",
    "application/vnd.openxmlformats-officedocument.presentationml.presentation": "Presentation"
  };

  return fileTypes[mimeType] || "Other";
}

function getOrCreateSheet(sheetName) {
  let sheet = SpreadsheetApp.getActive().getSheetByName(sheetName);
  if (!sheet) {
    sheet = SpreadsheetApp.getActive().insertSheet(sheetName);
  }
  return sheet;
}

function formatSheet(sheet) {
  sheet.setFrozenRows(1); // Freeze the header row
  sheet.getRange(1, 1, 1, sheet.getLastColumn()).setFontWeight("bold"); // Bold header row
}

