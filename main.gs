/**
 * Parsing invoice with Gemini API.
 */
class InvoiceApp {
  /**
   * @param {Object} object Object using this library.
   */
  constructor(object = {}) {
    this.model = "models/gemini-1.5-pro-latest";
    this.version = "v1beta";
    this.baseUrl = "https://generativelanguage.googleapis.com";
    this.apiKey = object.apiKey || null;
    this.headers = object.apiKey
      ? null
      : {
          authorization: `Bearer ${object.token || ScriptApp.getOAuthToken()}`,
        };
    this.retry = 5;
    this.folderId = object.folderId || "root";
    this.object = object;
  }

  /**
   * ### Description
   * Main method.
   *
   * @returns {Promise} Response from API is returned as Promise object.
   */
  async run() {
    if (!this.object?.blob) {
      throw new Error("Please set the PDF blob of invoice on Google Drive.");
    }
    const blob = this.object.blob;
    console.log(
      `--- Converting PDF blob to PNG images and uploading images to Gemini.`
    );
    const obj = await this.uploadFileByBlob_(blob);

    console.log(`--- Processing Gemini using the uploaded images.`);
  const q = [
  `Создайте таблицу из предоставленного изображения руководства пользователя в виде объекта JSON.`,
  `Предоставленное изображение - это руководства пользователя.`,
  `Верните созданную таблицу в виде объекта JSON.`,
  `Без описаний и объяснений. Верните только необработанный объект JSON без форматирования markdown. Без форматирования markdown.`,
  `Обязательные свойства в объекте JSON следующие.`,
  ``,
  `[Свойства в объекте JSON]`,
  `"productType": "тип товара"`,
  `"characteristics": "характеристики"`,
  `"preparing": {`,
  `    "note": "примечание подготовки"`,
  `    "details": "детали подготовки"`,
  ``,
  `"iPhoneSettings": {`,
  `    "note": "примечание настройки в первый раз"`,
  `    "details": "детали настройки"`,
  `    "tips": "подсказки"`,
  ``,
  `для характеристики, создайте двумерный массив со следующей структурой`,
  `Название характеристики, Значение (объект)`,
  ``,
  `для детали подготовки, создайте объект со следующей структурой`,
  `Название детали, Значение`,
  ``,
  `для детали настройки, создайте объект со следующей структурой`,
  `Порядковый номер, Значение`,
  ``,
  `для подсказки, создайте массив`,
  ``,
  `Верните только необработанный объект JSON без форматирования markdown. Без форматирования markdown. Без тегов markdown.`,
].join("\n");
const res = this.doGemini_({ q, obj });

console.log(`--- Удаление загруженных изображений из Gemini.`);
obj.forEach(({ name }) => this.deleteFile_(name));

console.log(`--- Готово.`);
return res;
  }

  /**
   * ### Description
   * Upload image files to Gemini.
   *
   * @param {Blob} Blob PDF blob of invoice on Google Drive.
   * @returns {Promise} An array including uri, name, mimeType
   */
  async uploadFileByBlob_(blob) {
    if (blob.getContentType() != MimeType.PDF) {
      throw new Error(
        `Please set PDF blob. The mimeType of this blob is '${blob.getContentType()}'`
      );
    }
    const imageBlobs = await PDFApp.setPDFBlob(blob)
      .convertPDFToPng()
      .catch((err) => {
        throw new Error(err);
      });
    const ar = [];
    let url = `${this.baseUrl}/upload/${this.version}/files?uploadType=multipart`;
    for (let blob of imageBlobs) {
      const metadata = { file: { displayName: blob.getName() } };
      const payload = {
        metadata: Utilities.newBlob(
          JSON.stringify(metadata),
          "application/json"
        ),
        file: blob,
      };
      const options = { method: "post", payload: payload };
      if (this.apiKey) {
        url += `&key=${this.apiKey}`;
      } else {
        options.headers = this.headers;
      }
      const res = this.fetch_({ url, ...options });
      const o = JSON.parse(res.getContentText());
      ar.push({
        uri: o.file.uri,
        name: o.file.name,
        mimeType: o.file.mimeType,
      });
    }
    return ar;
  }

  /**
   * ### Description
   * Parsing invoice of image data by Gemini API.
   *
   * @param {Object} object Object including q and fileUri.
   * @returns {String|Object} Return parsed invoice data from Gemini API.
   */
  doGemini_(object) {
    const { q, obj } = object;
    const text = q;
    let url = `${this.baseUrl}/${this.version}/${this.model}:generateContent`;
    const options = {
      contentType: "application/json",
      muteHttpExceptions: true,
    };
    if (this.apiKey) {
      url += `?key=${this.apiKey}`;
    } else {
      options.headers = this.headers;
    }
    const fileData = obj.map(({ uri, mimeType }) => ({
      fileData: { fileUri: uri, mimeType },
    }));
    const contents = [{ parts: [{ text }, ...fileData], role: "user" }];
    const temp = [];
    let result = null;
    let retry = 5;
    do {
      retry--;
      options.payload = JSON.stringify({ contents });
      const res = this.fetch_({ url, ...options });
      if (res.getResponseCode() == 500 && retry > 0) {
        console.warn("Retry by the status code 500.");
        Utilities.sleep(3000); // wait
        this.doGemini_(object);
      } else if (res.getResponseCode() != 200) {
        throw new Error(res.getContentText());
      }
      const { candidates } = JSON.parse(res.getContentText());
      if (candidates && !candidates[0]?.content?.parts) {
        temp.push(candidates[0]);
        break;
      }
      const parts = (candidates && candidates[0]?.content?.parts) || [];
      if (parts[0].text) {
        const t = parts[0].text.match(/\`\`\`json\n([\w\s\S]*)\`\`\`/);
        if (t) {
          try {
            result = JSON.parse(t[1].trim());
          } catch ({ stack }) {
            result = null;
            console.error(stack);
            console.error(t[1].trim());
            this.doGemini_(object);
          }
        }
      } else {
        result = "No parts[0].text.";
        console.warn("No parts[0].text.");
        console.warn(parts);
      }
      temp.push(...parts);
    } while (!result && retry > 0);
    return result || "No values. Please try it again.";
  }

  /**
   * ### Description
   * Delete file from Gemini.
   *
   * @param {String} name Name of file.
   * @return {void}
   */
  deleteFile_(name) {
    let url = `${this.baseUrl}/${this.version}/${name}`;
    const options = { method: "delete", muteHttpExceptions: true };
    if (this.apiKey) {
      url += `?key=${this.apiKey}`;
    } else {
      options.headers = this.headers;
    }
    this.fetch_({ url, ...options });
    return null;
  }

  /**
   * ### Description
   * Request Gemini API.
   *
   * @param {Object} obj Object for using UrlFetchApp.fetchAll.
   * @returns {UrlFetchApp.HTTPResponse} Response from API.
   */
  fetch_(obj) {
    obj.muteHttpExceptions = true;
    const res = UrlFetchApp.fetchAll([obj])[0];
    if (res.getResponseCode() != 200) {
      throw new Error(res.getContentText());
    }
    return res;
  }
}
