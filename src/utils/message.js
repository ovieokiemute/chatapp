const generateMessage = (username, text) => {

    return {
        username,
        text,
        createdAt: new Date().getTime()
    }
};

const generateLocationMessage = (username='Admin', url) => {

    return {
        username,
        url,
        createdAt: new Date().getTime()
    }
}


module.exports = {
    generateMessage,
    generateLocationMessage
}