
const msg91WidgetUrl = "https://control.msg91.com/api/v5/widget"
const widgetProcess = `${msg91WidgetUrl}/getWidgetProcess?widgetId=:widgetId&tokenAuth=:tokenAuth`

interface VerifyOtpT {
    
}

interface SendOtpT {

}

interface RetrySmsOtpT {

} 

function verifyOtp(payload: VerifyOtpT){
    return new Promise((resolve, reject)=>{
        const endpoint = `${msg91WidgetUrl}/verifyOtp`
        fetch(endpoint, {
            method: "POST",
            body: JSON.stringify(payload)
        }).then((value)=>value.json().then(value=>resolve(value)))
        .catch(reject)
    })
}

function sendSmsOtp(payload: SendOtpT){
    return new Promise((resolve, reject)=>{
        const endpoint = `${msg91WidgetUrl}/sendOtpMobile`
        fetch(endpoint, {
            method: "POST",
            body: JSON.stringify(payload)
        }).then((value)=>value.json().then(value=>resolve(value)))
        .catch(reject)
    })
}

function retrySmsOtp(payload: RetrySmsOtpT){
    return new Promise((resolve, reject)=>{
        const endpoint = `${msg91WidgetUrl}/retryOtp`
        fetch(endpoint, {
            method: "POST",
            body: JSON.stringify(payload)
        }).then((value)=>value.json().then(value=>resolve(value)))
        .catch(reject)
    })
}

export {
    verifyOtp,
    sendSmsOtp,
    retrySmsOtp
}