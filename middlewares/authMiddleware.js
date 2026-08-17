import JWT from "jsonwebtoken"

const isLoggedIn = (req, res, next) => {
    try{
        const {token} = req.cookies

        if(!token){
            throw new Error("user has not logged-in")
        }

        const payload = JWT.verify(token, process.env.JWT_SECRET) 
        req.user = payload 

        next() 
    }
    catch(e){
        res.status(400).json({
            success: false,
            message: e.message
        })
    }
}


const authorizedRoles = (listOfRoles) => (req, res, next) => {
    try{
        const currentUserRole = req.user.role

        if(!listOfRoles.includes(currentUserRole)){
            throw new Error("you do not have permission to perform this task")
        }

        next() 
    }
    catch(error){
        res.status(400).json({
            success: false,
            message: error.message
        })
    }
}

export {isLoggedIn, authorizedRoles} 