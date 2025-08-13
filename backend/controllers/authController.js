const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

const { createClient } = require("@supabase/supabase-js");


const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);




// Register with email/password
exports.register = async (req, res) => {
    try {
        const { email, name, password } = req.body;

        // validate the input data
        if (!email || !password) {
            return res.status(400).json({ message: "Email and password are required."});
        }

        // check user already exist
        const userExist = await User.findOne({ where: {email} });
        if (userExist) {
            return res.status(400).json({ message: "User already exists."});
        }

        // convert password into hash
        const hashPassword = await bcrypt.hash(password, 10);
        const user = await User.create({ email, name, password: hashPassword });

        // return successfull response
        return res.status(201).json({ message: "User registered successfully.", user: user });
    } catch (error) {
       return res.status(500).json({ message: "Server Error", error: error.message });
    }
}

// Login with email/password
exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;
        // validate the input data
        if (!email || !password) {
            return res.status(400).json({ message: "Email and password are required."});
        }

        // find user
        const user = await User.findOne({ where: {email} });
        if (!user) {
            return res.status(400).json({ message: "Invalid credentials."});
        }

        // compare password
        const comparePassword = await bcrypt.compare(password, user.password);
        if (!comparePassword) {
            return res.status(400).json({ message: "Invalid Password."});
        }

        const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: "1d" });
        return res.json({ token, user });
    } catch (error) {
        return res.status(500).json({ message: "Server Error", error: error.message });
    }
}


// Login/Register with Google OAuth
exports.googleAuth = async (req, res) => {
    try {
        const { access_token } = req.body;

        // get user info from google
        const { data, error } = await supabase.auth.getUser(access_token);
        if (error) {
            return res.status(400).json({ message: error.message });
        } 

        let user = await User.findOne({ where : { email: data.user.email }});

        if (!user) {
            user = await User.create({
                email: data.user.email,
                name: data.user.user_metadata.full_name,
                provider: "google"
            })
        }

        const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: "1d"});
        return res.json({ token, user });
    } catch (error) {
        return res.status(500).json({ message: "Server Error", error: error.message });
    }
}