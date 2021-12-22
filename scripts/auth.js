// Sign up & Authenticate firebase User
// Initialize Firebase
let config = {
    apiKey: "AIzaSyAgkh9KcqSQPTrrxF5bZiu1_Lq8QED-z_0",
    authDomain: "fir-auth-3b188.firebaseapp.com",
    projectId: "fir-auth-3b188",
    appId: "1:660913370019:web:467f43a746dd538394a016",
    measurementId: "G-F97HRFYSX7"
};
firebase.initializeApp(config);

// make auth and firestore references
const auth = firebase.auth();
const db = firebase.firestore();
const functions = firebase.functions();

// Add admin cloud function
const adminForm = document.querySelector('.admin-actions');
adminForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const adminEmail = document.querySelector('#admin-email').value;
    const addAdminRole = functions.httpsCallable('addAdminRole');

    // call function
    addAdminRole({ email: adminEmail }).then(result => {
        console.log("Added role: " + result.admin);
    });
});


// update firestore settings
db.settings({ timestampsInSnapshots: true });

// Listen for Auth state changes
auth.onAuthStateChanged(user => {
    if (user) {

        user.getIdTokenResult().then(idTokenResult => {
            const isAdminRole = idTokenResult.claims.admin;
            console.log('Admin: ' + isAdminRole);
            user.admin = idTokenResult.claims.admin;

            setupUI(user);

            if (isAdminRole) {
                document.querySelector('#isAdmin').innerHTML = `<span style="display:block;font-weight:bold;color:blue">A</span>`;
            } else {
                document.querySelector('#isAdmin').innerHTML = `<span style="display:none;font-weight:bold;color:blue">A</span>`;
            }
        })
        document.getElementById("#loggedInEmail").innerHTML = user.email;
        document.querySelector('#isAdmin').innerHTML = user.admin
        db.collection('guides').onSnapshot(snapshot => {
            setupGuides(snapshot.docs);

        }, err => {
            console.log(err.message)
        })
    } else {
        document.getElementById("#loggedInEmail").innerHTML = '';
        document.querySelector('#isAdmin').innerHTML = `<span style="display:none;font-weight:bold;color:blue">A</span>`;
        setupGuides([]);
        setupUI();
    }
});

// Create new guide
const createForm = document.querySelector('#create-form');
createForm.addEventListener('submit', (e) => {
    e.preventDefault();
    db.collection('guides').add({
        title: createForm['title'].value,
        content: createForm['content'].value
    }).then(() => {
        //clear form and close modal
        const modal = document.querySelector('#modal-create');
        M.Modal.getInstance(modal).close();
        createForm.reset();
    })
})

// Sign Up
const signupForm = document.querySelector('#signup-form');
signupForm.addEventListener('submit', (e) => {
    e.preventDefault();

    // get user info
    const email = signupForm['signup-email'].value;
    const password = signupForm['signup-password'].value;

    console.log("Email: " + email + ' and ' + "Password: " + password);

    // sign up the user
    auth.createUserWithEmailAndPassword(email, password).then(cred => {
        return db.collection('users').doc(cred.user.uid).set({
            bio: signupForm['signup-bio'].value
        });
    }).then(() => {
        // close modal
        const modal = document.querySelector('#modal-signup');
        M.Modal.getInstance(modal).close();
        signupForm.reset();
        signupForm.querySelector('.error').innerHTML = '';
    }).catch(err => {
        signupForm.querySelector('.error').innerHTML = err.message;
    })
});

// Login
const loginForm = document.querySelector('#login-form');
loginForm.addEventListener('submit', (e) => {
    e.preventDefault();

    // get user info
    const email = loginForm['login-email'].value;
    const password = loginForm['login-password'].value;

    console.log("Logged in Email: " + email + ' and ' + "Password: " + password);

    //email = document.querySelector('#loggedInEmail').value;

    // sign up the user
    auth.signInWithEmailAndPassword(email, password)
        .then(cred => {
            //console.log( cred.user);
        })

        // close login modal and reset form
        const modal = document.querySelector('#modal-login');
        M.Modal.getInstance(modal).close();
        loginForm.reset();
        loginForm.querySelector('.error').innerHTML = '';
}).catch(err => {
    loginForm.querySelector('.error').innerHTML = err.message;
});

// Logout
const logout = document.querySelector('#logout');
logout.addEventListener('click', (e) => {
    e.preventDefault();
    auth.signOut();

    console.clear();
    location.reload();



})