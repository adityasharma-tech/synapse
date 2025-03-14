import { body, query, validationResult } from "express-validator"
import { asyncHandler } from "../lib/asyncHandler"
import { ApiError } from "../lib/ApiError";
import { logger } from "../lib/configs";

const authRouteValidators = {
    loginRoute: [
        body('password')
            .notEmpty()
            .withMessage("Password is required field."),
        
        body('email')
            .if((value, {req})=> !req.body.username)
            .notEmpty()
            .withMessage('Any one of email or username is required to login.')
            .isEmail()
            .withMessage('Invalid email format.')
            .trim()
            .toLowerCase(),

        body('username')
            .if((value, {req})=>!req.body.email)
            .notEmpty()
            .withMessage('Any one of email or username is required to login.')
            .isLength({ max: 20 })
            .withMessage('Username must be less than 20 chars.')
            .matches(/^[a-zA-Z0-9.-]+$/)
            .withMessage('Username can only contain letters, numbers and can\'t user special chars other than dot(.) or dash(-) special chars. ')
            .trim()
            .toLowerCase()
    ],
    verifyEmailRoute: [
        query('verificationToken')
        .notEmpty()
        .withMessage('\'verificationToken\' is a required query parameter.')
        .trim()
    ],
    registerRoute: [
        body(['firstName', 'lastName'])
        .notEmpty()
        .withMessage('firstName and lastName are required field.'),
    
        body('password')
            .notEmpty()
            .withMessage("Password is required field."),
        
        body('email')
            .notEmpty()
            .withMessage('email is required to login.')
            .isEmail()
            .withMessage('Invalid email format.')
            .trim()
            .toLowerCase(),

        // body('username')
        //     .notEmpty()
        //     .withMessage('username is required to login.')
        //     .isLength({ max: 20 })
        //     .withMessage('Username must be less than 20 chars.')
        //     .matches(/^[a-zA-Z0-9.-]+$/)
        //     .withMessage('Username can only contain letters, numbers and can\'t user special chars other than dot(.) or dash(-) special chars. ')
        //     .trim()
        //     .toLowerCase()
    ],
    resendEmailRoute: [
        body('email')
            .notEmpty()
            .withMessage('email is required to login.')
            .isEmail()
            .withMessage('Invalid email format.')
            .trim()
            .toLowerCase(),
    ],
    resetPasswordMailRoute: [
        body('email')
            .notEmpty()
            .withMessage('email is required to login.')
            .isEmail()
            .withMessage('Invalid email format.')
            .trim()
            .toLowerCase(),
    ],
    resetPasswordRoute: [
        body('password')
            .notEmpty()
            .withMessage("Password is required field."),
            
        query('verificationToken')
            .notEmpty()
            .withMessage("Verification token not found.")
            .trim()
    ]
}

const userRouteValidators = {
    updateUserRoute: [
        body('firstName')
        .if((value, { req })=> !(req.body.lastName && req.body.username))
        .optional()
        .notEmpty(),

        body('lastName')
        .if((value, { req })=> !(req.body.firstName && req.body.username))
        .optional()
        .notEmpty(),

        body('username')
            .if((value, { req })=> !(req.body.firstName && req.body.username))
            .optional()
            .notEmpty()
            .withMessage('Atleast provide the username to update it.')
            .isLength({ max: 20 })
            .withMessage('Username must be less than 20 chars.')
            .matches(/^[a-zA-Z0-9.-]+$/)
            .withMessage('Username can only contain letters, numbers and can\'t user special chars other than dot(.) or dash(-) special chars. ')
            .trim()
            .toLowerCase()
    ] 
}

const validatorMiddeware = asyncHandler((req, res, next)=>{
    const errors = validationResult(req);

    if(errors.isEmpty()){
        return next();
    }

    logger.error(`Validation errors: ${JSON.stringify(errors)}`);

    throw new ApiError(400, `[${req.path}]: Validation error.`)
})

export {
    validatorMiddeware,
    authRouteValidators,
    userRouteValidators
}