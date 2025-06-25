/**
 * 根据模板和输出路径在 sheets 中找到对应的数据输出
 */

const folder = DriveApp.getFolderById("1rmgFk1r4RXFIK4m7TSHvBT5SJGmMVCEA");
const sheets = SpreadsheetApp.getActiveSheet();
const sheetName = sheets.getName();

const convertFolderName = "convertedFiles";

export function myFunction() {
  // 获取文件夹中的所有文件
  const files = folder.getFiles();
  let targetSpreadsheet;

  // 遍历所有文件查找匹配的电子表格
  while (files.hasNext()) {
    const file = files.next();

    // 检查文件类型
    const mimeType = file.getMimeType();
    if (
      mimeType === MimeType.GOOGLE_SHEETS ||
      (mimeType ===
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" &&
        file.getName().includes(sheetName))
    ) {
      // excelCount++;

      if (mimeType === MimeType.GOOGLE_SHEETS) {
        targetSpreadsheet = SpreadsheetApp.openById(file.getId());
      } else {
        targetSpreadsheet = convertToGoogleSheets(file);
      }
    }
  }

  if (!targetSpreadsheet) {
    Logger.log(`未找到名称为 "${sheetName}" 的电子表格`);
  }
}

export function convertToGoogleSheets(file: GoogleAppsScript.Drive.File) {
  // 检查是否存在目标文件夹
  const existingFolders = folder.getFoldersByName(convertFolderName);
  let convertedFolder;

  if (existingFolders.hasNext()) {
    convertedFolder = existingFolders.next();
    // 检查文件夹中是否已存在同名文件
    const existingFiles = convertedFolder.getFilesByName(file.getName());
    if (existingFiles.hasNext()) {
      Logger.log("文件格式转为 google sheets 中，文件已存在，直接返回");
      return existingFiles.next();
    }
  } else {
    // 如果文件夹不存在，创建新文件夹
    Logger.log("文件格式转为 google sheets 中，创建转换文件夹");
    convertedFolder = folder.createFolder(convertFolderName);
    // 转换文件
    const convertedFile = Drive.Files.copy(
      {
        name: file.getName(),
        mimeType: MimeType.GOOGLE_SHEETS,
      },
      file.getId()
    );

    if (!convertedFile.id) return Logger.log("转换文件失败");

    // 将转换后的文件移动到目标文件夹
    const convertedFileObj = DriveApp.getFileById(convertedFile.id);
    convertedFileObj.moveTo(convertedFolder);
    Logger.log("文件格式转为 google sheets 中，移动到转换文件夹");
    return convertedFile;
  }
}

function convertAndMoveToFolder(file: GoogleAppsScript.Drive.File) {
  const convertedFile = Drive.Files.copy(
    {
      name: file.getName(),
      mimeType: MimeType.GOOGLE_SHEETS,
    },
    file.getId()
  );
  const convertedFolder = folder.createFolder(convertFolderName);

  if (!convertedFile.id) return Logger.log("转换文件失败");

  // 将转换后的文件移动到目标文件夹
  const convertedFileObj = DriveApp.getFileById(convertedFile.id);
  convertedFileObj.moveTo(convertedFolder);
}
