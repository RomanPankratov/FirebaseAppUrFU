let db = null;
let docs = null;
let files = null;
let docsValues = null;
let filesValues = null;
let uid = null;
let userDocs = null;
let userFiles = null;
let data = [];
let dataFiles = [];
let numberEditId = null;
let fileName = null;
let fileKey = null;

let testImgUrl = null;

window.addEventListener("load", e =>
{
    const app = firebase.app();

    const signOut = document.getElementById("signOut");
    
    const userMail = document.getElementById("userMail");

    const deleteAccount = document.getElementById("deleteAccount");

    const createDocument = document.getElementById("createDocument");

    const documentTitle = document.getElementById("documentTitle");
    const documentDate = document.getElementById("documentDate");
    const documentText = document.getElementById("documentText");
    const documentReference = document.getElementById("documentReference");

    const documentTitleEdit = document.getElementById("documentTitleEdit");
    const documentDateEdit = document.getElementById("documentDateEdit");
    const documentTextEdit = document.getElementById("documentTextEdit");
    const documentReferenceEdit = document.getElementById("documentReferenceEdit");

    const editValues = document.getElementById("editValues");

    const fileButton = document.getElementById("fileButton");

    const sendToTransform = document.getElementById("sendToTransform");

    const content = document.getElementById("content");

    db = firebase.database();
    files = db.ref().child("files");
    docs = db.ref().child("docs");

    docs.on("value", datasnapshot => {
        docsValues = datasnapshot.val();
        filterDocuments();
        placeDocuments();
    });

    files.on("value", datasnapshot => {
        filesValues = datasnapshot.val();
        filterFiles();
        placeFiles();
    });

    firebase.auth().onAuthStateChanged(user => {
        if (user) {
          userMail.innerHTML = user.email;
          signOut.classList.remove("d-none");
          uid = firebase.auth().currentUser.uid;
        } else {
          userMail.innerHTML = "";
          signOut.classList.add("d-none");
          deleteAccount.style.display="none";
          content.style.display="none";
        }
      });

    signOut.addEventListener("click", e => {
        firebase.auth().signOut();
        document.location.href="/";
    });

    deleteAccount.addEventListener("click", el => {
        const user = firebase.auth().currentUser;
        let deleteConfirmation = confirm("Вы уверены, что хотите удалить аккаунт?");
        if(deleteConfirmation){
            user.delete()
            .then(() => {
                alert("Ваш аккаунт был удалён");
                document.location.href = "/";
            })
            .catch( err => {
                console.log(err);
            });
        }
    });

    createDocument.addEventListener("click", e => {
        let title = documentTitle.value;
        let date = documentDate.value;
        let text = documentText.value;
        let reference = documentReference.value;
        console.log({
            "title": title,
            "date": date.toString(),
            "text": text,
            "reference": reference
        });
        if(uid !== undefined && uid !== null){
            let newKey = docs.push().key;
            docs.child(newKey).set({
                "title": title,
                "date": date.toString(),
                "text": text,
                "reference": reference,
                "uid": uid
            });
        }
    });

    editValues.addEventListener("click", e => {
        let title = documentTitleEdit.value;
        let date = documentDateEdit.value;
        let text = documentTextEdit.value;
        let reference = documentReferenceEdit.value;
        console.log({
            "title": title,
            "date": date.toString(),
            "text": text,
            "reference": reference
        });
        if(uid !== undefined && uid !== null){
            docs.child(userDocs[numberEditId].index).set({
                "title": title,
                "date": date.toString(),
                "text": text,
                "reference": reference,
                "uid": uid
            });
            document.location.href="lk.html";
        }
    });

    fileButton.addEventListener("change", e => {
        let file = e.target.files[0];
        console.log(file);
        if(uid !== undefined && uid !== null){
            let storageRef = firebase.storage().ref("files/"+file.name);
            fileName = file.name;
            storageRef.put(file)
                .then(() => {
                    let urlToFileObj = storageRef.getDownloadURL()
                        .then(result => {
                            let newKey = files.push().key;
                            fileKey = newKey;
                            testImgUrl = result;
                            files.child(newKey).set({
                                "url": result,
                                "uid": uid,
                                "fileName": fileName
                            });
                        });
                    });
        }
    });
});

function getDocuments(){
    return new Promise((res, rej)=>{
        docs.on("value", datasnapshot => {
            docsValues = datasnapshot.val();
            res(docsValues);
        });
    })
}

function getFiles(){
    return new Promise((res, rej)=>{
        files.on("value", datasnapshot => {
            filesValues = datasnapshot.val();
            res(filesValues);
        });
    })
}

function filterFiles(){
    let keys = Object.keys(filesValues);
    keys = keys.filter(el => !dataFiles.map(el=>el.index).includes(el));
    keys.forEach(el => {
        dataFiles.push({index: el, file: filesValues[el], isPlaced: false, isUpdated: false})
    }
    );
    userFiles = dataFiles.filter(el => el.file.uid === uid);
    console.log(userFiles);
}

function filterDocuments(){
    let keys = Object.keys(docsValues);
    keys = keys.filter(el => !data.map(el=>el.index).includes(el));
    keys.forEach(el => {
        data.push({index: el, doc: docsValues[el], isPlaced: false, isUpdated: false})
    }
    );
    userDocs = data.filter(el => el.doc.uid === uid);
    console.log(userDocs);
}

function placeDocuments(){
    const cardContainer = document.querySelector(".card-container");
    userDocs.forEach((el, index) => {
        if(el.isPlaced==false){
            let card = document.createElement("div");
            card.className="card";
            card.style.marginBottom = "7.5px";
            card.id = "doc"+index;
            let cardBody = document.createElement("div");
            cardBody.className="card-body";
            let cardTitle= document.createElement("h5");
            cardTitle.className="card-title";
            cardTitle.innerHTML = el.doc.title;
            let cardDate = document.createElement("h6");
            cardDate.className="card-subtitle";
            cardDate.innerHTML = el.doc.date;
            let cardText = document.createElement("p");
            cardText.className="card-text";
            cardText.innerHTML = el.doc.text;
            let cardReference = document.createElement("p");
            cardReference.className="card-text";
            cardReference.innerHTML = "<a href='"+ el.doc.reference + "'>" + el.doc.reference + "</a>";
            cardContainer.append(card);
            card.append(cardBody);
            cardBody.append(cardTitle);
            cardBody.append(cardDate);
            cardBody.append(cardText);
            cardBody.append(cardReference);
            let cardFooter = document.createElement("div");
            cardFooter.className="card-footer d-flex";
            card.append(cardFooter);
            let div = document.createElement("div");
            div.innerHTML = '<button type="button" id="'+"doc-card"+index+'" class="btn btn-warning" data-toggle="modal" data-target="#exampleModal" onclick="checkId(this.id)" style="margin-right: 15px;">'
            +'Редактировать'
            +'</button>';
            let div2 = document.createElement("div");
            div2.innerHTML = '<button type="button" id="'+"doc-card-remove"+index+'" class="btn btn-danger" onclick="removeDoc(this.id)">'
            +'Удалить'
            +'</button>';
            cardFooter.append(div);
            cardFooter.append(div2);
            el.isPlaced = true;
        }
        /*if(el.isUpdated==true){
            let a = 
        }*/
    });
}

function placeFiles(){
    const fileContainer = document.querySelector(".file-container");
    userFiles.forEach((el, index) => {
        if(el.isPlaced==false){
            let card = document.createElement("div");
            card.className="card";
            card.style.marginBottom = "7.5px";
            card.id = "file"+index;
            let cardImgTop = document.createElement("img");
            cardImgTop.alt="Image";
            cardImgTop.src=el.file.url;
            cardImgTop.className="card-img-top";
            let cardFooter = document.createElement("div");
            cardFooter.className="card-footer";
            let div = document.createElement("div");
            div.innerHTML = '<button type="button" id="'+"file-card"+index+'" class="btn btn-primary" style="width: 100%;" onclick="sendToTransform(this.id)">'
            +'Преобразовать'
            +'</button>';
            fileContainer.append(card);
            card.append(cardImgTop);
            card.append(cardFooter);
            cardFooter.append(div);
            el.isPlaced = true;
        }
        /*if(el.isUpdated==true){
            let a = 
        }*/
    });
}

function fillCardContainer(){
    getDocuments()
        .then(() => {
            filterDocuments();
            placeDocuments();
    })
}

function blobToFile(theBlob, fileName){
    theBlob.lastModifiedDate = new Date();
    theBlob.name = fileName;
    return theBlob;
}

function checkId(id){
    let docId = id.slice(0, 3)+id.slice(id.length-1);
    numberEditId = parseInt(docId.slice(3, docId.length));
    console.log(docId);
    let doc = document.getElementById(docId)
    documentTitleEdit.value = doc.children[0].childNodes[0].innerHTML;
    documentDateEdit.value = doc.children[0].childNodes[1].innerHTML;
    documentTextEdit.value = doc.children[0].childNodes[2].innerHTML;
    documentReferenceEdit.value = doc.children[0].childNodes[3].innerText;
}

function removeDoc(id){
    let docId = id.slice(0, 3)+id.slice(id.length-1);
    numberRemoveId = parseInt(docId.slice(3, docId.length));
    console.log(docId);
    let doc = document.getElementById(docId);
    if(uid !== undefined && uid !== null){
        docs.child(userDocs[numberRemoveId].index).remove();
    }
    doc.remove();
}

function sendToTransform(id){
    let fileId = id.slice(0, 4)+id.slice(id.length-1);
    index = parseInt(fileId.slice(4, fileId.length));
    fetch("http://localhost:3000/grayScale", {
            method: "POST",
            headers: {
                "Content-Type": "text/plain;charset=utf-8"
            },    
            body: userFiles[index].file.url
            })
                .then(response => response.blob())
                .then(blob => {
                    console.log(blob);
                    let file = blobToFile(blob, userFiles[index].file.fileName);
                    if(uid !== undefined && uid !== null){
                        let storageRef = firebase.storage().ref("files/"+file.name);
                        storageRef.put(file)
                            .then(() => {
                                let urlToFileObj = storageRef.getDownloadURL()
                                    .then(result => {
                                        testImgUrl = result;
                                        files.child(userFiles[index].index).set({
                                            "url": result,
                                            "uid": uid,
                                            "fileName": fileName
                                        });
                                        alert("Изображение преобразовано");
                                        document.location.href="lk.html";
                                    });
                                });
                }
            })
            .catch( error => {
                alert("Нет доступа к удалённому серверу");
            });
}