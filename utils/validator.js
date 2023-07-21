export function checkConfirmPassword(password, confirmPassword) {
    if (password === confirmPassword && confirmPassword !== '') {
        return {
            message: "",
            error: false
        }
    } else {
        return {
            message: "Passwords don't match.",
            error: true
        }
    }
}

export function checkEmail(email) {
    if (email.length === 0) {
        return {
            message: "Email is required.",
            error: true
        }
    }

    const e = /^(([^<>()[\]\.,;:\s@\"]+(\.[^<>()[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/i

    if (e.test(email)) {
        return {
            message: "",
            error: false
        }
    } else {
        return {
            message: "Invalid email address.",
            error: true
        }
    }
}

export function checkPassword(password) {
    if (password.length === 0) {
        return {
            message: "Password is required.",
            error: true
        }
    }

    if (password.length >= 8 && password.length <= 20) {
        return {
            message: "",
            error: false
        }
    } else {
        return {
            message: "Password must be between 8 and 20 characters.",
            error: true
        }
    }
}

export function checkName(fieldname, str, min, max) {
    if (str.length === 0) {
        return {
            message: `${fieldname} is required.`,
            error: true
        }
    }

    if (str.split(' ').length !== 1) {
        return {
            message: `${fieldname} should have without any spaces.`,
            error: true
        }
    }

    if (str.length >= min && str.length <= max) {
        return {
            message: "",
            error: false
        }
    } else {
        return {
            message: fieldname + " must be between " + min + " and " + max + " characters.",
            error: true
        }
    }
}

export function checkText(fieldname, str, min, max) {
    if (str.length === 0) {
        return {
            message: `${fieldname} is required.`,
            error: true
        }
    }

    if (str.length >= min && str.length <= max) {
        return {
            message: "",
            error: false
        }
    } else {
        return {
            message: fieldname + " must be between " + min + " and " + max + " characters.",
            error: true
        }
    }
}

export function checkOTP(str) {
    if (str.length === 6) {
        return {
            message: "",
            error: false
        }
    } else {
        return {
            message: "OTP must be 6 characters.",
            error: true
        }
    }
}

export function checkReferralCode(str) {
    if (str.length === 6) {
        return {
            message: "",
            error: false
        }
    } else {
        return {
            message: "Referral code must be 6 characters.",
            error: true
        }
    }
}

export function checkImage(fieldname, file) {
    if (!file) {
        return {
            message: `${fieldname} is required.`,
            error: true
        }
    }

    if (['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/jpg', 'image/bmp'].includes(file.type)) {
        return {
            message: "",
            error: false
        }
    } else {
        return {
            message: "Invalid file type.",
            error: true
        }
    }
}

export function checkNumber(fieldname, num) {
    if (num && num.toString().split('').includes('e')) {
        return {
            message: `${fieldname} is not valid.`,
            error: true
        }
    }

    if (/^\d+$/.test(num)) {
        return {
            message: "",
            error: false
        }
    } else {
        return {
            message: `Invalid ${fieldname} field.`,
            error: true
        }
    }
}