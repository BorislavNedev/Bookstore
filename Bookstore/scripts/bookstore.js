function startApp() {    
     function showView(view) {
        $('section').hide();
        switch (view) {
            case 'home':
                $('#viewHome').show();
                break;
            case 'contact':
                $('#viewContact').show();
                loadAds();
                break;
            case 'login':
                $('#viewLogin').show();
                break;
            case 'register':
                $('#viewRegister').show();
                break;            
            case 'allBooks':
                $('#viewAllBooks').show();
                break;
            case 'details':
                $('#viewDetails').show();
                break;
        }
    }

    $('#linkHome').click(() => showView('home'));
    $('#linkContact').click(() => showView('contact'));
    $('#linkLogin').click(() => showView('login'));
    $('#linkRegister').click(() => showView('register'));
    $('#linkAll').click(() => showView('allBooks'));

    $('#buttonLoginUser').click(login);
    $('#buttonRegisterUser').click(register);    
    $('#linkLogout').click(logout);    

     $(document).on({
        ajaxStart: () => $('#loadingBox').show(),
        ajaxStop: () => $('#loadingBox').fadeOut()
    });

    $('#errorBox').click((event) => $(event.target).hide());

    function showInfo(message) {
        $('#infoBox').show();
        setTimeout(() => $('#infoBox').fadeOut(), 3000);
    }

    function showError(message) {
        $('#errorBox').text(message);
        $('#errorBox').show();
    }

    function handleError(reason) {
        showError(reason.responseJSON.description);
    }
    
    let requester = (() => {
        const baseUrl = 'https://baas.kinvey.com/';
        const appKey = 'kid_r1rtqG0i-';
        const appSecret = '441a1c600c4641b5a4cc835decd25b04';

        function makeAuth(auth) {
        if (auth === 'basic') return 'Basic ' + btoa(appKey + ':' + appSecret);
        else return 'Kinvey ' + localStorage.getItem('authtoken');
        }

        function makeRequest(method, module, url, auth) {
            return req = {
                url: baseUrl + module + '/' + appKey + '/' + url,
                method,
                headers: {
                    'Authorization': makeAuth(auth)
                } 
            };
        }

        function get(module, url, auth) {
            return $.ajax(makeRequest('GET', module, url, auth));
        }

        function post(module, url, data, auth) {
            let req = makeRequest('POST', module, url, auth);
            req.data = JSON.stringify(data);
            req.headers['Content-Type'] = 'application/json';
            return $.ajax(req);
        }

        function update(module, url, data, auth) {
            let req = makeRequest('PUT', module, url, auth);
            req.data = JSON.stringify(data);
            return $.ajax(req);
        }

        function remove(module, url, auth) {
            return $.ajax(makeRequest('DELETE', module, url, auth));
        }

        return {
            get, post, update, remove
        }
    })();

    if (localStorage.getItem('authtoken') !== null && localStorage.getItem('username') !== null) {
        userLoggedIn();  
    } else {
        userLoggedOut();
    }
    showView('home');

    function userLoggedIn() {
        $('#loggedInUser').text(`Hello, ${localStorage.getItem('username')}!`);
        $('#linkLogin').hide();
        $('#linkRegister').hide();       
        $('#linkContact').show();       
        $('#linkAll').show();        
        $('#linkLogout').show();                
    }

    function userLoggedOut() {
        $('#loggedInUser').text(``);
        $('#linkLogin').show();
        $('#linkRegister').show();      
        $('#linkContact').show();        
        $('#linkAll').show();        
        $('#linkLogout').hide();                
    }

    function saveSession(data) {
        localStorage.setItem('username', data.username);
        localStorage.setItem('id', data._id);
        localStorage.setItem('authtoken', data._kmd.authtoken);  
        userLoggedIn();   
    }

    async function login() {
        let form = $('#formLogin');
        let username = form.find('input[name=username]').val();
        let password = form.find('input[name=password]').val();
        
        try {
            let data = await requester.post('user', 'login', {username, password}, 'basic');
            saveSession(data);
            showView('allBooks');       
        } catch (err) {
            handleError(err);
        }
    }

    async function register() {
        let form = $('#formRegister');
        let username = form.find('input[name=username]').val();
        let email = form.find('input[name=email]').val();        
        let password = form.find('input[name=password]').val();
        
        try {
            let data = await requester.post('user', '', {username, email, password}, 'basic');
            saveSession(data);
            showView('allBooks');       
        } catch (err) {
            handleError(err);
        }
    }    

    async function logout() {
        try {
            let data = await requester.post('user', '_logout', {authtoken: localStorage.getItem('authtoken')});
            localStorage.clear();
            userLoggedOut();
            showView('home');
        } catch (err) {
            handleError(err);
        }
    }   
}