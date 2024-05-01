# Gemini AI pdf information extracter

> ENG

App script application that uses Gemini AI prompt to get info from pdf file 

## Usage
1. Edit sample.gs and put your Gemini AI API-KEY
2. Upload pdf file into your Google drive service, copy file ID(you can get it from sharing link for file) and put in sample.gs
3. If you need changes, then open main.gs and edit prompt.
4. Run sample.gs script

> [!IMPORTANT]
> This script uses a Google Apps Script library for converting PDF data to image data. So, please install [PDFApp](https://github.com/tanaikech/PDFApp).

> [!WARNING]
> Some times Gemini AI can make errors in understanding of pdf. However, it will try it again until reach result, so keep calm.

> [!NOTE]
> Not all information was extracted from pdf file. I made prompt(in russian) just to show how it works, so extracted only little part of all information in pdf file.

> [!TIP]
> Make sure you have a stable internet connection to use the Gemini AI API.

### Author: Omirzak Nurmukhamed


> RUS

App script приложение, которое использует запрос Gemini AI для получения информации из файла PDF.

## Инструкция 
1. Отредактируйте sample.gs и поместите свой API-ключ Gemini AI.
2. Загрузите PDF-файл в свой сервис Google Drive, скопируйте идентификатор файла (вы можете получить его по ссылке на файл) и вставьте sample.gs.
3. Если вам нужны изменения, откройте main.gs и отредактируйте запрос.
4. Запустите скрипт sample.gs

> [!IMPORTANT]
> Этот сценарий использует библиотеку Google Apps scripts для преобразования данных PDF в данные изображения. Итак, пожалуйста, установите [PDFApp](https://github.com/tanaikech/PDFApp).

> [!WARNING]
> Иногда Gemini AI может ошибаться в понимании PDF-файла. Однако он будет повторять попытку, пока не достигнет результата, так что сохраняйте спокойствие.

> [!NOTE]
> Не вся информация была извлечена из файла PDF. Я сделал запрос(на русском) только для того, чтобы показать, как это работает, поэтому извлек лишь небольшую часть всей информации из файла PDF.

> [!TIP]
> Убедитесь, что у вас стабильное подключение к Интернету для работы с Gemini AI API.

### Автор: Омирзак Нурмухамед
