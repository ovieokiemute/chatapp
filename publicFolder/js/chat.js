const socket = io();

//Elements
const $messageForm = document.getElementById('message-form');
const $messageFormInput = document.getElementById('message');
const $messageFormButton = $messageForm.querySelector('button');
const $locationButton = document.getElementById('location');
const $message = document.getElementById('msg');

//options
const {username, room} = Qs.parse(location.search, { ignoreQueryPrefix: true });

const autoscroll = () => {
    // New message element
    const $newMessage = $message.lastElementChild;

    //Height of the new message

    const newMessageStyles = getComputedStyle($newMessage) //Margin spacing value
    const newMessageMargin = parseInt(newMessageStyles.marginBottom)
    const newMessageHeight = $newMessage.offsetHeight + newMessageMargin
    
    //console.log(newMessageStyles) (newMessageMargin)

    //Visible Height (it does not change)
    const visibleHeight = $message.offsetHeight

    //Height of messages container 
    const containerHeight = $message.scrollHeight

    //How far down we are scrolling
    const scrollOffset = $message.scrollTop + visibleHeight

    if(containerHeight - newMessageHeight <= scrollOffset){
        $message.scrollTop = $message.scrollHeight
    }



}

//Message Template
const messageTemplate = document.getElementById('message-template').innerHTML;
const locationTemplate = document.getElementById('location-template').innerHTML;
const sidebarTemplate = document.getElementById('sidebar-template').innerHTML;

socket.on('welcomeMsg', (msg) => {
    console.log(msg)
    const html = Mustache.render(messageTemplate, {
        username: msg.username,
        msg: msg.text,
        createdAt: moment(msg.createdAt).format('h:mm a')
    });
    $message.insertAdjacentHTML('beforeend', html);

    autoscroll()

});

socket.on('locationMessage', (url) => {
    const html = Mustache.render(locationTemplate, {
        username: url.username,
        url: url.url,
        createdAt: moment(url.createdAt).format('h:mm a')
    });

    $message.insertAdjacentHTML('beforeend', html);
    autoscroll()
});

socket.on('roomData', ({users, room}) => {
    const html = Mustache.render(sidebarTemplate, {
        users,
        room
    });
    document.getElementById('chat__sidebar').innerHTML = html;
})

$messageForm.addEventListener('submit', (event) => {
    event.preventDefault();

    //disable the send Button Form
    $messageFormButton.setAttribute('disabled', 'disabled');

    const message = event.target.elements.message.value;

    socket.emit('sendMsg', message, (error) => {
        //enable the send Button Form
    

        $messageFormButton.removeAttribute('disabled');
        $messageFormInput.value = '';
        $messageFormInput.focus();
        if(error){
            return console.log(error);
        }
        console.log('message sent')
    });

    
});

$locationButton.addEventListener('click', () => {

    if(!navigator.geolocation){
        return alert('Not supported by your brower');
    }

    //disable the location button
    $locationButton.setAttribute('disabled', 'disabled');

    navigator.geolocation.getCurrentPosition(({coords }) => {
       
        socket.emit('getLocation', {
            latitude: coords.latitude,
            longitude: coords.longitude
        }, () => {

        //enable the location button
        $locationButton.removeAttribute('disabled');
            console.log('Location has been shared');
        } );

        socket.on('locationMessage', message => {
            console.log(message)
        });

        
    });
});

socket.emit('join', { username, room}, (error) => {
    if(error){
        alert (error)
        location.href = '/ '
    }
})