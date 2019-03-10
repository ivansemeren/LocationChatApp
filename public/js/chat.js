const socket = io();

// const $messageForm = document.querySelector('message-form');
// const $messageFormInput = $messageForm.querySelector('input');
// const $messageFormButton = $messageForm.querySelector('button');
const $sendLocationButton = document.querySelector('#send-location');
const $messages = document.querySelector('#messages');
const $sidebar = document.querySelector('#sidebar');
const messageTemplate = document.querySelector('#message-template').innerHTML;
const locationTemplate = document.querySelector('#location-template').innerHTML;
const sidebarTemplate = document.querySelector('#sidebar-template').innerHTML;

const {username, room} = Qs.parse(location.search, {ignoreQueryPrefix: true});

const autoscroll = () => {
    const $newMessage = $messages.lastElementChild

    const newMessageStyle = getComputedStyle($newMessage);
    const newMessageMargin = parseInt(newMessageStyle.marginBottom);
    const newMessageHeight = $newMessage.offsetHeight + newMessageMargin;

    //console.log(newMessageMargin);
    const visibleHeight = $messages.offsetHeight;

    //height
    const containerHeight = $messages.scrollHeight;

    const scrollOffset = $messages.scrollTop + visibleHeight;

    if(containerHeight - newMessageHeight <= scrollOffset){
        $messages.scrollTop = $messages.scrollHeight;
    }

}

// DOM getting events
socket.on('message', (message) => {
    console.log(message);
    const html = Mustache.render(messageTemplate, {
        message: message.text,
        createdAt: moment(message.createdAt).format('lll'),
        user: message.username
    })
    $messages.insertAdjacentHTML('beforeend', html);
    autoscroll();
});

socket.on('locationMessage', (message) => {
    console.log(message);
    const html = Mustache.render(locationTemplate, {
        url: message.url,
        createdAt: moment(message.createdAt).format('lll'),
        user: message.username
    });
    $messages.insertAdjacentHTML('beforeend', html);
    autoscroll();
});

socket.on('roomData', ({room, users}) => {
    console.log(room);
    console.log(users);
    const html = Mustache.render(sidebarTemplate, {
        room: room,
        users: users
    });
    $sidebar.innerHTML = html;
});


// DOM sending events
document.querySelector('#message-form').addEventListener('submit', (e)=>{
    e.preventDefault();
   
    const message = e.target.elements.message.value;
    socket.emit('sendMessage', message, (error)=> {
        if(error) {
            console.log(error);
        } else {
            console.log('Message delivered');
        }
    });
    e.target.elements.message.value = '';
});

document.querySelector('#send-location').addEventListener('click', () => {
    if(!navigator.geolocation){
        return alert('Geolocation is not supported in your broweser');
    } 

    navigator.geolocation.getCurrentPosition((position) => {
        socket.emit('sendLocation', {
            latitude: position.coords.latitude, 
            longitude: position.coords.longitude
        }, (message) => {
            console.log(message);
        });
    });
});

socket.emit('join', {username, room}, (error)=> {
    if (error) {
        alert(error)
        location.href = '/';
    }
});




 //$messageFormButton.setAttribute('disabled', 'disabled');

 // $messageFormButton.removeAttribute('disabled');
        // $messageFormInput.value = '';
        // $messageFormInput.focus();


// socket.on('countUpdated', (count) => {
    //     console.log('The count has been updated', count);
    // });
// document.querySelector('#increment').addEventListener('click', () => {
//     console.log('click');
//     socket.emit('increment');
// }
// );