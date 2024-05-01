async function sample2() {
  const apiKey = "###"; // Please set your API key.
  const fileId = "1DFvtrukNlB_fh6HdaScrmX1QDKaH1YZY"; // File ID of PDF file of invoice file.

  const ip = new InvoiceApp({
    apiKey,
    blob: DriveApp.getFileById(fileId).getBlob(),
  });
  const res = await ip.run();
  if (typeof res == "object") {
    console.log("--- Valid values.");
    console.log(JSON.stringify(res));

    // do something.
  } else {
    console.log("--- Invalid values.");
    console.log(res);
  }
}
