module.exports = {
    callback: {
        confirmEmail: require("./callback/confirmEmail")
    },
    trade: {
        accept: require("./trade/accept"),
        reject: require("./trade/reject")
    }
}