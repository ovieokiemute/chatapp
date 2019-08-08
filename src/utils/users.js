const users = [];

// add users, remove users, get Users


const addUsers = ({id, username, room}) => {

    username = username.trim().toLowerCase();
    room = room.trim().toLowerCase();

    if(!username || !room){
        return {
            error: 'Username and room are required'
        }
    };

    const existingUser = users.find((user) => {
        return user.username === username && user.room === room;
    })

    if(existingUser){
        return {
            error: 'Username already in use'
        }
    }

    const user = {id, username, room};

    users.push(user);

    return {user}


};

const removeUser = (id) => {
    // findIndex(value, index, array)
    const index = users.findIndex((user) => user.id === id);

    if(index !== -1){
        return users.splice(index, 1)[0]
    }
};

const getUser = (id) => {

    return users.find((user) => id === user.id);
    
}

const getUsersInRoom = (room) => {
    room = room.trim().toLowerCase();
    return users.filter((user) => room === user.room);
}


module.exports = {
    addUsers,
    removeUser,
    getUser,
    getUsersInRoom
}


