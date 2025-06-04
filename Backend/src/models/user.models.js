import mongoose, {Schema} from 'mongoose'
import bcrypt from 'bcryptjs'
import crypto from 'crypto'
import jwt from 'jsonwebtoken'
import { AvailableUserRoles, UserRolesEnum } from '../utils/constants.js'

const userSchema = new Schema({
    avatar: {
        type: {
            url: String,
            localpath: String
        },
        default: {
            url: `https://placehold.co/600x400`,
            localpath: ""
        }
    },
    username: {
        type: String,
        required: true,
        index: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        index: true,
        trim: true
    },
    fullname: {
        type: String,
        required: true,
    },
    password: {
        type: String,
        required: [true, "Password is required"]
    },
    isEmailVerified: {
        type: Boolean,
        default: false
    },
    role:{
        type: String,
        enum: AvailableUserRoles,
        default: UserRolesEnum.MEMBER
    },
    forgotPasswordToken: {
        type: String
    },
    forgotPasswordTokenExpiry: {
        type: Date
    },
    refreshToken: {
        type: String
    },
    refreshTokenExpiry: {
        type: Date
    },
    emailverificationToken: {
        type: String
    },
    emailverificationTokenExpiry: {
        type: Date
    }
}, {timestamps: true})

userSchema.pre("save", async function(next) {
    if(!this.isModified("password")) {
        return next()
    }

    this.password = await bcrypt.hash(this.password, 10)
    next()
})

userSchema.methods.isPasswordCorrect = async function(password) {
    return await bcrypt.compare(password, this.password)
}

userSchema.methods.generateAccessToken = function() {
    // Calculate and set expiry time in database
    const now = new Date();
    const expiryDuration = process.env.ACCESS_TOKEN_EXPIRY || '1h';
    
    // Parse the duration and calculate expiry
    const match = expiryDuration.match(/^(\d+)([smhd])$/);
    if (match) {
        const [fullMatch, value, unit] = match;
        const amount = parseInt(value);
        
        const expiryDate = new Date(now);
        switch (unit) {
            case 'h':
                expiryDate.setHours(expiryDate.getHours() + amount);
                break;
            case 'd':
                expiryDate.setDate(expiryDate.getDate() + amount);
                break;
            case 'm':
                expiryDate.setMinutes(expiryDate.getMinutes() + amount);
                break;
            case 's':
                expiryDate.setSeconds(expiryDate.getSeconds() + amount);
                break;
        }
        
        // Update the accessTokenExpiry field
        this.accessTokenExpiry = expiryDate;
    }
    
    return jwt.sign({
        _id: this._id,
        email: this.email,
        username: this.username,
        subscription: {
            tier: this.subscription.tier,
            status: this.subscription.status
        }
    }, process.env.ACCESS_TOKEN_SECRET, {expiresIn: expiryDuration});
};

userSchema.methods.generateRefreshToken = function() {
    // Calculate and set expiry time in database
    const now = new Date();
    const expiryDuration = process.env.REFRESH_TOKEN_EXPIRY || '10d';
    
    // Parse the duration and calculate expiry
    const match = expiryDuration.match(/^(\d+)([smhd])$/);
    if (match) {
        const [vfullMatch, value, unit] = match;
        const amount = parseInt(value);
        
        const expiryDate = new Date(now);
        switch (unit) {
            case 'h':
                expiryDate.setHours(expiryDate.getHours() + amount);
                break;
            case 'd':
                expiryDate.setDate(expiryDate.getDate() + amount);
                break;
            case 'm':
                expiryDate.setMinutes(expiryDate.getMinutes() + amount);
                break;
            case 's':
                expiryDate.setSeconds(expiryDate.getSeconds() + amount);
                break;
        }
        
        // Update the refreshTokenExpiry field
        this.refreshTokenExpiry = expiryDate;
    }
    
    return jwt.sign({
        _id: this._id,
    }, process.env.REFRESH_TOKEN_SECRET, {expiresIn: expiryDuration});
};

userSchema.methods.generateTemporaryToken = function() {
    const unhashedToken = crypto.randomBytes(20).toString("hex")
    const hashedToken = crypto
        .createHash("sha256")
        .update(unhashedToken)
        .digest("hex")

    const tokenExpiry = Date.now() + (20*60*1000)

    return {hashedToken, unhashedToken, tokenExpiry}
}

export const User = mongoose.model("User", userSchema)