window.addEventListener("load", e =>
{
    const emailInput = document.getElementById("emailInput");
    const passwordInput = document.getElementById("passwordInput");
    const emailSignIn = document.getElementById("emailSignIn");
    const signUp = document.getElementById("signUp");
    const signOut = document.getElementById("signOut");

    emailSignIn.addEventListener("click", e => {
        let email = emailInput.value;
        let password = passwordInput.value;
        const auth = firebase.auth();
        auth.signInWithEmailAndPassword(email, password)
            .then(() => {
                firebase.auth().currentUser.getIdToken(true)
                    .then(idToken => {
                        console.log(idToken);
                        fetch("http://localhost:3000/validateToken", {
                            method: "POST",
                            headers: {
                                "Content-Type": "text/plain;charset=utf-8"
                            },    
                            body: idToken
                            })
                            .then(response => response.json())
                            .then(content => {
                                console.log(content)
                                if(content.status === "success"){
                                    document.location.href = "lk.html";
                                }
                            })
                            .catch(error => {
                                alert("Нет доступа к удалённому серверу");
                            });
                    })
                    .catch(error => {
                        console.log(error.message);
                    });
            })
            .catch(error => {
                console.log(error.message);
            });
    });

    signUp.addEventListener("click", e => {
        let email = emailInput.value;
        let password = passwordInput.value;
        const auth = firebase.auth();
        auth.createUserWithEmailAndPassword(email, password)
            .then(success => {
                console.log("Пользователь зарегистрирован");
            })
            .catch(error => {
                console.log(error.message);
            });
    });

    signOut.addEventListener("click", e => {
        firebase.auth().signOut();
    });
});

function googleLogin(){
    const provider = new firebase.auth.GoogleAuthProvider();
    firebase.auth().signInWithPopup(provider)
        .then(result => {
            firebase.auth().currentUser.getIdToken(true)
            .then(idToken => {
                console.log(idToken);
                fetch("http://localhost:3000/validateToken", {
                    method: "POST",
                    headers: {
                        "Content-Type": "text/plain;charset=utf-8"
                    },    
                    body: idToken
                    })
                    .then(response => response.json())
                    .then(content => {
                        console.log(content)
                        if(content.status === "success"){
                            document.location.href = "lk.html";
                        }
                    })
                    .catch(error => {
                        alert("Нет доступа к удалённому серверу");
                    });
            })
            .catch(error => {
                console.log(error.message);
            });
        })
        .catch(error =>
            console.log(error));
}