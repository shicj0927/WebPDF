function log(txt) {
    document.getElementById("log").innerHTML += "<p>" + txt + "</p>";
    console.log(txt);
}
function main(dir) {
    log("WebPDF V1.0 log");
    log("");
    let infoUrl = dir + "info.json";
    fetch(infoUrl)
        .then(response => {
            if (!response.ok) {
                throw new Error("Network response was not ok " + response.statusText);
            }
            return response.json();
        })
        .then(data => {
            log("Loaded info.json");
            log("Name: " + data.name);
            let result = [];
            log("Parts: " + data.parts.length);
            let fetchPromises = data.parts.map((part, i) => {
                let partUrl = dir + part;
                log("Part " + i + ": " + part);
                log("Url = " + partUrl);
                return fetch(partUrl)
                    .then(response => {
                        if (!response.ok) {
                            throw new Error("Network response was not ok " + response.statusText);
                        }
                        return response.arrayBuffer();
                    })
                    .then(partData => {
                        let blob = new Blob([partData], { type: "application/octet-stream" });
                        result.push(blob);
                        log("Loaded part " + i);
                        log("Size = " + blob.size);
                        return blob;
                    })
                    .catch(error => {
                        log("Error loading part " + i + " : " + error);
                        throw error;
                    });
            });
            Promise.all(fetchPromises)
                .then(() => {
                    let mergedBlob = new Blob(result, { type: "application/pdf" });
                    log("All parts merged into a single Blob.");
                    log("Merged Blob size: " + mergedBlob.size + " bytes");
                    let blobUrl = URL.createObjectURL(mergedBlob);
                    let pdfViewer = document.createElement("iframe");
                    pdfViewer.src = blobUrl;
                    pdfViewer.style.position = "absolute";
                    pdfViewer.style.top = "0";
                    pdfViewer.style.left = "0";
                    pdfViewer.style.width = "100%";
                    pdfViewer.style.height = "100%";
                    pdfViewer.style.border = "none";
                    document.body.appendChild(pdfViewer);
                    let downloadButton = document.createElement("button");
                    downloadButton.textContent = "下载 PDF";
                    downloadButton.style.position = "absolute";
                    downloadButton.style.top = "10px";
                    downloadButton.style.left = "10px";
                    downloadButton.style.zIndex = "1000";
                    downloadButton.id = "downloadButton";
                    downloadButton.onclick = () => {
                        let a = document.createElement("a");
                        a.href = blobUrl;
                        a.download = data.name;
                        a.click();
                    };
                    document.body.appendChild(downloadButton);
                    let toggleButton = document.createElement("button");
                    toggleButton.textContent = "隐藏下载按钮";
                    toggleButton.style.position = "absolute";
                    toggleButton.style.top = "50px";
                    toggleButton.style.left = "10px";
                    toggleButton.style.zIndex = "1000";
                    toggleButton.id = "toggleButton";
                    toggleButton.onclick = () => {
                        let downloadBtn = document.getElementById("downloadButton");
                        let toggleBtn = document.getElementById("toggleButton");
                        if (downloadBtn.style.display === "none") {
                            downloadBtn.style.display = "block";
                            toggleBtn.style.display = "block";
                        } else {
                            downloadBtn.style.display = "none";
                            toggleBtn.style.display = "none";
                        }
                    };
                    document.body.appendChild(toggleButton);

                    log("PDF file displayed on the page.");
                })
                .catch(error => log("Error merging parts: " + error));
        })
        .catch(error => log("Error loading info.json: " + error));
}

main("./data/");
